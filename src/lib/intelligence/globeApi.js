/**
 * Globe API — all calls go through the backend function (server-side keys, no CORS issues).
 * This replaces all VITE_WINGBITS_API_KEY / VITE_OPENSKY_* browser calls.
 */
import { getGlobalIntelData } from '@/functions/getGlobalIntelData';

// Cache live data for 30s to avoid re-fetching on every hook call
let _liveCache = null;
let _liveCacheTime = 0;
const LIVE_TTL = 30_000;

export async function fetchLiveIntelData() {
  const now = Date.now();
  if (_liveCache && now - _liveCacheTime < LIVE_TTL) return _liveCache;
  const res = await getGlobalIntelData({});
  _liveCache = res.data;
  _liveCacheTime = now;
  return res.data;
}

// Per-flight detail + path cache
const _detailCache = new Map();
const DETAIL_TTL = 15_000;

export async function fetchFlightDetail(icao24) {
  if (!icao24) return { detail: null, path: null };
  const key = icao24.toLowerCase();
  const cached = _detailCache.get(key);
  if (cached && Date.now() - cached.ts < DETAIL_TTL) return cached.data;
  const res = await getGlobalIntelData({ action: 'detail', icao24: key });
  _detailCache.set(key, { data: res.data, ts: Date.now() });
  return res.data;
}

const _searchCache = new Map();
const SEARCH_TTL = 15_000;

export async function searchFlight(query) {
  const q = (query || '').trim();
  if (q.length < 3) return null;
  const key = q.toLowerCase();
  const cached = _searchCache.get(key);
  if (cached && Date.now() - cached.ts < SEARCH_TTL) return cached.data;
  const res = await getGlobalIntelData({ action: 'search', q });
  _searchCache.set(key, { data: res.data, ts: Date.now() });
  return res.data;
}