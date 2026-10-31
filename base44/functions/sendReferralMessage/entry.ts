import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const REASONS = {
  hire: 'a hire', investor: 'investment', customer: 'a customer conversation', partner: 'a partnership',
  supplier: 'supply', mentor: 'mentorship', press: 'a press conversation', peer: 'a peer exchange',
};
const first = (n = '') => n.split(' ')[0] || n;

function build(r, step, me) {
  const why = REASONS[r.reason] || 'a conversation';
  const line = r.context ? `\n\n${r.context}` : '';
  const sign = `\n\n${me.full_name || ''}`;
  if (step === 'consent') return {
    to: [r.subject_email], subject: `May I introduce you to ${r.recipient_name}?`,
    body: `Hi ${first(r.subject_name)},\n\nI'd like to introduce you to ${r.recipient_name} about ${why}.${line}\n\nHappy for me to make the introduction? A simple yes is enough.${sign}`,
    status: 'consent_asked',
  };
  if (step === 'heads_up') return {
    to: [r.recipient_email], subject: `A referral for you: ${r.subject_name}`,
    body: `Hi ${first(r.recipient_name)},\n\nI know someone worth meeting about ${why}: ${r.subject_name}.${line}\n\nOpen to an introduction?${sign}`,
  };
  return {
    to: [r.subject_email, r.recipient_email], subject: `Introduction: ${r.subject_name} <> ${r.recipient_name}`,
    body: `${first(r.subject_name)}, ${first(r.recipient_name)}, meet each other.\n\nYou both said yes, so I'll get out of the way. The conversation is about ${why}.${line}\n\nI'll leave the next step to you two.${sign}`,
    status: 'introduced',
  };
}

// Sends one referral message: by email to whoever is a registered member, into the
// app's own Messages (a 1:1 for consent and heads-up, a group of three for the intro),
// and hands the rest back so the referrer can send from their own mail.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { referral_id, step } = await req.json().catch(() => ({}));
    if (!referral_id || !['consent', 'heads_up', 'intro'].includes(step)) {
      return Response.json({ error: 'referral_id and a valid step are required' }, { status: 400 });
    }
    const r = await base44.entities.ConferenceReferral.get(referral_id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!r || r.created_by_id !== me.id) return Response.json({ error: 'Not found' }, { status: 404 });
    if (step === 'intro' && !['consented', 'introduced', 'connected'].includes(r.status)) {
      return Response.json({ error: 'The person referred has not agreed yet' }, { status: 400 });
    }

    const msg = build(r, step, me);
    const to = msg.to.filter(Boolean).map((e) => e.toLowerCase());
    const users = to.length ? await base44.asServiceRole.entities.User.filter({ email: { $in: to } }) : [];
    const members = users.map((u) => u.email.toLowerCase());

    const emailed = [];
    await Promise.allSettled(members.map(async (email) => {
      const res = await base44.asServiceRole.integrations.Core.SendEmail({
        to: email, subject: msg.subject, body: msg.body.replace(/\n/g, '<br>'), from_name: me.full_name, category: 'transactional',
      });
      if (res?.success !== false) emailed.push(email);
    }));

    // The thread: only members can read Messages, so only they are put in it.
    let conversation_id = null;
    if (members.length) {
      const participants = [me.email.toLowerCase(), ...members];
      const conv = await base44.asServiceRole.entities.Conversation.create({
        type: participants.length > 2 ? 'channel' : 'dm',
        name: participants.length > 2 ? `Intro · ${r.subject_name} & ${r.recipient_name}` : undefined,
        is_private: true, participants, owner_email: me.email, member_count: participants.length,
        last_message_at: new Date().toISOString(), last_message_preview: msg.subject,
      });
      await base44.asServiceRole.entities.Message.create({
        conversation_id: conv.id, sender_email: me.email, sender_name: me.full_name, content: msg.body, message_type: 'text',
      });
      conversation_id = conv.id;
    }

    const threads = { ...(r.threads || {}), ...(conversation_id ? { [step]: conversation_id } : {}) };
    const sent = { ...(r.sent_at || {}), [step]: new Date().toISOString() };
    const update = { threads, sent_at: sent };
    if (msg.status && r.status !== 'connected') update.status = msg.status === 'consent_asked' && r.status !== 'drafted' ? r.status : msg.status;
    if (step === 'intro') update.introduced_at = new Date().toISOString();
    const saved = await base44.entities.ConferenceReferral.update(r.id, update);

    return Response.json({
      referral: saved, subject: msg.subject, body: msg.body, emailed, conversation_id,
      unregistered: to.filter((e) => !members.includes(e)),
      missing_email: msg.to.length - to.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}