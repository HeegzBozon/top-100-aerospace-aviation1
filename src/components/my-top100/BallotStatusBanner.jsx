import { Share2, CheckCircle2, Lock, AlertTriangle, Loader2, Sparkles } from 'lucide-react';

// The line under the Manifest's name.
//
// It is a rule, not a panel: the list is the subject of this surface and everything here
// supports it. One line reports where the publication stands, one quiet key shares it, and
// the privacy of the ballot is stated underneath in the smallest type on the page.
//
// The list is a publication — public, ordinal, saved as it is edited. The ballot is a
// private vote cast on the Crosscheck, and nothing here derives it from the list or narrates
// it, because a published order that mirrors a private ranking hands the ranking to anyone
// who reads the profile.
export default function BallotStatusBanner({
  rankings,
  votingOpen,
  votingEndDate,
  saving,
  errorMessage,
  onShare,
}) {
  const count = rankings.length;
  const editableUntil = votingEndDate
    ? new Date(votingEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  const closed = votingOpen === false && !!votingEndDate && new Date(votingEndDate) < new Date();

  let icon = Sparkles;
  let label = 'Open';
  let detail = 'Nothing on the record yet — the first name begins it';

  if (count > 0) {
    icon = CheckCircle2;
    label = 'On the record';
    detail = closed
      ? `${count} listed · final, and still shareable`
      : editableUntil
        ? `${count} listed · yours to edit until ${editableUntil}`
        : `${count} listed · public and shareable`;
  }
  if (closed && count > 0) {
    icon = Lock;
    label = 'Cycle closed';
  }

  const Icon = icon;

  return (
    <div className="mb-1 border-b border-editorial-navy/12 pb-2.5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <p className="flex min-w-0 items-center gap-1.5 font-body text-[9.5px] uppercase tracking-[0.16em] text-editorial-label">
          <Icon className="h-3.5 w-3.5 shrink-0 text-editorial-copper" aria-hidden="true" />
          <span className="shrink-0 font-bold">{label}</span>
          <span className="truncate font-medium normal-case tracking-normal text-editorial-navy/50 tabular-nums">
            {detail}
          </span>
        </p>

        <div className="flex shrink-0 items-center gap-2.5">
          {saving && (
            <Loader2 className="h-3 w-3 animate-spin text-editorial-navy/35" aria-label="Saving" />
          )}
          {count > 0 && (
            <button
              type="button"
              onClick={onShare}
              className="inline-flex items-center gap-1 font-body text-[9.5px] font-bold uppercase tracking-[0.16em] text-editorial-navy/60 transition-colors hover:text-editorial-copper"
            >
              <Share2 className="h-3 w-3" aria-hidden="true" />
              Share
            </button>
          )}
        </div>
      </div>

      <p className="mt-1 font-body text-[9px] leading-relaxed text-editorial-navy/40">
        Your ballot stays private and is cast on the Crosscheck. This list is a publication,
        never a record of your vote.
      </p>

      {errorMessage && (
        <p className="mt-1.5 flex items-start gap-1.5 border-l-2 border-editorial-copper pl-2 font-body text-[10.5px] leading-relaxed text-editorial-navy/75">
          <AlertTriangle className="mt-[2px] h-3 w-3 shrink-0 text-editorial-copper" aria-hidden="true" />
          {errorMessage}
        </p>
      )}
    </div>
  );
}