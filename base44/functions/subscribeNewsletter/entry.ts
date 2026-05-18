import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2023-02-21';

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
  'general': ['Newsletter', 'General Subscribe'],
};

// GHL workflow/pipeline trigger tags for smart list segmentation
const SMART_LIST_TAGS = {
  'moon_joy': 'SmartList: Moon Joy Subscribers',
  'common_ground': 'SmartList: CommonGround Subscribers',
  'vision_2030': 'SmartList: 2030 Vision Subscribers',
  'general': 'SmartList: General Newsletter',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { email, name, source = 'general', first_name } = body;

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const locationId = Deno.env.get('GOHIGHLEVEL_LOCATION_ID');
    if (!locationId) {
      return Response.json({ error: 'GHL location not configured' }, { status: 500 });
    }

    const sourceTags = SOURCE_TAGS[source] || SOURCE_TAGS['general'];
    const smartListTag = SMART_LIST_TAGS[source] || SMART_LIST_TAGS['general'];

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

    if (!result.ok) {
      console.error('[GHL Subscribe] Error:', result.data);
      // Still save locally even if GHL fails
    }

    const contactId = result.data?.contact?.id;

    // Add to newsletter-specific GHL campaign/workflow via tag trigger
    // (GHL smart lists filter by tag, so tagging is the mechanism)
    console.log(`[Newsletter Subscribe] ${email} | source: ${source} | GHL contact: ${contactId} | tags: ${[...sourceTags, smartListTag].join(', ')}`);

    // Also save to LiveStreamLead for local record
    await base44.asServiceRole.entities.LiveStreamLead.create({
      email,
      source: `newsletter_${source}`,
    });

    return Response.json({
      success: true,
      contact_id: contactId,
      tags_applied: [...sourceTags, smartListTag],
    });
  } catch (error) {
    console.error('[subscribeNewsletter] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});