import { useState } from 'react';
import DeskMasthead from '@/components/admin/desk/DeskMasthead';
import DeskTabs from '@/components/admin/desk/DeskTabs';
import useMailRoom from './useMailRoom';
import AudiencePanel from './AudiencePanel';
import SegmentsPanel from './SegmentsPanel';
import ComposePanel from './ComposePanel';

const TABS = [
  { key: 'audience', label: 'Audience' },
  { key: 'segments', label: 'Smart lists' },
  { key: 'compose', label: 'Compose' },
];

// THE MAIL ROOM — the house's own correspondence desk.
//
// Three readings of one thing: who the house can reach, the smart lists that ask a question
// of them, and the letter itself. Every letter is written in one shell (base44/shared/
// mailShell.ts), so the house style is not a guideline to follow, it is the only shape a
// letter can take.
//
// The CRM of record is still GoHighLevel. This desk composes, addresses and posts; it never
// becomes a second contact database.
export default function MailRoom({ initialTab = 'audience' }) {
  const [tab, setTab] = useState(initialTab);
  const room = useMailRoom();
  const reachable = room.data?.summary?.mailable;

  return (
    <div className="space-y-4">
      <DeskMasthead
        kicker="Mail Room"
        title="Who the house writes to"
        blurb="The ledger of everyone the house can reach, the smart lists that ask a question of it, and the letter itself. One shell, one house style, one way out for every reader."
      >
        <span
          className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ background: 'rgba(201,168,124,0.14)', color: '#c9a87c' }}
        >
          {typeof reachable === 'number' ? `${reachable.toLocaleString()} reachable` : 'reading…'}
        </span>
      </DeskMasthead>

      <DeskTabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'audience' && <AudiencePanel room={room} />}
      {tab === 'segments' && <SegmentsPanel room={room} />}
      {tab === 'compose' && <ComposePanel room={room} />}
    </div>
  );
}