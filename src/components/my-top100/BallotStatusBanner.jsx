import { Share2, CheckCircle2, Lock, AlertTriangle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

// The band across the head of the Manifest.
//
// It reports one artifact and one only: the list. The list is a publication —
// public, ordinal, shareable, saved as it is edited. The ballot is a private vote
// cast on the ballot surface, and nothing here derives it from the list or narrates
// it, because a published order that mirrors a private ranking hands the ranking to
// anyone who reads the profile.
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
    ? new Date(votingEndDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  // Closed window: the season has ended — the list is final, locked, still shareable.
  const closed = votingOpen === false && !!votingEndDate && new Date(votingEndDate) < new Date();

  let kicker = 'Open for entries';
  let icon = Sparkles;
  let headline = 'Begin your Manifest';
  let subline = 'Add the first name. The list is yours to order, publish and share.';

  if (count > 0) {
    kicker = 'On the record';
    icon = CheckCircle2;
    headline = 'Your Manifest is on the record';
    subline = editableUntil && !closed
      ? `${count} listed · yours to edit and share until ${editableUntil}`
      : `${count} listed · public and shareable`;
  }
  if (closed && count > 0) {
    kicker = 'Cycle closed';
    icon = Lock;
    headline = 'The cycle has closed — the Manifest stands';
    subline = `${count} listed · final, and still shareable`;
  }

  const Icon = icon;
  const canShare = count > 0;

  return (
    <div className="mb-5 border border-editorial-copper/35 bg-editorial-navy px-5 py-4">
      <div className="flex items-start gap-3">
        <Icon
          className="mt-0.5 h-4 w-4 shrink-0"
          style={{ color: closed ? 'rgba(250,248,245,0.55)' : '#c9a87c' }}
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          <p className="font-body text-[9.5px] font-bold uppercase tracking-[0.2em] text-editorial-gold">
            {kicker}
          </p>
          <p className="mt-1.5 font-heading text-[17px] leading-snug text-editorial-cream">
            {headline}
          </p>
          <p className="mt-1 font-body text-[11.5px] leading-relaxed text-editorial-cream/65 tabular-nums">
            {subline}
          </p>

          <div className="mt-2.5 flex items-start gap-2">
            <ShieldCheck className="mt-[3px] h-3.5 w-3.5 shrink-0 text-editorial-copper" aria-hidden="true" />
            <p className="font-body text-[10.5px] leading-relaxed text-editorial-cream/55">
              Your ballot stays private and is cast on the ballot surface. This list is a
              publication, never a record of your vote.
            </p>
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-3">
            {canShare && (
              <button type="button" onClick={onShare} className="desk-key desk-key-primary">
                <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                Share your Manifest
              </button>
            )}

            {saving && (
              <span className="flex items-center gap-1.5 font-body text-[10px] uppercase tracking-[0.14em] text-editorial-cream/45">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> Saving
              </span>
            )}
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 flex items-start gap-2 border-l-2 border-editorial-copper bg-editorial-copper/15 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-editorial-gold" aria-hidden="true" />
          <span className="font-body text-[11px] leading-relaxed text-editorial-cream/85">
            {errorMessage}
          </span>
        </div>
      )}
    </div>
  );
}