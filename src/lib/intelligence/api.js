import { MARITIME_RSS_FEEDS, THEATER_BOUNDS } from './constants';

// ── OpenSky Network (Military Flights + Theater Posture) ──
// Add VITE_OPENSKY_USERNAME + VITE_OPENSKY_PASSWORD to .env.local for 10× rate limit (400→4000 req/day).
// Free account: https://opensky-network.org/index.php?option=com_users&view=registration
//
// Fetches 4 bounded regional payloads (EUCOM, CENTCOM, INDOPACOM, NORTHCOM) instead of the
// ~5-7MB global endpoint, reducing payload ~60% and halving quota usage at the 120s interval.
const OPENSKY_REGIONS = ['EUCOM', 'CENTCOM', 'INDOPACOM', 'NORTHCOM'];

export async function fetchOpenSkyStates(signal) {
  const user = import.meta.env.VITE_OPENSKY_USERNAME;
  const pass = import.meta.env.VITE_OPENSKY_PASSWORD;
  const headers = user && pass
    ? { Authorization: `Basic ${btoa(`${user}:${pass}`)}` }
    : {};

  const fetches = OPENSKY_REGIONS.map(region => {
    const [lamin, lomin, lamax, lomax] = THEATER_BOUNDS[region];
    const url = `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
    return fetch(url, { signal, headers })
      .then(res => { if (!res.ok) throw new Error(`OpenSky ${region} returned ${res.status}`); return res.json(); });
  });

  const results = await Promise.allSettled(fetches);
  const allStates = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value.states || []);

  // Deduplicate by icao24 (index 0) — aircraft near region boundaries appear in multiple fetches
  const seen = new Set();
  const states = allStates.filter(s => {
    const key = s[0];
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { states };
}

// ── Celestrak (Satellite TLEs) ────────────────────────────
export async function fetchSatelliteTLEs(signal) {
  const res = await fetch(
    'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json',
    { signal }
  );
  if (!res.ok) throw new Error(`Celestrak returned ${res.status}`);
  return res.json();
}

// ── RSS Feeds (Aviation News / Digest) ────────────────────
// Two CORS proxies for redundancy — falls back to corsproxy.io if allorigins is down.
const RSS_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

export async function fetchRSSFeed(url, signal) {
  let lastErr;
  for (const proxy of RSS_PROXIES) {
    try {
      const res = await fetch(proxy(url), { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      return parseRSSXML(text);
    } catch (err) {
      if (signal?.aborted) throw err;
      lastErr = err;
    }
  }
  throw new Error(`RSS fetch failed for ${url}: ${lastErr?.message}`);
}

// ── Finnhub (Market Quotes) ──────────────────────────────
export async function fetchFinnhubQuote(symbol, signal) {
  const key = import.meta.env.VITE_FINNHUB_API_KEY;
  if (!key) return { c: 0, d: 0, dp: 0, h: 0, l: 0, o: 0, pc: 0 };
  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`,
    { signal }
  );
  if (!res.ok) throw new Error(`Finnhub ${symbol} returned ${res.status}`);
  return res.json();
}

// ── ACLED (Conflict Events + Risk Scoring) ───────────────
export async function fetchACLEDEvents(params = {}, signal) {
  const key = import.meta.env.VITE_ACLED_API_KEY;
  const email = import.meta.env.VITE_ACLED_EMAIL;
  if (!key || !email) return { data: [] };
  const url = new URL('https://api.acleddata.com/acled/read');
  url.searchParams.set('key', key);
  url.searchParams.set('email', email);
  url.searchParams.set('limit', params.limit || '200');
  url.searchParams.set(
    'event_type',
    params.event_type || 'Battles|Explosions/Remote violence|Violence against civilians'
  );
  if (params.country) url.searchParams.set('country', params.country);
  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error(`ACLED returned ${res.status}`);
  return res.json();
}

// ── USGS Earthquakes (M4.5+ past 7 days, public CORS-enabled endpoint) ──────
export async function fetchUSGSEarthquakes(signal) {
  const res = await fetch(
    'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson',
    { signal }
  );
  if (!res.ok) throw new Error(`USGS returned ${res.status}`);
  return res.json();
}

// ── GDACS Global Disaster Alerts (RSS via proxy) ─────────────────────────────
export async function fetchGDACSAlerts(signal) {
  return fetchRSSFeed('https://www.gdacs.org/xml/rss_24h.xml', signal);
}

// ── CISA Known Exploited Vulnerabilities (JSON, CORS-enabled) ────────────────
export async function fetchCISAKEV(signal) {
  const res = await fetch(
    'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
    { signal }
  );
  if (!res.ok) throw new Error(`CISA KEV returned ${res.status}`);
  return res.json();
}

// ── CISA Alerts RSS ───────────────────────────────────────────────────────────
export async function fetchCISAAlerts(signal) {
  return fetchRSSFeed('https://www.cisa.gov/cybersecurity-advisories/all.xml', signal);
}

// ── Maritime Incidents (multi-source RSS) ─────────────────────────────────────
export async function fetchMaritimeIncidents(signal) {
  const results = await Promise.allSettled(
    MARITIME_RSS_FEEDS.map(url => fetchRSSFeed(url, signal))
  );
  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value);
}

// ── CISA ICS-CERT Advisories (RSS via proxy) ─────────────────────────────────
export async function fetchICSAdvisories(signal) {
  return fetchRSSFeed('https://www.cisa.gov/ics-advisories.xml', signal);
}

// ── GPS Interference (static JSON fallback) ───────────────
export async function fetchGpsInterference(signal) {
  const res = await fetch('/data/gps-interference.json', { signal });
  if (!res.ok) return { events: [] };
  return res.json();
}

// ── Wingbits (Aircraft Enrichment + Live GPS Jam) ─────────
// In-memory cache keyed by lowercase icao24 — aircraft profiles rarely change.
// 24h TTL keeps us well within the 20k/30-day free-trial request budget.
const _wingbitsCache = new Map();
const WINGBITS_TTL = 24 * 60 * 60 * 1000;

function _wingbitsKey() {
  return import.meta.env.VITE_WINGBITS_API_KEY || null;
}

/**
 * Fetch aircraft enrichment from Wingbits for a single ICAO24 hex.
 * Returns null if no API key or request fails.
 */
export async function fetchWingbitsDetails(icao24, signal) {
  const key = (icao24 || '').toLowerCase();
  if (!key) return null;

  const cached = _wingbitsCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < WINGBITS_TTL) return cached.data;

  const apiKey = _wingbitsKey();
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://customer-api.wingbits.com/v1/flights/details/${key}`,
      { headers: { 'x-api-key': apiKey }, signal }
    );
    if (!res.ok) return null;
    const data = await res.json();
    _wingbitsCache.set(key, { data, fetchedAt: Date.now() });
    return data;
  } catch {
    return null;
  }
}

/**
 * Batch-enrich a list of ICAO24 hexes.
 * Cache hits are instant; uncached calls are staggered 80ms apart to stay within rate limits.
 * Returns a Map of icao24 (lowercase) → enrichment object.
 */
export async function fetchWingbitsBatch(icao24List, signal) {
  const result = {};
  for (const icao24 of icao24List) {
    if (signal?.aborted) break;
    const key = (icao24 || '').toLowerCase();
    const wasCached = _wingbitsCache.has(key);
    const data = await fetchWingbitsDetails(key, signal);
    if (data) result[key] = data;
    // Pace uncached network calls to avoid rate-limit bursts
    if (!wasCached && data !== null) {
      await new Promise(r => setTimeout(r, 80));
    }
  }
  return result;
}

// ── Wingbits Live Flights Batch ───────────────────────────
// POSTs 7 area queries (radius + box) to the Wingbits flights endpoint.
// 30-second TTL — balances freshness against the rate budget.
const _liveFlightsCache = new Map();
const LIVE_FLIGHTS_TTL = 30 * 1000;

/**
 * Fetch live flights for 7 pre-defined aerospace-relevant areas in one POST request.
 * Returns Array<{ alias: string, data: Flight[] }> or null on failure / missing key.
 */
export async function fetchWingbitsLiveFlightsBatch(signal) {
  const cached = _liveFlightsCache.get('batch');
  if (cached && Date.now() - cached.fetchedAt < LIVE_FLIGHTS_TTL) return cached.data;

  const apiKey = _wingbitsKey();
  if (!apiKey) return null;

  const body = [
    { alias: 'cape_canaveral', by: 'radius', la: 28.3922,  lo: -80.6077,  rad: 200, unit: 'km' },
    { alias: 'boca_chica',     by: 'radius', la: 25.9969,  lo: -97.1572,  rad: 200, unit: 'km' },
    { alias: 'vandenberg',     by: 'radius', la: 34.7420,  lo: -120.5724, rad: 200, unit: 'km' },
    { alias: 'mahia',          by: 'radius', la: -39.2594, lo: 177.8645,  rad: 200, unit: 'km' },
    { alias: 'eastern_med',    by: 'box',    la: 34.5,     lo: 28.0,      w: 900,   h: 700, unit: 'km' },
    { alias: 'baltic',         by: 'box',    la: 58.0,     lo: 14.0,      w: 900,   h: 700, unit: 'km' },
    { alias: 'black_sea',      by: 'box',    la: 43.0,     lo: 28.0,      w: 900,   h: 600, unit: 'km' },
  ];

  try {
    const res = await fetch('https://customer-api.wingbits.com/v1/flights', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    _liveFlightsCache.set('batch', { data, fetchedAt: Date.now() });
    return data;
  } catch {
    return null;
  }
}

// ── Wingbits GPS Jam (multi-region) ──────────────────────
// Queries 3 bounding boxes in parallel, merges hexes, deduplicates by h3Index.
// 5-minute TTL — GPS interference patterns shift slowly.
const _gpsJamCache = new Map();
const GPS_JAM_TTL = 5 * 60 * 1000;

const _GPS_JAM_BOXES = [
  { min_lat: 30, max_lat: 42, min_lng: 25, max_lng: 42 }, // Eastern Mediterranean
  { min_lat: 54, max_lat: 64, min_lng: 14, max_lng: 28 }, // Baltic
  { min_lat: 46, max_lat: 56, min_lng: 22, max_lng: 40 }, // Eastern Europe
];

/**
 * Fetch live GPS jamming hexes across 3 strategic regions.
 * Returns { hexes: Array, lastUpdated: string|null }.
 */
export async function fetchWingbitsGpsJam(signal) {
  const cached = _gpsJamCache.get('gps-jam');
  if (cached && Date.now() - cached.fetchedAt < GPS_JAM_TTL) return cached.data;

  const apiKey = _wingbitsKey();
  if (!apiKey) return { hexes: [], lastUpdated: null };

  const requests = _GPS_JAM_BOXES.map(box => {
    const params = new URLSearchParams({
      min_lat: box.min_lat,
      max_lat: box.max_lat,
      min_lng: box.min_lng,
      max_lng: box.max_lng,
    });
    return fetch(`https://customer-api.wingbits.com/v1/gps/jam?${params}`, {
      headers: { 'x-api-key': apiKey },
      signal,
    }).then(res => {
      if (!res.ok) throw new Error(`GPS jam ${res.status}`);
      return res.json();
    });
  });

  const results = await Promise.allSettled(requests);
  const allHexes = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value?.hexes || []);

  // Deduplicate by h3Index
  const seen = new Set();
  const mergedHexes = allHexes.filter(h => {
    if (!h?.h3Index || seen.has(h.h3Index)) return false;
    seen.add(h.h3Index);
    return true;
  });

  const data = {
    hexes: mergedHexes,
    lastUpdated: mergedHexes.length > 0 ? new Date().toISOString() : null,
  };
  _gpsJamCache.set('gps-jam', { data, fetchedAt: Date.now() });
  return data;
}

// ── Wingbits Flight Detail (single ICAO24) ────────────────
// 10-second TTL — positional data is highly time-sensitive.
const _flightDetailCache = new Map();
const FLIGHT_DETAIL_TTL = 10 * 1000;

/**
 * Fetch live detail for a single ICAO24 hex.
 * Returns { flight, lastPosition, message } or null on failure / missing key.
 */
export async function fetchWingbitsFlightDetail(icao24, signal) {
  const key = (icao24 || '').toLowerCase();
  if (!key) return null;

  const cached = _flightDetailCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < FLIGHT_DETAIL_TTL) return cached.data;

  const apiKey = _wingbitsKey();
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://customer-api.wingbits.com/v1/flights/${key}`,
      { headers: { 'x-api-key': apiKey }, signal }
    );
    if (!res.ok) return null;
    const data = await res.json();
    _flightDetailCache.set(key, { data, fetchedAt: Date.now() });
    return data;
  } catch {
    return null;
  }
}

// ── Wingbits Flight Path (single ICAO24) ─────────────────
// 60-minute TTL — flight paths change infrequently within a mission window.
const _flightPathCache = new Map();
const FLIGHT_PATH_TTL = 60 * 60 * 1000;

/**
 * Fetch the recorded flight path for a single ICAO24 hex.
 * Returns { flight: { id, name, path: Array<{latitude, longitude, altitude, timestamp}> } }
 * or null on failure / missing key.
 */
export async function fetchWingbitsFlightPath(icao24, signal) {
  const key = (icao24 || '').toLowerCase();
  if (!key) return null;

  const cached = _flightPathCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < FLIGHT_PATH_TTL) return cached.data;

  const apiKey = _wingbitsKey();
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://customer-api.wingbits.com/v1/flights/${key}/path`,
      { headers: { 'x-api-key': apiKey }, signal }
    );
    if (!res.ok) return null;
    const data = await res.json();
    _flightPathCache.set(key, { data, fetchedAt: Date.now() });
    return data;
  } catch {
    return null;
  }
}

// ── Wingbits Flight Search (by callsign, ICAO hex, or registration) ──────────
const _flightSearchCache = new Map();
const FLIGHT_SEARCH_TTL = 15 * 1000;

export async function fetchWingbitsFlightSearch(query, signal) {
  const key = (query || '').toLowerCase().trim();
  if (!key || key.length < 3) return null;

  const cached = _flightSearchCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < FLIGHT_SEARCH_TTL) return cached.data;

  const apiKey = _wingbitsKey();
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://customer-api.wingbits.com/v1/flights/search?query=${encodeURIComponent(key)}`,
      { headers: { 'x-api-key': apiKey }, signal }
    );
    if (!res.ok) return null;
    const data = await res.json();
    _flightSearchCache.set(key, { data, fetchedAt: Date.now() });
    return data;
  } catch {
    return null;
  }
}

// ── Baltic Dry Index (Nasdaq Data Link, public — no API key required) ────────
// Dataset: CHRIS/CME_BF1 (BDI futures front month). Returns last 30 rows.
export async function fetchBDITrend(signal) {
  try {
    const res = await fetch(
      'https://data.nasdaq.com/api/v3/datasets/CHRIS/CME_BF1.json?rows=30',
      { signal }
    );
    if (!res.ok) return { data: [] };
    const json = await res.json();
    // column_names: ['Date', 'Open', 'High', 'Low', 'Last', 'Change', 'Settle', 'Volume', 'Open Interest']
    // data: [[date, open, high, low, last, ...], ...]  newest first
    const rows = (json.dataset?.data || []).map(row => ({
      date: row[0],
      value: row[6] ?? row[4], // Settle price preferred, fallback to Last
    }));
    return { data: rows };
  } catch {
    return { data: [] };
  }
}

// ── RSS XML Parser ───────────────────────────────────────
function parseRSSXML(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  return [...doc.querySelectorAll('item, entry')].map(item => {
    const linkEl = item.querySelector('link');
    const link = linkEl?.textContent || linkEl?.getAttribute('href') || '';
    let source = '';
    try { source = new URL(link).hostname.replace('www.', ''); } catch { /* ignore */ }
    return {
      title: item.querySelector('title')?.textContent || '',
      link,
      pubDate: item.querySelector('pubDate, published, updated')?.textContent || '',
      description: (item.querySelector('description, summary, content')?.textContent || '')
        .replace(/<[^>]*>/g, '')
        .slice(0, 300),
      source,
    };
  });
}