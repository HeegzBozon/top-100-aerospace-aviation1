import { BadgeCheck, ShieldCheck, Layers } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

const LABELS = {
  unverified: 'Unverified',
  self_verified: 'Self verified',
  partially_verified: 'Partially verified',
  fully_verified: 'Fully verified',
};

const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum'];

// Slide 2 — locked. Full-bleed credential and influence band. Present and
// quiet. Bands are visible, weights are never exposed.
export default function VerificationSlide({ nominee, accent }) {
  const status = nominee?.verified_status || 'unverified';
  const rank = nominee?.aura_rank_name || '';
  const tier = TIERS.find((t) => rank.toLowerCase().includes(t.toLowerCase())) || 'Unbanded';
  const checks = nominee?.verification_status || {};
  const confirmed = ['linkedin_verified', 'employer_verified', 'sme_reviewed', 'metrics_validated'].filter(
    (k) => checks[k]
  ).length;

  const stats = [
    { icon: BadgeCheck, label: 'Credential', value: LABELS[status] || LABELS.unverified },
    { icon: Layers, label: 'Influence band', value: tier },
    { icon: ShieldCheck, label: 'Checks confirmed', value: `${confirmed} of 4` },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: B.cream }}>
      <div className="text-center px-6 max-w-3xl w-full">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8" style={{ color: B.muted }}>
          Credential &amp; Influence
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: `${accent}10`, border: `1px solid ${accent}22` }}
              >
                <stat.icon className="w-7 h-7" style={{ color: accent }} />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: B.muted }}>
                {stat.label}
              </p>
              <p
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {stat.value}
              </p>
              {i < stats.length - 1 && (
                <span className="hidden sm:block w-px h-16 mt-6" style={{ background: B.border }} />
              )}
            </div>
          ))}
        </div>

        <p className="mt-12 text-sm max-w-md mx-auto leading-relaxed" style={{ color: B.muted }}>
          The institution measures. Individuals rank. Influence bands are visible; weights are not.
        </p>
      </div>
    </section>
  );
}