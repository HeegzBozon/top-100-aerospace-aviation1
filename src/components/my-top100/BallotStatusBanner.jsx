import { motion } from 'framer-motion';
import { Share2, CheckCircle2, Lock, AlertTriangle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';

// The band across the top of My TOP 100.
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

  let icon = Sparkles;
  let headline = 'Build your TOP 100';
  let subline = 'Add nominees to start. Your list is yours to publish and share.';

  if (count > 0) {
    icon = CheckCircle2;
    headline = 'Your TOP 100 is on the record';
    subline = editableUntil && !closed
      ? `${count} listed · yours to edit and share until ${editableUntil}`
      : `${count} listed · public and shareable`;
  }
  if (closed && count > 0) {
    icon = Lock;
    headline = 'Voting closed — list locked';
    subline = `${count} listed · your list is final and shareable`;
  }

  const Icon = icon;
  const canShare = count > 0;

  return (
    <div
      className="mx-4 mt-2 mb-3 rounded-3xl overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
    >
      <div className="px-4 py-4">
        <div className="flex items-start gap-3">
          <div
            className="h-9 w-9 rounded-full shrink-0 flex items-center justify-center mt-0.5"
            style={{
              background: closed ? 'rgba(255,255,255,0.10)' : `${brand.gold}20`,
            }}
          >
            <Icon
              className="w-4 h-4"
              style={{ color: closed ? 'rgba(255,255,255,0.7)' : brand.gold }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold">{headline}</p>
            <p className="text-white/60 text-[11px] mt-0.5 leading-relaxed">{subline}</p>

            <div className="flex items-start gap-2 mt-2">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-[3px]" style={{ color: brand.gold }} />
              <p className="text-white/55 text-[10.5px] leading-relaxed">
                Your ballot stays private and is cast on the ballot surface. This list is a
                publication, never a record of your vote.
              </p>
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {canShare && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={onShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all"
                  style={{ background: `linear-gradient(135deg, ${brand.gold}, #b8884a)`, color: 'white' }}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share your TOP 100
                </motion.button>
              )}

              {saving && (
                <span className="flex items-center gap-1 text-[10px] text-white/50">
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving…
                </span>
              )}
            </div>
          </div>
        </div>

        {errorMessage && (
          <div
            className="mt-3 flex items-start gap-2 px-3 py-2 rounded-xl text-[11px]"
            style={{ background: 'rgba(180,90,40,0.16)', color: '#f3c9a4' }}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}