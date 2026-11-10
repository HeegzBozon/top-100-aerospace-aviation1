import { useCountdown, pad } from '@/components/events/useCountdown';

// The office's clock, struck on the masthead.
//
// The cycle has one deadline and it is the whole committee's, so it is not set as a line of
// small print: it is an instrument seated in the navy band — the date in rose gold above,
// four moulded cells below carrying days, hours, minutes and seconds. It is the only thing
// on the masthead that moves, and it does so quietly: tabular figures, no second hand of
// colour, nothing pulsing. When the window shuts the cells are replaced by the fact.
export default function CommitteeCountdown({ votingEndDate = null, className = '' }) {
  const { days, hours, mins, secs, done } = useCountdown(votingEndDate);

  if (!votingEndDate) return null;

  const closesOn = new Date(votingEndDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  const cells = [
    { label: 'Days', value: String(days).padStart(2, '0') },
    { label: 'Hours', value: pad(hours) },
    { label: 'Mins', value: pad(mins) },
    { label: 'Secs', value: pad(secs) },
  ];

  return (
    <div className={`w-full shrink-0 lg:w-auto ${className}`}>
      <div className="flex items-baseline justify-between gap-3 lg:justify-start lg:gap-2.5">
        <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-gold">
          {done ? 'The cycle has closed' : 'The cycle closes'}
        </p>
        <p className="font-heading text-[12.5px] leading-none text-editorial-cream/65">
          {closesOn}
        </p>
      </div>

      {done ? (
        <p className="mt-2 border border-editorial-gold/30 px-3 py-2 font-body text-[10px] font-bold uppercase tracking-[0.17em] text-editorial-cream/70">
          The window is shut — the record stands as filed
        </p>
      ) : (
        <div className="desk-plate mt-2 flex items-stretch divide-x divide-editorial-gold/25 px-1.5 py-2">
          {cells.map((cell) => (
            <div key={cell.label} className="min-w-0 flex-1 px-2 text-center lg:min-w-[54px] lg:flex-none">
              <p className="font-heading text-[23px] leading-none text-editorial-cream tabular-nums">
                {cell.value}
              </p>
              <p className="mt-1.5 font-body text-[7.5px] font-bold uppercase tracking-[0.18em] text-editorial-gold/75">
                {cell.label}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}