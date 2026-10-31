import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import useMonitorEditMenu from './useMonitorEditMenu';
import MonitorStats from './MonitorStats';
import PulseBand from './PulseBand';
import CohortDive from './CohortDive';
import StandingsBoard from './StandingsBoard';
import BallotLedger from './BallotLedger';
import MarkSetsLedger from './MarkSetsLedger';
import ContributorTable from './ContributorTable';

// The selection monitor: every cohort's ballot in one room. Read-only, admin only — the
// ledger of who weighed whom, and the tallies those weights are producing while the
// windows are still open.
//
// The board is the whole head of the surface. Which reading it is, which cohort is in
// scope and taking it again live in the machine's Edit menu, so nothing stands between the
// operator and the standings.

const REFRESH_MS = 60000;
// The activity ledgers open on what has just landed; the whole record is one press away.
const RECENT = 20;

export default function SelectionMonitor({ onOpenMenu }) {
  const [scope, setScope] = useState('all');
  // Which ledger is being read: the community's record, or the internal review sets.
  const [mode, setMode] = useState('live');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (quiet = false) => {
      quiet ? setRefreshing(true) : setLoading(true);
      setError(null);
      try {
        const payload = { mode, ...(scope === 'all' ? {} : { season_ids: [scope] }) };
        const res = await base44.functions.invoke('getSelectionAnalytics', payload);
        if (res?.data?.error) throw new Error(res.data.error);
        setData(res.data);
      } catch (e) {
        setError(e?.response?.data?.error || e.message || 'The monitor could not reach the ledger.');
        if (!quiet) setData(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [scope, mode]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  // The picker offers the cohorts that can still be watched; archived editions keep
  // their ledgers where they are.
  const cohorts = useMemo(
    () => (data?.cohorts || []).filter((c) => c.status !== 'archived'),
    [data?.cohorts]
  );

  useMonitorEditMenu({
    mode,
    onMode: setMode,
    scope,
    onScope: setScope,
    cohorts,
    onRefresh: () => load(true),
    onOpenSections: onOpenMenu,
    enabled: !loading && !error,
  });

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center gap-2 rounded-xl border border-editorial-navy/10 bg-white">
        <Loader2 className="h-4 w-4 animate-spin text-editorial-gold" />
        <span className="text-xs uppercase tracking-[0.2em] text-editorial-navy/50">Reading the ledger</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-editorial-copper/40 bg-white p-6 text-center">
        <AlertTriangle className="mx-auto h-5 w-5 text-editorial-copper" />
        <p className="mt-2 font-heading text-lg text-editorial-navy">The ledger is not answering</p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-editorial-navy/60">{error}</p>
        <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={() => load()}>
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </Button>
      </div>
    );
  }

  const totals = data?.totals;

  return (
    <div className="space-y-3">
      {/* The figures stand at the head of the surface; the reading follows immediately. */}
      <MonitorStats totals={totals} />

      {/* Two readings of the same room: where the field stands, and what has just landed
          in it. */}
      <Tabs defaultValue="standings">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-0.5 bg-editorial-cream p-0.5 md:inline-flex md:h-10 md:w-auto md:gap-1 md:p-1">
          <TabsTrigger value="standings" className="px-2 text-[11px] md:px-4 md:text-sm">
            Standings
          </TabsTrigger>
          <TabsTrigger value="activity" className="px-2 text-[11px] md:px-4 md:text-sm">
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standings" className="mt-2.5 space-y-3">
          <StandingsBoard
            rows={data?.standings || []}
            seeded={totals?.seeded || 0}
            castBallots={totals?.ballots || 0}
            mode={mode}
            scopeKey={`${scope}:${mode}`}
          />
          <CohortDive cohortStats={data?.cohort_stats} mode={mode} />
        </TabsContent>

        <TabsContent value="activity" className="mt-2.5 space-y-3">
          <PulseBand totals={totals} mode={mode} />

          <Tabs defaultValue="ballots">
            <TabsList className="grid h-auto w-full grid-cols-3 gap-0.5 bg-editorial-cream p-0.5 md:inline-flex md:h-10 md:w-auto md:gap-1 md:p-1">
              <TabsTrigger value="ballots" className="px-1 text-[10px] md:px-3 md:text-sm">
                Ballots
              </TabsTrigger>
              <TabsTrigger value="marks" className="px-1 text-[10px] md:px-3 md:text-sm">
                Marks
              </TabsTrigger>
              <TabsTrigger value="contributors" className="px-1 text-[10px] md:px-3 md:text-sm">
                Community
              </TabsTrigger>
            </TabsList>
            <TabsContent value="ballots" className="mt-2.5">
              <BallotLedger ballots={data?.ballot_tracking || []} recent={RECENT} />
            </TabsContent>
            <TabsContent value="marks" className="mt-2.5">
              <MarkSetsLedger marks={data?.ledger || []} recent={RECENT} />
            </TabsContent>
            <TabsContent value="contributors" className="mt-2.5">
              <ContributorTable rows={data?.contributors || []} />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}