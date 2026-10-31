import { BadgeCheck, Layers } from 'lucide-react';

const LABELS = {
  unverified: 'Unverified',
  self_verified: 'Self verified',
  partially_verified: 'Partially verified',
  fully_verified: 'Fully verified',
};

const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum'];

const FLAGS = [
  ['LinkedIn', 'linkedin_verified'],
  ['Employer', 'employer_verified'],
  ['Fellow review', 'sme_reviewed'],
  ['Metrics', 'metrics_validated'],
];

// Verification holds position two on every profile, seated directly under the
// masthead so the credential is read before anything else. Bands are visible;
// weights never are, and nothing on this page can reorder or obscure them.
export default function CredentialBand({ nominee }) {
  const status = nominee?.verified_status || 'unverified';
  const rank = nominee?.aura_rank_name || '';
  const tier = TIERS.find((name) => rank.toLowerCase().includes(name.toLowerCase())) || 'Unbanded';
  const checks = nominee?.verification_status || {};
  const confirmed = FLAGS.filter(([, key]) => checks[key]).length;
  const claimed = nominee?.claim_status === 'approved';

  return (
    <div className="border-y border-editorial-copper/25 bg-editorial-sand">
      <div className="mx-auto w-full max-w-5xl px-6 py-8 lg:px-14 lg:py-10">
        <div className="grid gap-7 sm:grid-cols-3 sm:gap-0">
          <div className="sm:pr-6">
            <p className="pd-label">Credential</p>
            <p className="mt-2 flex items-center gap-2 font-heading text-[19px] leading-tight text-editorial-navy">
              <BadgeCheck className="h-4 w-4 text-editorial-copper" strokeWidth={1.8} />
              {LABELS[status] || LABELS.unverified}
            </p>
            <p className="mt-1.5 font-body text-[11px] leading-relaxed text-editorial-navy/55">
              {claimed
                ? 'This record is claimed and maintained by its Fellow.'
                : 'This record has not been claimed by its subject yet.'}
            </p>
          </div>

          <div className="sm:border-l sm:border-editorial-copper/20 sm:px-6">
            <p className="pd-label">Checks confirmed</p>
            <p className="mt-2 font-heading text-[19px] leading-tight text-editorial-navy">
              {confirmed} of {FLAGS.length}
            </p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {FLAGS.map(([label, key]) => (
                <li
                  key={key}
                  className="inline-flex items-center gap-1.5 font-body text-[10.5px] tracking-[0.06em] text-editorial-navy/60"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${checks[key] ? 'bg-editorial-copper' : 'bg-editorial-navy/20'}`}
                  />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:border-l sm:border-editorial-copper/20 sm:pl-6">
            <p className="pd-label">Influence band</p>
            <p className="mt-2 flex items-center gap-2 font-heading text-[19px] leading-tight text-editorial-navy">
              <Layers className="h-4 w-4 text-editorial-copper" strokeWidth={1.8} />
              {tier}
            </p>
            <p className="mt-1.5 font-body text-[11px] leading-relaxed text-editorial-navy/55">
              Bands are visible. Weights are not.
            </p>
          </div>
        </div>

        <p className="mt-8 border-t border-editorial-copper/20 pt-4 font-body text-[11px] tracking-[0.04em] text-editorial-navy/55">
          The institution measures. Individuals rank. Verification is never reordered, obscured, or sold.
        </p>
      </div>
    </div>
  );
}