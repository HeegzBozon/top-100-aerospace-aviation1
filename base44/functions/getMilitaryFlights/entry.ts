import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// OpenSky Network public API - no auth required for basic state vectors
// We filter for interesting callsigns (military patterns)
const MILITARY_PREFIXES = ['RCH', 'DUKE', 'RAID', 'FURY', 'VIPER', 'EAGLE', 'HAWK', 'COBRA', 'KNIFE', 'CHAOS', 'JOLLY', 'PEDRO', 'REACH', 'SWIFT', 'REAPER', 'PREDATOR'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const res = await fetch('https://opensky-network.org/api/states/all', {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`OpenSky returned ${res.status}`);
    const data = await res.json();

    const states = data.states || [];
    // Map OpenSky state vector array to objects
    // [icao24, callsign, origin_country, time_position, last_contact, longitude, latitude, baro_altitude, on_ground, velocity, true_track, vertical_rate, sensors, geo_altitude, squawk, spi, position_source]
    const flights = states
      .filter(s => {
        const callsign = (s[1] || '').trim().toUpperCase();
        return callsign && MILITARY_PREFIXES.some(p => callsign.startsWith(p));
      })
      .slice(0, 100)
      .map(s => ({
        id: s[0],
        callsign: (s[1] || '').trim(),
        origin_country: s[2],
        longitude: s[5],
        latitude: s[6],
        altitude: s[7] ? Math.round(s[7] * 3.28084) : 0, // meters to feet
        on_ground: s[8],
        velocity: s[9] ? Math.round(s[9] * 1.944) : 0, // m/s to knots
        heading: s[10],
        squawk: s[14],
        is_interesting: ['7700', '7600', '7500'].includes(s[14]),
        aircraft_model: 'Military',
        operator: s[2],
      }));

    // Also get general high-altitude interesting traffic
    const generalInteresting = states
      .filter(s => {
        const squawk = s[14];
        const alt = s[7] || 0;
        return ['7700', '7600', '7500'].includes(squawk) && alt > 3000;
      })
      .slice(0, 20)
      .map(s => ({
        id: s[0],
        callsign: (s[1] || '').trim(),
        origin_country: s[2],
        longitude: s[5],
        latitude: s[6],
        altitude: s[7] ? Math.round(s[7] * 3.28084) : 0,
        on_ground: s[8],
        velocity: s[9] ? Math.round(s[9] * 1.944) : 0,
        squawk: s[14],
        is_interesting: true,
        aircraft_model: 'Unknown',
        operator: s[2],
      }));

    const combined = [...flights, ...generalInteresting.filter(g => !flights.find(f => f.id === g.id))];

    return Response.json({
      flights: combined,
      clusters: [],
      total_tracked: states.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});