import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Celestrak public JSON API - completely free, no auth
const CELESTRAK_GROUPS = [
  { url: 'https://celestrak.org/SOCRATES/query.php?CATALOG=active&FORMAT=JSON', type: 'active' },
];

// Use the simpler GP endpoint which returns structured JSON
async function fetchCelestrakGroup(name, query) {
  const url = `https://celestrak.org/SOCRATES/query.php?CATALOG=${query}&FORMAT=JSON`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return [];
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map(sat => ({
    id: sat.OBJECT_ID || sat.NORAD_CAT_ID,
    name: sat.OBJECT_NAME || sat.SATNAME,
    country: sat.COUNTRY || sat.SITE || '—',
    type: name,
    alt: sat.PERIGEE ? Math.round((Number(sat.PERIGEE) + Number(sat.APOGEE || sat.PERIGEE)) / 2) : null,
    period: sat.PERIOD,
    inclination: sat.INCLINATION,
    launch_date: sat.LAUNCH_DATE || sat.LAUNCH,
  }));
}

async function fetchByCategory() {
  // Use the GP (General Perturbations) catalog endpoint
  const categories = [
    { name: 'military', query: 'https://celestrak.org/SOCRATES/query.php?CATALOG=military&FORMAT=JSON' },
  ];

  // Fallback: use the active satellites JSON endpoint
  const endpoints = [
    { name: 'military', url: 'https://celestrak.org/pub/TLE/catalog.txt' },
  ];

  // Best available: celestrak GP JSON catalog
  const res = await fetch('https://celestrak.org/SOCRATES/query.php?CATALOG=active&FORMAT=JSON&LIMIT=200', {
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Celestrak returned ${res.status}`);
  const data = await res.json();
  return data;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Celestrak GP JSON - most reliable free endpoint
    const [milRes, stationRes, weatherRes] = await Promise.allSettled([
      fetch('https://celestrak.org/SOCRATES/query.php?CATALOG=military&FORMAT=JSON', { signal: AbortSignal.timeout(8000) }),
      fetch('https://celestrak.org/SOCRATES/query.php?CATALOG=stations&FORMAT=JSON', { signal: AbortSignal.timeout(8000) }),
      fetch('https://celestrak.org/SOCRATES/query.php?CATALOG=weather&FORMAT=JSON', { signal: AbortSignal.timeout(8000) }),
    ]);

    const processSats = async (result, type) => {
      if (result.status !== 'fulfilled' || !result.value.ok) return [];
      const data = await result.value.json().catch(() => []);
      return (Array.isArray(data) ? data : []).map(sat => ({
        id: sat.OBJECT_ID || sat.NORAD_CAT_ID || String(Math.random()),
        name: sat.OBJECT_NAME || sat.SATNAME || 'Unknown',
        country: sat.COUNTRY || sat.SITE || '—',
        type,
        alt: sat.MEAN_MOTION ? Math.round(42164 - (42164 * Math.pow(sat.MEAN_MOTION / 13.44704, 2/3))) : null,
        inclination: sat.INCLINATION,
        launch_date: sat.LAUNCH_DATE || sat.LAUNCH,
      }));
    };

    const [military, stations, weather] = await Promise.all([
      processSats(milRes, 'military'),
      processSats(stationRes, 'station'),
      processSats(weatherRes, 'weather'),
    ]);

    const satellites = [...military, ...stations, ...weather];

    return Response.json({ satellites });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});