import { Moon, Target } from 'lucide-react';
import { B } from './journeyConfig';
import { Chip, Empty, Panel, SectionLabel } from './bits';
import DebriefRow from './DebriefRow';

// DEBRIEF — ten minutes, at the end of the day.
//
// The habit the whole conference turns on: read back everyone you met, complete the notes
// that were too rushed to finish on the floor, and close out the targets you did or did not
// reach. What is left open here is exactly what the follow-up surface will ask for.
export default function DebriefPanel({ contacts, targets, queued, onPatchContact, onTargetPatch }) {
  const open = targets.filter((target) => (target.status || 'pending') === 'pending');
  const noted = contacts.filter((contact) => contact.notes && contact.promise).length;

  return (
    <div className="flex flex-col gap-3">
      <Panel>
        <SectionLabel count={`${noted}/${contacts.length} complete`}>Tonight</SectionLabel>
        <p className="mt-1 text-[11px] leading-relaxed" style={{ color: B.muted }}>
          Everyone you captured at this show. Two lines are all that is missing — the note and
          the promise — and both are worth more now than tomorrow.
        </p>
        {!!queued && (
          <p className="mt-2 text-[10.5px]" style={{ color: B.copper }}>
            {queued} row{queued === 1 ? '' : 's'} still held on this device, waiting for a line.
          </p>
        )}

        {contacts.length === 0 ? (
          <div className="mt-3">
            <Empty icon={Moon} title="Nothing captured yet">
              The debrief fills as you meet people. Capture on the floor, read it back here.
            </Empty>
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {contacts.map((contact) => (
              <DebriefRow
                key={contact.id}
                contact={contact}
                onPatch={(patch) => onPatchContact(contact.id, patch)}
              />
            ))}
          </div>
        )}
      </Panel>

      <Panel>
        <SectionLabel count={open.length}>Targets still open</SectionLabel>
        {open.length === 0 ? (
          <p className="mt-2 text-[11.5px] leading-relaxed" style={{ color: B.muted }}>
            {targets.length === 0
              ? 'No target list yet. Build one on the Targets surface and it will close out here.'
              : 'Every target is accounted for. Nothing left to chase.'}
          </p>
        ) : (
          <div className="mt-2 flex flex-col">
            {open.map((target) => (
              <div
                key={target.email}
                className="flex items-center justify-between gap-2 py-2"
                style={{ borderTop: `1px solid ${B.border}` }}
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <Target className="h-3 w-3 shrink-0" style={{ color: B.copper }} />
                  <span className="truncate text-[12px]" style={{ color: B.navy }}>{target.name}</span>
                </span>
                <span className="flex shrink-0 gap-1">
                  <Chip onClick={() => onTargetPatch(target.email, { status: 'met' })}>Met</Chip>
                  <Chip onClick={() => onTargetPatch(target.email, { status: 'missed' })}>Missed</Chip>
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}