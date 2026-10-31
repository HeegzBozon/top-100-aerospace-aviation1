import { useState } from 'react';
import { ChevronDown, Building2, Clock } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { MODES, requestLabel, TIMELINES } from './intentConfig';

const STATUSES = [
  { key: 'new', label: 'New' },
  { key: 'opened', label: 'Opened' },
  { key: 'responded', label: 'Replied' },
  { key: 'closed', label: 'Closed' },
  { key: 'declined', label: 'Declined' },
];

// One inbound inquiry, as the Fellow reads it: who wrote, what they asked for, their
// own words, and where it stands. The submitter's address is here because a reply
// needs it — it is never rendered on a public surface.
export default function InquiryRow({ inquiry, accent, onStatus, busy }) {
  const [expanded, setExpanded] = useState(false);
  const mode = MODES[inquiry.mode] || MODES.hire;
  const timeline = TIMELINES.find((option) => option.key === inquiry.timeline);
  const when = inquiry.created_date ? new Date(inquiry.created_date) : null;

  return (
    <div
      className="rounded-2xl p-3.5"
      style={{
        background: 'rgba(255,255,255,0.9)',
        border: `1px solid ${inquiry.status === 'new' ? `${accent}77` : B.border}`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: B.copper }}>
              {mode.label}
            </span>
            <span className="text-[9px] uppercase tracking-[0.16em]" style={{ color: B.muted }}>
              {requestLabel(inquiry.mode, inquiry.request_type)}
            </span>
            {timeline && (
              <span className="flex items-center gap-1 text-[9px] uppercase tracking-[0.16em]" style={{ color: B.muted }}>
                <Clock className="h-2.5 w-2.5" /> {timeline.label}
              </span>
            )}
          </div>
          <p className="mt-1 truncate font-heading text-[15px] font-semibold" style={{ color: B.navy }}>
            {inquiry.sender_name}
          </p>
          {(inquiry.sender_org || inquiry.sender_role) && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-[10.5px]" style={{ color: B.muted }}>
              <Building2 className="h-3 w-3 shrink-0" />
              {[inquiry.sender_role, inquiry.sender_org].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <select
          value={inquiry.status}
          disabled={busy}
          onChange={(event) => onStatus(inquiry.id, event.target.value)}
          aria-label={`Status for ${inquiry.sender_name}`}
          className="shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] outline-none"
          style={{ background: 'rgba(30,58,90,0.05)', border: `1px solid ${B.border}`, color: B.navy }}
        >
          {STATUSES.map((status) => (
            <option key={status.key} value={status.key}>{status.label}</option>
          ))}
        </select>
      </div>

      <p
        className={`mt-2 whitespace-pre-line text-[12px] leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}
        style={{ color: B.navy }}
      >
        {inquiry.message}
      </p>

      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: B.copper }}
        >
          <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          {expanded ? 'Less' : 'Read it all'}
        </button>
        <div className="flex items-center gap-2 text-[10px]" style={{ color: B.muted }}>
          {when && <span>{when.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
          <a href={`mailto:${inquiry.sender_email}`} className="font-semibold underline underline-offset-2" style={{ color: B.navy }}>
            Reply
          </a>
        </div>
      </div>
    </div>
  );
}