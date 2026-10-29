import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, RefreshCw, AlertTriangle, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import MonitorTotals from './MonitorTotals';
import StandingsBoard from './StandingsBoard';
import BallotLedger from './BallotLedger';
import ContributorTable from './ContributorTable';

// The selection monitor: every cohort's ballot in one room. Read-only, admin only — the
// ledger of who weighed whom, and the tallies those weights are producing while the
// windows are still open.

const REFRESH_MS = 60000;

export default function SelectionMonitor() {
  const [scope, setScope] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (quiet = false) => {
      quiet ? setRefreshing(true) : setLoading(true);
      setError(null);
      try {
        const payload = scope === 'all' ? {} : { season_ids: [scope] };
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
    [scope]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

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

  // The picker offers the cohorts that can still be watched; archived editions keep
  // their ledgers where they are.
  const cohorts = (data?.cohorts || []).filter((c) => c.status !== 'archived');
  const stamp = data?.generated_at
    ? new Date(data.generated_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-editorial-gold" />
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-editorial-label">Selection</p>
          </div>
          <h2 className="mt-0.5 font-heading text-2xl leading-tight text-editorial-navy">Live monitor</h2>
          <p className="text-xs text-editorial-navy/55">
            Every cohort's ballot, its standings, and the marks behind them. {stamp && `Read at ${stamp}.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={scope} onValueChange={setScope}>
            <SelectTrigger className="h-8 w-[220px] text-xs">
              <SelectValue placeholder="All cohorts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cohorts</SelectItem>
              {cohorts.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.cohort_label || c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => load(true)} disabled={refreshing}>
            {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
        </div>
      </div>

      <MonitorTotals totals={data?.totals} cohortStats={data?.cohort_stats} />

      <Tabs defaultValue="standings">
        <TabsList className="bg-editorial-cream">
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="ballots">Ballots</TabsTrigger>
          <TabsTrigger value="marks">Marks</TabsTrigger>
          <TabsTrigger value="contributors">Community</TabsTrigger>
        </TabsList>
        <TabsContent value="standings" className="mt-4">
          <StandingsBoard
            rows={data?.standings || []}
            seeded={data?.totals?.seeded || 0}
            castBallots={data?.totals?.ballots || 0}
            scopeKey={scope}
          />
        </TabsContent>
        <TabsContent value="ballots" className="mt-4">
          <BallotLedger kind="ballots" ballots={data?.ballot_tracking || []} />
        </TabsContent>
        <TabsContent value="marks" className="mt-4">
          <BallotLedger kind="marks" marks={data?.ledger || []} />
        </TabsContent>
        <TabsContent value="contributors" className="mt-4">
          <ContributorTable rows={data?.contributors || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}