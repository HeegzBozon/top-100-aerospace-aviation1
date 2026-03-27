import { Suspense, lazy } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const WorldMonitorGlobe = lazy(() => import('@/components/capabilities/global-intelligence/WorldMonitorGlobe'));
const LiveFlightsPanel = lazy(() => import('@/components/capabilities/global-intelligence/LiveFlightsPanel'));
const TickerHeader = lazy(() => import('@/components/capabilities/global-intelligence/TickerHeader'));
const LiveNewsPanel = lazy(() => import('@/components/capabilities/global-intelligence/LiveNewsPanel'));
const FleetORBATPanel = lazy(() => import('@/components/capabilities/global-intelligence/FleetORBATPanel'));
const LaunchWidgetCompact = lazy(() => import('@/components/capabilities/global-intelligence/LaunchWidgetCompact'));
const ConflictAlertsSummary = lazy(() => import('@/components/capabilities/global-intelligence/ConflictAlertsSummary'));
const DisastersSummary = lazy(() => import('@/components/capabilities/global-intelligence/DisastersSummary'));
const CyberThreatsSummary = lazy(() => import('@/components/capabilities/global-intelligence/CyberThreatsSummary'));
const MaritimeSummary = lazy(() => import('@/components/capabilities/global-intelligence/MaritimeSummary'));
const GpsJammingSummary = lazy(() => import('@/components/capabilities/global-intelligence/GpsJammingSummary'));
const SupplyChainSummary = lazy(() => import('@/components/capabilities/global-intelligence/SupplyChainSummary'));

// ── TerminalPanel must be defined at FILE SCOPE — not inside the page component.
// Moving it inside would cause React to treat it as a new component type on every
// render, unmounting the globe/YouTube iframes on every state change.
function TerminalPanel({ label, children }) {
  return (
    <div className="h-full flex flex-col bg-[#0a0f1e]">
      <div className="px-3 py-1 border-b border-slate-800 flex items-center gap-2 shrink-0">
        <span className="text-[10px] font-mono tracking-[0.2em] text-slate-400 uppercase">
          {label}
        </span>
        <div className="flex-1 h-px bg-slate-800" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      </div>
      <div className="flex-1 overflow-auto p-2 min-h-0">
        {children}
      </div>
    </div>
  );
}

function TerminalPanelCompact({ label, children }) {
  return (
    <div className="h-full flex flex-col bg-[#0a0f1e]">
      <div className="px-2 py-0.5 border-b border-slate-800 flex items-center gap-1.5 shrink-0">
        <span className="text-[9px] font-mono tracking-[0.15em] text-slate-500 uppercase">
          {label}
        </span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>
      <div className="flex-1 overflow-hidden p-1 min-h-0">
        {children}
      </div>
    </div>
  );
}

const BOTTOM_PANELS = [
  { label: 'CONFLICTS',    Component: ConflictAlertsSummary },
  { label: 'DISASTERS',   Component: DisastersSummary },
  { label: 'CYBER',       Component: CyberThreatsSummary },
  { label: 'MARITIME',    Component: MaritimeSummary },
  { label: 'GPS JAM',     Component: GpsJammingSummary },
  { label: 'SUPPLY',      Component: SupplyChainSummary },
];

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full bg-[#070b14]">
    <div className="w-8 h-8 border-4 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
  </div>
);

export default function GlobalIntelligence() {
  return (
    <div className="bg-[#070b14] text-white h-screen flex flex-col overflow-hidden font-mono">

      {/* Ticker */}
      <Suspense fallback={<LoadingSpinner />}>
        <TickerHeader />
      </Suspense>

      {/* Main 3-column panel grid */}
      <Suspense fallback={<LoadingSpinner />}>
        <PanelGroup
          direction="horizontal"
          className="flex-1 min-h-0"
          autoSaveId="gi-main"
        >

          {/* Left: Globe (40%) */}
          <Panel defaultSize={40} minSize={20} id="globe">
            <TerminalPanel label="GLOBAL MAP">
              <ErrorBoundary label="Globe">
                <Suspense fallback={<LoadingSpinner />}>
                  <WorldMonitorGlobe />
                </Suspense>
              </ErrorBoundary>
            </TerminalPanel>
          </Panel>

        <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-blue-600 transition-colors cursor-col-resize" />

        {/* Middle: Flights (top) + ORBAT (bottom) — 35% */}
        <Panel defaultSize={35} minSize={20} id="intel-col">
          <PanelGroup direction="vertical" autoSaveId="gi-intel-col">

            <Panel defaultSize={55} minSize={25} id="flights">
              <TerminalPanel label="MILITARY INTEL">
                <ErrorBoundary label="Live Flights">
                  <LiveFlightsPanel />
                </ErrorBoundary>
              </TerminalPanel>
            </Panel>

            <PanelResizeHandle className="h-1 bg-slate-800 hover:bg-blue-600 transition-colors cursor-row-resize" />

            <Panel defaultSize={45} minSize={25} id="orbat">
              <TerminalPanel label="FLEET ORBAT">
                <ErrorBoundary label="Fleet ORBAT">
                  <FleetORBATPanel />
                </ErrorBoundary>
              </TerminalPanel>
            </Panel>

          </PanelGroup>
        </Panel>

        <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-blue-600 transition-colors cursor-col-resize" />

        {/* Right: Live feeds (top) + Launches (bottom) — 25% */}
        <Panel defaultSize={25} minSize={15} id="streams-col">
          <PanelGroup direction="vertical" autoSaveId="gi-streams-col">

            <Panel defaultSize={60} minSize={30} id="live-news">
              <TerminalPanel label="LIVE FEEDS">
                <LiveNewsPanel />
              </TerminalPanel>
            </Panel>

            <PanelResizeHandle className="h-1 bg-slate-800 hover:bg-blue-600 transition-colors cursor-row-resize" />

            <Panel defaultSize={40} minSize={20} id="launches">
              <TerminalPanel label="LAUNCH SCHEDULE">
                <LaunchWidgetCompact />
              </TerminalPanel>
            </Panel>

          </PanelGroup>
        </Panel>

        </PanelGroup>
      </Suspense>

      {/* Bottom strip — fixed height, 6 panels side-by-side */}
      <Suspense fallback={<div className="h-28 bg-[#070b14]" />}>
        <div className="h-28 flex border-t border-slate-800 shrink-0">
          {BOTTOM_PANELS.map(({ label, Component }, i) => (
            <div
              key={label}
              className={`flex-1 min-w-0 ${i > 0 ? 'border-l border-slate-800' : ''}`}
            >
              <TerminalPanelCompact label={label}>
                <Suspense fallback={<LoadingSpinner />}>
                  <Component />
                </Suspense>
              </TerminalPanelCompact>
            </div>
          ))}
        </div>
      </Suspense>

    </div>
  );
}