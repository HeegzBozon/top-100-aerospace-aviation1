// THE BRIDGE TO GOHIGHLEVEL — one request shape, shared by every function that touches it.
//
// GoHighLevel is the CRM of record: contacts, tags, notes and pipelines live there. Base44
// holds the lifecycle record. This module is the only place that talks to the provider, so
// a change to the request shape happens once. HubSpot is retired and must never return.

export const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
export const GHL_VERSION = '2023-02-21';

export async function ghlRequest(path: string, options: RequestInit = {}) {
  const token = Deno.env.get('GOHIGHLEVEL_API_KEY');
  if (!token) return { ok: false, status: 0, data: { error: 'GHL is not configured' } };

  const response = await fetch(`${GHL_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Version: GHL_VERSION,
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  return { ok: response.ok, status: response.status, data };
}

// Contacts dedupe by email in the provider itself, so this is safe to call on every touch.
export async function upsertContact({
  email,
  name,
  firstName,
  lastName,
  phone,
  source,
  tags = [],
  customFields = [],
}: {
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  source?: string;
  tags?: string[];
  customFields?: Array<{ key: string; field_value: string }>;
}) {
  const locationId = Deno.env.get('GOHIGHLEVEL_LOCATION_ID');
  if (!locationId) return { ok: false, contactId: '', data: { error: 'GHL location is not configured' } };

  const result = await ghlRequest('/contacts/upsert', {
    method: 'POST',
    body: JSON.stringify({
      locationId,
      email,
      name: name || email,
      firstName,
      lastName,
      phone: phone || undefined,
      source,
      tags,
      customFields,
    }),
  });

  return {
    ok: result.ok,
    contactId: result.data?.contact?.id || '',
    data: result.data,
  };
}

export async function addContactNote(contactId: string, body: string) {
  if (!contactId) return { ok: false };
  const userId = Deno.env.get('GOHIGHLEVEL_USER_ID') || '';
  return ghlRequest(`/contacts/${contactId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ userId, body }),
  });
}

// Tags are additive here: the existing set is read first, so a stage change never strips a
// contact of the segments it already belongs to.
export async function addContactTags(contactId: string, tags: string[]) {
  if (!contactId || !tags.length) return { ok: false };

  const current = await ghlRequest(`/contacts/${contactId}`);
  const existing: string[] = current.data?.contact?.tags || [];
  const merged = [...new Set([...existing, ...tags])];

  return ghlRequest(`/contacts/${contactId}`, {
    method: 'PUT',
    body: JSON.stringify({ tags: merged }),
  });
}

export const ghlStageTag = (stage: string) => `Patron: ${stage}`;