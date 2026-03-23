// ── OpenSky Network (Military Flights + Theater Posture) ──
// Add VITE_OPENSKY_USERNAME + VITE_OPENSKY_PASSWORD to .env.local for 10× rate limit (400→4000 req/day).
// Free account: https://opensky-network.org/index.php?option=com_users&view=registration
export async function fetchOpenSkyStates(signal) {
  const user = import.meta.env.VITE_OPENSKY_USERNAME;
  const pass = import.meta.env.VITE_OPENSKY_PASSWORD;
  const headers = user && pass
    ? { Authorization: `Basic ${btoa(`${user}:${pass}`)}` }
    : {};
  const res = await fetch('https://opensky-network.org/api/states/all', { signal, headers });
  if (!res.ok) throw new Error(`OpenSky returned ${res.status}`);
  return res.json();
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
