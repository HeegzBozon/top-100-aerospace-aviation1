import { useMemo } from 'react';
import { Target } from 'lucide-react';
import { B } from './journeyConfig';
import { Empty, Panel, SectionLabel } from './bits';
import TargetRow from './TargetRow';

// TARGETS — the ten people worth crossing a hall for.
//
// Read from the room's own roster, and only from Fellows who have listed themselves in it.
// A private declaration never appears here, and no one can be added that the Fellow cannot
// already see. Progress (met or missed) is the Fellow's personal scoreboard; it is never
// read by the platform.
export default function TargetsPanel({ roster, targets, onAdd, onPatch, onRemove }) {
  const targeted = useMemo(() => new Set(targets.map((target) => target.email)), [targets]);
  const open = useMemo(() => roster.filter((person) => !targeted.has(person.email)), [roster, targeted]);

  const must = targets.filter((target) => (target.priority || 'must_meet') === 'must_meet');
  const met = targets.filter((target) => target.status === 'met').length;

  return (
    <div className="flex flex-col gap-3">
      <Panel>
        <SectionLabel count={`${met}/${targets.length} met`}>Your list</SectionLabel>
        <p className="mt-1 text-[11px] leading-relaxed" style={{ color: B.muted }}>
          {must.length > 0
            ? `${must.length} must-meet, ${targets.length - must.length} nice-to-meet. Mark them as you go — the last day is for the ones still open.`
            : 'Add the people worth crossing a hall for. Ten is a show; thirty is a wish.'}
        </p>

        {targets.length === 0 ? (
          <div className="mt-3">
            <Empty icon={Target} title="No targets yet">
              The roster below is everyone who has listed themselves in this room. Pick the
              ones your outcomes depend on.
            </Empty>
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {targets.map((target) => (
              <TargetRow
                key={target.email}
                target={target}
                onPatch={(patch) => onPatch(target.email, patch)}
                onRemove={() => onRemove(target.email)}
              />
            ))}
          </div>
        )}
      </Panel>

      <Panel>
        <SectionLabel count={open.length}>In the room, not on your list</SectionLabel>
        {open.length === 0 ? (
          <p className="mt-2 text-[11.5px] leading-relaxed" style={{ color: B.muted }}>
            {roster.length === 0
              ? 'No one else has listed themselves in this room yet. The roster fills as they do.'
              : 'Everyone listed in this room is on your list.'}
          </p>
        ) : (
          <div className="mt-2 flex flex-col divide-y" style={{ borderColor: B.border }}>
            {open.map((person) => (
              <div key={person.email} className="flex items-center justify-between gap-2 py-2" style={{ borderTop: `1px solid ${B.border}` }}>
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full font-heading text-[10px]"
                    style={{ background: B.sand, color: B.navy }}
                  >
                    {person.avatar
                      ? <img src={person.avatar} alt="" className="h-full w-full object-cover" />
                      : (person.name || '?').slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px]" style={{ color: B.navy }}>{person.name}</p>
                    {person.focus && (
                      <p className="truncate text-[9.5px] uppercase tracking-[0.12em]" style={{ color: B.muted }}>
                        {person.focus}
                      </p>
                    )}
                  </div>
                </div>
                <span className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => onAdd(person, 'must_meet')}
                    className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]"
                    style={{ background: B.copper, color: '#fff' }}
                  >
                    Must
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdd(person, 'nice_to_meet')}
                    className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]"
                    style={{ background: 'transparent', color: B.navy, border: `1px solid ${B.border}` }}
                  >
                    Nice
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}