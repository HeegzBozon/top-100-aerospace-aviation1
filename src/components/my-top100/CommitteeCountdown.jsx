import { useCountdown, pad } from '@/components/events/useCountdown';

// The office's clock, struck on the masthead.
//
// The cycle has one deadline and it is the whole committee's, so it is not set as a line of
// small print: it is an instrument seated in the navy band — the date in rose gold above,
// four moulded cells below carrying days, hours, minutes and seconds. It is drawn as a
// strip rather than a block, so it seats across the width of the command rail beneath it
// and the head reads as one plate. It is the only thing on the masthead that moves, and it
// does so quietly: tabular figures, no second hand of colour, nothing pulsing. When the
// window shuts the cells are replaced by the fact.
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
    <div className={`w-full ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-body text-[8.5px] font-bold uppercase tracking-[0.22em] text-editorial-gold">
          {done ? 'The cycle has closed' : 'The cycle closes'}
        </p>
        <p className="font-heading text-[11.5px] leading-none text-editorial-cream/55">
          {closesOn}
        </p>
      </div>

      {done ? (
        <p className="mt-1.5 border border-editorial-gold/30 px-3 py-1.5 font-body text-[9.5px] font-bold uppercase tracking-[0.17em] text-editorial-cream/70">
          The window is shut — the record stands as filed
        </p>
      ) : (
        <div className="desk-plate mt-1.5 flex items-stretch divide-x divide-editorial-gold/20 px-1 py-1.5">
          {cells.map((cell) => (
            <div key={cell.label} className="min-w-0 flex-1 px-1.5 text-center">
              <p className="font-heading text-[17px] leading-none text-editorial-cream tabular-nums">
                {cell.value}
              </p>
              <p className="mt-1 font-body text-[7px] font-bold uppercase tracking-[0.16em] text-editorial-gold/70">
                {cell.label}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}