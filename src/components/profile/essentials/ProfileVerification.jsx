import { BadgeCheck } from 'lucide-react';

// The verification band: it sits over the seam between the masthead and the
// record, so the credential is read before anything else on the page. Each key
// states where the check stands — never a score, never a weight.
const FLAG_LABEL = {
  linkedin: 'LinkedIn',
  employer: 'Employer',
  sme: 'Fellow review',
  metrics: 'Metrics',
  ecosystem: 'Ecosystem',
};

const stateOf = (value) => (value ? 'verified' : 'pending');

export default function ProfileVerification({ nominee, claimStatus }) {
  const flags = nominee?.verification_status || {};
  const keys = [
    ['linkedin', flags.linkedin_verified],
    ['employer', flags.employer_verified],
    ['sme', flags.sme_reviewed],
  ];

  const claimed = claimStatus === 'approved';

  return (
    <div className="pd-band pd-rise pd-rise-1 relative mx-6 flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:gap-[26px] lg:mx-40 lg:-mt-[34px] lg:px-[44px] lg:py-[30px]">
      <BadgeCheck className="h-9 w-9 text-editorial-copper" strokeWidth={1.8} />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {keys.map(([key, value]) => (
          <span key={key} className="flex items-baseline gap-2">
            <span className="pd-label">{FLAG_LABEL[key]}</span>
            <span className="font-body text-[12px] tracking-[0.06em] text-editorial-navy/70">
              {stateOf(value)}
            </span>
          </span>
        ))}
        <span className="flex items-baseline gap-2">
          <span className="pd-label">Record</span>
          <span className="font-body text-[12px] tracking-[0.06em] text-editorial-navy/70">
            {claimed ? 'claimed' : 'unclaimed'}
          </span>
        </span>
      </div>
    </div>
  );
}