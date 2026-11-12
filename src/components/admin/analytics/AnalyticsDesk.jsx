import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAnalyticsData } from '@/functions/getAnalyticsData';
import DeskMasthead from '@/components/admin/desk/DeskMasthead';
import AnalyticsPanel from '@/components/analytics/AnalyticsPanel';
import GaConnectionPlate from './GaConnectionPlate';
import AudienceCards from './AudienceCards';
import TopContentRoutes from './TopContentRoutes';
import SponsorDelivery from './SponsorDelivery';

// THE TRAFFIC DESK.
//
// Two ledgers read side by side, because they answer different questions and neither can
// stand in for the other. Who is arriving, and which of the house's own pages they read,
// comes from Google Analytics through the connector. What the patrons' links delivered
// comes from the house's own click ledger, which no ad-blocker can remove.
//
// The deep report below is the panel the /analytics surface already uses — one surface,
// reached from two doors, rather than a second set of charts that would drift from it.
export default function AnalyticsDesk() {
  // The property the desk is pointed at is carried in the address, so a pinned property
  // survives a reload and can be handed to another administrator as a link.
  const [searchParams, setSearchParams] = useSearchParams();
  const pinned = searchParams.get('property') || '';

  const [link, setLink] = useState('loading');
  const [properties, setProperties] = useState([]);
  const [property, setProperty] = useState(null);
  const [stream, setStream] = useState(null);
  const [reason, setReason] = useState('');
  const [report, setReport] = useState(null);
  const [reportState, setReportState] = useState('idle');
  const [reportError, setReportError] = useState('');

  const readStatus = useCallback(async () => {
    setLink('loading');
    try {
      const { data } = await getAnalyticsData({ action: 'status', propertyId: pinned });
      if (!data?.connected) {
        setProperties([]);
        setProperty(null);
        setStream(null);
        setReason(data?.reason || '');
        setLink('down');
        return;
      }
      setProperties(data.properties || []);
      setProperty(data.property || null);
      setStream(data.stream || null);
      setReason(data.reason || '');
      setLink('live');
    } catch {
      setProperties([]);
      setProperty(null);
      setLink('down');
    }
  }, [pinned]);

  const pointAt = (name) => {
    const next = new URLSearchParams(searchParams);
    if (name) next.set('property', name);
    else next.delete('property');
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    readStatus();
  }, [readStatus]);

  useEffect(() => {
    if (!property?.name) return undefined;
    let cancelled = false;

    (async () => {
      setReportState('loading');
      setReportError('');
      try {
        const { data } = await getAnalyticsData({ propertyId: property.name, windows: [7, 30] });
        if (cancelled) return;
        if (data?.error) {
          setReportError(data.error);
          setReportState('error');
          return;
        }
        setReport(data);
        setReportState('ready');
      } catch (caught) {
        if (cancelled) return;
        setReportError(caught?.message || 'Google Analytics could not complete the report.');
        setReportState('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [property?.name]);

  // One shape for the route table, whatever the GA4 report's column order turned out to be.
  const routes = useMemo(() => {
    const report_ = report?.topPages;
    const dimensions = (report_?.dimensionHeaders || []).map((header) => header.name);
    const metrics = (report_?.metricHeaders || []).map((header) => header.name);
    const pathIndex = dimensions.indexOf('pagePath');
    const viewsIndex = metrics.indexOf('screenPageViews');

    return (report_?.rows || []).map((row) => ({
      path: row.dimensionValues?.[pathIndex]?.value || '',
      views: Number(row.metricValues?.[viewsIndex]?.value || 0),
    }));
  }, [report]);

  // The denominator of a rate is taken from the same window as its numerator: the patron
  // clicks are counted over seven days, so the media-kit views they are set against are
  // the seven-day views, never the thirty-day figure printed beside them.
  const mediaKitViews7 = (report?.windowRoutes?.['7'] || [])
    .filter((route) => String(route.path).startsWith('/mediakit'))
    .reduce((total, route) => total + Number(route.views || 0), 0);

  const selectProperty = (name) => {
    setProperty(properties.find((item) => item.name === name) || (name ? { name, displayName: name } : null));
    pointAt(name);
  };

  return (
    <div className="space-y-4">
      <DeskMasthead
        kicker="Analytics"
        title="Who is arriving, and what they read"
        blurb="Audience and routes read from Google Analytics; patron delivery counted on the house's own click ledger, which no browser setting can remove."
      >
        <Link to="/analytics" className="desk-key">
          Full traffic ledger
        </Link>
      </DeskMasthead>

      <GaConnectionPlate
        state={link}
        property={property}
        properties={properties}
        reason={reason}
        stream={stream}
        onSelect={selectProperty}
        onApply={pointAt}
        onRefresh={readStatus}
      />

      {reportError && (
        <div className="desk-plate px-4 py-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-editorial-copper">
            Report unavailable
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-editorial-cream/75">{reportError}</p>
        </div>
      )}

      <AudienceCards windows={report?.windows} loading={reportState === 'loading'} />

      <div className="grid gap-2.5 lg:grid-cols-2">
        <TopContentRoutes routes={routes} loading={reportState === 'loading'} />
        <SponsorDelivery mediaKitViews={mediaKitViews7} />
      </div>

      <div className="desk-plate px-3 py-3.5">
        <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-editorial-gold">
          Daily traffic
        </p>
        <div className="desk-rule mt-2" />
        <div className="mt-3">
          <AnalyticsPanel
            propertyId={property?.name || ''}
            onPropertyChange={selectProperty}
            properties={properties}
          />
        </div>
      </div>
    </div>
  );
}