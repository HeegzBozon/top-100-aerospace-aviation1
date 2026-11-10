import { ShieldCheck } from 'lucide-react';
import { P } from '../../patronConfig';
import { FIREWALL_POINTS } from '../deckSlides';

export default function SlideFirewall() {
  return (
    <div className="flex flex-col justify-center py-1 md:py-4">
      <h2 className="max-w-[24ch] font-heading text-[1.3rem] leading-tight text-editorial-cream md:text-[1.9rem]">
        Sponsorship is attribution, never placement.
      </h2>
      <ul className="mt-5 space-y-2 md:max-w-[62ch]">
        {FIREWALL_POINTS.map((line) => (
          <li
            key={line}
            className="flex items-center gap-2.5 border px-3 py-2.5 text-[12px] leading-snug text-editorial-cream/85 md:text-[13px]"
            style={{ borderColor: 'rgba(184,115,51,0.45)', background: 'rgba(250,248,245,0.03)' }}
          >
            <ShieldCheck className="h-4 w-4 flex-none" style={{ color: P.copper }} />
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}