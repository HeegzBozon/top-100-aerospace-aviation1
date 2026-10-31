import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import {
  INQUIRY_MODES,
  INQUIRY_TYPES,
  INQUIRY_TIMELINES,
  oneOf,
} from '../../shared/profileIntent.ts';

// Public intake for the intent layer. A visitor who is not signed in can reach a
// Fellow through this function and nothing else: the recipient is resolved here,
// from the profile record itself, so a caller can never redirect an enquiry and a
// Fellow's address is never rendered on a public surface. Every submission is
// validated, rate-limited per sender, and recorded before anything is sent on to
// Ground Control.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const SENDER_LIMIT_PER_HOUR = 3;
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2023-02-21';

const MODE_TAGS = {
  hire: ['profile-inquiry', 'Job & Career'],
  commercial: ['profile-inquiry', 'Deal & BD'],
};

function rows(page) {
  return Array.isArray(page) ? page : page?.items || [];
}

async function ghlUpsertContact({ email, name, org, role, tags, note }) {
  const token = Deno.env.get('GOHIGHLEVEL_API_KEY');
  const locationId = Deno.env.get('GOHIGHLEVEL_LOCATION_ID');
  if (!token || !locationId) return false;

  const contactRes = await fetch(`${GHL_BASE_URL}/contacts/upsert`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Version: GHL_VERSION,
    },
    body: JSON.stringify({
      locationId,
      email,
      name: name || email.split('@')[0],
      firstName: name ? name.split(' ')[0] : undefined,
      companyName: org || undefined,
      source: 'TOP 100 Talent Desk',
      tags,
      customFields: [
        { key: 'profile_inquiry_role', field_value: role || '' },
        { key: 'profile_inquiry_at', field_value: new Date().toISOString() },
      ],
    }),
  });

  if (!contactRes.ok) {
    console.error('[submitProfileInquiry] GHL upsert failed', await contactRes.text());
    return false;
  }

  const contactData = await contactRes.json().catch(() => ({}));
  const contactId = contactData?.contact?.id;
  if (contactId && note) {
    const noteRes = await fetch(`${GHL_BASE_URL}/contacts/${contactId}/notes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Version: GHL_VERSION,
      },
      body: JSON.stringify({ body: note }),
    });
    if (!noteRes.ok) console.error('[submitProfileInquiry] GHL note failed', await noteRes.text());
  }
  return true;
}

export default async function (req) {
  const base44 = createClientFromRequest(req);
  const body = await req.json().catch(() => ({}));

  const nomineeId = String(body.nominee_id || '').trim();
  const mode = String(body.mode || '');
  const requestType = String(body.request_type || '');
  const senderName = String(body.sender_name || '').trim().slice(0, 120);
  const senderEmail = String(body.sender_email || '').trim().toLowerCase();
  const senderOrg = String(body.sender_org || '').trim().slice(0, 140);
  const senderRole = String(body.sender_role || '').trim().slice(0, 140);
  const message = String(body.message || '').trim().slice(0, 2500);
  const timeline = oneOf(body.timeline, INQUIRY_TIMELINES);

  if (!nomineeId) return Response.json({ error: 'A profile is required' }, { status: 400 });
  if (!INQUIRY_MODES.includes(mode)) {
    return Response.json({ error: 'Choose the kind of conversation you want' }, { status: 400 });
  }
  if (!INQUIRY_TYPES.includes(requestType)) {
    return Response.json({ error: 'Choose what you are asking for' }, { status: 400 });
  }
  if (!EMAIL_RE.test(senderEmail)) {
    return Response.json({ error: 'Enter a working email address so they can reply' }, { status: 400 });
  }
  if (senderName.length < 2) {
    return Response.json({ error: 'Enter your name' }, { status: 400 });
  }
  if (message.length < 30) {
    return Response.json({ error: 'Write at least a sentence about what you have in mind' }, { status: 400 });
  }

  // The recipient comes from the record, never from the caller.
  const nominee = await base44.asServiceRole.entities.Nominee.get(nomineeId).catch(() => null);
  if (!nominee) return Response.json({ error: 'That profile is no longer available' }, { status: 404 });

  let profileEmail = nominee.nominee_email || '';
  if (nominee.claimed_by_user_id) {
    const owner = await base44.asServiceRole.entities.User.get(nominee.claimed_by_user_id).catch(() => null);
    if (owner?.email) profileEmail = owner.email;
  }
  if (!profileEmail) {
    return Response.json({ error: 'This profile is not accepting enquiries yet' }, { status: 400 });
  }

  const settingsRows = rows(
    await base44.asServiceRole.entities.FellowProfileSettings
      .filter({ fellow_email: profileEmail })
      .catch(() => [])
  );
  const settings = settingsRows[0];

  const modeEnabled =
    mode === 'hire' ? settings?.intent_hire_enabled === true : settings?.intent_commercial_enabled === true;
  if (!modeEnabled) {
    return Response.json({ error: 'This profile is not open to that conversation right now' }, { status: 400 });
  }
  if (requestType === 'dossier' && settings?.dossier_enabled === false) {
    return Response.json({ error: 'This profile does not release a dossier' }, { status: 400 });
  }

  // Rate limit: per sender, per hour. Counted from the record itself so it holds
  // across surfaces and across a visitor clearing their browser.
  const recent = rows(
    await base44.asServiceRole.entities.ProfileInquiry
      .filter({ sender_email: senderEmail }, { sort: '-created_date', limit: 20 })
      .catch(() => [])
  );
  const now = Date.now();
  const lastHour = recent.filter((row) => now - new Date(row.created_date).getTime() < 60 * 60 * 1000);
  if (lastHour.length >= SENDER_LIMIT_PER_HOUR) {
    return Response.json(
      { error: 'You have sent several enquiries already. Give them a day to reply.' },
      { status: 429 }
    );
  }

  // One enquiry per sender per profile per day: a second send is a duplicate, not
  // a new conversation. Answered as success so the visitor is not left retrying.
  const duplicate = recent.find(
    (row) =>
      row.nominee_id === nomineeId &&
      now - new Date(row.created_date).getTime() < DUPLICATE_WINDOW_MS
  );
  if (duplicate) {
    return Response.json({ success: true, duplicate: true, inquiry_id: duplicate.id });
  }

  const record = await base44.asServiceRole.entities.ProfileInquiry.create({
    profile_email: profileEmail,
    profile_name: nominee.name || '',
    nominee_id: nomineeId,
    mode,
    request_type: requestType,
    sender_name: senderName,
    sender_email: senderEmail,
    sender_org: senderOrg,
    sender_role: senderRole,
    message,
    timeline: timeline || 'exploratory',
    status: 'new',
    status_updated_at: new Date().toISOString(),
    source: body.source === 'desk' ? 'desk' : 'profile',
    ghl_synced: false,
  });

  // Ground Control routing. A CRM hiccup never costs the Fellow the enquiry — the
  // record is already written and sits in their desk either way.
  let synced = false;
  try {
    synced = await ghlUpsertContact({
      email: senderEmail,
      name: senderName,
      org: senderOrg,
      role: senderRole,
      tags: MODE_TAGS[mode] || ['profile-inquiry'],
      note:
        `Enquiry to ${nominee.name || profileEmail}\n` +
        `Track: ${mode === 'hire' ? 'Job & Career' : 'Deal & BD'}\n` +
        `Asked for: ${requestType}\n` +
        `Timeline: ${timeline || 'exploratory'}\n\n${message}`,
    });
  } catch (error) {
    console.error('[submitProfileInquiry] GHL routing error', error.message);
  }
  if (synced) {
    await base44.asServiceRole.entities.ProfileInquiry.update(record.id, { ghl_synced: true }).catch(() => null);
  }

  return Response.json({ success: true, inquiry_id: record.id, duplicate: false });
}