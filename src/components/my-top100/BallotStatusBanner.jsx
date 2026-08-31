import { motion } from 'framer-motion';
import { Share2, CheckCircle2, Lock, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';

// Replaces the old Publish & Submit Ballot button. The ballot now auto-syncs as
// the Fellow edits; this band reports state and carries the primary "share"
// CTA. No publish step, no save-draft step. Institutional language only.
export default function BallotStatusBanner({
  rankings,
  ballotLive,
  votingOpen,
  votingEndDate,
  saving,
  syncError,
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

  // Closed window: voting has ended — list is final, locked, still shareable.
  const closed = votingOpen === false && !!votingEndDate && new Date(votingEndDate) < new Date();

  let icon = Sparkles;
  let headline = 'Build your TOP 100';
  let subline = 'Add nominees to start. Your ballot syncs automatically once voting opens.';

  if (ballotLive) {
    icon = CheckCircle2;
    headline = 'Your ballot is live';
    subline = editableUntil
      ? `${count} nominees · editable until ${editableUntil}`
      : `${count} nominees · synced to your ranked ballot`;
  } else if (closed) {
    icon = Lock;
    headline = 'Voting closed — list locked';
    subline = `${count} nominees · your list is final and shareable`;
  } else if (!votingOpen && votingEndDate) {
    icon = Sparkles;
    headline = 'Voting opens soon';
    subline = `${count} nominees · build your list now, ballot syncs when voting opens`;
  } else if (votingOpen && count < 3) {
    icon = Sparkles;
    headline = 'Add 3 to make your ballot live';
    subline = `${count}/3 nominees · your ballot syncs automatically once live`;
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
              background: ballotLive
                ? 'rgba(201,168,124,0.22)'
                : closed
                ? 'rgba(255,255,255,0.10)'
                : `${brand.gold}20`,
            }}
          >
            <Icon
              className="w-4 h-4"
              style={{ color: ballotLive ? brand.gold : closed ? 'rgba(255,255,255,0.7)' : brand.gold }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold">{headline}</p>
            <p className="text-white/60 text-[11px] mt-0.5 leading-relaxed">{subline}</p>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
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
                  <Loader2 className="w-3 h-3 animate-spin" /> Syncing…
                </span>
              )}
            </div>
          </div>
        </div>

        {syncError && (
          <div
            className="mt-3 flex items-start gap-2 px-3 py-2 rounded-xl text-[11px]"
            style={{ background: 'rgba(180,90,40,0.16)', color: '#f3c9a4' }}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{syncError}</span>
          </div>
        )}
      </div>
    </div>
  );
}