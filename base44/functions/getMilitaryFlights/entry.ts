import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// OpenSky has a dedicated anonymous endpoint for a bounded area
// We query multiple regions known for military activity to stay under timeout
const REGIONS = [
  // Eastern Europe / Ukraine
  { lamin: 44, lomin: 22, lamax: 55, lomax: 42 },
  // Middle East
  { lamin: 25, lomin: 30, lamax: 38, lomax: 55 },
  // Western Pacific
  { lamin: 20, lomin: 115, lamax: 40, lomax: 135 },
];

const MILITARY_SQUAWKS = ['7700', '7600', '7500'];
const MILITARY_PREFIXES = ['RCH', 'DUKE', 'RAID', 'FURY', 'VIPER', 'EAGLE', 'HAWK', 'COBRA', 'REACH', 'REAPER', 'JOLLY', 'PEDRO'];

async function fetchRegion(bounds) {
  const { lamin, lomin, lamax, lomax } = bounds;
  const url = `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(7000) });
  if (!res.ok) return [];
  const data = await res.json();
  return data.states || [];
}

function parseState(s) {
  return {
    id: s[0],
    callsign: (s[1] || '').trim(),
    origin_country: s[2],
    longitude: s[5],
    latitude: s[6],
    altitude: s[7] ? Math.round(s[7] * 3.28084) : 0,
    on_ground: s[8],
    velocity: s[9] ? Math.round(s[9] * 1.944) : 0,
    heading: s[10],
    squawk: s[14],
    is_interesting: MILITARY_SQUAWKS.includes(s[14]),
    operator: s[2],
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const results = await Promise.allSettled(REGIONS.map(fetchRegion));
    const allStates = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);

    const flights = allStates
      .filter(s => {
        const callsign = (s[1] || '').trim().toUpperCase();
        const squawk = s[14] || '';
        return (
          MILITARY_PREFIXES.some(p => callsign.startsWith(p)) ||
          MILITARY_SQUAWKS.includes(squawk)
        );
      })
      .map(parseState)
      .slice(0, 100);

    return Response.json({
      flights,
      clusters: [],
      total_tracked: allStates.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});