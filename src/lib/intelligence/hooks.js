import { useQuery, useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  fetchOpenSkyStates,
  fetchSatelliteTLEs,
  fetchRSSFeed,
  fetchFinnhubQuote,
  fetchACLEDEvents,
  fetchGpsInterference,
  fetchWingbitsDetails,
  fetchUSGSEarthquakes,
  fetchGDACSAlerts,
  fetchCISAKEV,
  fetchCISAAlerts,
  fetchMaritimeIncidents,
  fetchICSAdvisories,
  fetchBDITrend,
  fetchWingbitsLiveFlightsBatch,
  fetchWingbitsGpsJam,
  fetchWingbitsFlightDetail,
  fetchWingbitsFlightPath,
} from './api';
import {
  ALL_RSS_FEEDS,
  MILITARY_HEX_PREFIXES,
  DEFENSE_TICKERS,
  AEROSPACE_ENTITIES,
  THEATER_BOUNDS,
  MARITIME_CHOKEPOINTS,
} from './constants';

export function getFlightTheater(lat, lon) {
  for (const [name, [minLat, minLon, maxLat, maxLon]] of Object.entries(THEATER_BOUNDS)) {
    if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) return name;
  }
  return null;
}
import { enrichFlight } from './enrichment';

// ── Shared base query configs (React Query deduplicates identical queryKeys) ──

const OPENSKY_BASE = {
  queryKey: ['intel', 'opensky-raw'],
  queryFn: ({ signal }) => fetchOpenSkyStates(signal),
  staleTime: 30_000,
  refetchInterval: 120_000,
};

const RSS_BASE = {
  queryKey: ['intel', 'rss-raw'],
  queryFn: async ({ signal }) => {
    const results = await Promise.allSettled(
      ALL_RSS_FEEDS.map(url => fetchRSSFeed(url, signal))
    );
    const raw = results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
    return deduplicateItems(raw);
  },
  staleTime: 5 * 60_000,
};

// ── Military Flights (derived from shared OpenSky query) ──────────────────
export function useMilitaryFlights() {
  return useQuery({
    ...OPENSKY_BASE,
    select: (data) => {
      const flights = (data.states || [])
        .map(s => ({
          icao24: s[0],
          callsign: (s[1] || '').trim(),
          country: s[2],
          lon: s[5],
          lat: s[6],
          altitudeM: s[7],                        // raw meters from OpenSky
          altitudeFt: s[7] ? Math.round(s[7] * 3.28084) : null,
          onGround: s[8],
          velocity: s[9],
          heading: s[10],
          verticalRate: s[11],
        }))
        .filter(s => s.lat && s.lon && !s.onGround)
        .filter(s => {
          const hex = (s.icao24 || '').toUpperCase();
          return MILITARY_HEX_PREFIXES.some(p => hex.startsWith(p));
        })
        .map(f => ({ ...f, ...enrichFlight(f.icao24) }))
        .map(f => ({ ...f, theater: getFlightTheater(f.lat, f.lon) }));
      return { flights, total: flights.length, clusters: [] };
    },
  });
}

// ── Theater Posture (derived from same shared OpenSky query — zero extra fetch) ─
export function useTheaterPosture() {
  return useQuery({
    ...OPENSKY_BASE,
    select: (data) => {
      const militaryFlights = (data.states || [])
        .filter(s =>
          MILITARY_HEX_PREFIXES.some(p => (s[0] || '').toUpperCase().startsWith(p))
        )
        .filter(s => s[6] && s[5]);
      return { theaters: computeTheaterPosture(militaryFlights) };
    },
  });
}

// ── Aviation News (derived from shared RSS query) ─────────────────────────
export function useAviationNews() {
  return useQuery({
    ...RSS_BASE,
    select: (items) => ({
      items: items
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
        .slice(0, 40)
        .map((item, i) => ({
          id: i,
          title: item.title,
          url: item.link,
          snippet: item.description,
          source_name: item.source,
          published_at: item.pubDate,
          matched_entities: matchEntities(item),
          category: classifyNewsItem(item),
          threat_level: computeThreatLevel(item),
        })),
    }),
  });
}

// ── News Digest (derived from same shared RSS query — zero extra fetch) ──
export function useNewsFeedDigest() {
  return useQuery({
    ...RSS_BASE,
    select: (items) => ({ categories: categorizeNews(items) }),
  });
}

// ── Satellites (Celestrak TLE) ────────────────────────────────────────────
export function useSatellites() {
  return useQuery({
    queryKey: ['intel', 'satellites'],
    queryFn: async ({ signal }) => {
      const data = await fetchSatelliteTLEs(signal);
      const satellites = data.slice(0, 200).map(s => ({
        id: s.NORAD_CAT_ID,
        name: s.OBJECT_NAME,
        country: s.COUNTRY_CODE || '—',
        type: classifySatellite(s.OBJECT_NAME),
        inclination: s.INCLINATION,
        period: s.PERIOD,
        alt: s.APOAPSIS
          ? Math.round((parseFloat(s.APOAPSIS) + parseFloat(s.PERIAPSIS)) / 2)
          : null,
      }));
      return { satellites };
    },
    staleTime: 60 * 60_000,
  });
}

// ── GPS Interference ──────────────────────────────────────────────────────
export function useGpsJamming() {
  return useQuery({
    queryKey: ['intel', 'gps-jamming'],
    queryFn: ({ signal }) => fetchGpsInterference(signal),
    staleTime: 60 * 60_000,
  });
}

// ── Natural Disasters (USGS + GDACS) ─────────────────────────────────────────
export function useNaturalDisasters() {
  return useQuery({
    queryKey: ['intel', 'natural-disasters'],
    queryFn: async ({ signal }) => {
      const [usgsRaw, gdacsRaw] = await Promise.allSettled([
        fetchUSGSEarthquakes(signal),
        fetchGDACSAlerts(signal),
      ]);

      // USGS earthquakes → normalized events
      const earthquakes = usgsRaw.status === 'fulfilled'
        ? (usgsRaw.value.features || []).map(f => ({
            id: f.id,
            type: 'earthquake',
            title: f.properties.title,
            magnitude: f.properties.mag,
            depth: f.geometry.coordinates[2],
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
            place: f.properties.place,
            url: f.properties.url,
            occurredAt: new Date(f.properties.time).toISOString(),
            severity: f.properties.mag >= 7 ? 'critical'
              : f.properties.mag >= 6 ? 'high'
              : f.properties.mag >= 5 ? 'medium' : 'low',
          }))
        : [];

      // GDACS alerts → normalized events (lat/lon from geo: field in RSS)
      const gdacs = gdacsRaw.status === 'fulfilled'
        ? (gdacsRaw.value || []).slice(0, 30).map((item, i) => {
            // GDACS RSS includes geo:lat/geo:long in description text — parse best-effort
            const latMatch = (item.description || '').match(/lat[itude]*[:\s]+(-?\d+\.?\d*)/i);
            const lonMatch = (item.description || '').match(/lon[gitude]*[:\s]+(-?\d+\.?\d*)/i);
            return {
              id: `gdacs-${i}`,
              type: classifyGDACS(item.title),
              title: item.title,
              magnitude: null,
              lat: latMatch ? parseFloat(latMatch[1]) : null,
              lon: lonMatch ? parseFloat(lonMatch[1]) : null,
              place: item.source || 'Global',
              url: item.link,
              occurredAt: item.pubDate || null,
              severity: /red/i.test(item.title) ? 'critical'
                : /orange/i.test(item.title) ? 'high' : 'medium',
            };
          }).filter(e => e.lat && e.lon)
        : [];

      const events = [...earthquakes, ...gdacs]
        .sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));

      return { events, earthquakeCount: earthquakes.length, gdacsCount: gdacs.length };
    },
    staleTime: 10 * 60_000,
    refetchInterval: 15 * 60_000,
  });
}

function classifyGDACS(title = '') {
  const t = title.toLowerCase();
  if (/earthquake|quake/i.test(t)) return 'earthquake';
  if (/flood/i.test(t)) return 'flood';
  if (/cyclone|hurricane|typhoon|tropical/i.test(t)) return 'cyclone';
  if (/volcano/i.test(t)) return 'volcano';
  if (/tsunami/i.test(t)) return 'tsunami';
  if (/drought/i.test(t)) return 'drought';
  return 'disaster';
}

// ── Cyber Threats (CISA KEV + advisories) ───────────────────────────────────
export function useCyberThreats() {
  return useQuery({
    queryKey: ['intel', 'cyber-threats'],
    queryFn: async ({ signal }) => {
      const [kevRaw, alertsRaw] = await Promise.allSettled([
        fetchCISAKEV(signal),
        fetchCISAAlerts(signal),
      ]);

      // CISA KEV: last 30 entries, newest first
      const kev = kevRaw.status === 'fulfilled'
        ? (kevRaw.value.vulnerabilities || [])
            .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
            .slice(0, 30)
            .map(v => ({
              id: v.cveID,
              cve: v.cveID,
              vendor: v.vendorProject,
              product: v.product,
              name: v.vulnerabilityName,
              description: v.shortDescription,
              dateAdded: v.dateAdded,
              dueDate: v.dueDate,
              ransomware: v.knownRansomwareCampaignUse === 'Known',
              url: `https://www.cve.org/CVERecord?id=${v.cveID}`,
            }))
        : [];

      // CISA alerts RSS: advisory headlines
      const alerts = alertsRaw.status === 'fulfilled'
        ? (alertsRaw.value || []).slice(0, 20).map((item, i) => ({
            id: `alert-${i}`,
            title: item.title,
            link: item.link,
            source: item.source || 'CISA',
            pubDate: item.pubDate,
            snippet: item.description,
            severity: /critical/i.test(item.title) ? 'critical'
              : /high/i.test(item.title) ? 'high'
              : /medium/i.test(item.title) ? 'medium' : 'low',
          }))
        : [];

      return { kev, alerts, kevCount: kev.length, ransomwareCount: kev.filter(v => v.ransomware).length };
    },
    staleTime: 60 * 60_000,   // KEV list updates ~daily
    refetchInterval: 60 * 60_000,
  });
}

// ── Maritime Intelligence (multi-source RSS) ─────────────────────────────────
export function useMaritimeIntel() {
  return useQuery({
    queryKey: ['intel', 'maritime'],
    queryFn: async ({ signal }) => {
      const raw = await fetchMaritimeIncidents(signal);
      const incidents = deduplicateItems(raw)
        .slice(0, 40)
        .map((item, i) => ({
          id: i,
          title: item.title,
          link: item.link,
          source: item.source,
          pubDate: item.pubDate,
          snippet: item.description,
          type: classifyMaritimeIncident(item.title),
        }));
      return { incidents };
    },
    staleTime: 15 * 60_000,
    refetchInterval: 20 * 60_000,
  });
}

function classifyMaritimeIncident(title = '') {
  if (/pirac|hijack|attack|armed/i.test(title)) return 'piracy';
  if (/collision|grounding|aground/i.test(title)) return 'accident';
  if (/sanction|embargo/i.test(title)) return 'sanctions';
  if (/closure|canal|blocked|congest/i.test(title)) return 'disruption';
  if (/drone|missile|houthi|naval/i.test(title)) return 'conflict';
  return 'news';
}

// ── Critical Infrastructure Threats (CISA ICS-CERT advisories) ───────────────
export function useInfraThreats() {
  return useQuery({
    queryKey: ['intel', 'ics-advisories'],
    queryFn: async ({ signal }) => {
      const raw = await fetchICSAdvisories(signal);
      const advisories = (raw || []).slice(0, 25).map((item, i) => ({
        id: i,
        title: item.title,
        link: item.link,
        source: item.source || 'CISA ICS-CERT',
        pubDate: item.pubDate,
        snippet: item.description,
        sector: classifyICSector(item.title),
        severity: /critical/i.test(item.title) ? 'critical'
          : /high/i.test(item.title) ? 'high'
          : /medium/i.test(item.title) ? 'medium' : 'low',
      }));
      return { advisories };
    },
    staleTime: 60 * 60_000,
    refetchInterval: 60 * 60_000,
  });
}

function classifyICSector(title = '') {
  if (/energy|power|electric|grid|oil|gas/i.test(title)) return 'Energy';
  if (/water|wastewater/i.test(title)) return 'Water';
  if (/transport|aviation|rail|port/i.test(title)) return 'Transportation';
  if (/manufactur|chemical/i.test(title)) return 'Manufacturing';
  if (/health|hospital|medical/i.test(title)) return 'Healthcare';
  if (/communicat|telecom/i.test(title)) return 'Communications';
  return 'Industrial';
}

// ── Risk Scores (ACLED → CII) ─────────────────────────────────────────────
export function useRiskScores() {
  return useQuery({
    queryKey: ['intel', 'risk-scores'],
    queryFn: async ({ signal }) => {
      const data = await fetchACLEDEvents({ limit: '500' }, signal);
      return { cii_scores: computeCII(data.data || []), strategic_risks: [] };
    },
    staleTime: 30 * 60_000,
    enabled: !!(import.meta.env.VITE_ACLED_API_KEY),
  });
}

// ── Market Quotes (Finnhub) ──────────────────────────────────────────────
export function useDefenseMarketQuotes() {
  return useQuery({
    queryKey: ['intel', 'market-quotes'],
    queryFn: async ({ signal }) => {
      const results = await Promise.allSettled(
        DEFENSE_TICKERS.map(sym =>
          fetchFinnhubQuote(sym, signal).then(q => ({ symbol: sym, ...q }))
        )
      );
      const quotes = results
        .filter(r => r.status === 'fulfilled')
        .map(r => ({
          symbol: r.value.symbol,
          price: r.value.c,
          change: r.value.dp,         // percent change
          absoluteChange: r.value.d,  // absolute price change
          high: r.value.h,
          low: r.value.l,
          open: r.value.o,
          prevClose: r.value.pc,
        }));
      return { quotes };
    },
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
  });
}

// ── Conflict Events (ACLED) ──────────────────────────────────────────────
export function useConflictEvents(params = {}) {
  return useQuery({
    queryKey: ['intel', 'conflict-events', params],
    queryFn: async ({ signal }) => {
      const data = await fetchACLEDEvents(params, signal);
      const events = (data.data || []).map(e => ({
        id: e.data_id,
        eventType: e.event_type,
        country: e.country,
        location: {
          latitude: parseFloat(e.latitude),
          longitude: parseFloat(e.longitude),
        },
        occurredAt: e.event_date,
        fatalities: parseInt(e.fatalities) || 0,
        actors: [e.actor1, e.actor2].filter(Boolean),
        admin1: e.admin1,
        source: e.source,
      }));
      return { events };
    },
    staleTime: 15 * 60_000,
    enabled: !!(import.meta.env.VITE_ACLED_API_KEY),
  });
}

// ── Wingbits Aircraft Enrichment ─────────────────────────────────────────
// One React Query cache entry per ICAO24 → perfect deduplication across tabs.
// 24h staleTime matches the in-api-layer cache so we never double-fetch.
// Key is server-side only (no VITE_WINGBITS_API_KEY needed in frontend).
export function useWingbitsEnrichment(icao24List = []) {
  const queries = useQueries({
    queries: icao24List.map(icao24 => ({
      queryKey: ['intel', 'wingbits-aircraft', icao24.toLowerCase()],
      queryFn: () => fetchWingbitsDetails(icao24),
      staleTime: 24 * 60 * 60_000,
      gcTime: 24 * 60 * 60_000,
      enabled: !!icao24,
    })),
  });

  // Return a plain object: { [icao24_lowercase]: enrichmentData | null }
  const enrichment = {};
  icao24List.forEach((icao24, i) => {
    enrichment[icao24.toLowerCase()] = queries[i]?.data ?? null;
  });
  return { enrichment, isLoading: queries.some(q => q.isLoading), hasKey: true };
}

// ── Supply Chain Intelligence ─────────────────────────────────────────────
// Disruption alerts derived from shared RSS_BASE (zero extra fetch).
// BDI trend from Nasdaq Data Link public endpoint (no key required, graceful fallback).
export function useSupplyChainIntel() {
  const disruptions = useQuery({
    ...RSS_BASE,
    select: (items) => {
      const filtered = items.filter(item => {
        const text = `${item.title} ${item.description}`.toLowerCase();
        return /suez|panama|canal|blocked|freight disruption|shipping disruption/.test(text);
      });
      return filtered.slice(0, 20).map((item, i) => ({
        id: i,
        title: item.title,
        link: item.link,
        source: item.source,
        pubDate: item.pubDate,
        snippet: item.description,
        canal: /suez/i.test(item.title + item.description) ? 'Suez'
          : /panama/i.test(item.title + item.description) ? 'Panama'
          : 'Other',
      }));
    },
  });

  const bdi = useQuery({
    queryKey: ['intel', 'bdi-trend'],
    queryFn: ({ signal }) => fetchBDITrend(signal),
    staleTime: 15 * 60_000,
    refetchInterval: 20 * 60_000,
  });

  // Chokepoint status derived from static MARITIME_CHOKEPOINTS constant
  const FOCUS_CHOKEPOINTS = ['Suez Canal', 'Panama Canal', 'Strait of Hormuz', 'Strait of Malacca'];
  const chokepoints = MARITIME_CHOKEPOINTS
    .filter(c => FOCUS_CHOKEPOINTS.includes(c.name))
    .map(c => ({
      ...c,
      statusColor: c.risk === 'high' ? 'red'
        : c.risk === 'elevated' ? 'yellow'
        : 'green',
    }));

  return {
    disruptions: disruptions.data || [],
    isLoadingDisruptions: disruptions.isLoading,
    bdiData: bdi.data?.data || [],
    isLoadingBDI: bdi.isLoading,
    chokepoints,
  };
}

// ── Wingbits Live Flights ─────────────────────────────────────────────────
// Key is server-side only — always enabled, no VITE_ env var needed.
export function useWingbitsLiveFlights() {
  return useQuery({
    queryKey: ['intel', 'wingbits-live-flights'],
    queryFn: () => fetchWingbitsLiveFlightsBatch(),
    staleTime: 25_000,           // slightly under 30s server cache
    refetchInterval: 30_000,
    placeholderData: null,
  });
}

// ── Wingbits GPS Jamming ──────────────────────────────────────────────────
export function useWingbitsGpsJam() {
  return useQuery({
    queryKey: ['intel', 'wingbits-gps-jam'],
    queryFn: () => fetchWingbitsGpsJam(),
    staleTime: 4 * 60_000,       // 4min (server caches 5min)
    refetchInterval: 5 * 60_000,
    placeholderData: { hexes: [], lastUpdated: null },
  });
}

// ── Wingbits Flight Detail ────────────────────────────────────────────────
export function useWingbitsFlightDetail(icao24) {
  return useQuery({
    queryKey: ['intel', 'wingbits-flight-detail', (icao24 || '').toLowerCase()],
    queryFn: () => fetchWingbitsFlightDetail(icao24),
    staleTime: 10_000,
    refetchInterval: 15_000,
    enabled: !!icao24,
  });
}

// ── Wingbits Flight Path ──────────────────────────────────────────────────
export function useWingbitsFlightPath(icao24) {
  return useQuery({
    queryKey: ['intel', 'wingbits-flight-path', (icao24 || '').toLowerCase()],
    queryFn: () => fetchWingbitsFlightPath(icao24),
    staleTime: 60 * 60_000,
    enabled: !!icao24,
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────

// ── Threat level (1–5) from headline + description keywords ──────────────────
function computeThreatLevel(item) {
  const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();
  if (/\b(war|invasion|invade|airstrike|strike|attacked|missile|nuclear|ballistic)\b/.test(text)) return 5;
  if (/\b(sanctions|conflict|escalation|hostilities|coup|deployment)\b/.test(text)) return 4;
  if (/\b(tensions|warning|incident|violation|standoff|intercept|disputed)\b/.test(text)) return 3;
  if (/\b(military exercise|drill|treaty|surveillance|reconnaissance|intelligence)\b/.test(text)) return 2;
  if (/\b(procurement|contract|funding|modernization|awarded|upgrade)\b/.test(text)) return 1;
  return null;
}

// ── Entity matching against AEROSPACE_ENTITIES list ──────────────────────────
function matchEntities(item) {
  const text = `${item.title || ''} ${item.description || ''}`;
  return AEROSPACE_ENTITIES.filter(entity => {
    // Use word-boundary regex for short tokens (≤3 chars) to avoid false positives
    if (entity.length <= 3) {
      return new RegExp(`\\b${entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text);
    }
    return text.toLowerCase().includes(entity.toLowerCase());
  });
}

// ── Deduplication by normalized title ────────────────────────────────────────
function normalizeTitle(title) {
  return (title || '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
}

function deduplicateItems(items) {
  const seen = new Map();
  for (const item of items) {
    const key = normalizeTitle(item.title);
    if (key && !seen.has(key)) seen.set(key, item);
  }
  return [...seen.values()];
}

function classifySatellite(name) {
  const n = (name || '').toUpperCase();
  if (/USA|NROL|LACROSSE|ONYX|MISTY|KH-/.test(n)) return 'military';
  if (/SAR|COSMO|ICEYE|CAPELLA/.test(n)) return 'sar';
  if (/STARLINK|IRIDIUM|GLOBALSTAR|ORBCOMM/.test(n)) return 'communication';
  if (/LANDSAT|SENTINEL|WORLDVIEW|PLEIADES/.test(n)) return 'optical';
  return null;
}

function classifyNewsItem(item) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  if (/war|conflict|sanction|military|nato|missile|troops/.test(text)) return 'geopolitics';
  if (/defense|lockheed|raytheon|northrop|weapon|pentagon/.test(text)) return 'defense';
  if (/ai|space|satellite|launch|rocket|spacex|starship/.test(text)) return 'technology';
  if (/stock|market|earnings|revenue|profit|shares/.test(text)) return 'markets';
  return 'aviation';
}

function categorizeNews(items) {
  const cats = { geopolitics: [], aviation: [], technology: [], markets: [], defense: [] };
  for (const item of items) {
    const cat = classifyNewsItem(item);
    cats[cat].push(item);
  }
  const result = {};
  for (const [key, arr] of Object.entries(cats)) {
    if (arr.length > 0) {
      const sorted = arr.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      result[key] = {
        lastUpdated: sorted.length > 0 ? (new Date(sorted[0].pubDate).toISOString() || null) : null,
        items: sorted.slice(0, 30).map((item, i) => ({
          id: `${key}-${i}`,
          title: item.title,
          link: item.link,
          source: item.source,
          published_at: item.pubDate,
          snippet: item.description,
          matched_entities: matchEntities(item),
          threat_level: computeThreatLevel(item),
        })),
      };
    }
  }
  return result;
}

function computeCII(acledEvents) {
  const byCountry = {};
  for (const e of acledEvents) {
    const c = e.country;
    if (!c) continue;
    if (!byCountry[c]) byCountry[c] = { region: c, events: 0, fatalities: 0, battles: 0 };
    byCountry[c].events++;
    byCountry[c].fatalities += parseInt(e.fatalities) || 0;
    if (e.event_type === 'Battles') byCountry[c].battles++;
  }
  return Object.values(byCountry)
    .map(c => {
      const eventScore = Math.min(c.events * 2, 40);
      const fatalityScore = Math.min(c.fatalities * 0.5, 30);
      const battleScore = Math.min(c.battles * 5, 30);
      const combined = Math.min(eventScore + fatalityScore + battleScore, 100);
      const trend = combined > 60 ? 1 : combined > 30 ? 3 : 2;
      return { region: c.region, combined_score: Math.round(combined), trend };
    })
    .sort((a, b) => b.combined_score - a.combined_score)
    .slice(0, 20);
}

function computeTheaterPosture(militaryStates) {
  const theaters = Object.fromEntries(
    Object.entries(THEATER_BOUNDS).map(([k, b]) => [k, { bounds: b, flights: 0 }])
  );
  for (const s of militaryStates) {
    const lat = s[6], lon = s[5];
    for (const [, t] of Object.entries(theaters)) {
      if (lat >= t.bounds[0] && lon >= t.bounds[1] && lat <= t.bounds[2] && lon <= t.bounds[3]) {
        t.flights++;
        break;
      }
    }
  }
  return Object.entries(theaters).map(([theater, t]) => ({
    theater,
    postureLevel: t.flights > 50 ? 'heightened' : t.flights > 20 ? 'raised' : 'normal',
    activeFlights: t.flights,
    trackedVessels: null,
    activeOperations: [],
    assessedAt: new Date().toISOString(),
  }));
}

// ── Fleet ORBAT (Order of Battle) ────────────────────────────────────────────
// Aggregates Wingbits-enriched flights into a live operator registry.
export function useFleetORBAT() {
  const { data: flightData } = useMilitaryFlights();
  const flights = flightData?.flights ?? [];
  const icao24s = flights.map(f => f.icao24).filter(Boolean);
  const { enrichment } = useWingbitsEnrichment(icao24s);

  return useMemo(() => {
    const registry = {};
    for (const flight of flights) {
      const wb = enrichment?.[flight.icao24?.toLowerCase()] ?? {};
      const operator = wb.operator || flight.operator || flight.originCountry || flight.country || 'Unknown';
      const theater = flight.theater || 'Unknown';

      if (!registry[operator]) {
        registry[operator] = {
          operator,
          country: flight.operatorCountry || flight.country || null,
          flag: flight.operatorFlag || null,
          total: 0,
          theaters: new Set(),
        };
      }
      registry[operator].total++;
      registry[operator].theaters.add(theater);
    }

    const orbat = Object.values(registry)
      .map(r => ({ ...r, theaters: [...r.theaters] }))
      .sort((a, b) => b.total - a.total);

    return {
      orbat,
      totalFlights: flights.length,
      totalOperators: orbat.length,
    };
  }, [flights, enrichment]);
}
