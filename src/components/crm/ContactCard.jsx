import { ChevronRight } from 'lucide-react';
import { C, initialsFor, metLine, formatDay } from './crmConfig';

// One name in the rolodex: who they are, where they stand, the show they were met at, and
// the line that says what happens next. Everything else is one press away.
export default function ContactCard({ contact, onOpen }) {
  const met = metLine(contact);
  const touched = contact.last_touch ? `Last worked ${formatDay(contact.last_touch)}` : 'Not yet worked';

  return (
    <button
      type="button"
      onClick={() => onOpen(contact)}
      className="flex w-full items-start gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-[#f7f2ea] md:p-4"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-heading text-[15px]"
        style={{ background: C.sand, color: C.navy }}
        aria-hidden="true"
      >
        {initialsFor(contact.full_name)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="truncate font-heading text-[16px]" style={{ color: C.navy }}>
            {contact.full_name}
          </span>
          {contact.source === 'card' ? (
            <span className="shrink-0 text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: C.gold }}>
              Card
            </span>
          ) : null}
        </span>

        <span className="mt-0.5 block truncate text-[11.5px]" style={{ color: C.muted }}>
          {[contact.role_title, contact.company].filter(Boolean).join(' · ') || 'No role recorded'}
        </span>

        {met ? (
          <span className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.18em]"
            style={{ background: C.cream, color: C.copper, border: `1px solid ${C.border}` }}>
            {met}
          </span>
        ) : null}

        {contact.next_step ? (
          <span className="mt-1.5 block truncate text-[11px]" style={{ color: C.navy }}>
            Next: {contact.next_step}
          </span>
        ) : null}

        <span className="mt-1 block text-[9px] uppercase tracking-[0.18em]" style={{ color: C.muted }}>
          {touched}
        </span>
      </span>

      <ChevronRight className="mt-1 h-4 w-4 shrink-0" style={{ color: C.muted }} />
    </button>
  );
}