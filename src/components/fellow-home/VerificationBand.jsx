import { BadgeCheck, ShieldCheck, Layers } from 'lucide-react';
import { B } from './fellowHomeConfig';
import { CHECKS_TOTAL, confirmedCount, labelOf } from '@/components/verify/verificationLadder';

const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum'];

// Locked to position 2. Present and quiet. Bands are visible, weights never are.
export default function VerificationBand({ nominee, accent }) {
  const rank = nominee?.aura_rank_name || '';
  const tier = TIERS.find((t) => rank.toLowerCase().includes(t.toLowerCase())) || 'Bronze';
  const confirmed = confirmedCount(nominee);

  return (
    <section
      className="rounded-2xl px-5 py-4 flex items-center gap-5 flex-wrap"
      style={{ background: '#fff', border: `1px solid ${B.border}` }}
    >
      <div className="flex items-center gap-2">
        <BadgeCheck className="w-4 h-4" style={{ color: accent }} />
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: B.muted }}>
            Credential
          </p>
          <p className="text-sm font-semibold" style={{ color: B.navy }}>
            {labelOf(nominee)}
          </p>
        </div>
      </div>

      <span className="hidden sm:block w-px h-8" style={{ background: B.border }} />

      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4" style={{ color: accent }} />
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: B.muted }}>
            Influence band
          </p>
          <p className="text-sm font-semibold" style={{ color: B.navy }}>
            {tier}
          </p>
        </div>
      </div>

      <span className="hidden sm:block w-px h-8" style={{ background: B.border }} />

      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4" style={{ color: accent }} />
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: B.muted }}>
            Checks confirmed
          </p>
          <p className="text-sm font-semibold" style={{ color: B.navy }}>
            {confirmed} of {CHECKS_TOTAL}
          </p>
        </div>
      </div>
    </section>
  );
}