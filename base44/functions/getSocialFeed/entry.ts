import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// The wire.
//
// What the house is publishing away from the stand — the posts on its Instagram account and
// on its LinkedIn page — read from the two networks themselves rather than copied across, so
// the wire is never a stale duplicate of the record. Both networks meter reads and neither
// changes more than a few times a day, so one read is held for a short while and shared.
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
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const httpUrl = (value) => (/^https?:\/\//i.test(value || '') ? value : '');

// Instagram: one account, read off the Instagram host with the token as a query parameter,
// which is the only place that token works.
async function readInstagram(base44) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection('instagram');
  if (!accessToken) throw new Error('The Instagram account is not connected.');

  const token = encodeURIComponent(accessToken);
  const meRes = await fetch(
    `https://graph.instagram.com/me?fields=id,username&access_token=${token}`,
    { signal: AbortSignal.timeout(12000) },
  );
  const me = await meRes.json().catch(() => ({}));
  if (!meRes.ok || !me?.id) throw new Error(me?.error?.message || 'Instagram did not answer.');

  const mediaRes = await fetch(
    `https://graph.instagram.com/${me.id}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=12&access_token=${token}`,
    { signal: AbortSignal.timeout(12000) },
  );
  const media = await mediaRes.json().catch(() => ({}));
  if (!mediaRes.ok) {
    throw new Error(media?.error?.message || 'Instagram did not return its posts.');
  }

  const account = me.username ? `@${me.username}` : 'Instagram';
  const items = (media.data || []).map((post) => ({
    id: `instagram-${post.id}`,
    source: 'instagram',
    account,
    text: clean(post.caption),
    mediaUrl: httpUrl(
      post.media_type === 'VIDEO' ? post.thumbnail_url || post.media_url : post.media_url,
    ),
    permalink: httpUrl(post.permalink),
    publishedAt: post.timestamp || '',
  }));

  return { account, items };
}

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

// The page the wire reads. A member who administers a page can list it from the token; where
// the connected account cannot, the page's own id is set here and used instead.
const LINKEDIN_ORGANIZATION_ID = '';

// The page a token administers is not carried on the token, so the page is asked which
// organisations this member can post for.
async function resolveOrganization(accessToken) {
  if (LINKEDIN_ORGANIZATION_ID) return `urn:li:organization:${LINKEDIN_ORGANIZATION_ID}`;

  const data = await linkedInGet(
    'https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED&count=10',
    accessToken,
  );
  const urn = (data.elements || [])[0]?.organization || '';
  if (!urn) throw new Error('No LinkedIn page is administered by the connected account.');
  return urn.startsWith('urn:li:organization:') ? urn : `urn:li:organization:${urn}`;
}

async function readLinkedIn(base44) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection('linkedin');
  if (!accessToken) throw new Error('The LinkedIn page is not connected.');

  const organization = await resolveOrganization(accessToken);

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

    // One network being down or unconnected must not take the other off the wire.
    const [instagram, linkedin] = await Promise.allSettled([
      readInstagram(base44),
      readLinkedIn(base44),
    ]);

    const settle = (result, key) =>
      result.status === 'fulfilled'
        ? { key, ok: true, account: result.value.account, reason: null }
        : { key, ok: false, account: '', reason: result.reason?.message || 'Not available.' };

    const items = [instagram, linkedin]
      .filter((result) => result.status === 'fulfilled')
      .flatMap((result) => result.value.items)
      .filter((post) => post.text || post.mediaUrl)
      .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

    const payload = {
      sources: [settle(instagram, 'instagram'), settle(linkedin, 'linkedin')],
      fetchedAt: new Date().toISOString(),
      items,
    };

    held = { at: Date.now(), payload };

    return Response.json(payload);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}