import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const WorldMonitorGlobe = lazy(() =>
  import('@/components/capabilities/global-intelligence').then(m => ({ default: m.WorldMonitorGlobe }))
);

export default function EditorialGlobeSection() {
  const [loaded, setLoaded] = useState(true);

  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'rgba(30,58,90,0.1)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b"
        style={{
          background: 'linear-gradient(135deg, #1e3a5a 0%, #152a42 100%)',
          borderColor: 'rgba(30,58,90,0.2)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-sky-300" />
          <span
            className="text-sm font-bold text-white tracking-wide"
            style={{ fontFamily: "var(--brand-font-serif, 'Playfair Display', Georgia, serif)" }}
          >
            Global Situational Awareness
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <Link to="/global-intelligence">
          <Button variant="ghost" size="sm" className="text-[11px] gap-1 text-sky-200 hover:text-white hover:bg-white/10">
            Full Terminal <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>

      {/* Globe body */}
      <div className="relative bg-[#070b14]" style={{ minHeight: '420px' }}>
        {!loaded ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Globe className="w-14 h-14 text-sky-400/30" />
            <p className="text-sm text-slate-400 text-center px-8 max-w-md" style={{ fontFamily: 'var(--brand-font-sans)' }}>
              Interactive 3D globe with real-time military flights, GPS jamming zones & conflict events
            </p>
            <Button
              onClick={() => setLoaded(true)}
              className="text-white text-xs font-semibold px-5 h-9 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #c9a87c, #d4a574)' }}
            >
              <Globe className="w-3.5 h-3.5 mr-1.5" /> Load Globe
            </Button>
            <p className="text-[10px] text-slate-600">Loads 3D engine · may use more resources</p>
          </div>
        ) : (
          <ErrorBoundary label="Globe">
            <Suspense fallback={
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
              </div>
            }>
              <WorldMonitorGlobe />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}