import { useQuery } from '@tanstack/react-query';
import {
  fetchOpenSkyStates,
  fetchSatelliteTLEs,
  fetchRSSFeed,
  fetchFinnhubQuote,
  fetchACLEDEvents,
  fetchGpsInterference,
} from './api';
import {
  AVIATION_RSS_FEEDS,
  MILITARY_HEX_PREFIXES,
  DEFENSE_TICKERS,
} from './constants';

// ── Military Flights ──────────────────────────────────────
export function useMilitaryFlights() {
  return useQuery({
    queryKey: ['intel', 'military-flights'],
    queryFn: async ({ signal }) => {
      const data = await fetchOpenSkyStates(signal);
      const flights = (data.states || [])
        .map(s => ({
          icao24: s[0],
          callsign: (s[1] || '').trim(),
          country: s[2],
          lon: s[5],
          lat: s[6],
          altitude: s[7],
          onGround: s[8],
          velocity: s[9],
          heading: s[10],
          verticalRate: s[11],
        }))
        .filter(s => s.lat && s.lon && !s.onGround)
        .filter(s => {
          const hex = (s.icao24 || '').toUpperCase();
          return MILITARY_HEX_PREFIXES.some(p => hex.startsWith(p));
        });
      return { flights, total: flights.length, clusters: [] };
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// ── Aviation News ─────────────────────────────────────────
export function useAviationNews() {
  return useQuery({
    queryKey: ['intel', 'aviation-news'],
    queryFn: async ({ signal }) => {
      const results = await Promise.allSettled(
        AVIATION_RSS_FEEDS.map(url => fetchRSSFeed(url, signal))
      );
      const items = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value)
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
        .slice(0, 30)
        .map((item, i) => ({
          id: i,
          title: item.title,
          url: item.link,
          snippet: item.description,
          source_name: item.source,
          published_at: item.pubDate,
          matched_entities: [],
        }));
      return { items };
    },
    staleTime: 5 * 60_000,
  });
}

// ── Satellites ────────────────────────────────────────────
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

// ── GPS Interference ──────────────────────────────────────
export function useGpsJamming() {
  return useQuery({
    queryKey: ['intel', 'gps-jamming'],
    queryFn: ({ signal }) => fetchGpsInterference(signal),
    staleTime: 60 * 60_000,
  });
}

// ── News Digest ───────────────────────────────────────────
export function useNewsFeedDigest() {
  return useQuery({
    queryKey: ['intel', 'news-digest'],
    queryFn: async ({ signal }) => {
      const results = await Promise.allSettled(
        AVIATION_RSS_FEEDS.map(url => fetchRSSFeed(url, signal))
      );
      const allItems = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value);
      return { categories: categorizeNews(allItems) };
    },
    staleTime: 5 * 60_000,
  });
}

// ── Risk Scores ───────────────────────────────────────────
export function useRiskScores() {
  return useQuery({
    queryKey: ['intel', 'risk-scores'],
    queryFn: async ({ signal }) => {
      const data = await fetchACLEDEvents({ limit: '500' }, signal);
      const events = data.data || [];
      return { cii_scores: computeCII(events), strategic_risks: [] };
    },
    staleTime: 30 * 60_000,
    enabled: !!(import.meta.env.VITE_ACLED_API_KEY),
  });
}

// ── Market Quotes ─────────────────────────────────────────
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
          change: r.value.dp,
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

// ── Conflict Events ───────────────────────────────────────
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

// ── Theater Posture ───────────────────────────────────────
export function useTheaterPosture() {
  return useQuery({
    queryKey: ['intel', 'theater-posture'],
    queryFn: async ({ signal }) => {
      const data = await fetchOpenSkyStates(signal);
      const militaryFlights = (data.states || [])
        .filter(s =>
          MILITARY_HEX_PREFIXES.some(p => (s[0] || '').toUpperCase().startsWith(p))
        )
        .filter(s => s[6] && s[5]);
      return { theaters: computeTheaterPosture(militaryFlights) };
    },
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
  });
}

// ── Helpers ───────────────────────────────────────────────

function classifySatellite(name) {
  const n = (name || '').toUpperCase();
  if (/USA|NROL|LACROSSE|ONYX|MISTY|KH-/.test(n)) return 'military';
  if (/SAR|COSMO|ICEYE|CAPELLA/.test(n)) return 'sar';
  if (/STARLINK|IRIDIUM|GLOBALSTAR|ORBCOMM/.test(n)) return 'communication';
  if (/LANDSAT|SENTINEL|WORLDVIEW|PLEIADES/.test(n)) return 'optical';
  return null;
}

function categorizeNews(items) {
  const cats = {
    geopolitics: [],
    aviation: [],
    technology: [],
    markets: [],
    defense: [],
  };
  for (const item of items) {
    const text = `${item.title} ${item.description}`.toLowerCase();
    if (/war|conflict|sanction|military|nato|missile/.test(text))
      cats.geopolitics.push(item);
    else if (/flight|airline|airport|faa|airbus|boeing/.test(text))
      cats.aviation.push(item);
    else if (/ai|space|satellite|launch|rocket|spacex/.test(text))
      cats.technology.push(item);
    else if (/stock|market|earnings|revenue|profit/.test(text))
      cats.markets.push(item);
    else if (/defense|lockheed|raytheon|northrop|weapon/.test(text))
      cats.defense.push(item);
    else cats.aviation.push(item);
  }
  const result = {};
  for (const [key, arr] of Object.entries(cats)) {
    if (arr.length > 0) {
      result[key] = {
        items: arr
          .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
          .slice(0, 30)
          .map((item, i) => ({
            id: `${key}-${i}`,
            title: item.title,
            link: item.link,
            source: item.source,
            published_at: item.pubDate,
            threat: null,
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
    if (!byCountry[c])
      byCountry[c] = { region: c, events: 0, fatalities: 0, battles: 0 };
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
  const theaters = {
    EUCOM: { bounds: [35, -30, 72, 40], flights: 0 },
    CENTCOM: { bounds: [10, 25, 45, 75], flights: 0 },
    INDOPACOM: { bounds: [-10, 60, 50, 180], flights: 0 },
    NORTHCOM: { bounds: [15, -170, 72, -50], flights: 0 },
    SOUTHCOM: { bounds: [-60, -120, 15, -30], flights: 0 },
    AFRICOM: { bounds: [-35, -20, 37, 55], flights: 0 },
  };
  for (const s of militaryStates) {
    const lat = s[6];
    const lon = s[5];
    for (const [, t] of Object.entries(theaters)) {
      if (
        lat >= t.bounds[0] &&
        lon >= t.bounds[1] &&
        lat <= t.bounds[2] &&
        lon <= t.bounds[3]
      ) {
        t.flights++;
        break;
      }
    }
  }
  return Object.entries(theaters).map(([theater, t]) => ({
    theater,
    postureLevel:
      t.flights > 50 ? 'heightened' : t.flights > 20 ? 'raised' : 'normal',
    activeFlights: t.flights,
    trackedVessels: null,
    activeOperations: [],
    assessedAt: new Date().toISOString(),
  }));
}
