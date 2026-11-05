import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2023-02-21';

// The RFC-ish gate the whole platform uses: one @, something either side of it, and a
// dot in the domain. Shallow on purpose — GoHighLevel is the system of record and will
// refuse what is genuinely undeliverable. This only stops rubbish at the door, before
// it can reach the CRM and pollute a list the house reports on.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function ghlRequest(path, options = {}) {
  const token = Deno.env.get('GOHIGHLEVEL_API_KEY');
  const response = await fetch(`${GHL_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Version': GHL_VERSION,
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  return { ok: response.ok, status: response.status, data };
}

// Smart list tag mapping by source
const SOURCE_TAGS = {
  'moon_joy': ['Newsletter', 'Moon Joy', 'Operation Moon Joy', 'Community Interest'],
  'common_ground': ['Newsletter', 'CommonGround', 'CommonGround 5.0', 'Civic Interest'],
  'vision_2030': ['Newsletter', '2030 Vision', 'Institutional Interest'],
  'top100_women': ['Newsletter', 'Top 100 Women', 'Orbital Index Waitlist', 'Publication Waitlist'],
  'results_go_live': ['Newsletter', 'Top 100', 'Results Go Live', 'Publication Waitlist'],
  'general': ['Newsletter', 'General Subscribe'],
};

// GHL workflow/pipeline trigger tags for smart list segmentation
const SMART_LIST_TAGS = {
  'moon_joy': 'SmartList: Moon Joy Subscribers',
  'common_ground': 'SmartList: CommonGround Subscribers',
  'vision_2030': 'SmartList: 2030 Vision Subscribers',
  'top100_women': 'SmartList: Top 100 Women Publication',
  'results_go_live': 'SmartList: Results Go Live',
  'general': 'SmartList: General Newsletter',
};

const DEVICES = ['mobile', 'desktop'];

// A short, safe label out of whatever the caller sent: attribution is worth keeping,
// but nothing a caller types may become a key in the CRM or the ledger.
const label = (value, max = 48) => String(value ?? '').trim().slice(0, max);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { name, first_name } = body;

    // Normalise first: the same address in different casing is one subscriber, and
    // GoHighLevel matches on the address it is given.
    const email = String(body.email ?? '').trim().toLowerCase();
    const source = SOURCE_TAGS[body.source] ? body.source : 'general';
    const entryPoint = label(body.entry_point, 40) || 'subscribe_page';
    const device = DEVICES.includes(body.device) ? body.device : 'unknown';

    if (!email) {
      return Response.json({ success: false, error: 'invalid_email', message: 'An email address is required.' }, { status: 400 });
    }
    if (!EMAIL.test(email) || email.length > 254) {
      return Response.json({ success: false, error: 'invalid_email', message: 'That does not look like an email address.' }, { status: 400 });
    }

    const locationId = Deno.env.get('GOHIGHLEVEL_LOCATION_ID');
    if (!locationId) {
      return Response.json({ success: false, error: 'crm_not_configured', message: 'The list is not connected.' }, { status: 500 });
    }

    const sourceTags = SOURCE_TAGS[source];
    const smartListTag = SMART_LIST_TAGS[source];

    // Upsert contact in GHL with source-specific tags
    const contactPayload = {
      locationId,
      email,
      name: name || first_name || email.split('@')[0],
      firstName: first_name || (name ? name.split(' ')[0] : undefined),
      source: `TOP 100 Newsletter - ${source}`,
      tags: [...sourceTags, smartListTag, 'Newsletter Subscriber'],
      customFields: [
        { key: 'newsletter_source', field_value: source },
        { key: 'subscribed_at', field_value: new Date().toISOString() },
      ],
    };

    const result = await ghlRequest('/contacts/upsert', {
      method: 'POST',
      body: JSON.stringify(contactPayload),
    });

    const contactId = result.data?.contact?.id;

    // A failed upsert is a failed signup: the reader is not on the list, and telling
    // them they are would be the one thing this surface must never do.
    if (!result.ok) {
      console.error('[subscribeNewsletter] GHL refused the upsert:', result.status, result.data);
      return Response.json({ success: false, error: 'crm_unavailable', message: 'The list could not be reached.' }, { status: 502 });
    }

    // Add to newsletter-specific GHL campaign/workflow via tag trigger
    // (GHL smart lists filter by tag, so tagging is the mechanism)
    console.log(`[Newsletter Subscribe] ${email} | source: ${source} | entry: ${entryPoint} | GHL contact: ${contactId}`);

    // The local echo of the CRM, and the only place the funnel's attribution is kept.
    // One row per address per entry point: a reader who returns is the same reader.
    const now = new Date().toISOString();
    try {
      const existing = await base44.asServiceRole.entities.NewsletterSignup.filter(
        { email, entry_point: entryPoint },
        { limit: 1 },
      );
      const rows = Array.isArray(existing) ? existing : existing?.items || [];
      if (rows.length) {
        await base44.asServiceRole.entities.NewsletterSignup.update(rows[0].id, {
          status: 'submitted',
          device,
          source,
          submitted_at: now,
          crm_contact_id: contactId || rows[0].crm_contact_id || '',
        });
      } else {
        await base44.asServiceRole.entities.NewsletterSignup.create({
          email,
          source,
          entry_point: entryPoint,
          device,
          status: 'submitted',
          crm_contact_id: contactId || '',
          submitted_at: now,
        });
      }
    } catch (ledgerError) {
      // Bookkeeping must never cost the reader a signup the CRM already accepted.
      console.error('[subscribeNewsletter] Local ledger write failed:', ledgerError.message);
    }

    // Also save to LiveStreamLead for the local lead record
    try {
      await base44.asServiceRole.entities.LiveStreamLead.create({
        email,
        source: `newsletter_${source}`,
      });
    } catch (leadError) {
      console.error('[subscribeNewsletter] Lead record failed:', leadError.message);
    }

    return Response.json({
      success: true,
      status: 'submitted',
      contact_id: contactId,
      tags_applied: [...sourceTags, smartListTag],
      // Said plainly so no surface has to imply a confirmation it cannot observe.
      next_step: 'welcome_email',
    });
  } catch (error) {
    console.error('[subscribeNewsletter] Error:', error.message);
    return Response.json({ success: false, error: 'request_failed', message: error.message }, { status: 500 });
  }
});