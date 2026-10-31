import { useMemo } from 'react';
import { PenLine } from 'lucide-react';
import { B } from './journeyConfig';
import { Empty, Panel, SectionLabel } from './bits';
import FollowUpCard from './FollowUpCard';

// FOLLOW UP — the part every per-event app drops.
//
// Whoever was captured comes back here, in one queue, until they are answered. Nothing is
// sequenced and nothing is sent for the Fellow: each card is a draft they edit and a key
// that opens their own mail or LinkedIn. The outcome they record is what makes the next
// conference smarter than this one.
export default function FollowUpPanel({ contacts, fellowName, sharedShowsFor, onPatch }) {
  const queue = useMemo(() => [...contacts].sort((a, b) => (
    Number(!!a.follow_up_sent) - Number(!!b.follow_up_sent)
  )), [contacts]);

  const open = queue.filter((contact) => !contact.follow_up_sent).length;

  return (
    <div className="flex flex-col gap-3">
      <Panel>
        <SectionLabel count={`${open} open`}>The queue</SectionLabel>
        <p className="mt-1 text-[11px] leading-relaxed" style={{ color: B.muted }}>
          Same-day beats same-week. The draft below is built from your note and your promise —
          edit it until it sounds like you, then send it from your own account.
        </p>
      </Panel>

      {queue.length === 0 ? (
        <Empty icon={PenLine} title="Nothing to follow up">
          Capture someone on the floor and they will be waiting here with a draft already
          written.
        </Empty>
      ) : (
        <div className="flex flex-col gap-2.5">
          {queue.map((contact) => (
            <FollowUpCard
              key={contact.id}
              contact={contact}
              fellowName={fellowName}
              sharedShows={sharedShowsFor(contact)}
              onPatch={(patch) => onPatch(contact.id, patch)}
            />
          ))}
        </div>
      )}
    </div>
  );
}