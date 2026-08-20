import { BadgeCheck, ShieldCheck, Layers } from 'lucide-react';
import { B } from './fellowHomeConfig';

const LABELS = {
  unverified: 'Unverified',
  self_verified: 'Self verified',
  partially_verified: 'Partially verified',
  fully_verified: 'Fully verified',
};

const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum'];

// Locked to position 2. Present and quiet. Bands are visible, weights never are.
export default function VerificationBand({ nominee, accent }) {
  const status = nominee?.verified_status || 'unverified';
  const rank = nominee?.aura_rank_name || '';
  const tier = TIERS.find((t) => rank.toLowerCase().includes(t.toLowerCase())) || 'Bronze';
  const checks = nominee?.verification_status || {};
  const confirmed = ['linkedin_verified', 'employer_verified', 'sme_reviewed', 'metrics_validated'].filter(
    (k) => checks[k]
  ).length;

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
            {LABELS[status] || LABELS.unverified}
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
            {confirmed} of 4
          </p>
        </div>
      </div>
    </section>
  );
}