import { BadgeCheck } from 'lucide-react';
import { checksOf } from '@/components/verify/verificationLadder';

// The verification band: it sits over the seam between the masthead and the
// record, so the credential is read before anything else on the page. Each key
// states where the check stands — never a score, never a weight.
//
// Only checks something can actually confirm are listed. A check nobody performs is
// not a check; it is a blank that makes the whole band read as unfinished.
export default function ProfileVerification({ nominee, claimStatus }) {
  const checks = checksOf(nominee);
  const claimed = claimStatus === 'approved';

  return (
    <div className="pd-band pd-rise pd-rise-1 relative mx-6 flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:gap-[26px] lg:mx-40 lg:-mt-[34px] lg:px-[44px] lg:py-[30px]">
      <BadgeCheck className="h-9 w-9 text-editorial-copper" strokeWidth={1.8} />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {checks.map((check) => (
          <span key={check.key} className="flex items-baseline gap-2">
            <span className="pd-label">{check.label}</span>
            <span className="font-body text-[12px] tracking-[0.06em] text-editorial-navy/70">
              {check.confirmed ? 'confirmed' : 'pending'}
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