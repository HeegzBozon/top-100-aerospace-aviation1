import { MARITIME_RSS_FEEDS, THEATER_BOUNDS } from './constants';
import { base44 } from '@/api/base44Client';

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
// All Wingbits calls are proxied through Base44 backend functions to avoid CORS.
// In-memory cache keyed by lowercase icao24 — aircraft profiles rarely change.
// 24h TTL keeps us well within the 20k/30-day free-trial request budget.
const _wingbitsCache = new Map();
const WINGBITS_TTL = 24 * 60 * 60 * 1000;

/**
 * Fetch aircraft enrichment from Wingbits for a single ICAO24 hex.
 * Proxied through Base44 getWingbitsAircraftDetails function (CORS-safe).
 * Returns null if request fails.
 */
export async function fetchWingbitsDetails(icao24) {
  const key = (icao24 || '').toLowerCase();
  if (!key) return null;

  const cached = _wingbitsCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < WINGBITS_TTL) return cached.data;

  try {
    const data = await base44.functions.getWingbitsAircraftDetails({ icao24: key });
    if (!data || data.error) return null;
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
    const data = await fetchWingbitsDetails(key);
    if (data) result[key] = data;
    // Pace uncached network calls to avoid rate-limit bursts
    if (!wasCached && data !== null) {
      await new Promise(r => setTimeout(r, 80));
    }
  }
  return result;
}

// ── Wingbits Live Flights Batch ───────────────────────────
// Proxied through Base44 getWingbitsLiveFlights (CORS-safe).
// 30-second TTL — balances freshness against the rate budget.
const _liveFlightsCache = new Map();
const LIVE_FLIGHTS_TTL = 30 * 1000;

/**
 * Fetch live flights for 7 pre-defined aerospace-relevant areas in one batch.
 * Returns Array<{ alias: string, data: Flight[] }> or null on failure.
 */
export async function fetchWingbitsLiveFlightsBatch() {
  const cached = _liveFlightsCache.get('batch');
  if (cached && Date.now() - cached.fetchedAt < LIVE_FLIGHTS_TTL) return cached.data;

  try {
    const data = await base44.functions.getWingbitsLiveFlights({});
    if (!data || data.error) return null;
    _liveFlightsCache.set('batch', { data, fetchedAt: Date.now() });
    return data;
  } catch {
    return null;
  }
}

// ── Wingbits GPS Jam (multi-region) ──────────────────────
// Proxied through Base44 getWingbitsGpsJam (CORS-safe).
// 5-minute TTL — GPS interference patterns shift slowly.
const _gpsJamCache = new Map();
const GPS_JAM_TTL = 5 * 60 * 1000;

/**
 * Fetch live GPS jamming hexes across 3 strategic regions (Eastern Med, Baltic, Eastern Europe).
 * Returns { hexes: Array, lastUpdated: string|null }.
 */
export async function fetchWingbitsGpsJam() {
  const cached = _gpsJamCache.get('gps-jam');
  if (cached && Date.now() - cached.fetchedAt < GPS_JAM_TTL) return cached.data;

  try {
    const data = await base44.functions.getWingbitsGpsJam({});
    if (!data || data.error) return { hexes: [], lastUpdated: null };
    _gpsJamCache.set('gps-jam', { data, fetchedAt: Date.now() });
    return data;
  } catch {
    return { hexes: [], lastUpdated: null };
  }
}

// ── Wingbits Flight Detail (single ICAO24) ────────────────
// Proxied through Base44 getWingbitsFlightDetail (CORS-safe).
// 10-second TTL — positional data is highly time-sensitive.
const _flightDetailCache = new Map();
const FLIGHT_DETAIL_TTL = 10 * 1000;

/**
 * Fetch live detail for a single ICAO24 hex.
 * Returns { flight, lastPosition, message } or null on failure.
 */
export async function fetchWingbitsFlightDetail(icao24) {
  const key = (icao24 || '').toLowerCase();
  if (!key) return null;

  const cached = _flightDetailCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < FLIGHT_DETAIL_TTL) return cached.data;

  try {
    const data = await base44.functions.getWingbitsFlightDetail({ icao24: key });
    if (!data || data.error) return null;
    _flightDetailCache.set(key, { data, fetchedAt: Date.now() });
    return data;
  } catch {
    return null;
  }
}

// ── Wingbits Flight Path (single ICAO24) ─────────────────
// Proxied through Base44 getWingbitsFlightPath (CORS-safe).
// 60-minute TTL — flight paths change infrequently within a mission window.
const _flightPathCache = new Map();
const FLIGHT_PATH_TTL = 60 * 60 * 1000;

/**
 * Fetch the recorded flight path for a single ICAO24 hex.
 * Returns { flight: { id, name, path: Array<{latitude, longitude, altitude, timestamp}> } }
 * or null on failure.
 */
export async function fetchWingbitsFlightPath(icao24) {
  const key = (icao24 || '').toLowerCase();
  if (!key) return null;

  const cached = _flightPathCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < FLIGHT_PATH_TTL) return cached.data;

  try {
    const data = await base44.functions.getWingbitsFlightPath({ icao24: key });
    if (!data || data.error) return null;
    _flightPathCache.set(key, { data, fetchedAt: Date.now() });
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
