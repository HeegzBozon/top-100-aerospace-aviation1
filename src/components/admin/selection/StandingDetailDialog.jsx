import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StandingMovement from './StandingMovement';

// One nominee's full reading, opened from a card. The column it was opened from leads —
// that column's rank, value and note — and every other measure the platform holds on the
// person is printed beneath it, read from the same pool and the same ballots.

const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

function measureLine(column, entry) {
  const { row } = entry;
  if (column?.key === 'borda') {
    return {
      value: row.borda_projected ? Math.round(row.borda_projected) : '—',
      note: row.borda_cast ? `${Math.round(row.borda_cast)} cast · ${Math.round(row.borda_projected)} projected` : 'no ballot cast yet',
    };
  }
  if (column?.key === 'elo') {
    const weighed = row.appearances > 0 || row.elo !== 1200;
    return { value: weighed ? Math.round(row.elo) : '—', note: `${row.appearances} marks` };
  }
  const measured = row.borda_projected > 0 || row.appearances > 0;
  return { value: measured ? row.combined_index : '—', note: 'index across the three measures' };
}

export default function StandingDetailDialog({ entry, since, onClose }) {
  const open = !!entry;
  const row = entry?.row || {};
  const column = entry?.column || {};
  const line = entry ? measureLine(column, entry) : { value: '—', note: '' };
  const winRate = row.appearances ? Math.round((row.wins / row.appearances) * 100) : null;

  const stats = [
    { label: 'Borda · cast', value: Math.round(row.borda_cast || 0) },
    { label: 'Borda · projected', value: Math.round(row.borda_projected || 0) },
    { label: 'Borda · recorded', value: Math.round(row.borda || 0) },
    { label: 'Elo · this view', value: row.appearances > 0 || row.elo !== 1200 ? Math.round(row.elo) : '—' },
    { label: 'Elo · recorded', value: Math.round(row.elo_recorded || 0) },
    { label: 'Holistic', value: row.holistic ? Math.round(row.holistic) : '—' },
    { label: 'Combined index', value: row.combined_index ?? '—' },
    { label: 'Pairwise marks', value: row.appearances || 0 },
    { label: 'Won / lost', value: `${row.wins || 0} / ${row.losses || 0}` },
    { label: 'Win rate', value: winRate === null ? '—' : `${winRate}%` },
  ];

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose?.()}>
      <DialogContent className="max-w-lg border-editorial-navy/15 bg-editorial-cream text-editorial-navy">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {row.avatar_url ? (
              <img
                src={row.avatar_url}
                alt=""
                className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-editorial-navy/15"
              />
            ) : (
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-editorial-navy text-sm font-semibold tracking-[0.08em] text-editorial-cream">
                {initials(row.name)}
              </span>
            )}
            <div className="min-w-0">
              <DialogTitle className="font-heading text-lg leading-tight text-editorial-navy">{row.name}</DialogTitle>
              <DialogDescription className="mt-0.5 text-[11px] leading-snug text-editorial-navy/55">
                {[row.title, row.company].filter(Boolean).join(' · ') || 'No role on record'}
              </DialogDescription>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className="rounded-sm bg-editorial-navy/8 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] text-editorial-navy/60">
                  {row.cohort_label || 'No cohort'}
                </span>
                <span
                  className={`rounded-sm px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] ${
                    row.claimed
                      ? 'bg-editorial-gold/30 text-editorial-label'
                      : 'bg-editorial-navy/8 text-editorial-navy/45'
                  }`}
                >
                  {row.claimed ? 'Profile claimed' : 'Unclaimed'}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-md bg-editorial-navy px-3 py-2.5 text-editorial-cream">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[9.5px] uppercase tracking-[0.18em] text-editorial-gold">{column.label} standing</p>
            <div className="flex items-center gap-2">
              <span className="font-heading text-[11px] tabular-nums text-editorial-cream/60">#{entry?.rank ?? '—'}</span>
              <StandingMovement delta={entry?.move?.delta} isNew={entry?.move?.isNew} since={since} />
            </div>
          </div>
          <p className="mt-1 font-heading text-2xl leading-none tabular-nums">{line.value}</p>
          <p className="mt-1 text-[9.5px] uppercase tracking-[0.12em] text-editorial-cream/55">{line.note}</p>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-md border border-editorial-navy/10 bg-white px-2 py-1.5">
              <p className="text-[8.5px] uppercase leading-tight tracking-[0.12em] text-editorial-navy/45">{stat.label}</p>
              <p className="mt-0.5 font-heading text-[13px] leading-none tabular-nums text-editorial-navy">{stat.value}</p>
            </div>
          ))}
        </div>

        <Link
          to={`/profiles/${row.id}`}
          className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-editorial-label hover:text-editorial-copper"
        >
          Review the full profile <ArrowUpRight className="h-3 w-3" />
        </Link>

        <p className="text-[10px] leading-relaxed text-editorial-navy/50">
          Read from the current pool and the ballots on file. Projected figures include drafts seeded from nominations
          and are never written to a Fellow's record.
        </p>
      </DialogContent>
    </Dialog>
  );
}