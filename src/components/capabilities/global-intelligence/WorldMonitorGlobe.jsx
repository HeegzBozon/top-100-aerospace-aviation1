import React, { useState } from 'react';
import { Globe2, ExternalLink } from 'lucide-react';

export function WorldMonitorGlobe() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/50 shadow-lg bg-slate-900">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/80 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold text-slate-200 tracking-wide">World Monitor — Live Globe</span>
        </div>
        <a
          href="https://www.flightradar24.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-sky-400 transition-colors"
          aria-label="Open full map in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Full map</span>
        </a>
      </div>

      {/* Loading skeleton */}
      {!loaded && (
        <div className="absolute inset-0 top-10 flex items-center justify-center bg-slate-900 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-slate-600 border-t-sky-400 rounded-full animate-spin" />
            <span className="text-xs text-slate-400">Loading live globe…</span>
          </div>
        </div>
      )}

      <iframe
        src="https://www.flightradar24.com/simple"
        title="Live flight tracking globe"
        className="w-full h-64 sm:h-80 md:h-96 border-0"
        onLoad={() => setLoaded(true)}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}