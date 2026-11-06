import {
  ANALYST_DUTIES,
  ANALYST_FOUNDATION,
  ANALYST_OFFICE_IS,
  ANALYST_STANDING,
} from '@/components/voting/ballotNaming';

// The office of Analyst, stated in full.
//
// One block, read from one place, so the role is never narrower on the committee page than
// it is in the invitation: three duties — find, measure, carry the record — then the fact
// that the office is the audience's own, not a seat granted to a few.
export default function AnalystOffice({ className = '' }) {
  return (
    <section className={`border-t-2 border-editorial-copper pt-6 ${className}`}>
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-editorial-label">
        The office of Analyst
      </p>

      <p className="mt-3 max-w-xl font-body text-[15px] leading-relaxed text-editorial-navy/85">
        {ANALYST_OFFICE_IS}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {ANALYST_DUTIES.map((duty) => (
          <div key={duty.key} className="border-l-2 border-editorial-copper/45 pl-3">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.16em] text-editorial-navy">
              {duty.label}
            </p>
            <p className="mt-1.5 font-body text-[12.5px] leading-relaxed text-editorial-navy/70">
              {duty.line}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-5 max-w-xl font-body text-[12px] leading-relaxed text-editorial-navy/65">
        {ANALYST_FOUNDATION}
      </p>

      <p className="mt-3 max-w-xl font-body text-[12px] font-semibold leading-relaxed text-editorial-navy">
        {ANALYST_STANDING}
      </p>
    </section>
  );
}