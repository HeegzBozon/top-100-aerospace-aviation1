// Live satellite orbital positions from CelesTrak (U.S. public domain data).
// Fetches GP (General Perturbations) elements and propagates each satellite
// to its current sub-satellite point using simplified Keplerian mechanics.
// Attribution: "Dr. T.S. Kelso / CelesTrak" — displayed on the globe.

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min — TLEs are stable for minutes
let cache = null;
let cacheTs = 0;

const GROUPS = [
  { key: 'stations', label: 'Space Stations' },
  { key: 'visual', label: 'Visual' },
  { key: 'weather', label: 'Weather' },
  { key: 'gps', label: 'GPS' },
  { key: 'iridium', label: 'Iridium' },
  { key: 'noaa', label: 'NOAA' },
  { key: 'starlink', label: 'Starlink' },
];

const MU = 398600.4418; // km³/s²
const RE = 6371; // km

function computeGMST(now) {
  const J2000 = 946728000000; // Jan 1, 2000 12:00 UTC in ms
  const D = (now - J2000) / (24 * 3600 * 1000);
  const T = D / 36525;
  let gmst = 280.46061837 + 360.98564736629 * D + 0.000387933 * T * T;
  gmst = ((gmst % 360) + 360) % 360;
  return gmst * Math.PI / 180;
}

function propagate(sat, now) {
  try {
    const mm = parseFloat(sat.MEAN_MOTION);
    if (!mm || mm <= 0) return null;

    const ecc = parseFloat(sat.ECCENTRICITY) || 0;
    const inc = (parseFloat(sat.INCLINATION) || 0) * Math.PI / 180;
    const raan = (parseFloat(sat.RA_OF_ASC_NODE) || 0) * Math.PI / 180;
    const argp = (parseFloat(sat.ARG_OF_PERICENTER) || 0) * Math.PI / 180;
    const ma = (parseFloat(sat.MEAN_ANOMALY) || 0) * Math.PI / 180;

    // Semi-major axis from mean motion
    const n = mm * 2 * Math.PI / 86400; // rad/s
    const a = Math.cbrt(MU / (n * n)); // km

    // Time since epoch
    const epoch = new Date(sat.EPOCH).getTime();
    const dt = (now - epoch) / 1000; // seconds

    // Current mean anomaly
    const M = ma + n * dt;

    // Solve Kepler's equation: M = E - e*sin(E) (5 iterations is enough)
    let E = M;
    for (let i = 0; i < 5; i++) {
      E = M + ecc * Math.sin(E);
    }

    // True anomaly
    const nu = 2 * Math.atan2(
      Math.sqrt(1 + ecc) * Math.sin(E / 2),
      Math.sqrt(1 - ecc) * Math.cos(E / 2)
    );

    // Radius
    const r = a * (1 - ecc * Math.cos(E));

    // Position in orbital plane
    const xOrb = r * Math.cos(nu);
    const yOrb = r * Math.sin(nu);

    // Rotation matrices: R_z(argp) * R_x(inc) * R_z(raan)
    const cA = Math.cos(argp), sA = Math.sin(argp);
    const cI = Math.cos(inc), sI = Math.sin(inc);
    const cR = Math.cos(raan), sR = Math.sin(raan);

    const x = (cA * cR - sA * sR * cI) * xOrb + (-sA * cR - cA * sR * cI) * yOrb;
    const y = (cA * sR + sA * cR * cI) * xOrb + (-sA * sR + cA * cR * cI) * yOrb;
    const z = (sA * sI) * xOrb + (cA * sI) * yOrb;

    // ECI → lat/lon
    const gmst = computeGMST(now);
    const lat = Math.asin(Math.max(-1, Math.min(1, z / r))) * 180 / Math.PI;
  let lon = (Math.atan2(y, x) - gmst);
  lon = ((lon % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
  lon = lon * 180 / Math.PI;

    const alt = r - RE;

    return { lat, lon, alt };
  } catch {
    return null;
  }
}

export default async function(req) {
  try {
    if (cache && (Date.now() - cacheTs) < CACHE_TTL_MS) {
      return Response.json({ ...cache, cached: true });
    }

    const now = Date.now();
    const fetchOpts = { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(10000) };

    const responses = await Promise.all(
      GROUPS.map(async (g) => {
        const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${g.key}&FORMAT=json`;
        const res = await fetch(url, fetchOpts).catch(() => null);
        if (!res || !res.ok) return [];
        const data = await res.json().catch(() => []);
        return data.map(sat => ({ sat, group: g.key }));
      })
    );

    const allSats = responses.flat();
    const seen = new Set();
    const satellites = [];

    for (const { sat, group } of allSats) {
      const name = sat.OBJECT_NAME || sat.OBJECT_ID || '';
      const id = sat.OBJECT_ID || name;
      if (seen.has(id)) continue;
      seen.add(id);

      const pos = propagate(sat, now);
      if (!pos) continue;

      satellites.push({
        name,
        id,
        lat: pos.lat,
        lon: pos.lon,
        alt: pos.alt, // km above Earth surface
        group,
        epoch: sat.EPOCH,
        inclination: parseFloat(sat.INCLINATION) || 0,
        mean_motion: parseFloat(sat.MEAN_MOTION) || 0,
      });
    }

    const result = {
      satellites,
      total: satellites.length,
      source: 'CelesTrak',
      attribution: 'Dr. T.S. Kelso / CelesTrak (public domain)',
      fetched_at: new Date().toISOString(),
    };

    cache = result;
    cacheTs = Date.now();

    return Response.json(result);
  } catch (error) {
    if (cache) return Response.json({ ...cache, cached: true, stale: true });
    return Response.json({ error: error.message, satellites: [] }, { status: 500 });
  }
}