import { useMemo, useState } from 'react';
import { ClipboardCheck, Layers, ListChecks, Route, ShieldQuestion, TriangleAlert } from 'lucide-react';
import { AUDIT_METHOD, AUDIT_READ_ON, FINDINGS, FUNNELS, coverageOf, severityCounts } from './funnelRegistry';
import FunnelLedger from './FunnelLedger';
import FunnelFindings from './FunnelFindings';
import FunnelRoadmap from './FunnelRoadmap';
import FunnelStreams from './FunnelStreams';
import useFunnelEvidence from './useFunnelEvidence';

// THE AUDIT DESK — everything the house runs as a journey, read against the code that runs it.
//
// God's Eye answers "how much is there". This answers "where does a person stop, and who
// speaks to them afterwards", which is a different question and needs a different surface.
// It reads and reports; it changes nothing.

const TABS = [
  { key: 'streams', label: 'The five streams', icon: Layers },
  { key: 'ledger', label: 'The ledger', icon: Route },
  { key: 'findings', label: 'Findings', icon: TriangleAlert },
  { key: 'roadmap', label: 'What to do next', icon: ListChecks },
];

export default function FunnelAuditDesk() {
  const [tab, setTab] = useState('streams');
  const [selectedId, setSelectedId] = useState(FUNNELS[0].id);
  const { evidence, state: evidenceState, error: evidenceError, reload } = useFunnelEvidence();

  const rungs = useMemo(() => {
    const totals = FUNNELS.reduce(
      (acc, funnel) => {
        const cover = coverageOf(funnel);
        return { recorded: acc.recorded + cover.recorded, total: acc.total + cover.total };
      },
      { recorded: 0, total: 0 },
    );
    return totals;
  }, []);

  const counts = useMemo(() => severityCounts(), []);
  const urgent = (counts.critical || 0) + (counts.high || 0);

  const openFunnel = (id) => {
    setSelectedId(id);
    setTab('ledger');
  };

  return (
    <div className="space-y-5">
      <div className="desk-plate p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-md border border-editorial-gold/35 bg-editorial-gold/10">
              <ClipboardCheck className="h-5 w-5 text-editorial-gold" aria-hidden="true" />
            </div>
            <div>
              <p className="font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-editorial-gold">Funnel Desk</p>
              <h2 className="mt-1 font-heading text-2xl text-editorial-cream">The audit</h2>
              <p className="mt-1.5 max-w-2xl font-body text-xs leading-6 text-[#a3b8c9]">{AUDIT_METHOD}</p>
            </div>
          </div>
          <p className="font-body text-[10px] uppercase tracking-[0.16em] text-[#7d97ad]">Read {AUDIT_READ_ON}</p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="desk-face px-4 py-4">
            <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-label">Journeys audited</p>
            <p className="mt-1 font-heading text-3xl text-editorial-navy">{FUNNELS.length}</p>
            <p className="mt-1 font-body text-[10px] text-editorial-navy/60">Every door into the house</p>
          </div>
          <div className="desk-face px-4 py-4">
            <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-label">Rungs with an instrument</p>
            <p className="mt-1 font-heading text-3xl text-editorial-navy">
              {rungs.recorded}
              <span className="font-body text-base text-editorial-navy/50"> / {rungs.total}</span>
            </p>
            <p className="mt-1 font-body text-[10px] text-editorial-navy/60">
              The rest is a record written at the finish line
            </p>
          </div>
          <div className="desk-face px-4 py-4">
            <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-label">Worth acting on now</p>
            <p className="mt-1 font-heading text-3xl text-editorial-navy">{urgent}</p>
            <p className="mt-1 font-body text-[10px] text-editorial-navy/60">Critical and high findings</p>
          </div>
          <div className="desk-face px-4 py-4">
            <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-label">Named unknowns</p>
            <p className="mt-1 font-heading text-3xl text-editorial-navy">{FINDINGS.filter((f) => f.confidence === 'unknown').length}</p>
            <p className="mt-1 font-body text-[10px] text-editorial-navy/60">Where the record cannot say</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5" role="tablist" aria-label="Audit views">
          {TABS.map((entry) => {
            const Icon = entry.icon;
            const active = tab === entry.key;
            return (
              <button
                key={entry.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(entry.key)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 font-body text-[10px] font-bold uppercase tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-gold/60 ${
                  active
                    ? 'bg-editorial-gold/15 text-editorial-cream shadow-[inset_0_0_0_1px_rgba(201,168,124,0.55)]'
                    : 'text-[#8ea7bd] hover:bg-white/[0.05] hover:text-editorial-cream'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {entry.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'streams' ? (
        <FunnelStreams
          evidence={evidence}
          evidenceState={evidenceState}
          onOpenFunnel={openFunnel}
        />
      ) : null}

      {tab === 'ledger' ? (
        <div className="desk-plate p-4 md:p-5">
          <FunnelLedger
            selectedId={selectedId}
            onSelect={setSelectedId}
            evidence={evidence}
            evidenceState={evidenceState}
            evidenceError={evidenceError}
            onRetry={reload}
          />
        </div>
      ) : null}

      {tab === 'findings' ? (
        <div className="desk-plate p-5 md:p-6">
          <div className="flex items-start gap-2.5">
            <ShieldQuestion className="mt-0.5 h-4 w-4 flex-none text-editorial-copper" aria-hidden="true" />
            <p className="max-w-3xl font-body text-xs leading-6 text-[#a3b8c9]">
              Each row is a reading of the code, graded by what it costs and marked with how sure it is. Confirmed means
              the pattern was seen in the source; likely means it follows from what was seen; unknown is named so that
              silence is never mistaken for health.
            </p>
          </div>
          <div className="mt-5">
            <FunnelFindings onOpenFunnel={openFunnel} />
          </div>
        </div>
      ) : null}

      {tab === 'roadmap' ? (
        <div className="desk-plate p-5 md:p-6">
          <FunnelRoadmap onOpenFunnel={openFunnel} />
        </div>
      ) : null}
    </div>
  );
}