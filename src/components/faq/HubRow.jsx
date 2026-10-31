import { ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// One row of the hub: a question, an article, or a way to get help.
//
// The row is the unit the wheel lands on, so it has to read as one thing at rest and
// open in place when it is pressed. The number at the head is what the keypad types,
// which is why every row carries one whether or not it is being driven by a ring.
export default function HubRow({
  index,
  label,
  kicker = null,
  open = false,
  active = false,
  hint = null,
  hhKey = null,
  onClick,
  children,
}) {
  return (
    <div
      data-hh-key={hhKey || undefined}
      className="border-b"
      style={{ borderColor: 'rgba(30,58,90,0.12)' }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-expanded={open}
        aria-current={active ? 'true' : undefined}
        className="flex w-full items-start gap-3 py-3 text-left transition-colors"
        style={{
          background: active ? 'rgba(201,168,124,0.14)' : 'transparent',
        }}
      >
        <span
          className="mt-[3px] w-5 shrink-0 text-[9.5px] font-bold tabular-nums"
          style={{ color: open || active ? B.copper : 'rgba(30,58,90,0.38)' }}
        >
          {String(index).padStart(2, '0')}
        </span>

        <span className="min-w-0 flex-1">
          {kicker ? (
            <span
              className="block text-[7.5px] font-bold uppercase tracking-[0.24em]"
              style={{ color: 'rgba(30,58,90,0.45)' }}
            >
              {kicker}
            </span>
          ) : null}
          <span
            className="block font-heading text-[15.5px] leading-snug md:text-[17px]"
            style={{ color: B.navy }}
          >
            {label}
          </span>
          {hint ? (
            <span
              className="mt-0.5 block text-[8px] font-bold uppercase tracking-[0.2em]"
              style={{ color: 'rgba(30,58,90,0.4)' }}
            >
              {hint}
            </span>
          ) : null}
        </span>

        <ChevronDown
          className="mt-1 h-3.5 w-3.5 shrink-0 transition-transform"
          style={{
            color: 'rgba(30,58,90,0.45)',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        />
      </button>

      {open ? <div className="pb-4 pl-8 pr-1">{children}</div> : null}
    </div>
  );
}

// The one key a row can end with: somewhere the long version lives.
export function RowCta({ label, to }) {
  return (
    <Link
      to={to}
      className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[8.5px] font-bold uppercase tracking-[0.2em] transition-colors"
      style={{ borderColor: 'rgba(184,115,51,0.5)', color: '#8F5C2C' }}
    >
      {label}
      <ArrowRight className="h-2.5 w-2.5" />
    </Link>
  );
}