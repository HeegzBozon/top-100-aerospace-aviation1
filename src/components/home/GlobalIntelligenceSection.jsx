import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Globe, ArrowRight, Radio, Crosshair, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { LiveNewsPanel } from '@/components/capabilities/global-intelligence/LiveNewsPanel';
import { ConflictAlertsSummary } from '@/components/capabilities/global-intelligence/ConflictAlertsSummary';
import { CyberThreatsSummary } from '@/components/capabilities/global-intelligence/CyberThreatsSummary';
import { GpsJammingSummary } from '@/components/capabilities/global-intelligence/GpsJammingSummary';

// Lazy-load the heavy globe
const WorldMonitorGlobe = lazy(() =>
  import('@/components/capabilities/global-intelligence').then(m => ({ default: m.WorldMonitorGlobe }))
);

const brand = {
  navy: '#1e3a5a',
  gold: '#c9a87c',
  cream: '#faf8f5',
};

function MiniPanel({ label, icon: Icon, children }) {
  return (
    <div className="bg-[#0c1220] rounded-lg border border-slate-800/80 overflow-hidden flex flex-col h-full">
      <div className="px-2.5 py-1.5 border-b border-slate-800/60 flex items-center gap-1.5 shrink-0">
        {Icon && <Icon className="w-3 h-3 text-slate-500" />}
        <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">{label}</span>
        <div className="flex-1" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-500/80 animate-pulse" />
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-1.5">{children}</div>
    </div>
  );
}

export default function GlobalIntelligenceSection() {
  const [showGlobe, setShowGlobe] = useState(true);

  return (
    <section className="mx-3 md:mx-4 mt-4 md:mt-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${brand.navy}, #0d2137)` }}
          >
            <Globe className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h2
              className="text-base md:text-lg font-bold leading-tight"
              style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Global Intelligence
            </h2>
            <p className="text-[10px] md:text-xs text-slate-500" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Real-time aerospace & geopolitical ops
            </p>
          </div>
        </div>
        <Link to={createPageUrl('GlobalIntelligence')}>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1 cursor-pointer"
            style={{ color: brand.navy }}
          >
            Full Dashboard
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>

      {/* Main grid: Globe left, feeds right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Globe — takes 2 cols on desktop */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden border border-slate-800/50 bg-[#070b14] min-h-[320px] md:min-h-[420px] relative">
          {!showGlobe ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/95">
              <Globe className="w-12 h-12 text-sky-400/40" />
              <p className="text-sm text-slate-400 text-center px-6">Interactive 3D globe with live military flights, GPS jamming & conflict zones</p>
              <Button
                onClick={() => setShowGlobe(true)}
                className="text-white font-semibold px-5 h-9 text-xs cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${brand.gold}, #d4a574)` }}
              >
                <Globe className="w-3.5 h-3.5 mr-1.5" />
                Load Globe
              </Button>
              <p className="text-[10px] text-slate-600">Loads 3D engine · may use more resources</p>
            </div>
          ) : (
            <ErrorBoundary label="Globe">
              <Suspense fallback={
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                </div>
              }>
                <WorldMonitorGlobe />
              </Suspense>
            </ErrorBoundary>
          )}
        </div>

        {/* Right column: stacked feed panels */}
        <div className="flex flex-col gap-3">
          {/* Live News */}
          <div className="h-[240px] md:h-[300px]">
            <MiniPanel label="Live Feeds" icon={Radio}>
              <LiveNewsPanel />
            </MiniPanel>
          </div>

          {/* Mini stat strip */}
          <div className="grid grid-cols-3 gap-2">
            <div className="h-[80px]">
              <MiniPanel label="Conflicts" icon={Crosshair}>
                <ConflictAlertsSummary />
              </MiniPanel>
            </div>
            <div className="h-[80px]">
              <MiniPanel label="Cyber" icon={AlertTriangle}>
                <CyberThreatsSummary />
              </MiniPanel>
            </div>
            <div className="h-[80px]">
              <MiniPanel label="GPS Jam" icon={Radio}>
                <GpsJammingSummary />
              </MiniPanel>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}