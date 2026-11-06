import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { isEmailShaped, normalizeEmail } from '../../shared/patronLifecycle.ts';
import { upsertContact, addContactNote } from '../../shared/ghlContact.ts';

// THE DOOR ON THE MEDIA KIT.
//
// A prospect raises a hand on /patronage and this is where it lands. Three things happen,
// in this order: the address is checked at the door, the lifecycle record is written, and
// the contact reaches GoHighLevel — the CRM of record — tagged so the qualification cadence
// can start. Nothing here is a promise to the buyer, and nothing here touches measurement.
//
// Records are written with the service role because the desk is admin-only: a prospect can
// hand us their details without being able to read the pipeline they have joined.

const FIT_CATEGORIES = ['space_defense_vc', 'b2b_tools', 'recruiter', 'event_organizer', 'prime', 'other'];

const FIT_TAGS = {
  space_defense_vc: 'Fit: Space & Defense VC',
  b2b_tools: 'Fit: B2B Tools',
  recruiter: 'Fit: Recruiter',
  event_organizer: 'Fit: Event Organizer',
  prime: 'Fit: Prime',
  other: 'Fit: Other',
};

const trim = (value: string, max = 400) => String(value || '').trim().slice(0, max);

export default async function (req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Use POST' }, { status: 405 });
  }

  const body = await req.json().catch(() => ({}));

  const organization_name = trim(body.organization_name, 160);
  const contact_name = trim(body.contact_name, 120);
  const contact_email = normalizeEmail(body.contact_email);
  const contact_role = trim(body.contact_role, 120);
  const phone = trim(body.phone, 40);
  const interest = trim(body.interest, 80);
  const message = trim(body.message, 1200);
  const source_detail = trim(body.source_detail, 160) || 'Media kit';
  const fit_category = FIT_CATEGORIES.includes(body.fit_category) ? body.fit_category : 'other';

  if (!organization_name || !contact_name) {
    return Response.json({ error: 'An organization and a name are needed.' }, { status: 400 });
  }
  if (!isEmailShaped(contact_email)) {
    return Response.json({ error: 'That address does not look like an email.' }, { status: 400 });
  }

  const base44 = createClientFromRequest(req);
  const sr = base44.asServiceRole;

  // One person, one deal. A second hand raised by the same address joins the live record
  // rather than starting a parallel conversation.
  const existing = await sr.entities.PatronDeal.filter({ contact_email });
  const live = (existing || []).find((deal: any) => deal.stage !== 'declined');

  const noteLines = [
    `Hand raised on the media kit (${source_detail}).`,
    `Interest: ${interest || 'Not stated'}`,
    `Fit: ${fit_category}`,
    phone ? `Phone: ${phone}` : '',
    message ? `Their words: ${message}` : '',
  ].filter(Boolean);

  if (live) {
    // A number given on the second visit is still a number the desk needs: it is written
    // onto the record when the record has none, and it always goes into the note.
    if (phone && !live.phone) {
      await sr.entities.PatronDeal.update(live.id, { phone });
    }
    if (live.ghl_contact_id) {
      await addContactNote(live.ghl_contact_id, noteLines.join('\n')).catch(() => null);
    }
    return Response.json({ ok: true, existing: true, deal_id: live.id });
  }

  const deal = await sr.entities.PatronDeal.create({
    organization_name,
    contact_name,
    contact_email,
    contact_role,
    phone,
    source: 'media_kit',
    source_detail,
    fit_category,
    consent_basis: `Raised a hand on the media kit, ${new Date().toISOString().slice(0, 10)}. Asked to be contacted about a placement.`,
    stage: 'identified',
    owner_qualifier: 'Erwin',
    owner_pitcher: 'Matthew',
    ghl_sync_state: 'pending',
    next_action: 'Qualify: confirm fit, category and budget window.',
    notes: noteLines.join('\n'),
    stage_history: [{ stage: 'identified', at: new Date().toISOString(), by: 'media kit', note: source_detail }],
  });

  // The CRM bridge. A failure here is recorded on the deal, never swallowed: the desk shows
  // a contact that has not reached GoHighLevel so it can be re-sent.
  let ghlState = 'failed';
  let contactId = '';
  try {
    const [first_name, ...rest] = contact_name.split(/\s+/);
    const result = await upsertContact({
      email: contact_email,
      name: contact_name,
      firstName: first_name,
      lastName: rest.join(' '),
      phone,
      source: 'TOP 100 Patron of Record - Media Kit',
      tags: ['Patron Inquiry', FIT_TAGS[fit_category], 'Trigger: Patron Qualification'],
      customFields: [
        { key: 'source', field_value: `Patron of Record - ${source_detail}` },
        { key: 'nomination_type', field_value: 'patron' },
      ],
    });
    contactId = result.contactId;
    ghlState = result.ok && contactId ? 'synced' : 'failed';

    if (contactId) {
      await addContactNote(contactId, noteLines.join('\n')).catch(() => null);
    }
  } catch (error) {
    console.error('[patronIntake] GHL sync failed:', error?.message);
  }

  await sr.entities.PatronDeal.update(deal.id, {
    ghl_contact_id: contactId,
    ghl_sync_state: ghlState,
  });

  // The handoff is owed within one business day, so it is announced rather than waited for.
  try {
    const admins = await sr.entities.User.filter({ role: 'admin' });
    const recipients = (admins || []).map((user: any) => user.email).filter(Boolean);
    await Promise.all(
      recipients.map((to: string) =>
        sr.integrations.Core.SendEmail({
          to,
          subject: `Patron enquiry: ${organization_name}`,
          body: [
            `${contact_name} at ${organization_name} raised a hand on the media kit.`,
            '',
            `Email: ${contact_email}`,
            `Fit: ${fit_category}`,
            `Interest: ${interest || 'Not stated'}`,
            message ? `\n${message}` : '',
            '',
            'Open the Patron desk to qualify and hand off within one business day.',
          ].join('\n'),
          category: 'transactional',
        }).catch(() => null),
      ),
    );
  } catch (error) {
    console.warn('[patronIntake] admin notice skipped:', error?.message);
  }

  return Response.json({ ok: true, deal_id: deal.id, ghl: ghlState });
}