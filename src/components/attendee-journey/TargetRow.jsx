import { X } from 'lucide-react';
import { B, PRIORITIES, TARGET_STATUS, labelOf } from './journeyConfig';
import { Chip, inputStyle } from './bits';

// One person on the target list: how badly they matter, whether they were reached, and the
// Fellow's own reason for wanting the meeting. The reason is the point — a list of names
// with no why is a contacts dump.
export default function TargetRow({ target, onPatch, onRemove }) {
  return (
    <div className="rounded-sm px-3 py-2.5" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-heading text-[14.5px] leading-tight" style={{ color: B.navy }}>
            {target.name}
          </p>
          <p className="truncate text-[10px]" style={{ color: B.muted }}>{target.email}</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${target.name} from the target list`}
          className="shrink-0 rounded-full p-1 transition-opacity hover:opacity-70"
          style={{ color: B.muted }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <input
        value={target.why || ''}
        onChange={(event) => onPatch({ why: event.target.value })}
        placeholder="Why this person matters to your outcomes"
        className="mt-2"
        style={{ ...inputStyle, fontSize: 11.5, padding: '6px 8px' }}
      />

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {PRIORITIES.map((priority) => (
          <Chip
            key={priority.key}
            active={(target.priority || 'must_meet') === priority.key}
            onClick={() => onPatch({ priority: priority.key })}
          >
            {priority.label}
          </Chip>
        ))}
        <span className="mx-0.5 h-3 w-px" style={{ background: B.border }} />
        {TARGET_STATUS.map((status) => (
          <Chip
            key={status.key}
            tone={status.key === 'met' ? B.navy : B.copper}
            active={(target.status || 'pending') === status.key}
            onClick={() => onPatch({ status: status.key })}
          >
            {labelOf(TARGET_STATUS, status.key)}
          </Chip>
        ))}
      </div>
    </div>
  );
}