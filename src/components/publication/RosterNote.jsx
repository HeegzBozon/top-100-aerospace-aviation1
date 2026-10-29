import { ROSTER_LABEL, ROSTER_NOTE } from '@/components/magazine/top100WomenEdition';

// The count, as the institution states it: one hundred names, with the asterisk that says
// a record is being corrected and reviewed. One line, printed where the edition's count is
// met — never a banner, never a modal.
export default function RosterNote({ className = '' }) {
  return (
    <p
      className={`mx-auto flex max-w-3xl flex-wrap items-baseline gap-x-2 gap-y-1 px-5 py-2.5 md:px-8 ${className}`}
      aria-label={ROSTER_NOTE}
    >
      <span
        className="font-heading text-[15px] leading-none tabular-nums"
        style={{ color: 'rgb(var(--editorial-label-rgb))' }}
      >
        {ROSTER_LABEL}
      </span>
      <span
        className="font-body text-[10.5px] leading-snug"
        style={{ color: 'rgb(var(--editorial-navy-rgb) / 0.62)' }}
      >
        {ROSTER_NOTE}
      </span>
    </p>
  );
}