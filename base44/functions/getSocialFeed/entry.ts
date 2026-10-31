import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// The wire.
//
// What the house is publishing away from the stand — the posts on its LinkedIn company page —
// read from the network itself rather than copied across, so the wire is never a stale
// duplicate of the record. The network meters reads and does not change more than a few times
// a day, so one read is held for a short while and shared.
const CACHE_MS = 10 * 60 * 1000;
let held = { at: 0, payload: null };

// LinkedIn retires an API version every month and refuses one that is no longer active, so
// the newest version an endpoint will accept is found rather than pinned: the current month
// is asked first and the read steps back a month at a time until the network takes it.
const versionMonths = (count = 12) => {
  const out = [];
  const now = new Date();
  for (let back = 0; back < count; back += 1) {
    const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
    out.push(`${month.getUTCFullYear()}${String(month.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  return out;
};

const staleVersion = (data) => /not active|invalid version/i.test(String(data?.message || ''));

// A caption is set as text on the stand, never as markup.
const clean = (text) =>
  String(text || '')
    // LinkedIn prints a mention as @[Name](urn:li:person:…); the stand prints the name.
    .replace(/@\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const httpUrl = (value) => (/^https?:\/\//i.test(value || '') ? value : '');

async function linkedInGet(url, accessToken) {
  let lastError = 'LinkedIn did not answer.';
  for (const version of versionMonths()) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'LinkedIn-Version': version,
        'X-Restli-Protocol-Version': '2.0.0',
      },
      signal: AbortSignal.timeout(12000),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return data;
    lastError = data?.message || `LinkedIn returned ${res.status}.`;
    if (!staleVersion(data)) throw new Error(lastError);
  }
  throw new Error(lastError);
}

// The page the wire reads: the house's own company page, named by its id. The connected account
// is not permitted to list the pages it administers, so the page is set here and read directly.
const LINKEDIN_ORGANIZATION_ID = '110252945';

const organizationUrn = () => `urn:li:organization:${LINKEDIN_ORGANIZATION_ID}`;

async function readLinkedIn(base44) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection('linkedin');
  if (!accessToken) throw new Error('The LinkedIn page is not connected.');

  const organization = organizationUrn();

  const data = await linkedInGet(
    `https://api.linkedin.com/rest/posts?author=${encodeURIComponent(organization)}&q=author&count=12&sortBy=LAST_MODIFIED`,
    accessToken,
  );

  const items = (data.elements || [])
    .filter((post) => !post.lifecycleState || post.lifecycleState === 'PUBLISHED')
    .map((post) => {
      const urn = post.id || '';
      return {
        id: `linkedin-${urn}`,
        source: 'linkedin',
        account: 'LinkedIn',
        text: clean(post.commentary),
        mediaUrl: '',
        permalink: urn ? `https://www.linkedin.com/feed/update/${urn}` : '',
        publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : '',
      };
    });

  return { account: 'LinkedIn page', items };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    if (held.payload && Date.now() - held.at < CACHE_MS) {
      return Response.json({ ...held.payload, cached: true });
    }

    const [linkedin] = await Promise.allSettled([readLinkedIn(base44)]);

    const settle = (result, key) =>
      result.status === 'fulfilled'
        ? { key, ok: true, account: result.value.account, reason: null }
        : { key, ok: false, account: '', reason: result.reason?.message || 'Not available.' };

    const items = [linkedin]
      .filter((result) => result.status === 'fulfilled')
      .flatMap((result) => result.value.items)
      .filter((post) => post.text || post.mediaUrl)
      .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

    const payload = {
      sources: [settle(linkedin, 'linkedin')],
      fetchedAt: new Date().toISOString(),
      items,
    };

    held = { at: Date.now(), payload };

    return Response.json(payload);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}