import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const REASONS = {
  hire: 'a hire', investor: 'investment', customer: 'a customer conversation', partner: 'a partnership',
  supplier: 'supply', mentor: 'mentorship', press: 'a press conversation', peer: 'a peer exchange',
};
const TTL_DAYS = 30;

// Public: the response page for one referral. The token is the only key, it opens one
// step of one referral, shows only that referral's own wording, and answers once.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const { token, answer } = await req.json().catch(() => ({}));
    if (typeof token !== 'string' || token.length < 32) return Response.json({ error: 'not_found' }, { status: 404 });

    const db = base44.asServiceRole.entities.ConferenceReferral;
    let step = 'consent';
    let [r] = await db.filter({ consent_token: token });
    if (!r) { step = 'heads_up'; [r] = await db.filter({ heads_up_token: token }); }
    if (!r) return Response.json({ error: 'not_found' }, { status: 404 });

    const sentAt = r.sent_at?.[step];
    const expired = !sentAt || Date.now() - new Date(sentAt).getTime() > TTL_DAYS * 864e5;
    const prior = r.responses?.[step];
    const referrer = r.created_by_id ? (await base44.asServiceRole.entities.User.filter({ id: r.created_by_id }))[0] : null;

    const view = {
      step,
      referrer_name: referrer?.full_name || 'A member',
      you: step === 'consent' ? r.subject_name : r.recipient_name,
      other: step === 'consent' ? r.recipient_name : r.subject_name,
      why: REASONS[r.reason] || 'a conversation',
      context: r.context || '',
      answered: prior?.answer || null,
      expired: expired && !prior,
    };
    if (!answer) return Response.json(view);

    if (!['yes', 'no'].includes(answer)) return Response.json({ error: 'invalid' }, { status: 400 });
    if (prior) return Response.json(view);
    if (view.expired) return Response.json({ error: 'expired' }, { status: 410 });

    const update = { responses: { ...(r.responses || {}), [step]: { answer, at: new Date().toISOString() } } };
    if (step === 'consent' && ['drafted', 'consent_asked'].includes(r.status)) update.status = answer === 'yes' ? 'consented' : 'declined';
    await db.update(r.id, update);
    return Response.json({ ...view, answered: answer });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}