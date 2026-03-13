import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch missions, launches, and spacecraft from SpaceDevs API with timeout and error handling
    const fetchWithTimeout = async (url, timeout = 5000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const data = await res.json();
        return data;
      } catch (err) {
        clearTimeout(timeoutId);
        console.error(`Fetch error for ${url}:`, err.message);
        return { results: [] };
      }
    };

    const [missionsData, launchesData, spacecraftData] = await Promise.all([
      fetchWithTimeout('https://ll.thespacedevs.com/2.0.0/missions/?limit=50&ordering=-launch_date'),
      fetchWithTimeout('https://ll.thespacedevs.com/2.0.0/launches/?limit=50&ordering=-net'),
      fetchWithTimeout('https://ll.thespacedevs.com/2.0.0/spacecraft/?limit=50'),
    ]);

    // Transform to internal Program format
    const missions = (missionsData.results || []).map(m => ({
      id: `mission_${m.id}`,
      name: m.name,
      description: m.description || '',
      program_type: 'mission',
      mission_type: 'civil',
      status: m.status ? m.status.name : 'unknown',
      start_date: m.launch_date,
      logo_url: m.image_url,
      source: 'spacedevs',
      spacedevs_id: m.id,
    }));

    const launches = (launchesData.results || []).map(l => ({
      id: `launch_${l.id}`,
      name: l.name,
      description: l.mission?.description || `Launch of ${l.rocket.configuration.name}`,
      program_type: 'spacecraft',
      mission_type: l.mission?.type === 'Human Spaceflight' ? 'civil' : 'commercial',
      status: l.status.name || 'TBD',
      start_date: l.net,
      logo_url: l.rocket.configuration.image_url || l.image_url,
      source: 'spacedevs',
      spacedevs_id: l.id,
    }));

    const spacecraft = (spacecraftData.results || []).map(sc => ({
      id: `spacecraft_${sc.id}`,
      name: sc.name,
      description: sc.description || '',
      program_type: 'spacecraft',
      mission_type: 'commercial',
      status: 'operational',
      logo_url: sc.image_url,
      source: 'spacedevs',
      spacedevs_id: sc.id,
    }));

    // Combine and deduplicate
    const allPrograms = [...missions, ...launches, ...spacecraft];
    const uniquePrograms = Array.from(
      new Map(allPrograms.map(p => [p.name, p])).values()
    );

    // Upcoming = future launches (or all if none future)
    const now = new Date();
    const withDates = uniquePrograms.filter(p => p.start_date);
    const futurePrograms = withDates.filter(p => new Date(p.start_date) > now)
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    const upcoming = futurePrograms.length > 0 
      ? futurePrograms.slice(0, 6)
      : withDates.sort((a, b) => new Date(b.start_date) - new Date(a.start_date)).slice(0, 6);

    // Trending = recent activity (last 30 days or all recent)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentPrograms = withDates.filter(p => new Date(p.start_date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    const trending = recentPrograms.length > 0
      ? recentPrograms.slice(0, 6)
      : withDates.slice(0, 6);

    // Top = unique spacecraft + launches sorted by date
    const top = withDates.slice(0, 6);

    return Response.json({
      upcoming,
      trending,
      top,
      allPrograms: uniquePrograms,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});