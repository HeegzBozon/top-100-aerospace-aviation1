// Aerospace/aviation news from GDELT DOC 2.0 API (commercial-OK with citation).
// Fetches recent articles matching aerospace keywords and maps source country to lat/lon.
// Attribution: "The GDELT Project"

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min
let cache = null;
let cacheTs = 0;

// Country → centroid [lat, lon] for the most common GDELT source countries
const COUNTRY_CENTROIDS = {
  'United States': [39.8, -98.5], 'United Kingdom': [55.3, -3.4], 'China': [35.8, 104.1],
  'Russia': [61.5, 105.3], 'India': [22.6, 78.9], 'Japan': [36.2, 138.2],
  'Germany': [51.1, 10.4], 'France': [46.6, 2.4], 'Australia': [-25.2, 133.7],
  'Canada': [56.1, -106.3], 'Brazil': [-14, -51.9],
  'Italy': [42.8, 12.8], 'Spain': [40.4, -3.7], 'Netherlands': [52.1, 5.3],
  'South Korea': [35.9, 127.8], 'Israel': [31.0, 34.9], 'Turkey': [38.9, 35.2],
  'Ukraine': [48.9, 31.2], 'Iran': [32.4, 53.7], 'Saudi Arabia': [23.9, 45.1],
  'UAE': [23.4, 53.8], 'Singapore': [1.35, 103.8], 'Indonesia': [-0.8, 113.9],
  'Mexico': [23.6, -102.5], 'Argentina': [-38, -63.6],
  'South Africa': [-30.6, 22.9], 'Nigeria': [9.08, 8.67], 'Egypt': [26.8, 30.8],
  'Sweden': [60.1, 18.6], 'Norway': [60.5, 8.47], 'Finland': [61.9, 25.7],
  'Poland': [51.9, 19.1], 'Switzerland': [46.8, 8.22], 'Belgium': [50.5, 4.47],
  'Ireland': [53.4, -8.24], 'Portugal': [39.4, -8.22], 'Greece': [39.1, 21.8],
  'Austria': [47.5, 14.5], 'Czech Republic': [49.8, 15.5], 'Denmark': [56.3, 9.05],
  'New Zealand': [-40.9, 174.9], 'Thailand': [15.9, 100.9], 'Malaysia': [4.21, 101.9],
  'Pakistan': [30.4, 69.3], 'Bangladesh': [23.7, 90.4], 'Vietnam': [14.1, 108.3],
  'Philippines': [12.9, 121.8], 'Taiwan': [23.7, 121.0], 'France, Metropolitan': [46.6, 2.4],
  'Spain, Mexico': [23.6, -102.5], 'The Netherlands': [52.1, 5.3],
  'Republic of Korea': [35.9, 127.8], 'Russian Federation': [61.5, 105.3],
  'United Arab Emirates': [23.4, 53.8], 'Hong Kong': [22.3, 114.2],
  'Czechia': [49.8, 15.5], 'Korea, South': [35.9, 127.8],
};

export default async function(req) {
  try {
    if (cache && (Date.now() - cacheTs) < CACHE_TTL_MS) {
      return Response.json({ ...cache, cached: true });
    }

    const query = encodeURIComponent(
      '(aerospace OR aviation OR satellite OR "space launch" OR spacecraft OR "air force" OR orbit OR ISS OR NASA OR SpaceX OR Boeing OR Airbus)'
    );
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=ArtList&maxrecords=75&timespan=1d&sort=datedesc&format=json`;

    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'TOP100-Aerospace-Globe/1.0 (https://top100aero.space)' },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      // Serve stale cache on error
      if (cache) return Response.json({ ...cache, cached: true, stale: true });
      return Response.json({ error: `GDELT error: ${res.status}`, articles: [] }, { status: res.status });
    }

    const data = await res.json().catch(() => ({}));
    const raw = data.articles || [];

    const articles = raw.map(a => {
      const country = a.sourcecountry || '';
      const centroid = COUNTRY_CENTROIDS[country];
      return {
        title: a.title || '',
        url: a.url || '',
        seendate: a.seendate || '',
        domain: a.domain || '',
        language: a.language || '',
        sourcecountry: country,
        lat: centroid ? centroid[0] : null,
        lon: centroid ? centroid[1] : null,
        socialimage: a.socialimage || '',
      };
    }).filter(a => a.lat != null && a.title);

    const result = {
      articles,
      total: articles.length,
      countries: [...new Set(articles.map(a => a.sourcecountry))].length,
      source: 'GDELT',
      attribution: 'The GDELT Project',
      fetched_at: new Date().toISOString(),
    };

    cache = result;
    cacheTs = Date.now();

    return Response.json(result);
  } catch (error) {
    if (cache) return Response.json({ ...cache, cached: true, stale: true });
    return Response.json({ error: error.message, articles: [] }, { status: 500 });
  }
}