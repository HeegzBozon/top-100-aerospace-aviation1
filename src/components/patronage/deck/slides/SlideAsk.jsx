import { ArrowRight, Building2, CalendarCheck, Rocket } from 'lucide-react';
import { P } from '../../patronConfig';

const NEEDED = [
  { icon: Building2, label: 'Organization & role' },
  { icon: CalendarCheck, label: 'Targeted issue date' },
  { icon: Rocket, label: 'Sector fit' },
];

// The ask. The key lands on the enquiry desk at the foot of the page rather than opening a
// second window: three details are all the house needs to answer.
export default function SlideAsk() {
  const toDesk = () => document.getElementById('enquire')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="flex flex-col justify-center py-1 md:py-3">
      <h2 className="font-heading text-[1.5rem] leading-tight text-editorial-cream md:text-[2.1rem]">Ready to partner?</h2>
      <ul className="mt-4 flex flex-col gap-2 md:flex-row md:gap-5">
        {NEEDED.map(({ icon: Glyph, label }) => (
          <li key={label} className="flex items-center gap-2 text-[12px] text-editorial-cream/80 md:text-[13px]">
            <Glyph className="h-3.5 w-3.5 flex-none" style={{ color: P.copper }} />
            {label}
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <button type="button" onClick={toDesk} className="desk-key desk-key-primary px-4 py-2.5 text-[9.5px]">
          Claim your Sponsor of Record slot
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="mt-3.5 text-[10.5px] text-editorial-cream/50">
        <a href="mailto:partner@top100aero.space" className="underline" style={{ color: P.gold }}>
          partner@top100aero.space
        </a>{' '}
        or the enquiry form below.
      </p>
    </div>
  );
}