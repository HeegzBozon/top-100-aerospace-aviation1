import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// THE TRAFFIC LEDGER.
//
// One admin-gated door to GA4, read through the Google Analytics connector the house has
// already authorized (analytics.readonly). No service account, no key file, no credential
// on the client: the connector's token is fetched here, inside the handler, on every call.
//
// Two actions:
//   status  — is the connector alive, and which properties can it see.
//   report  — the property's audience, its top routes, the utm_content tokens on the
//             house's patron links, and the event names the funnel is written in.
//
// The gate answers the way the house asks every guarded function to answer: 401 for a
// caller with no session, 403 for a Fellow who is not an administrator, and a readable 400
// — never a 500 — when GA4 is not connected or no property has been chosen.

const DATA_API = 'https://analyticsdata.googleapis.com/v1beta';
const ADMIN_API = 'https://analyticsadmin.googleapis.com/v1beta';
const TIMEOUT = 20000;

const UNCONNECTED =
  'Google Analytics is not connected. Authorize the Google Analytics connector under Integrations, then reload this desk.';

const METRICS = ['sessions', 'totalUsers', 'screenPageViews'];

function daysAgo(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function gaFetch(token: string, url: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(TIMEOUT),
  });

  const text = await response.text();
  let payload: any = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const error: any = new Error(
      payload?.error?.message || `Google Analytics answered ${response.status}`,
    );
    error.status = response.status;
    throw error;
  }

  return payload;
}

async function listProperties(token: string) {
  const accounts = await gaFetch(token, `${ADMIN_API}/accounts?pageSize=200`).catch(() => ({ accounts: [] }));
  const properties: { name: string; displayName: string }[] = [];

  for (const account of accounts?.accounts || []) {
    const page = await gaFetch(
      token,
      `${ADMIN_API}/properties?filter=parent:${account.name}&pageSize=200`,
    ).catch(() => ({ properties: [] }));
    for (const property of page?.properties || []) {
      properties.push({ name: property.name, displayName: property.displayName || property.name });
    }
  }

  return properties;
}

// A property is addressed by its full resource name ("properties/123456"), by the bare id,
// or by its display name — the desk may hold any of the three. When none is named, the
// only property the connection can see is the answer; when the connection spans several,
// the first named one is reported on and the desk offers the rest.
function matchProperty(properties: any[], wanted: any) {
  const explicit = String(wanted || '').trim();
  if (!explicit) return null;
  const bare = explicit.includes('/') ? explicit.split('/').pop() : explicit;
  return (
    properties.find(
      (property) =>
        property.name === explicit ||
        property.name?.split('/').pop() === bare ||
        property.displayName === explicit,
    ) || null
  );
}

// The Admin API only lists properties the connected identity can administer. A property
// whose id the house already knows is checked against the Data API instead, which answers
// for anyone allowed to report on it — so a property can still be read on a connection
// that cannot enumerate accounts.
async function pinnedProperty(accessToken: string, wanted: any) {
  const raw = String(wanted || '').trim();
  if (!raw) return null;
  const bare = raw.includes('/') ? raw.split('/').pop() : raw;
  if (!/^\d+$/.test(bare)) return null;
  try {
    await gaFetch(accessToken, `${DATA_API}/properties/${bare}/metadata`);
    return { name: `properties/${bare}`, displayName: `Property ${bare}` };
  } catch {
    return null;
  }
}

async function resolveTarget(accessToken: string, properties: any[], wanted: any) {
  const matched = matchProperty(properties, wanted);
  if (matched) return matched;

  const pinned = await pinnedProperty(accessToken, wanted);
  if (pinned) return pinned;

  if (properties.length === 1) return properties[0];
  const named = properties.find((property) => property.displayName);
  return named || properties[0] || null;
}

async function runReport(token: string, propertyName: string, spec: any) {
  const body: any = {
    dateRanges: [{ startDate: spec.startDate, endDate: spec.endDate }],
    metrics: (spec.metrics || METRICS).map((name: string) => ({ name })),
  };
  if (spec.dimensions?.length) {
    body.dimensions = spec.dimensions.map((name: string) => ({ name }));
  }
  if (spec.limit) body.limit = spec.limit;
  if (spec.orderBy) body.orderBys = [spec.orderBy];
  if (spec.dimensionFilter) body.dimensionFilter = spec.dimensionFilter;

  return gaFetch(token, `${DATA_API}/${propertyName}:runReport`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// A report arrives as parallel header and value arrays. This reads it as plain rows so the
// desk never has to think in column indexes.
function rowsOf(report: any) {
  const dimensions = (report?.dimensionHeaders || []).map((header: any) => header.name);
  const metrics = (report?.metricHeaders || []).map((header: any) => header.name);

  return (report?.rows || []).map((row: any) => {
    const out: Record<string, any> = {};
    dimensions.forEach((name: string, index: number) => {
      out[name] = row.dimensionValues?.[index]?.value ?? '';
    });
    metrics.forEach((name: string, index: number) => {
      out[name] = Number(row.metricValues?.[index]?.value ?? 0);
    });
    return out;
  });
}

function totalsOf(report: any) {
  const first = rowsOf(report)[0] || {};
  return {
    sessions: Number(first.sessions || 0),
    users: Number(first.totalUsers || 0),
    pageviews: Number(first.screenPageViews || 0),
  };
}

export default async function (req: Request): Promise<Response> {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth
    .me()
    .catch((error: any) => (error?.status === 401 ? null : Promise.reject(error)));
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') {
    return Response.json({ error: 'Forbidden: administrators only' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || 'report');

  // ── The connection ──
  let accessToken = '';
  let connectError = '';
  try {
    const connection = await base44.asServiceRole.connectors.getConnection('google_analytics');
    accessToken = connection?.accessToken || '';
    if (!accessToken) connectError = UNCONNECTED;
  } catch (error: any) {
    connectError = error?.message ? `${UNCONNECTED} (${error.message})` : UNCONNECTED;
  }

  if (action === 'status') {
    if (connectError) {
      return Response.json({ connected: false, ok: false, reason: connectError });
    }
    try {
      const properties = await listProperties(accessToken);
      const property = await resolveTarget(accessToken, properties, body.propertyId);
      return Response.json({
        connected: true,
        ok: Boolean(property),
        properties,
        property,
        reason: property
          ? ''
          : 'The connection is live but the Google account behind it cannot see any GA4 property. Authorize the connector with the account that owns the property, or pin the property id.',
      });
    } catch (error: any) {
      return Response.json({
        connected: false,
        ok: false,
        reason: error?.message || 'Google Analytics could not be reached.',
      });
    }
  }

  if (connectError) {
    return Response.json({ connected: false, error: connectError }, { status: 400 });
  }

  let properties: any[] = [];
  try {
    properties = await listProperties(accessToken);
  } catch (error: any) {
    return Response.json(
      { connected: false, error: error?.message || 'Google Analytics could not be read.' },
      { status: 400 },
    );
  }

  const property = await resolveTarget(accessToken, properties, body.propertyId);
  if (!property) {
    return Response.json(
      {
        connected: true,
        properties,
        error:
          'No GA4 property could be reached. Authorize the connector with the account that owns the property, or pin the property id on this desk.',
      },
      { status: 400 },
    );
  }

  // Discovery: no property was named and none could be resolved, so hand back the list.
  const windows = (Array.isArray(body.windows) ? body.windows : [7, 30])
    .map((value: any) => Number(value))
    .filter((value: number) => Number.isFinite(value) && value > 0 && value <= 365);

  const mainDays = Number(body.days) > 0 ? Number(body.days) : Math.max(...windows, 30);
  const startDate = String(body.startDate || daysAgo(mainDays));
  const endDate = String(body.endDate || daysAgo(1));

  try {
    const [overview, topPages, utmContent, events, ...windowReports] = await Promise.all([
      runReport(accessToken, property.name, {
        startDate,
        endDate,
        dimensions: ['date'],
        metrics: [...METRICS, 'activeUsers', 'bounceRate', 'averageSessionDuration'],
        orderBy: { dimension: { dimensionName: 'date' } },
      }),
      runReport(accessToken, property.name, {
        startDate,
        endDate,
        dimensions: ['pagePath'],
        metrics: ['screenPageViews', 'totalUsers', 'averageSessionDuration'],
        orderBy: { metric: { metricName: 'screenPageViews' }, desc: true },
        limit: 25,
      }),
      runReport(accessToken, property.name, {
        startDate,
        endDate,
        dimensions: ['sessionManualAdContent'],
        metrics: ['sessions', 'eventCount'],
        orderBy: { metric: { metricName: 'sessions' }, desc: true },
        limit: 25,
      }).catch(() => null),
      runReport(accessToken, property.name, {
        startDate,
        endDate,
        dimensions: ['eventName'],
        metrics: ['eventCount'],
        orderBy: { metric: { metricName: 'eventCount' }, desc: true },
        limit: 30,
      }).catch(() => null),
      ...windows.map((days: number) =>
        runReport(accessToken, property.name, {
          startDate: daysAgo(days),
          endDate: daysAgo(1),
          metrics: METRICS,
        }),
      ),
      // The routes each window's own figures are made of, so a rate is only ever clicks
      // over the views of that same window.
      ...windows.map((days: number) =>
        runReport(accessToken, property.name, {
          startDate: daysAgo(days),
          endDate: daysAgo(1),
          dimensions: ['pagePath'],
          metrics: ['screenPageViews'],
          orderBy: { metric: { metricName: 'screenPageViews' }, desc: true },
          limit: 50,
        }),
      ),
    ]);

    const windowTotals: Record<string, any> = {};
    windows.forEach((days: number, index: number) => {
      windowTotals[String(days)] = totalsOf(windowReports[index]);
    });

    const windowRoutes: Record<string, any> = {};
    windows.forEach((days: number, index: number) => {
      windowRoutes[String(days)] = rowsOf(windowReports[windows.length + index]).map((row: any) => ({
        path: row.pagePath || '',
        views: Number(row.screenPageViews || 0),
      }));
    });

    return Response.json({
      connected: true,
      property,
      properties,
      range: { startDate, endDate },
      // Kept as the raw GA4 reports: the existing traffic panel reads them by header.
      overview,
      topPages,
      totals: totalsOf({ rows: [{ metricValues: overview?.totals?.[0]?.metricValues }], metricHeaders: overview?.metricHeaders }),
      windows: windowTotals,
      windowRoutes,
      utmContent: rowsOf(utmContent).filter((row: any) => row.sessionManualAdContent),
      events: rowsOf(events),
    });
  } catch (error: any) {
    const refused = error?.status === 401 || error?.status === 403;
    return Response.json(
      {
        connected: true,
        property,
        error: refused
          ? `Google Analytics refused the request: ${error.message}. Confirm the connected account can read this property.`
          : error?.message || 'Google Analytics could not complete the report.',
      },
      { status: refused ? 400 : 502 },
    );
  }
}