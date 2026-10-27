import { Camera, ChevronRight, Loader2, Stamp } from 'lucide-react';
import { C, initialsFor, metLine, sinceLabel } from './crmConfig';

// One row of the rolodex: who they are, where they stand, the show they were met at, and the
// line that says what happens next. The two things done most often are on the row itself —
// log the touch, or open the record — so the list is worked without opening anything.
export default function ContactCard({ contact, onOpen, onTouch, touching }) {
  const met = metLine(contact);
  const worked = contact.last_touch ? `worked ${sinceLabel(contact.last_touch)}` : 'never worked';

  return (
    <div
      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-[#f7f2ea]"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold uppercase"
        style={{ background: C.sand, color: C.navy }}
        aria-hidden="true"
      >
        {initialsFor(contact.full_name)}
      </span>

      <button type="button" onClick={() => onOpen(contact)} className="min-w-0 flex-1 text-left">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[13.5px] font-semibold" style={{ color: C.navy }}>
            {contact.full_name}
          </span>
          {contact.source === 'card' ? (
            <Camera className="h-3 w-3 shrink-0" style={{ color: C.gold }} aria-label="Read from a captured card" />
          ) : null}
        </span>

        <span className="mt-0.5 block truncate text-[11.5px]" style={{ color: C.muted }}>
          {[contact.role_title, contact.company].filter(Boolean).join(' · ') || 'No role recorded'}
        </span>

        <span
          className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[9px] font-bold uppercase tracking-[0.14em]"
          style={{ color: C.muted }}
        >
          {met ? <span style={{ color: C.copper }}>{met}</span> : null}
          {met ? <span aria-hidden="true">•</span> : null}
          <span>{worked}</span>
        </span>

        {contact.next_step ? (
          <span className="mt-1 block truncate text-[11.5px]" style={{ color: C.navy }}>
            → {contact.next_step}
          </span>
        ) : null}
      </button>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onTouch(contact)}
          disabled={touching}
          aria-label={`Log a touch with ${contact.full_name}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-60"
          style={{ border: `1px solid ${C.border}`, background: C.surface, color: C.navy }}
        >
          {touching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Stamp className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => onOpen(contact)}
          aria-label={`Open ${contact.full_name}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ color: C.navy }}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}