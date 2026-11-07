import { BadgeCheck, Layers } from 'lucide-react';
import {
  CHECKS,
  CHECKS_TOTAL,
  checksOf,
  confirmedCount,
  labelOf,
  hintOf,
} from '@/components/verify/verificationLadder';

const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum'];

// Verification holds position two on every profile, seated directly under the
// masthead so the credential is read before anything else. Bands are visible;
// weights never are, and nothing on this page can reorder or obscure them.
export default function CredentialBand({ nominee }) {
  const rank = nominee?.aura_rank_name || '';
  const tier = TIERS.find((name) => rank.toLowerCase().includes(name.toLowerCase())) || 'Unbanded';
  const checks = checksOf(nominee);
  const confirmed = confirmedCount(nominee);
  const claimed = nominee?.claim_status === 'approved';

  return (
    <div className="border-y border-editorial-copper/25 bg-editorial-sand">
      <div className="mx-auto w-full max-w-5xl px-6 py-8 lg:px-14 lg:py-10">
        <div className="grid gap-7 sm:grid-cols-3 sm:gap-0">
          <div className="sm:pr-6">
            <p className="pd-label">Credential</p>
            <p className="mt-2 flex items-center gap-2 font-heading text-[19px] leading-tight text-editorial-navy">
              <BadgeCheck className="h-4 w-4 text-editorial-copper" strokeWidth={1.8} />
              {labelOf(nominee)}
            </p>
            <p className="mt-1.5 font-body text-[11px] leading-relaxed text-editorial-navy/55">
              {hintOf(nominee)}
            </p>
          </div>

          <div className="sm:border-l sm:border-editorial-copper/20 sm:px-6">
            <p className="pd-label">Checks confirmed</p>
            <p className="mt-2 font-heading text-[19px] leading-tight text-editorial-navy">
              {confirmed} of {CHECKS_TOTAL}
            </p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {checks.map((check) => (
                <li
                  key={check.key}
                  className="inline-flex items-center gap-1.5 font-body text-[10.5px] tracking-[0.06em] text-editorial-navy/60"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${check.confirmed ? 'bg-editorial-copper' : 'bg-editorial-navy/20'}`}
                  />
                  {check.label}
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
          {claimed
            ? 'This record is claimed and maintained by its Fellow. Verification is never reordered, obscured, or sold.'
            : 'This record has not been claimed by its subject yet. Verification is never reordered, obscured, or sold.'}
        </p>
      </div>
    </div>
  );
}