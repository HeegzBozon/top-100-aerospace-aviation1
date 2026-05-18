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

// GHL Smart Lists are created via the /contacts/smart-lists endpoint
// Each list filters contacts by a specific tag
const SMART_LISTS = [
  {
    name: '🌙 Moon Joy Subscribers',
    description: 'Contacts who subscribed via the Operation: Moon Joy page. Warm community leads.',
    filterTag: 'SmartList: Moon Joy Subscribers',
  },
  {
    name: '🌿 CommonGround Subscribers',
    description: 'Contacts who subscribed via the CommonGround 5.0 white paper page. Civic/mission-aligned.',
    filterTag: 'SmartList: CommonGround Subscribers',
  },
  {
    name: '🚀 2030 Vision Subscribers',
    description: 'Contacts who subscribed via the 2030 Vision page. Institutional/investor-aligned.',
    filterTag: 'SmartList: 2030 Vision Subscribers',
  },
  {
    name: '📬 All Newsletter Subscribers',
    description: 'All TOP 100 newsletter subscribers across all sources.',
    filterTag: 'Newsletter Subscriber',
  },
];

// Email templates for each smart list
const EMAIL_TEMPLATES = [
  {
    listName: '🌙 Moon Joy Subscribers',
    subject: "You're in the room. 🌙 Here's what happens next.",
    preheader: 'Operation: Moon Joy starts M–F at 1:30 PM Pacific. Come as you are.',
    body: `<p>Thank you for signing up for Operation: Moon Joy updates.</p>

<p>Every weekday, M–F at 1:30 PM Pacific, we open a room. Not a webinar. Not a panel. A working session shaped entirely by who shows up.</p>

<p><strong>Here's what you need to know:</strong></p>
<ul>
  <li>Sessions run 30–60 minutes</li>
  <li>Anyone can bring an agenda item — a problem, a win, a question</li>
  <li>The Joy Fund means nobody gets turned away for what they can invest ($0 is fine)</li>
  <li>300+ verified Fellows from 40+ countries are in this network</li>
</ul>

<p>Your first session is the hardest one to attend. After that, the room pulls you back.</p>

<p><a href="https://top100aero.space/moon-joy" style="background:#c9a87c;color:#07111f;padding:12px 24px;border-radius:24px;text-decoration:none;font-weight:bold;display:inline-block;">Join Operation: Moon Joy →</a></p>

<p style="color:#888;font-size:12px;margin-top:32px;">Think Global. Act Local. Ad Astra. Joy is the mission.<br/>TOP 100 Aerospace &amp; Aviation · Est. 2021</p>`,
  },
  {
    listName: '🌿 CommonGround Subscribers',
    subject: 'CommonGround 5.0 is live. The white paper that started it all.',
    preheader: 'Solarpunk + Permaculture + Dignity Infrastructure. The future we\'re actually building.',
    body: `<p>Thank you for your interest in CommonGround.</p>

<p>CommonGround 5.0 is the white paper that maps the convergence of aerospace infrastructure, urban dignity, and ecological design into a single, coherent model.</p>

<p><strong>What's new in 5.0:</strong></p>
<ul>
  <li>The Solarpunk Philosophy layer — appropriate technology, maker-hero residency, prefigurative design</li>
  <li>The Permaculture Design framework — food forests, circular material economies, multi-layer ecology</li>
  <li>The Food Forest simulation campaign — try the CommonGround simulator to see how it works</li>
  <li>Measurable ecological targets built into every site design</li>
</ul>

<p>This is not an abstract vision document. It is a site-design specification and a policy argument, built from the same community that has been building aerospace talent infrastructure since 2021.</p>

<p><a href="https://top100aero.space/common-ground" style="background:#4ade80;color:#071a10;padding:12px 24px;border-radius:24px;text-decoration:none;font-weight:bold;display:inline-block;">Read CommonGround 5.0 →</a></p>
<a href="https://top100aero.space/common-ground-sim" style="color:#4ade80;font-weight:bold;text-decoration:none;">Try the Simulator →</a>

<p style="color:#888;font-size:12px;margin-top:32px;">Think Global. Act Local. Ad Astra.<br/>TOP 100 Aerospace &amp; Aviation · Est. 2021</p>`,
  },
  {
    listName: '🚀 2030 Vision Subscribers',
    subject: 'The 2030 Vision. This is what we are building toward.',
    preheader: 'Type 0 to Type 1 — in our lifetime. Here\'s the full picture.',
    body: `<p>Thank you for reading the 2030 Vision.</p>

<p>Four crises. One decade. One solution space. The women building the climate monitoring systems, the launch infrastructure, and the life support for the lunar surface are already doing this work. Most of them are invisible to the institutions that need them.</p>

<p><strong>By 2030, TOP 100 will be:</strong></p>
<ul>
  <li>1,000+ verified Fellows across 50+ countries</li>
  <li>Nine Volumes published — a decade of institutional record</li>
  <li>Ten active Local Legends CommonGround hubs</li>
  <li>Flightography: a career credential that survives displacement and crosses borders</li>
  <li>Operation: Moon Joy running daily across Squad and Chapter networks globally</li>
</ul>

<p>This is not a recognition platform with a vision. By 2030, it is structural infrastructure for the industry's talent pipeline.</p>

<p><a href="https://top100aero.space/2030-vision" style="background:#1e3a5a;color:#c9a87c;padding:12px 24px;border-radius:24px;text-decoration:none;font-weight:bold;display:inline-block;border:1px solid #c9a87c44;">Read the Full Vision →</a></p>
<br/><a href="https://top100aero.space/nominate" style="color:#c9a87c;font-weight:bold;text-decoration:none;">Nominate a Fellow →</a>

<p style="color:#888;font-size:12px;margin-top:32px;">TOP 100 Aerospace &amp; Aviation · Est. 2021<br/>Governed by contribution. Built in community. Built with community.</p>`,
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { action = 'preview' } = body;

    if (action === 'preview') {
      return Response.json({
        message: 'Smart list and email template definitions ready. Call with action="create" to apply in GHL.',
        smart_lists: SMART_LISTS.map(l => l.name),
        email_templates: EMAIL_TEMPLATES.map(e => ({ subject: e.subject, for_list: e.listName })),
        note: 'GHL Smart Lists are tag-based filters. Contacts receive the tag when they subscribe via the newsletter form on each page. The smart lists are then defined in GHL using the tag filter: Settings → Smart Lists → Create. This function documents the tag strategy.',
      });
    }

    // Attempt to create smart lists via GHL API if supported
    const results = [];
    for (const list of SMART_LISTS) {
      // GHL smart list creation via API (v2)
      const res = await ghlRequest(`/contacts/smart-lists`, {
        method: 'POST',
        body: JSON.stringify({
          locationId: Deno.env.get('GOHIGHLEVEL_LOCATION_ID'),
          name: list.name,
          description: list.description,
          filters: [
            {
              field: 'tags',
              operator: 'contains',
              value: list.filterTag,
            },
          ],
        }),
      });
      results.push({ list: list.name, ok: res.ok, status: res.status, response: res.data });
    }

    return Response.json({
      success: true,
      results,
      email_templates: EMAIL_TEMPLATES,
      instructions: 'If smart list API is not available for your GHL plan, create them manually in GHL: Contacts → Smart Lists → New → Filter by Tag = [tag name]',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});