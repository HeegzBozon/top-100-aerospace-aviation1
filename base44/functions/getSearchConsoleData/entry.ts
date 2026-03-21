import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_search_console');

    const body = await req.json().catch(() => ({}));
    const { siteUrl, startDate, endDate, dimensions = ['query'], rowLimit = 20 } = body;

    if (!siteUrl) {
      return Response.json({ error: 'siteUrl is required' }, { status: 400 });
    }

    const encodedUrl = encodeURIComponent(siteUrl);

    // Fetch search analytics
    const analyticsRes = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodedUrl}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: startDate || getDateDaysAgo(28),
          endDate: endDate || getDateDaysAgo(1),
          dimensions,
          rowLimit,
        }),
      }
    );
    const analyticsData = await analyticsRes.json();

    // Fetch site list (to confirm access)
    const sitesRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const sitesData = await sitesRes.json();

    return Response.json({
      rows: analyticsData.rows || [],
      sites: sitesData.siteEntry || [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getDateDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}