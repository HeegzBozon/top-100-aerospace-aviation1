import { useCallback, useEffect, useState } from 'react';
import { Loader2, Clock, Lock, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brand } from '@/components/nominate/NominateConfig';
import AnchorVoting from '@/components/voting/AnchorVoting';
import VotingProgressPanel from '@/components/voting/VotingProgressPanel';
import { useToast } from '@/components/ui/use-toast';

const fmtDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// The ballot, open to every Fellow. One call opens it — which cohort is counting,
// where its window stands, and the ladder already climbed — and the weighing itself
// is the anchor surface, unchanged.
export default function VoteSurface({ user }) {
  const { toast } = useToast();
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('getVotingContext', {});
      if (res?.data?.success) setContext(res.data);
      else setError(res?.data?.error || 'The ballot could not be opened.');
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'The ballot could not be opened.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // A recorded set returns the ladder as it now stands, so the panel moves without a
  // second call.
  const onRecorded = useCallback(
    (result) => {
      if (!result?.recorded) return;
      setContext((prev) =>
        prev
          ? {
              ...prev,
              ballot: prev.ballot,
              progress: { ...prev.progress, ...result.progress, ladder: prev.progress?.ladder },
            }
          : prev
      );
      if (result.leveled_up) {
        toast({ title: `Level ${result.progress?.level}`, description: result.progress?.name });
      }
      const fresh = result.new_milestones || [];
      if (fresh.length) {
        toast({ title: 'Milestone', description: fresh.map((m) => m.label).join(' · ') });
      }
    },
    [toast]
  );

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin" style={{ color: brand.gold }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
        <p className="font-heading text-lg" style={{ color: brand.navy }}>
          The ballot did not open
        </p>
        <p className="max-w-sm text-xs leading-relaxed" style={{ color: `${brand.navy}60` }}>
          {error}
        </p>
        <button
          onClick={load}
          className="mt-1 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium"
          style={{ background: brand.navy, color: brand.cream || '#FAF8F5' }}
        >
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </button>
      </div>
    );
  }

  const target = context?.target;
  const open = Boolean(context?.open && target);

  if (!open) {
    // The window, not the Fellow, closes the ballot: say which one, and when the next
    // counting cohort opens, rather than showing an empty surface.
    const upcoming = (context?.cohorts || [])
      .filter((c) => c.voting_start && new Date(c.voting_start) > new Date())
      .sort((a, b) => new Date(a.voting_start) - new Date(b.voting_start))[0];

    return (
      <div className="flex flex-1 flex-col overflow-y-auto px-5 py-8">
        <div className="mx-auto w-full max-w-md">
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: 'rgba(255,255,255,0.68)', border: `1px solid ${brand.navy}12` }}
          >
            <span
              className="inline-flex h-11 w-11 items-center justify-center rounded-full"
              style={{ background: `${brand.navy}0A` }}
            >
              <Lock className="h-5 w-5" style={{ color: `${brand.navy}70` }} />
            </span>
            <h2 className="mt-3 font-heading text-xl" style={{ color: brand.navy }}>
              The ballot is closed
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed" style={{ color: `${brand.navy}60` }}>
              {upcoming
                ? `The next counting cohort opens ${fmtDate(upcoming.voting_start)}. Your contribution record is kept.`
                : 'No cohort is counting right now. Your contribution record is kept.'}
            </p>
          </div>

          {context?.progress && (
            <div className="mt-4">
              <VotingProgressPanel progress={context.progress} />
            </div>
          )}
        </div>
      </div>
    );
  }

  const closes = fmtDate(target.voting_end);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto lg:overflow-hidden">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 pt-3 md:px-5 lg:flex-1 lg:flex-row lg:items-start lg:gap-6 lg:pt-5">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:h-full">
          <AnchorVoting user={user} activeSeason={target} onRecorded={onRecorded} />
        </div>

        <aside className="flex shrink-0 flex-col gap-3 lg:w-[290px] lg:overflow-y-auto lg:pb-6">
          <div
            className="rounded-xl px-3.5 py-3"
            style={{ background: 'rgba(255,255,255,0.62)', border: `1px solid ${brand.navy}14` }}
          >
            <p className="text-[8.5px] font-bold uppercase tracking-[0.3em]" style={{ color: brand.gold }}>
              Counting now
            </p>
            <p className="mt-1 font-heading text-[15px] leading-tight" style={{ color: brand.navy }}>
              {target.cohort_label || target.name}
            </p>
            {closes && (
              <p className="mt-1 inline-flex items-center gap-1 text-[10px]" style={{ color: `${brand.navy}60` }}>
                <Clock className="h-3 w-3" /> Closes {closes}
              </p>
            )}
          </div>

          <VotingProgressPanel progress={context.progress} />
        </aside>
      </div>
    </div>
  );
}