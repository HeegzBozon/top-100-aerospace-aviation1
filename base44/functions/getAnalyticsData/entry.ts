import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_analytics');

    const body = await req.json().catch(() => ({}));
    const { propertyId, startDate, endDate } = body;

    if (!propertyId) {
      // Return list of GA4 accounts/properties
      const accountsRes = await fetch(
        'https://analyticsadmin.googleapis.com/v1alpha/accounts',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const accountsData = await accountsRes.json();

      // Fetch properties for each account
      const accounts = accountsData.accounts || [];
      const propertiesPromises = accounts.map(async (account) => {
        const propsRes = await fetch(
          `https://analyticsadmin.googleapis.com/v1alpha/properties?filter=parent:${account.name}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const propsData = await propsRes.json();
        return propsData.properties || [];
      });
      const propertiesNested = await Promise.all(propertiesPromises);
      const properties = propertiesNested.flat();

      return Response.json({ accounts, properties });
    }

    const start = startDate || getDateDaysAgo(28);
    const end = endDate || getDateDaysAgo(1);

    // Run both report requests in parallel
    const [overviewRes, pagesRes] = await Promise.all([
      fetch(`https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: start, endDate: end }],
          dimensions: [{ name: 'date' }],
          metrics: [
            { name: 'sessions' },
            { name: 'activeUsers' },
            { name: 'screenPageViews' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' },
          ],
          orderBys: [{ dimension: { dimensionName: 'date' } }],
        }),
      }),
      fetch(`https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: start, endDate: end }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'activeUsers' },
            { name: 'averageSessionDuration' },
          ],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: 20,
        }),
      }),
    ]);

    const [overviewData, pagesData] = await Promise.all([overviewRes.json(), pagesRes.json()]);

    return Response.json({
      overview: overviewData,
      topPages: pagesData,
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