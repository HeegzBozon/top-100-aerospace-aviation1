import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// The invitation desk for a launch party. Nothing about the party is taken from the
// request: the record is read back by its own invitation code, so a guest can only ever
// be told about a party that exists, in the house's own words. The addresses are the one
// thing the host supplies, and each send is reported back on its own, because an address
// that is not a member of the network may be refused.

const SITE = 'https://top100aero.space';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const MAX_INVITES = 10;

function stamp(iso) {
  if (!iso) return 'To be announced';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'To be announced';
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function firstNameOf(email) {
  const local = String(email).split('@')[0] || '';
  const part = local.split(/[._-]/)[0].replace(/[^a-z]/gi, '');
  if (!part) return 'Fellow';
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const code = String(body.code || '').trim();
    const asked = Array.isArray(body.emails) ? body.emails : [];
    const emails = [...new Set(asked.map((e) => String(e || '').trim().toLowerCase()).filter(Boolean))];

    if (!code) return Response.json({ error: 'An invitation code is needed.' }, { status: 400 });
    if (!emails.length) return Response.json({ error: 'At least one address is needed.' }, { status: 400 });
    if (emails.length > MAX_INVITES) {
      return Response.json({ error: `Send at most ${MAX_INVITES} invitations at a time.` }, { status: 400 });
    }
    const unreadable = emails.filter((e) => !EMAIL_RE.test(e));
    if (unreadable.length) {
      return Response.json({ error: `These addresses are not readable: ${unreadable.join(', ')}` }, { status: 400 });
    }

    const found = await base44.entities.LaunchParty.filter({ invite_code: code }, '-created_date', 1);
    const party = found[0] || null;
    if (!party) return Response.json({ error: 'That invitation is not on the books.' }, { status: 404 });

    const variables = (to) => ({
      first_name: firstNameOf(to),
      invites_label: 'Invitation',
      event_name: party.title,
      body: `${party.host_name || 'A Fellow'} has opened a launch party for ${party.launch_name}. The Mission Theatre is lit, the room chat is open, and your name belongs on the door.`,
      cta_label: 'Take your seat',
      cta_url: `${SITE}/launch-party/${party.invite_code}`,
      when_label: 'The room opens',
      event_date: `${stamp(party.opens_at)} · lift-off ${stamp(party.net)}`,
      where_label: 'Where',
      event_location: party.venue || 'The Mission Theatre, online',
    });

    const results = [];
    for (let i = 0; i < emails.length; i += 5) {
      const batch = emails.slice(i, i + 5);
      const settled = await Promise.allSettled(
        batch.map((to) =>
          base44.integrations.Core.SendEmail({
            to,
            template_name: 'LaunchPartyInvite',
            category: 'transactional',
            variables: variables(to),
          }),
        ),
      );
      settled.forEach((outcome, n) => {
        const to = batch[n];
        if (outcome.status === 'rejected') {
          results.push({
            email: to,
            sent: false,
            reason: outcome.reason?.message || 'The mail service did not answer.',
          });
          return;
        }
        const res = outcome.value || {};
        if (res.success === false) {
          results.push({ email: to, sent: false, reason: res.reason || 'The address could not be reached.' });
          return;
        }
        results.push({ email: to, sent: true, reason: '' });
      });
    }

    return Response.json({
      sent: results.filter((r) => r.sent).length,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}