import React, { useState, useEffect } from 'react';
import { getAnalyticsData } from '@/functions/getAnalyticsData';
import { getSearchConsoleData } from '@/functions/getSearchConsoleData';
import { BarChart2, Search, RefreshCw, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import SearchConsolePanel from '@/components/analytics/SearchConsolePanel';
import AnalyticsPanel from '@/components/analytics/AnalyticsPanel';
import { base44 } from '@/api/base44Client';

export default function AnalyticsDashboard() {
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [setupError, setSetupError] = useState(null);

  useEffect(() => {
    const init = async () => {
      setLoadingSetup(true);
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me?.role !== 'admin') {
          setSetupError('Admin access required.');
          setLoadingSetup(false);
          return;
        }

        // Load GA properties + GSC sites in parallel
        const [gaRes, gscRes] = await Promise.all([
          getAnalyticsData({}),
          getSearchConsoleData({ siteUrl: 'list' }).catch(() => ({ data: { sites: [] } })),
        ]);

        const props = gaRes.data?.properties || [];
        setProperties(props);
        // Default to the known property or the first available
        const known = props.find(p => p.name?.includes('FKVD6VNDVS') || p.displayName);
        setSelectedProperty(known?.name || props[0]?.name || '');

        // For GSC we need a real siteUrl to list sites — fetch with a dummy then extract from response
        // Actually call with no siteUrl to get sites list via the sites endpoint
        const sitesList = gaRes.data?.sites || [];
        // Re-fetch GSC sites list separately
        const gscSitesRes = await getSearchConsoleData({ siteUrl: '' }).catch(() => ({ data: null }));
        const fetchedSites = gscSitesRes.data?.sites || [];
        setSites(fetchedSites);
        if (fetchedSites.length > 0) setSelectedSite(fetchedSites[0].siteUrl);
      } catch (e) {
        setSetupError(e.message);
      }
      setLoadingSetup(false);
    };
    init();
  }, []);

  if (loadingSetup) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (setupError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{setupError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-emerald-400" />
          <h1 className="font-semibold text-base">Analytics Dashboard</h1>
        </div>
        <span className="text-xs text-slate-500 ml-auto">Admin only</span>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-10">

        {/* Site selector for GSC */}
        {sites.length > 1 && (
          <div className="flex items-center gap-3 flex-wrap">
            <label htmlFor="site-select" className="text-xs text-slate-400 uppercase tracking-wider">
              GSC Site
            </label>
            <div className="relative">
              <select
                id="site-select"
                value={selectedSite}
                onChange={e => setSelectedSite(e.target.value)}
                className="appearance-none bg-slate-700 text-slate-300 text-sm rounded-lg pl-3 pr-8 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                aria-label="Select Search Console site"
              >
                {sites.map(s => (
                  <option key={s.siteUrl} value={s.siteUrl}>{s.siteUrl}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}

        <SearchConsolePanel siteUrl={selectedSite} />

        <div className="border-t border-slate-800" />

        <AnalyticsPanel
          propertyId={selectedProperty}
          onPropertyChange={setSelectedProperty}
          properties={properties}
        />
      </main>
    </div>
  );
}