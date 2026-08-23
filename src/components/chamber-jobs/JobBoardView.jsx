import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Briefcase, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import JobCard from './JobCard';
import JobComposer from './JobComposer';

// Member-facing job board — a Chamber utility. Lists active roles posted by
// Fellows, newest first. Any authenticated Fellow can post a role on behalf of
// their company. Loading / empty / error states implemented.
export default function JobBoardView({ user, accent = B.navy }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const list = await base44.entities.Job.list('-posted_date', 100);
        if (!alive) return;
        setJobs((list || []).filter((j) => j.status === 'active'));
      } catch {
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [refreshKey]);

  const isEmpty = !loading && !error && jobs.length === 0;
  const canPost = !!user?.email;

  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-4">
        <p className="text-[11px] leading-relaxed max-w-md" style={{ color: B.muted }}>
          Roles posted by Fellows, for Fellows. The Chamber convenes the network; members introduce the opportunities.
        </p>
        {canPost && !isEmpty && (
          <button
            type="button"
            onClick={() => setComposerOpen((v) => !v)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors"
            style={{ background: composerOpen ? B.navy : `${accent}10`, color: composerOpen ? '#fff' : accent, border: `1px solid ${accent}33` }}
          >
            <Plus className="w-3.5 h-3.5" /> Post a Role
          </button>
        )}
      </div>

      {composerOpen && canPost && (
        <div className="mb-5 max-w-md">
          <JobComposer user={user} accent={accent} onSubmitted={() => { setComposerOpen(false); refresh(); }} />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: B.muted }} />
          <p className="text-xs" style={{ color: B.muted }}>Loading the board…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
          <AlertCircle className="w-6 h-6" style={{ color: B.muted }} />
          <p className="text-sm font-semibold" style={{ color: B.navy }}>Couldn't load the board.</p>
          <button onClick={refresh} className="text-xs font-semibold" style={{ color: accent }}>Try again</button>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Briefcase className="w-8 h-8" style={{ color: accent }} />
          <p className="text-sm font-bold" style={{ color: B.navy }}>No open roles on the board.</p>
          <p className="text-xs max-w-sm" style={{ color: B.muted }}>
            When a Fellow's company is hiring, they post the role here so the network sees it first.
          </p>
          {canPost && (
            <>
              <button
                type="button"
                onClick={() => setComposerOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{ background: accent, color: '#fff' }}
              >
                <Plus className="w-3.5 h-3.5" /> Post a Role
              </button>
              {composerOpen && (
                <div className="w-full max-w-md mt-2">
                  <JobComposer user={user} accent={accent} onSubmitted={() => { setComposerOpen(false); refresh(); }} />
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} accent={accent} />
          ))}
        </div>
      )}
    </>
  );
}