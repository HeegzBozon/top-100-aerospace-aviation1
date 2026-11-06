import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Who is on the wire right now — read from two live sources and never stored twice:
//   people — the accounts that have beaten inside the window (see usePresenceBeacon)
//   campus — the Colony's own room presence, from the meeting service
// The reading is taken again by the surface every minute; these rows are not a ledger.

const DAILY = 'https://api.daily.co/v1';
const WINDOW_MS = 3 * 60 * 1000;

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

  const cutoff = Date.now() - WINDOW_MS;

  // The beats are read newest first and the window is applied here, so a reading never
  // depends on how a timestamp is compared in the query.
  const [rows, campus] = await Promise.all([
    base44.asServiceRole.entities.Presence
      .list({ sort: '-last_seen_at', limit: 400 })
      .catch(() => []),
    readCampus(),
  ]);

  // One reading per person: whoever beat last speaks for them, whichever device it was.
  const seen = new Map();
  const live = rows.filter((row) => new Date(row.last_seen_at).getTime() >= cutoff);
  for (const row of live) {
    const key = String(row.user_email || '').toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.set(key, {
      name: row.user_name || key,
      route: row.route || '/',
      last_seen_at: row.last_seen_at,
    });
  }
  const people = [...seen.values()];

  return Response.json({
    people: { online: people.length, standing: people.slice(0, 24) },
    campus,
    readAt: new Date().toISOString(),
  });
});