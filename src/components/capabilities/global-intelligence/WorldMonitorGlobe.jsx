import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WM_URL = 'https://worldmonitor-voip40t21-top-100-aerospace-and-aviation.vercel.app/?lat=20.0000&lon=0.0000&zoom=1.50&view=global&timeRange=7d&layers=conflicts%2Cbases%2Chotspots%2Cnuclear%2Csanctions%2Cweather%2Ceconomic%2Cwaterways%2Coutages%2Cmilitary%2Cnatural%2CiranAttacks';

export function WorldMonitorGlobe() {
  const [collapsed, setCollapsed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200/50 shadow-lg bg-slate-900">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/80 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Live Global Intelligence Map
          </span>
          {!loaded && !collapsed && (
            <span className="text-xs text-slate-400 animate-pulse">Loading…</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a href={WM_URL} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-400 transition-colors" title="Open in new tab" aria-label="Open World Monitor in new tab">
            <ExternalLink className="w-4 h-4" />
          </a>
          <Button variant="ghost" size="sm" onClick={() => {
              if (!collapsed) setLoaded(false);
              setCollapsed(c => !c);
            }} className="text-slate-400 hover:text-white h-6 px-2">
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            <span className="text-xs ml-1">{collapsed ? 'Expand' : 'Collapse'}</span>
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 520 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative overflow-hidden"
          >
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900" style={{ zIndex: 1 }}>
                <div className="flex flex-col items-center gap-3">
                  <Globe className="w-10 h-10 text-sky-400 animate-pulse" />
                  <p className="text-sm text-slate-400">Loading World Monitor…</p>
                </div>
              </div>
            )}
            <iframe
              src={WM_URL}
              title="World Monitor — Global Intelligence"
              className="w-full border-0"
              style={{ height: 520 }}
              onLoad={() => setLoaded(true)}
              allow="geolocation"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}