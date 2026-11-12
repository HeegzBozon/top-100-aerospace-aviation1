import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ContributorTable from './ContributorTable';

// The evaluator ladder, opened from the head strip. It is the same table the Activity
// ledger carries, read on its own because the figure above it is the one an operator asks
// about: who is doing the weighing, and how much of it each has done.
//
// Progress only. Nothing here reaches a nominee's position, and no weight of it is printed.

const num = (value) => (Number(value) || 0).toLocaleString();
const each = (value) => (Math.round((Number(value) || 0) * 10) / 10).toLocaleString();

export default function EvaluatorLeaderboard({ open, onOpenChange, totals, rows = [] }) {
  const figures = [
    { label: 'Evaluators', value: num(totals?.contributors) },
    { label: 'Evaluations', value: num(totals?.comparisons) },
    { label: 'Ballots', value: num(totals?.ballots) },
    { label: 'Each evaluator', value: each(totals?.votes_per_contributor) },
  ];

  // The Manifest is never counted as an evaluation, so the ladder says so where it stands.
  const manifestNote =
    Number(totals?.manifests) > 0
      ? `${num(totals.manifests)} Manifests hold ${num(totals.manifest_entries)} names. An order is saved as it is built; an evaluation is only written in the Crosscheck, so the two are counted apart.`
      : 'No Manifest holds names in this scope yet.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl text-editorial-navy">Evaluators</DialogTitle>
          <p className="text-[10px] uppercase tracking-[0.16em] text-editorial-navy/45">
            Who is doing the weighing · progress only
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4">
          {figures.map((figure) => (
            <div
              key={figure.label}
              className="rounded-lg border border-editorial-navy/10 bg-editorial-cream px-2 py-1.5"
            >
              <p className="text-[8px] font-semibold uppercase leading-[1.15] tracking-[0.12em] text-editorial-navy/45">
                {figure.label}
              </p>
              <p className="mt-0.5 font-heading text-[18px] leading-none tabular-nums text-editorial-navy">
                {figure.value}
              </p>
            </div>
          ))}
        </div>

        <ContributorTable rows={rows} />

        <p className="text-[10px] leading-relaxed text-editorial-navy/50">{manifestNote}</p>
        <p className="text-[9px] uppercase tracking-[0.14em] text-editorial-navy/35">
          Feedback only · this ladder never moves a nominee’s position
        </p>
      </DialogContent>
    </Dialog>
  );
}