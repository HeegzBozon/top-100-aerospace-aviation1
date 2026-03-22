# GlobalIntelligence Page — World Monitor Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a new `GlobalIntelligence` page in the TOP 100 Aerospace app that embeds the World Monitor 3D globe via iFrame and renders 6 live-data panels (aviation news, military flights, satellites, GPS jamming, risk scores, news digest) as native React components.

**Architecture:** Hybrid approach — iFrame for the WebGL globe (not portable to React), native React for all data panels. All WM API calls are plain `fetch()` GET requests to the deployed Vercel instance. Components go in `src/components/capabilities/global-intelligence/` per CLAUDE.md conventions. Page auto-registers via the `@base44/vite-plugin` when the file is created in `src/pages/`.

**Tech Stack:** React 18, Tailwind CSS, shadcn/ui (Card, Tabs, Badge, ScrollArea), Framer Motion, lucide-react icons, plain `fetch()` for API calls.

---

## World Monitor API Base URL

All fetch calls hit:
```
https://worldmonitor-voip40t21-top-100-aerospace-and-aviation.vercel.app
```

---

## Task 1: Create the component directory and barrel export

**Files:**
- Create: `src/components/capabilities/global-intelligence/index.js`

**Step 1: Create the barrel file**

```js
// src/components/capabilities/global-intelligence/index.js
export { WorldMonitorGlobe } from './WorldMonitorGlobe';
export { AviationNewsFeed } from './AviationNewsFeed';
export { LiveFlightsPanel } from './LiveFlightsPanel';
export { SatelliteTracker } from './SatelliteTracker';
export { GpsJammingPanel } from './GpsJammingPanel';
export { RiskScoresPanel } from './RiskScoresPanel';
export { NewsFeedDigest } from './NewsFeedDigest';
```

**Step 2: Verify directory was created**

Run: `ls src/components/capabilities/global-intelligence/`
Expected: `index.js`

---

## Task 2: WorldMonitorGlobe — iFrame wrapper

**Files:**
- Create: `src/components/capabilities/global-intelligence/WorldMonitorGlobe.jsx`

**Step 1: Create the component**

```jsx
// src/components/capabilities/global-intelligence/WorldMonitorGlobe.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WM_URL = 'https://worldmonitor-voip40t21-top-100-aerospace-and-aviation.vercel.app';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
};

export function WorldMonitorGlobe() {
  const [collapsed, setCollapsed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200/50 shadow-lg bg-slate-900">
      {/* Globe toolbar */}
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
          <a
            href={WM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-sky-400 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(c => !c)}
            className="text-slate-400 hover:text-white h-6 px-2"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            <span className="text-xs ml-1">{collapsed ? 'Expand' : 'Collapse'}</span>
          </Button>
        </div>
      </div>

      {/* iFrame */}
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
              <div
                className="absolute inset-0 flex items-center justify-center bg-slate-900"
                style={{ zIndex: 1 }}
              >
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
```

**Step 2: Verify it renders (after page is wired up in Task 9)**

Open browser → `/GlobalIntelligence` → globe toolbar should appear with "Loading…" text, then iframe should load.

---

## Task 3: AviationNewsFeed — aviation news articles

**Files:**
- Create: `src/components/capabilities/global-intelligence/AviationNewsFeed.jsx`

**Step 1: Create the component**

```jsx
// src/components/capabilities/global-intelligence/AviationNewsFeed.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const WM_BASE = 'https://worldmonitor-voip40t21-top-100-aerospace-and-aviation.vercel.app';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
};

// Aerospace-relevant entities to search for
const AEROSPACE_ENTITIES = ['Boeing', 'Airbus', 'NASA', 'SpaceX', 'FAA', 'ICAO'];

export function AviationNewsFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams({
      window_hours: '48',
      max_items: '20',
    });
    AEROSPACE_ENTITIES.forEach(e => params.append('entities', e));

    fetch(`${WM_BASE}/api/aviation/v1/list-aviation-news?${params}`)
      .then(r => r.json())
      .then(data => setItems(data.items || []))
      .catch(() => setError('Unable to load aviation news'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PanelLoader label="aviation news" />;
  if (error) return <PanelError message={error} />;
  if (!items.length) return <PanelEmpty label="No aviation news in the last 48 hours" />;

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <motion.div
          key={item.id || i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <Card className="glass-card border-slate-200/50 hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg flex-shrink-0" style={{ background: `${brandColors.skyBlue}15` }}>
                  <Newspaper className="w-4 h-4" style={{ color: brandColors.skyBlue }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold hover:underline line-clamp-2 flex-1"
                      style={{ color: brandColors.navyDeep }}
                    >
                      {item.title}
                    </a>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  </div>
                  {item.snippet && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-2">{item.snippet}</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-400">{item.source_name}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400">
                      {item.published_at ? new Date(item.published_at).toLocaleDateString() : ''}
                    </span>
                    {item.matched_entities?.slice(0, 2).map(e => (
                      <Badge key={e} variant="secondary" className="text-xs px-1.5 py-0">
                        {e}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function PanelLoader({ label }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Loading {label}…</span>
    </div>
  );
}

function PanelError({ message }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-red-400">
      <AlertCircle className="w-5 h-5" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

function PanelEmpty({ label }) {
  return (
    <div className="flex items-center justify-center py-16 text-slate-400">
      <span className="text-sm">{label}</span>
    </div>
  );
}
```

**Note:** `PanelLoader`, `PanelError`, and `PanelEmpty` will be repeated across panels — this is intentional (YAGNI: each panel is self-contained).

**Step 2: Commit**

```bash
git add src/components/capabilities/global-intelligence/
git commit -m "feat: add GlobalIntelligence component scaffolding and AviationNewsFeed"
```

---

## Task 4: LiveFlightsPanel — military aircraft tracking

**Files:**
- Create: `src/components/capabilities/global-intelligence/LiveFlightsPanel.jsx`

**Step 1: Create the component**

```jsx
// src/components/capabilities/global-intelligence/LiveFlightsPanel.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plane, AlertCircle, Loader2, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const WM_BASE = 'https://worldmonitor-voip40t21-top-100-aerospace-and-aviation.vercel.app';

const brandColors = { navyDeep: '#1e3a5a', skyBlue: '#4a90b8', goldPrestige: '#c9a87c' };

// Numeric enum values from proto
const AIRCRAFT_TYPE_LABELS = {
  0: 'Unknown', 1: 'Fighter', 2: 'Bomber', 3: 'Transport',
  4: 'Tanker', 5: 'AWACS', 6: 'Recon', 7: 'Helicopter',
  8: 'Drone', 9: 'Patrol', 10: 'Special Ops', 11: 'VIP', 12: 'Unknown',
};

const OPERATOR_LABELS = {
  0: 'Unknown', 1: 'USAF', 2: 'USN', 3: 'USMC', 4: 'US Army',
  5: 'RAF', 6: 'Royal Navy', 7: 'French AF', 8: 'Luftwaffe',
  9: 'PLAAF', 10: 'PLAN', 11: 'VKS', 12: 'IAF', 13: 'NATO', 14: 'Other',
};

export function LiveFlightsPanel() {
  const [flights, setFlights] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${WM_BASE}/api/military/v1/list-military-flights?page_size=50`)
      .then(r => r.json())
      .then(data => {
        setFlights(data.flights || []);
        setClusters(data.clusters || []);
      })
      .catch(() => setError('Unable to load military flight data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PanelLoader label="military flights" />;
  if (error) return <PanelError message={error} />;

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Active Flights" value={flights.length} icon={Plane} />
        <StatCard label="Flight Clusters" value={clusters.length} icon={Activity} />
        <StatCard
          label="Flagged"
          value={flights.filter(f => f.is_interesting).length}
          icon={AlertCircle}
          highlight
        />
      </div>

      {/* Flight list */}
      {flights.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-8">No military flights tracked at this time</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {flights.map((flight, i) => (
            <motion.div
              key={flight.id || i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className={`border-slate-200/50 transition-all duration-200 ${flight.is_interesting ? 'border-amber-300/60 bg-amber-50/30' : 'glass-card'}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Plane className="w-4 h-4 flex-shrink-0" style={{ color: brandColors.skyBlue }} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: brandColors.navyDeep }}>
                          {flight.callsign || flight.hex_code || 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {flight.aircraft_model || AIRCRAFT_TYPE_LABELS[flight.aircraft_type] || 'Unknown'} · {OPERATOR_LABELS[flight.operator] || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {flight.is_interesting && (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Flagged</Badge>
                      )}
                      {flight.altitude > 0 && (
                        <span className="text-xs text-slate-400">{Math.round(flight.altitude).toLocaleString()} ft</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, highlight }) {
  const brandColors = { navyDeep: '#1e3a5a', skyBlue: '#4a90b8' };
  return (
    <Card className="glass-card border-slate-200/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`w-4 h-4 ${highlight ? 'text-amber-500' : ''}`} style={highlight ? {} : { color: brandColors.skyBlue }} />
          <span className="text-xs text-slate-500 font-medium">{label}</span>
        </div>
        <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>{value}</p>
      </CardContent>
    </Card>
  );
}

function PanelLoader({ label }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Loading {label}…</span>
    </div>
  );
}

function PanelError({ message }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-red-400">
      <AlertCircle className="w-5 h-5" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
```

---

## Task 5: SatelliteTracker — orbital positions

**Files:**
- Create: `src/components/capabilities/global-intelligence/SatelliteTracker.jsx`

**Step 1: Create the component**

```jsx
// src/components/capabilities/global-intelligence/SatelliteTracker.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Satellite, AlertCircle, Loader2, Globe2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const WM_BASE = 'https://worldmonitor-voip40t21-top-100-aerospace-and-aviation.vercel.app';
const brandColors = { navyDeep: '#1e3a5a', skyBlue: '#4a90b8' };

const TYPE_COLORS = {
  military: 'bg-red-100 text-red-700 border-red-200',
  sar: 'bg-blue-100 text-blue-700 border-blue-200',
  optical: 'bg-purple-100 text-purple-700 border-purple-200',
  communication: 'bg-green-100 text-green-700 border-green-200',
};

export function SatelliteTracker() {
  const [satellites, setSatellites] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${WM_BASE}/api/intelligence/v1/list-satellites`)
      .then(r => r.json())
      .then(data => setSatellites(data.satellites || []))
      .catch(() => setError('Unable to load satellite data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PanelLoader label="satellites" />;
  if (error) return <PanelError message={error} />;

  const types = ['all', ...new Set(satellites.map(s => s.type).filter(Boolean))];
  const displayed = filter === 'all' ? satellites : satellites.filter(s => s.type === filter);

  return (
    <div className="space-y-4">
      {/* Stats + filter */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Globe2 className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
          <span className="text-sm font-semibold" style={{ color: brandColors.navyDeep }}>
            {satellites.length} satellites tracked
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {types.slice(0, 6).map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all duration-150 capitalize ${
                filter === t
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Satellite list */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {displayed.slice(0, 100).map((sat, i) => (
          <motion.div
            key={sat.id || i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(i * 0.02, 0.5) }}
          >
            <Card className="glass-card border-slate-200/50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Satellite className="w-4 h-4 flex-shrink-0" style={{ color: brandColors.skyBlue }} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: brandColors.navyDeep }}>
                        {sat.name || sat.id}
                      </p>
                      <p className="text-xs text-slate-500">
                        {sat.country || '—'} · {sat.alt ? `${Math.round(sat.alt)} km` : '—'}
                      </p>
                    </div>
                  </div>
                  {sat.type && (
                    <Badge
                      className={`text-xs capitalize flex-shrink-0 ${TYPE_COLORS[sat.type] || 'bg-slate-100 text-slate-600'}`}
                    >
                      {sat.type}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      {displayed.length > 100 && (
        <p className="text-xs text-center text-slate-400">Showing 100 of {displayed.length} satellites</p>
      )}
    </div>
  );
}

function PanelLoader({ label }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Loading {label}…</span>
    </div>
  );
}

function PanelError({ message }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-red-400">
      <AlertCircle className="w-5 h-5" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
```

---

## Task 6: GpsJammingPanel — GPS interference alerts

**Files:**
- Create: `src/components/capabilities/global-intelligence/GpsJammingPanel.jsx`

**Step 1: Create the component**

```jsx
// src/components/capabilities/global-intelligence/GpsJammingPanel.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const WM_BASE = 'https://worldmonitor-voip40t21-top-100-aerospace-and-aviation.vercel.app';
const brandColors = { navyDeep: '#1e3a5a', skyBlue: '#4a90b8' };

export function GpsJammingPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${WM_BASE}/api/intelligence/v1/list-gps-interference`)
      .then(r => r.json())
      .then(data => setEvents(data.events || data.items || []))
      .catch(() => setError('Unable to load GPS interference data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PanelLoader label="GPS interference data" />;
  if (error) return <PanelError message={error} />;
  if (!events.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
        <Radio className="w-8 h-8 text-green-400" />
        <p className="text-sm font-medium text-green-600">No GPS interference detected</p>
        <p className="text-xs text-slate-400">All monitored regions nominal</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <p className="text-sm font-semibold text-amber-700">
          {events.length} GPS interference {events.length === 1 ? 'event' : 'events'} detected
        </p>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {events.map((event, i) => (
          <motion.div
            key={event.id || i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="border-amber-200/60 bg-amber-50/20">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Radio className="w-4 h-4 flex-shrink-0 text-amber-500" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: brandColors.navyDeep }}>
                        {event.region || event.location_name || event.area || `Event ${i + 1}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        {event.type || 'GNSS interference'} · {event.detected_at || event.timestamp
                          ? new Date(event.detected_at || event.timestamp).toLocaleString()
                          : 'Recent'}
                      </p>
                    </div>
                  </div>
                  {event.severity && (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs flex-shrink-0 capitalize">
                      {event.severity}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PanelLoader({ label }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Loading {label}…</span>
    </div>
  );
}

function PanelError({ message }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-red-400">
      <AlertCircle className="w-5 h-5" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
```

---

## Task 7: RiskScoresPanel — country composite risk scores

**Files:**
- Create: `src/components/capabilities/global-intelligence/RiskScoresPanel.jsx`

**Step 1: Create the component**

```jsx
// src/components/capabilities/global-intelligence/RiskScoresPanel.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, TrendingUp, TrendingDown, Minus, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WM_BASE = 'https://worldmonitor-voip40t21-top-100-aerospace-and-aviation.vercel.app';
const brandColors = { navyDeep: '#1e3a5a', skyBlue: '#4a90b8', goldPrestige: '#c9a87c' };

// Proto TrendDirection enum values
const TREND_ICONS = {
  1: { icon: TrendingUp, color: 'text-red-500' },    // TREND_DIRECTION_UP
  2: { icon: TrendingDown, color: 'text-green-500' }, // TREND_DIRECTION_DOWN
  3: { icon: Minus, color: 'text-slate-400' },        // TREND_DIRECTION_STABLE
};

function RiskBar({ score }) {
  const color = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#22c55e';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color }}>{Math.round(score)}</span>
    </div>
  );
}

export function RiskScoresPanel() {
  const [ciiScores, setCiiScores] = useState([]);
  const [strategicRisks, setStrategicRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${WM_BASE}/api/intelligence/v1/get-risk-scores`)
      .then(r => r.json())
      .then(data => {
        setCiiScores((data.cii_scores || []).sort((a, b) => b.combined_score - a.combined_score));
        setStrategicRisks(data.strategic_risks || []);
      })
      .catch(() => setError('Unable to load risk scores'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PanelLoader label="risk scores" />;
  if (error) return <PanelError message={error} />;
  if (!ciiScores.length && !strategicRisks.length) {
    return <div className="text-center py-16 text-sm text-slate-400">No risk data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* CII Scores */}
      {ciiScores.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
            <h3 className="font-semibold text-sm" style={{ color: brandColors.navyDeep }}>
              Composite Instability Index
            </h3>
          </div>
          <div className="space-y-3">
            {ciiScores.slice(0, 20).map((score, i) => {
              const trendInfo = TREND_ICONS[score.trend] || TREND_ICONS[3];
              const TrendIcon = trendInfo.icon;
              return (
                <motion.div
                  key={score.region || i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="glass-card border-slate-200/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold" style={{ color: brandColors.navyDeep }}>
                          {score.region}
                        </span>
                        <TrendIcon className={`w-4 h-4 ${trendInfo.color}`} />
                      </div>
                      <RiskBar score={score.combined_score} />
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strategic Risks */}
      {strategicRisks.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3" style={{ color: brandColors.navyDeep }}>
            Strategic Risk Assessments
          </h3>
          <div className="space-y-2">
            {strategicRisks.slice(0, 10).map((risk, i) => (
              <Card key={i} className="glass-card border-slate-200/50">
                <CardContent className="p-3">
                  <p className="text-sm font-semibold" style={{ color: brandColors.navyDeep }}>
                    {risk.region || risk.country || 'Global'}
                  </p>
                  {risk.summary && <p className="text-xs text-slate-500 mt-1">{risk.summary}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PanelLoader({ label }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Loading {label}…</span>
    </div>
  );
}

function PanelError({ message }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-red-400">
      <AlertCircle className="w-5 h-5" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
```

---

## Task 8: NewsFeedDigest — aggregated 435+ RSS feed digest

**Files:**
- Create: `src/components/capabilities/global-intelligence/NewsFeedDigest.jsx`

**Step 1: Create the component**

```jsx
// src/components/capabilities/global-intelligence/NewsFeedDigest.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rss, ExternalLink, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const WM_BASE = 'https://worldmonitor-voip40t21-top-100-aerospace-and-aviation.vercel.app';
const brandColors = { navyDeep: '#1e3a5a', skyBlue: '#4a90b8' };

// Proto ThreatLevel enum
const THREAT_COLORS = {
  1: null,                                                     // LOW - no badge
  2: 'bg-yellow-100 text-yellow-700 border-yellow-200',        // MEDIUM
  3: 'bg-orange-100 text-orange-700 border-orange-200',        // HIGH
  4: 'bg-red-100 text-red-700 border-red-200',                 // CRITICAL
};
const THREAT_LABELS = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };

export function NewsFeedDigest() {
  const [categories, setCategories] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${WM_BASE}/api/news/v1/list-feed-digest?variant=full&lang=en`)
      .then(r => r.json())
      .then(data => {
        const cats = data.categories || {};
        setCategories(cats);
        const firstKey = Object.keys(cats)[0];
        if (firstKey) setActiveCategory(firstKey);
      })
      .catch(() => setError('Unable to load news digest'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PanelLoader label="news digest" />;
  if (error) return <PanelError message={error} />;

  const categoryKeys = Object.keys(categories);
  const activeItems = activeCategory ? (categories[activeCategory]?.items || []) : [];

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {categoryKeys.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-all duration-150 ${
              activeCategory === cat
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {cat.replace(/_/g, ' ')}
            <span className="ml-1.5 opacity-70">
              {categories[cat]?.items?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Active category items */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {activeItems.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">No items in this category</p>
        ) : (
          activeItems.slice(0, 50).map((item, i) => {
            const threatLevel = item.threat?.level;
            const threatColor = THREAT_COLORS[threatLevel];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={`border-slate-200/50 transition-all ${threatLevel >= 3 ? 'border-orange-200/60 bg-orange-50/20' : 'glass-card'}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2.5">
                      {threatLevel >= 3 ? (
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 text-orange-400 mt-0.5" />
                      ) : (
                        <Rss className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: brandColors.skyBlue }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          {item.link ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium hover:underline line-clamp-2 flex-1"
                              style={{ color: brandColors.navyDeep }}
                            >
                              {item.title}
                            </a>
                          ) : (
                            <p className="text-sm font-medium line-clamp-2 flex-1" style={{ color: brandColors.navyDeep }}>
                              {item.title}
                            </p>
                          )}
                          {item.link && <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-slate-400">{item.source}</span>
                          {item.published_at && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="text-xs text-slate-400">
                                {new Date(item.published_at).toLocaleDateString()}
                              </span>
                            </>
                          )}
                          {item.location_name && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="text-xs text-slate-400">{item.location_name}</span>
                            </>
                          )}
                          {threatColor && (
                            <Badge className={`text-xs ${threatColor}`}>
                              {THREAT_LABELS[threatLevel]}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

function PanelLoader({ label }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Loading {label}…</span>
    </div>
  );
}

function PanelError({ message }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-red-400">
      <AlertCircle className="w-5 h-5" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
```

**Step 2: Commit all components so far**

```bash
git add src/components/capabilities/global-intelligence/
git commit -m "feat: add GlobalIntelligence data panel components"
```

---

## Task 9: GlobalIntelligence page — assemble everything

**Files:**
- Create: `src/pages/GlobalIntelligence.jsx`

**Step 1: Create the page**

```jsx
// src/pages/GlobalIntelligence.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe2, Plane, Satellite, Radio, ShieldAlert, Rss } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  WorldMonitorGlobe,
  AviationNewsFeed,
  LiveFlightsPanel,
  SatelliteTracker,
  GpsJammingPanel,
  RiskScoresPanel,
  NewsFeedDigest,
} from '@/components/capabilities/global-intelligence';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

const DATA_TABS = [
  { id: 'news', label: 'Aviation News', icon: Plane },
  { id: 'flights', label: 'Live Flights', icon: Plane },
  { id: 'satellites', label: 'Satellites', icon: Satellite },
  { id: 'gps', label: 'GPS Signals', icon: Radio },
  { id: 'risk', label: 'Risk Scores', icon: ShieldAlert },
  { id: 'digest', label: 'News Digest', icon: Rss },
];

export default function GlobalIntelligence() {
  const [activeTab, setActiveTab] = useState('news');

  return (
    <div
      className="min-h-screen overflow-x-hidden sf-pro"
      style={{ background: `linear-gradient(135deg, #faf8f5 0%, #f5f1ed 50%, #faf8f5 100%)` }}
    >
      <div className="px-4 py-8 md:px-6 max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-4 rounded-2xl shadow-lg"
              style={{ background: `linear-gradient(135deg, ${brandColors.skyBlue}, ${brandColors.navyDeep})` }}
            >
              <Globe2 className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1
                className="text-4xl md:text-5xl font-bold"
                style={{ color: brandColors.navyDeep }}
              >
                Global Intelligence
              </h1>
              <p className="text-sm text-slate-600 mt-2 font-medium">
                Real-time aerospace, aviation & geopolitical intelligence — powered by World Monitor
              </p>
            </div>
          </div>
        </motion.div>

        {/* Globe iFrame */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <WorldMonitorGlobe />
        </motion.div>

        {/* Data Panels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="glass-card border border-slate-200/50 rounded-2xl shadow-lg p-6"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1 bg-slate-100/50 p-1.5 rounded-xl mb-6">
              {DATA_TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex flex-col items-center gap-1 rounded-lg text-xs data-[state=active]:glass-card data-[state=active]:shadow-md transition-all duration-200 py-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:block font-medium leading-tight text-center">
                      {tab.label.split(' ')[0]}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="news"><AviationNewsFeed /></TabsContent>
            <TabsContent value="flights"><LiveFlightsPanel /></TabsContent>
            <TabsContent value="satellites"><SatelliteTracker /></TabsContent>
            <TabsContent value="gps"><GpsJammingPanel /></TabsContent>
            <TabsContent value="risk"><RiskScoresPanel /></TabsContent>
            <TabsContent value="digest"><NewsFeedDigest /></TabsContent>
          </Tabs>
        </motion.div>

      </div>
    </div>
  );
}
```

**Step 2: Verify page auto-registers**

Run: `npm run dev` in `top-100-aerospace-aviation1`
Navigate to: `http://localhost:5173/GlobalIntelligence`
Expected: Page loads with header, globe toolbar (or iframe), and data tabs.

**Step 3: Commit**

```bash
git add src/pages/GlobalIntelligence.jsx
git commit -m "feat: add GlobalIntelligence page with World Monitor integration"
```

---

## Task 10: Add to navigation

**Files:**
- Modify: `src/components/layout/navConfig.js`

**Step 1: Add to ALL_RESOURCES and QUICK_ACTIONS**

In `navConfig.js`, add `GlobalIntelligence` to `ALL_RESOURCES`:

```js
// Add this entry to ALL_RESOURCES array:
{ icon: 'Globe2', label: 'Global Intelligence', pageName: 'GlobalIntelligence' },
```

And optionally add to `QUICK_ACTIONS` for top-level visibility:

```js
// Add this entry to QUICK_ACTIONS array:
{ label: 'Global Intelligence', pageName: 'GlobalIntelligence', icon: 'Globe2', color: brandColors.skyBlue },
```

The final `navConfig.js` should look like:

```js
import { brandColors } from "@/components/core/brandTheme";

export { brandColors };

export const CORE_NAV_ITEMS = [
    { icon: 'Home', label: "Home", pageName: "Home" },
    { icon: 'MessageCircle', label: "Comms", pageName: "Comms" },
    { icon: 'Cpu', label: "Index", pageName: "Top100Women2025" },
];

export const QUICK_ACTIONS = [
    { label: 'Nominate Someone', pageName: 'Nominations', icon: 'Send', color: brandColors.goldPrestige },
    { label: 'View TOP 100', pageName: 'Top100Women2025', icon: 'Trophy', color: brandColors.navyDeep },
    { label: 'Explore Arena', pageName: 'Arena', icon: 'Users', color: brandColors.skyBlue },
    { label: 'Global Intelligence', pageName: 'GlobalIntelligence', icon: 'Globe2', color: brandColors.skyBlue },
];

export const ALL_RESOURCES = [
    { label: 'Home', pageName: 'Landing', icon: 'Home' },
    { icon: 'Trophy', label: "Explore Index", pageName: "Top100Women2025" },
    { icon: 'Award', label: "Season 4", pageName: "Season4" },
    { label: 'Calendar', pageName: 'Calendar', icon: 'Calendar' },
    { label: 'Arena', pageName: 'Arena', icon: 'Users' },
    { label: 'Get Started', pageName: 'GetStarted', icon: 'Compass' },
    { label: 'About', pageName: 'About', icon: 'BookOpen' },
    { label: 'Talent Exchange', pageName: 'TalentExchange', icon: 'Briefcase' },
    { label: 'Profile', pageName: 'Profile', icon: 'Users' },
    { label: 'Mission Control', pageName: 'MissionControl', icon: 'LayoutDashboard' },
    { label: 'Global Intelligence', pageName: 'GlobalIntelligence', icon: 'Globe2' },
    { label: 'Sponsors', pageName: 'Sponsors', icon: 'Heart' },
    { label: 'Help', pageName: 'HelpCenter', icon: 'MessageSquare' },
];

export const DEFAULT_BOOKMARKS = [
    { label: 'Home', pageName: 'Landing', icon: 'Home', order: 0 },
    { label: 'Calendar', pageName: 'Calendar', icon: 'Calendar', order: 1 },
    { label: 'Mission Control', pageName: 'MissionControl', icon: 'LayoutDashboard', order: 2 },
];
```

**Step 2: Verify nav entry appears in the sidebar**

In the running dev server, open the sidebar/drawer. `Global Intelligence` with `Globe2` icon should appear in the resources list and quick actions.

**Step 3: Final commit**

```bash
git add src/components/layout/navConfig.js
git commit -m "feat: add Global Intelligence to navigation"
```

---

## Verification Checklist

After all tasks:

- [ ] Navigate to `/GlobalIntelligence` — page loads with correct header styling
- [ ] Globe toolbar appears; iframe loads World Monitor within ~10s
- [ ] Collapse/expand globe toggle works
- [ ] All 6 data tabs are clickable and show loading state → data
- [ ] Aviation News tab: shows article cards with source, date, entity badges
- [ ] Live Flights tab: shows flight count + flight cards (may be empty if no active flights)
- [ ] Satellites tab: shows satellite list with type filter buttons
- [ ] GPS Signals tab: shows "no interference detected" or alert cards
- [ ] Risk Scores tab: shows CII score bars with animated fills
- [ ] News Digest tab: shows category buttons + scrollable article list
- [ ] `Global Intelligence` appears in sidebar navigation
- [ ] Clicking it from any page navigates correctly
- [ ] Mobile: page is responsive, globe collapses cleanly

---

## Troubleshooting

**iFrame shows blank / refuses to connect:**
Vercel deployment may have CORS or frame-ancestors restrictions. Open the WM URL directly in the browser first to confirm it loads. If needed, add `X-Frame-Options: ALLOWALL` or update `Content-Security-Policy: frame-ancestors *` in WM's `vercel.json`.

**API fetch returns 401 or CORS error:**
WM APIs are public but may require the request to come from a browser (not server-side). All fetches in this plan are client-side `useEffect`, so this should work. If CORS errors appear, the WM deployment needs `Access-Control-Allow-Origin: *` headers on its API routes.

**`Globe2` icon not found:**
Use `Globe` from lucide-react instead — same visual.

**pages.config.js doesn't auto-update:**
If the `@base44/vite-plugin` doesn't pick up the new page file, manually add the import and entry following the existing pattern in `pages.config.js`.
