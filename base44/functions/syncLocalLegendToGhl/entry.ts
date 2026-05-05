import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2023-02-21';
const LOCAL_LEGENDS_PIPELINE_ID = 'm1tBvUU8hF7vpHJ3J17H';
const LOCAL_LEGENDS_TAG = 'Local Legends Application';

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

  if (!response.ok) {
    return { ok: false, status: response.status, data };
  }

  return { ok: true, status: response.status, data };
}

function getFirstStageId(pipelinesResponse) {
  const pipelines = pipelinesResponse?.pipelines || pipelinesResponse?.data?.pipelines || [];
  const pipeline = pipelines.find(item => item.id === LOCAL_LEGENDS_PIPELINE_ID || item._id === LOCAL_LEGENDS_PIPELINE_ID);
  const stages = pipeline?.stages || pipeline?.pipelineStages || [];
  return stages[0]?.id || stages[0]?._id || null;
}

function getContactId(contactResponse) {
  return contactResponse?.contact?.id || contactResponse?.id || contactResponse?.contactId || null;
}

Deno.serve(async (req) => {
  try {
    createClientFromRequest(req);
    const locationId = Deno.env.get('GOHIGHLEVEL_LOCATION_ID');
    const body = await req.json().catch(() => ({}));
    const { answers = {}, surveyResponseId, dryRun = false } = body;

    const email = answers.email || answers.your_email;
    const name = answers.your_name || answers.name || '';
    const businessName = answers.biz_name || answers.business_name || 'Local Legends Applicant';
    const phone = answers.phone || '';
    const website = answers.website_or_ig || answers.website || '';
    const city = answers.city || '';

    if (!email || !locationId) {
      return Response.json({ success: false, error: 'Missing email or GoHighLevel location ID' }, { status: 200 });
    }

    const contactPayload = {
      locationId,
      name,
      email,
      phone,
      website,
      city,
      companyName: businessName,
      source: 'Local Legends Application',
      tags: [LOCAL_LEGENDS_TAG],
      createNewIfDuplicateAllowed: false,
    };

    const pipelinesResult = await ghlRequest(`/opportunities/pipelines?locationId=${encodeURIComponent(locationId)}`, { method: 'GET' });
    const pipelineStageId = pipelinesResult.ok ? getFirstStageId(pipelinesResult.data) : null;

    const opportunityPayload = {
      pipelineId: LOCAL_LEGENDS_PIPELINE_ID,
      locationId,
      name: `${businessName} — Local Legends Spotlight`,
      pipelineStageId,
      status: 'open',
      contactId: 'CONTACT_ID_FROM_UPSERT',
      monetaryValue: 0,
    };

    if (dryRun) {
      return Response.json({ success: true, dryRun: true, contactPayload, opportunityPayload, pipelineStageId });
    }

    const contactResult = await ghlRequest('/contacts/upsert', {
      method: 'POST',
      body: JSON.stringify(contactPayload),
    });

    if (!contactResult.ok) {
      return Response.json({ success: false, step: 'contact', details: contactResult.data }, { status: 200 });
    }

    const contactId = getContactId(contactResult.data);
    if (!contactId || !pipelineStageId) {
      return Response.json({ success: false, step: 'opportunity_setup', contactId, pipelineStageId }, { status: 200 });
    }

    const opportunityResult = await ghlRequest('/opportunities/', {
      method: 'POST',
      body: JSON.stringify({ ...opportunityPayload, contactId }),
    });

    return Response.json({
      success: contactResult.ok && opportunityResult.ok,
      surveyResponseId,
      contactId,
      opportunity: opportunityResult.data?.opportunity || opportunityResult.data,
      opportunityError: opportunityResult.ok ? null : opportunityResult.data,
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 200 });
  }
});