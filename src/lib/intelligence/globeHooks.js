/**
 * Globe hooks — all data fetched server-side via getGlobalIntelData backend function.
 * No VITE_ keys, no CORS issues, no key exposure.
 */
import { useQuery } from '@tanstack/react-query';
import { getGlobalIntelData } from '@/functions/getGlobalIntelData';

// ── Live data: OpenSky military flights + Wingbits flights + GPS jamming ──────
export function useGlobeIntelLive() {
  return useQuery({
    queryKey: ['globe', 'intel-live'],
    queryFn: async () => {
      const res = await getGlobalIntelData({});
      return res.data;
    },
    staleTime: 25_000,
    refetchInterval: 30_000,
    retry: 2,
  });
}

// ── Flight detail + path (fires when an ICAO24 is selected) ──────────────────
export function useGlobeFlightDetail(icao24) {
  return useQuery({
    queryKey: ['globe', 'flight-detail', (icao24 || '').toLowerCase()],
    queryFn: async () => {
      const res = await getGlobalIntelData({ action: 'detail', icao24: icao24.toLowerCase() });
      return res.data;
    },
    staleTime: 12_000,
    refetchInterval: 15_000,
    enabled: !!icao24,
    retry: 1,
  });
}

// ── Flight search ─────────────────────────────────────────────────────────────
export function useGlobeFlightSearch(query) {
  return useQuery({
    queryKey: ['globe', 'flight-search', (query || '').toLowerCase().trim()],
    queryFn: async () => {
      const res = await getGlobalIntelData({ action: 'search', q: query });
      return res.data;
    },
    staleTime: 12_000,
    enabled: !!query && query.trim().length >= 3,
    retry: 1,
  });
}