import { lazy, Suspense } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { TickerHeader } from '@/components/capabilities/global-intelligence/TickerHeader';
import { LiveFlightsPanel } from '@/components/capabilities/global-intelligence';
import { LiveNewsPanel } from '@/components/capabilities/global-intelligence/LiveNewsPanel';
import { ConflictAlertsSummary } from '@/components/capabilities/global-intelligence/ConflictAlertsSummary';
import { CyberThreatsSummary } from '@/components/capabilities/global-intelligence/CyberThreatsSummary';
import { GpsJammingSummary } from '@/components/capabilities/global-intelligence/GpsJammingSummary';
import { MaritimeSummary } from '@/components/capabilities/global-intelligence/MaritimeSummary';
import { DisastersSummary } from '@/components/capabilities/global-intelligence/DisastersSummary';
import { SupplyChainSummary } from '@/components/capabilities/global-intelligence/SupplyChainSummary';
import { TerminalPanel, TerminalPanelCompact } from './TerminalPanel';
import { TerminalNewsFeed } from './TerminalNewsFeed';
import { TerminalMarketStrip } from './TerminalMarketStrip';
import { TerminalLaunchSchedule } from './TerminalLaunchSchedule';
import { TerminalIntelFeed } from './TerminalIntelFeed';
import { Loader2 } from 'lucide-react';

const WorldMonitorGlobe = lazy(() =>
  import('@/components/capabilities/global-intelligence').then(m => ({ default: m.WorldMonitorGlobe }))
);

const VRESIZE = "h-1 bg-slate-800 hover:bg-blue-600 transition-colors cursor-row-resize";
const HRESIZE = "w-1 bg-slate-800 hover:bg-blue-600 transition-colors cursor-col-resize";

const BOTTOM_PANELS = [
  { label: 'CONFLICTS',  Component: ConflictAlertsSummary },
  { label: 'DISASTERS',  Component: DisastersSummary },
  { label: 'CYBER',      Component: CyberThreatsSummary },
  { label: 'MARITIME',   Component: MaritimeSummary },
  { label: 'GPS JAM',    Component: GpsJammingSummary },
  { label: 'SUPPLY',     Component: SupplyChainSummary },
];

const GlobeFallback = () => (
  <div className="flex items-center justify-center h-full bg-slate-900">
    <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
  </div>
);

export default function BloombergTerminal() {
  return (
    <div className="bg-[#070b14] text-white h-[calc(100vh-48px)] flex flex-col overflow-hidden font-mono">
      {/* Top ticker */}
      <TickerHeader />

      {/* Market quotes strip */}
      <div className="h-6 bg-[#050810] border-b border-slate-800 flex items-center px-3 shrink-0">
        <TerminalMarketStrip />
      </div>

      {/* Main 3-column resizable layout */}
      <PanelGroup direction="horizontal" className="flex-1 min-h-0" autoSaveId="terminal-main">

        {/* Left column: Globe (top) + News Feed (bottom) */}
        <Panel defaultSize={40} minSize={25} id="t-left">
          <PanelGroup direction="vertical" autoSaveId="terminal-left-v">
            <Panel defaultSize={60} minSize={30} id="t-globe">
              <TerminalPanel label="GLOBAL MAP">
                <ErrorBoundary label="Globe">
                  <Suspense fallback={<GlobeFallback />}>
                    <WorldMonitorGlobe />
                  </Suspense>
                </ErrorBoundary>
              </TerminalPanel>
            </Panel>

            <PanelResizeHandle className={VRESIZE} />

            <Panel defaultSize={40} minSize={20} id="t-news">
              <TerminalPanel label="AEROSPACE NEWS">
                <TerminalNewsFeed />
              </TerminalPanel>
            </Panel>
          </PanelGroup>
        </Panel>

        <PanelResizeHandle className={HRESIZE} />

        {/* Middle column: Flights (top) + Intel Feed (bottom) */}
        <Panel defaultSize={35} minSize={20} id="t-mid">
          <PanelGroup direction="vertical" autoSaveId="terminal-mid-v">
            <Panel defaultSize={55} minSize={25} id="t-flights">
              <TerminalPanel label="MILITARY INTEL">
                <ErrorBoundary label="Live Flights">
                  <LiveFlightsPanel />
                </ErrorBoundary>
              </TerminalPanel>
            </Panel>

            <PanelResizeHandle className={VRESIZE} />

            <Panel defaultSize={45} minSize={20} id="t-intel">
              <TerminalPanel label="INTELLIGENCE FEED">
                <TerminalIntelFeed />
              </TerminalPanel>
            </Panel>
          </PanelGroup>
        </Panel>

        <PanelResizeHandle className={HRESIZE} />

        {/* Right column: Live Streams (top) + Launch Schedule (bottom) */}
        <Panel defaultSize={25} minSize={15} id="t-right">
          <PanelGroup direction="vertical" autoSaveId="terminal-right-v">
            <Panel defaultSize={55} minSize={25} id="t-live">
              <TerminalPanel label="LIVE FEEDS">
                <LiveNewsPanel />
              </TerminalPanel>
            </Panel>

            <PanelResizeHandle className={VRESIZE} />

            <Panel defaultSize={45} minSize={20} id="t-launches">
              <TerminalPanel label="LAUNCH SCHEDULE">
                <TerminalLaunchSchedule />
              </TerminalPanel>
            </Panel>
          </PanelGroup>
        </Panel>

      </PanelGroup>

      {/* Bottom strip — 6 compact summary panels */}
      <div className="h-24 flex border-t border-slate-800 shrink-0">
        {BOTTOM_PANELS.map(({ label, Component }, i) => (
          <div
            key={label}
            className={`flex-1 min-w-0 ${i > 0 ? 'border-l border-slate-800' : ''}`}
          >
            <TerminalPanelCompact label={label}>
              <Component />
            </TerminalPanelCompact>
          </div>
        ))}
      </div>
    </div>
  );
}