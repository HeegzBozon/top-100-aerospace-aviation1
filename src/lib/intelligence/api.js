// ── OpenSky Network (Military Flights + Theater Posture) ──
export async function fetchOpenSkyStates(signal) {
  const res = await fetch('https://opensky-network.org/api/states/all', { signal });
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
export async function fetchRSSFeed(url, signal) {
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl, { signal });
  if (!res.ok) throw new Error(`RSS fetch failed for ${url}`);
  const text = await res.text();
  return parseRSSXML(text);
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

// ── GPS Interference (static JSON) ───────────────────────
export async function fetchGpsInterference(signal) {
  const res = await fetch('/data/gps-interference.json', { signal });
  if (!res.ok) return { events: [] };
  return res.json();
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
