import { ArrowRight } from 'lucide-react';
import { CROSSCHECK } from '@/components/voting/ballotNaming';

// The step from the order to the weighing.
//
// The Manifest is the order a Fellow builds in their own hand; the Crosscheck is where the
// field is measured against it — in pairs, one name kept over the other, and nothing else.
// Enough of those and a whole order falls out of the counting, so the method is taught in
// the same breath as the invitation.
//
// It appears only once there is an order worth weighing: two names, put in order by the
// Fellow. And it never claims the Manifest is the ballot — the list is a publication, the
// ballot is a private vote, and the two are not the same record.
export default function ManifestToCrosscheck({ count = 0, onOpenVote }) {
  if (count < 2) return null;

  return (
    <div className="mt-6 border-t-2 border-editorial-copper pt-3.5">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-editorial-label">
        Next · {CROSSCHECK}
      </p>
      <h3 className="mt-2 font-heading text-[18px] leading-snug text-editorial-navy">
        Your order is a ranked choice.
      </h3>
      <p className="mt-1.5 font-body text-[11px] leading-relaxed text-editorial-navy/60">
        On the {CROSSCHECK} the field is weighed in pairs: you keep the stronger of two, and
        nothing else. Enough of those, and a whole order falls out of the counting — no scores
        to award, no numbers to invent.
      </p>
      <button
        type="button"
        onClick={onOpenVote}
        className="desk-key desk-key-primary mt-3 w-full justify-center"
      >
        Begin the {CROSSCHECK}
        <ArrowRight className="h-3 w-3" aria-hidden="true" />
      </button>
      <p className="mt-2 font-body text-[9.5px] leading-relaxed text-editorial-navy/40">
        Your ballot stays private, and is cast on the {CROSSCHECK}. The Manifest is a
        publication, never a record of your vote.
      </p>
    </div>
  );
}