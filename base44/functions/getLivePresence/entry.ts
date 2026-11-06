import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Who is on the wire right now. Two readings, both live, both admin-only:
//   site   — the app's own property, read in realtime (the last half hour of readers)
//   campus — the Colony's rooms, read from the meeting service's own presence
// Nothing here is durable: it is a reading of this minute, taken again next minute.

const GA = 'https://analyticsdata.googleapis.com/v1beta';
const DAILY = 'https://api.daily.co/v1';

// Resolved once per warm isolate, so a minute-by-minute reading does not re-walk the
// account tree every time.
let cachedProperty = null;

async function resolveProperty(token) {
  if (cachedProperty) return cachedProperty;
  const headers = { Authorization: `Bearer ${token}` };
  const acctRes = await fetch('https://analyticsadmin.googleapis.com/v1alpha/accounts', { headers });
  const accounts = (await acctRes.json()).accounts || [];
  for (const account of accounts.slice(0, 10)) {
    const propsRes = await fetch(
      `https://analyticsadmin.googleapis.com/v1alpha/properties?filter=parent:${account.name}`,
      { headers }
    );
    const properties = (await propsRes.json()).properties || [];
    if (properties.length) {
      cachedProperty = properties[0].name;
      return cachedProperty;
    }
  }
  return null;
}

async function readSite(base44) {
  try {
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_analytics');
    const propertyId = await resolveProperty(accessToken);
    if (!propertyId) return { state: 'empty', active: 0, pages: [] };

    const post = (body) =>
      fetch(`${GA}/${propertyId}:runRealtimeReport`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

    const [totalRes, pagesRes] = await Promise.all([
      post({ metrics: [{ name: 'activeUsers' }] }),
      post({
        metrics: [{ name: 'activeUsers' }],
        dimensions: [{ name: 'unifiedScreenName' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 4,
      }),
    ]);

    const [totalData, pagesData] = await Promise.all([totalRes.json(), pagesRes.json()]);
    if (totalData.error) return { state: 'error', active: 0, pages: [], reason: totalData.error.message };

    const active = Number(totalData.rows?.[0]?.metricValues?.[0]?.value || 0);
    const pages = (pagesData.rows || [])
      .map((row) => ({
        label: row.dimensionValues?.[0]?.value || '(not set)',
        users: Number(row.metricValues?.[0]?.value || 0),
      }))
      .filter((page) => page.users > 0);

    return { state: 'ready', active, pages };
  } catch (error) {
    return { state: 'error', active: 0, pages: [], reason: error.message };
  }
}

// colony-media-hub-2 → Media hub
function labelFor(name) {
  const bare = name.replace(/^colony-/, '').replace(/-\d+$/, '');
  if (bare === 'main') return 'Main hall';
  const words = bare.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

async function readCampus() {
  const key = Deno.env.get('DAILY_API_KEY');
  if (!key) return { state: 'empty', total: 0, rooms: [] };
  const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

  try {
    const roomsRes = await fetch(`${DAILY}/rooms`, { headers });
    const rooms = ((await roomsRes.json()).data || []).filter((room) =>
      /^colony-[a-z0-9-]+$/.test(room.name || '')
    );

    const readings = await Promise.all(
      rooms.map(async (room) => {
        const res = await fetch(`${DAILY}/rooms/${room.name}/presence`, { headers });
        if (!res.ok) return null;
        const count = Number((await res.json()).total_count) || 0;
        return count > 0 ? { key: room.name, label: labelFor(room.name), count } : null;
      })
    );

    const standing = readings.filter(Boolean).sort((a, b) => b.count - a.count);
    return {
      state: standing.length ? 'ready' : 'empty',
      total: standing.reduce((sum, room) => sum + room.count, 0),
      rooms: standing,
    };
  } catch (error) {
    return { state: 'error', total: 0, rooms: [], reason: error.message };
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

  const [site, campus] = await Promise.all([readSite(base44), readCampus()]);

  return Response.json({ site, campus, readAt: new Date().toISOString() });
});