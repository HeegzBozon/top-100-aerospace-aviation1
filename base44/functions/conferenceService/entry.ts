import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// The gate between an organizer and the network.
//
// Two things happen here, and neither can happen from the client:
//
//   1. Host approval. ConferenceHost is a credential, not a profile — its `status` is the
//      right to publish conferences. The entity's access rules keep it read-your-own and
//      admin-write, so the only path to an approved record is an administrator, and the
//      only path to an application is this function. An applicant can never write their
//      own status, and a declined application returns to `pending` when it is revised.
//
//   2. Publishing. ConferenceRoom accepts creation from administrators alone at the data
//      layer, so an approved host cannot mint a conference by talking to the database
//      directly. This function is the one writer: it verifies the approval on every call,
//      stamps the host's own email on the record (which is what the record's read and
//      update rules anchor on), and refuses an edit by anyone who is not that host.
//
// Everything below runs as the caller until it must elevate, and elevation is only ever
// reached after the approval check has passed.

const DOMAINS = [
  'space_rd', 'commercial_aviation', 'defense', 'manufacturing',
  'operations', 'engineering', 'policy', 'entrepreneurship',
];

const COVERS = ['none', 'orbit', 'launch', 'runway', 'lunar', 'horizon'];

// A host may place a conference in draft or open it to the network. 'live' and 'closed'
// are reached by the calendar and by the host respectively — never by inventing a date.
const HOST_SETTABLE_STATUS = ['draft', 'open', 'closed'];

const clean = (value, max = 600) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

const focusAreas = (raw) => {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  return raw
    .map((item) => {
      const label = clean(typeof item === 'string' ? item : item?.label, 80);
      if (!label) return null;
      const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      if (!key || seen.has(key)) return null;
      seen.add(key);
      return { key, label };
    })
    .filter(Boolean)
    .slice(0, 12);
};

const isDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = clean(body?.action, 40);
    if (!action) return Response.json({ error: 'action is required' }, { status: 400 });

    // The caller's own identity is what everything is checked against — never a value
    // lifted from the payload.
    const admin = base44.asServiceRole;
    const isAdmin = user.role === 'admin';

    const mine = await admin.entities.ConferenceHost.filter({ applicant_email: user.email });
    const application = (mine || [])[0] || null;
    const isHost = !!application && application.status === 'approved';

    if (action === 'hostStatus') {
      return Response.json({ isAdmin, isHost, application });
    }

    if (action === 'applyHost') {
      if (isHost) return Response.json({ isAdmin, isHost, application });

      const patch = {
        applicant_email: user.email,
        applicant_name: clean(body?.applicant_name, 120) || user.full_name || '',
        organization: clean(body?.organization, 160),
        role_title: clean(body?.role_title, 120),
        website: clean(body?.website, 300),
        reason: clean(body?.reason, 1200),
      };
      if (!patch.organization) return Response.json({ error: 'Tell us who stages the conference' }, { status: 400 });
      if (!patch.reason) return Response.json({ error: 'Tell us why you host' }, { status: 400 });

      if (application) {
        // A revised application returns to the queue. An approval is never overwritten by
        // an application edit.
        const updated = await admin.entities.ConferenceHost.update(application.id, {
          ...patch,
          status: application.status === 'approved' ? 'approved' : 'pending',
        });
        return Response.json({ isAdmin, isHost: updated.status === 'approved', application: updated });
      }

      const created = await admin.entities.ConferenceHost.create({ ...patch, status: 'pending' });
      return Response.json({ isAdmin, isHost: false, application: created });
    }

    if (action === 'saveConference') {
      if (!isHost && !isAdmin) {
        return Response.json(
          { error: 'Only an approved host can publish a conference. Apply for host approval first.' },
          { status: 403 },
        );
      }

      const fields = {
        conference_name: clean(body?.conference_name, 140),
        conference_series: clean(body?.conference_series, 80),
        organizer: clean(body?.organizer, 160),
        venue: clean(body?.venue, 160),
        city: clean(body?.city, 80),
        country: clean(body?.country, 80),
        start_date: body?.start_date || '',
        end_date: body?.end_date || '',
        official_url: clean(body?.official_url, 300),
        registration_url: clean(body?.registration_url, 300),
        description: clean(body?.description, 1600),
        cover_key: COVERS.includes(body?.cover_key) ? body.cover_key : 'none',
        domain_focus: DOMAINS.includes(body?.domain_focus) ? body.domain_focus : '',
        focus_areas: focusAreas(body?.focus_areas),
      };

      if (!fields.conference_name) return Response.json({ error: 'A conference needs a name' }, { status: 400 });
      if (!isDate(fields.start_date) || !isDate(fields.end_date)) {
        return Response.json({ error: 'A conference needs a start and an end date' }, { status: 400 });
      }
      if (fields.end_date < fields.start_date) {
        return Response.json({ error: 'The end date cannot fall before the start date' }, { status: 400 });
      }

      const status = HOST_SETTABLE_STATUS.includes(body?.status) ? body.status : 'draft';
      const roomId = clean(body?.room_id, 40) || null;

      if (roomId) {
        const existing = await admin.entities.ConferenceRoom
          .get(roomId)
          .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
        if (!existing) return Response.json({ error: 'Conference not found' }, { status: 404 });
        if (!isAdmin && existing.facilitator_email !== user.email) {
          return Response.json({ error: 'This conference belongs to another host' }, { status: 403 });
        }

        const patch = { ...fields, status };
        if (status !== 'draft' && !existing.published_at) patch.published_at = new Date().toISOString();
        if (isHost && application?.organization) patch.host_organization = application.organization;

        const room = await admin.entities.ConferenceRoom.update(roomId, patch);
        return Response.json({ room });
      }

      const room = await admin.entities.ConferenceRoom.create({
        ...fields,
        status,
        facilitator_email: user.email,
        facilitator_name: user.full_name || '',
        host_organization: isHost ? application?.organization || '' : '',
        published_at: status === 'draft' ? undefined : new Date().toISOString(),
      });
      return Response.json({ room });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}