import { useQuery } from '@tanstack/react-query';
import { getGlobeFlights } from '@/functions/getGlobeFlights';
import { getGlobeSatellites } from '@/functions/getGlobeSatellites';
import { getGlobeEarthquakes } from '@/functions/getGlobeEarthquakes';
import { getGlobeNews } from '@/functions/getGlobeNews';
import { getGlobeLaunches } from '@/functions/getGlobeLaunches';

// Centralized data-fetching hook for the Intelligence Globe.
// Each source refetches on its own cadence matching the backend cache TTL.
export function useGlobeData(enabled = {}) {
  const flights = useQuery({
    queryKey: ['globe-flights'],
    queryFn: async () => (await getGlobeFlights({})).data,
    refetchInterval: 60_000,
    staleTime: 55_000,
    enabled: enabled.flights !== false,
  });

  const satellites = useQuery({
    queryKey: ['globe-satellites'],
    queryFn: async () => (await getGlobeSatellites({})).data,
    refetchInterval: 300_000,
    staleTime: 290_000,
    enabled: enabled.satellites !== false,
  });

  const earthquakes = useQuery({
    queryKey: ['globe-earthquakes'],
    queryFn: async () => (await getGlobeEarthquakes({})).data,
    refetchInterval: 300_000,
    staleTime: 290_000,
    enabled: enabled.earthquakes !== false,
  });

  const news = useQuery({
    queryKey: ['globe-news'],
    queryFn: async () => (await getGlobeNews({})).data,
    refetchInterval: 600_000,
    staleTime: 590_000,
    enabled: enabled.news !== false,
  });

  const launches = useQuery({
    queryKey: ['globe-launches'],
    queryFn: async () => (await getGlobeLaunches({})).data,
    refetchInterval: 1800_000,
    staleTime: 1790_000,
    enabled: enabled.launches !== false,
  });

  return { flights, satellites, earthquakes, news, launches };
}