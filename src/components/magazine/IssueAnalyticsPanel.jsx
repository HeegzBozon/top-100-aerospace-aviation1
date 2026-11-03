import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, MessageSquare, PenLine, FileText, BookOpen } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// What an issue has actually gathered. Nothing here measures a Fellow: every number is
// the publication's own record — how much of it is written, and how much of it readers
// have answered. Counts are read from IssueFeedback and PageComment by issue id, so the
// panel always agrees with the notes and threads the masthead works from.

const ART_STATUS = ['reserved', 'gathering', 'drafting', 'ready', 'laid_out', 'published'];

const Card = ({ label, value, note, icon: Icon }) => (
  <div className="rounded-lg p-4" style={{ background: '#fff', border: '1px solid rgba(30,58,90,0.12)' }}>
    <div className="flex items-center gap-2 mb-2">
      {Icon && <Icon className="w-3.5 h-3.5" style={{ color: P.copper }} />}
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: P.navy, opacity: 0.7 }}>{label}</span>
    </div>
    <p className="text-3xl leading-none" style={{ color: P.navy, fontFamily: 'Playfair Display, Georgia, serif' }}>{value}</p>
    {note && <p className="text-[11px] mt-2" style={{ color: P.navy, opacity: 0.6 }}>{note}</p>}
  </div>
);

export default function IssueAnalyticsPanel({ issue, pages = [], articles = [] }) {
  const [notes, setNotes] = useState([]);
  const [threads, setThreads] = useState([]);
  const [state, setState] = useState('loading');

  useEffect(() => {
    if (!issue?.id) return;
    let live = true;
    setState('loading');
    (async () => {
      try {
        const [feedback, comments] = await Promise.all([
          base44.entities.IssueFeedback.filter({ issue_id: issue.id }, { sort: '-created_date', limit: 300 }),
          base44.entities.PageComment.filter({ issue_id: issue.id }, { sort: '-created_date', limit: 500 }),
        ]);
        if (!live) return;
        setNotes(feedback.items || []);
        setThreads(comments.items || []);
        setState('ready');
      } catch {
        if (live) setState('error');
      }
    })();
    return () => { live = false; };
  }, [issue?.id]);

  const metrics = useMemo(() => {
    const publishedPages = pages.filter((p) => p.status === 'published').length;
    const byStatus = ART_STATUS.map((s) => ({ status: s, count: articles.filter((a) => a.status === s).length }));
    const corrections = notes.filter((n) => n.kind === 'edit_request');
    const open = notes.filter((n) => n.status === 'open');
    const openings = threads.filter((c) => !c.parent_id);
    const readers = new Set(threads.map((c) => c.thread_owner_email).filter(Boolean));

    // One row per page, counting everything filed against it.
    const perPage = new Map();
    const add = (num, field) => {
      if (!num) return;
      const row = perPage.get(num) || { page: num, notes: 0, corrections: 0, comments: 0 };
      row[field] += 1;
      perPage.set(num, row);
    };
    notes.forEach((n) => add(n.page_number, n.kind === 'edit_request' ? 'corrections' : 'notes'));
    threads.forEach((c) => add(c.page_number, 'comments'));

    return {
      publishedPages,
      byStatus,
      notes: notes.filter((n) => n.kind === 'note').length,
      corrections: corrections.length,
      open: open.length,
      comments: threads.length,
      threadOpenings: openings.length,
      readers: readers.size,
      busiest: [...perPage.values()].sort((a, b) => (b.notes + b.corrections + b.comments) - (a.notes + a.corrections + a.comments)).slice(0, 8),
    };
  }, [pages, articles, notes, threads]);

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: P.navy }} />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="rounded-lg p-8 text-center" style={{ background: '#fff', border: '1px solid rgba(30,58,90,0.15)' }}>
        <p className="text-sm" style={{ color: P.navy }}>The issue's reader record could not be read. Reload the studio to try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: P.copper }}>Issue analytics</p>
        <h2 className="mt-1 text-2xl" style={{ color: P.navy, fontFamily: 'Playfair Display, Georgia, serif' }}>{issue.title}</h2>
        <p className="text-xs mt-1" style={{ color: P.navy, opacity: 0.65 }}>
          What the edition holds, and what readers have filed against it. The publication's own record only.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Pages" value={pages.length} note={`${metrics.publishedPages} published`} icon={BookOpen} />
        <Card label="Articles" value={articles.length} note={`${metrics.byStatus.find((s) => s.status === 'published')?.count || 0} published`} icon={FileText} />
        <Card label="Reader notes" value={metrics.notes} note={`${metrics.open} still open`} icon={PenLine} />
        <Card label="Corrections" value={metrics.corrections} note={`${metrics.readers} readers in threads`} icon={MessageSquare} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg p-5" style={{ background: '#fff', border: '1px solid rgba(30,58,90,0.12)' }}>
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: P.navy, opacity: 0.7 }}>Editorial progress</h3>
          <div className="space-y-2.5">
            {metrics.byStatus.map((row) => {
              const pct = articles.length ? Math.round((row.count / articles.length) * 100) : 0;
              return (
                <div key={row.status}>
                  <div className="flex items-baseline justify-between text-xs" style={{ color: P.navy }}>
                    <span className="capitalize">{row.status.replace('_', ' ')}</span>
                    <span style={{ opacity: 0.65 }}>{row.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full" style={{ background: 'rgba(30,58,90,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: P.copper }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg p-5" style={{ background: '#fff', border: '1px solid rgba(30,58,90,0.12)' }}>
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: P.navy, opacity: 0.7 }}>Pages readers answered</h3>
          {metrics.busiest.length === 0 ? (
            <p className="text-xs py-6" style={{ color: P.navy, opacity: 0.6 }}>
              No notes or corrections filed yet. Threads and notes appear here as readers answer the edition.
            </p>
          ) : (
            <table className="w-full text-xs" style={{ color: P.navy }}>
              <thead>
                <tr className="text-left" style={{ opacity: 0.55 }}>
                  <th className="pb-2 font-medium">Page</th>
                  <th className="pb-2 font-medium text-right">Notes</th>
                  <th className="pb-2 font-medium text-right">Corrections</th>
                  <th className="pb-2 font-medium text-right">Comments</th>
                </tr>
              </thead>
              <tbody>
                {metrics.busiest.map((row) => (
                  <tr key={row.page} style={{ borderTop: '1px solid rgba(30,58,90,0.08)' }}>
                    <td className="py-1.5">{row.page}</td>
                    <td className="py-1.5 text-right">{row.notes}</td>
                    <td className="py-1.5 text-right">{row.corrections}</td>
                    <td className="py-1.5 text-right">{row.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}