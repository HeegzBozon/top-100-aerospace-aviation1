import { Check, X } from 'lucide-react';
import { P } from '../../patronConfig';
import { LEGACY_CLAIMS, VERIFIED_PROMISES } from '../deckSlides';

function Column({ title, items, verified }) {
  const ink = verified ? '#faf8f5' : 'rgba(250,248,245,0.5)';
  return (
    <div>
      <p
        className="text-[8.5px] font-bold uppercase tracking-[0.24em]"
        style={{ color: verified ? P.gold : 'rgba(250,248,245,0.42)' }}
      >
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((line) => (
          <li key={line} className="flex items-start gap-2 text-[12px] leading-snug md:text-[13px]" style={{ color: ink }}>
            {verified ? (
              <Check className="mt-0.5 h-3.5 w-3.5 flex-none" style={{ color: P.copper }} />
            ) : (
              <X className="mt-0.5 h-3.5 w-3.5 flex-none" style={{ color: 'rgba(250,248,245,0.3)' }} />
            )}
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SlideShift() {
  return (
    <div>
      <h2 className="font-heading text-[1.25rem] leading-tight text-editorial-cream md:text-[1.7rem]">
        The shift in how this is done
      </h2>
      <div className="mt-5 grid gap-5 md:grid-cols-[1fr_auto_1fr] md:items-start md:gap-6">
        <Column title="Legacy publications" items={LEGACY_CLAIMS} />
        <div className="flex items-center gap-2 md:flex-col md:pt-6">
          <span className="h-px flex-1 md:h-6 md:w-px md:flex-none" style={{ background: 'rgba(201,168,124,0.4)' }} />
          <span className="text-[8px] font-bold uppercase tracking-[0.24em]" style={{ color: P.gold }}>
            The shift
          </span>
          <span className="h-px flex-1 md:h-6 md:w-px md:flex-none" style={{ background: 'rgba(201,168,124,0.4)' }} />
        </div>
        <Column title="TOP 100 Aerospace & Aviation" items={VERIFIED_PROMISES} verified />
      </div>
    </div>
  );
}