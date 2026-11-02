import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactRolodex from '@/components/crm/ContactRolodex';
import FollowingLedger from '@/components/following/FollowingLedger';
import Classifieds from '@/pages/Classifieds';
import { C } from '@/components/crm/crmConfig';

const TABS = [['cards', 'My Network'], ['following', 'Following'], ['desk', 'Classifieds']];

// Who: the cards you captured, the names you follow, and who has a door open.
export default function PeopleTab({ crm, initial }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState(TABS.some(([k]) => k === initial) ? initial : 'cards');
  return (
    <>
      <div role="tablist" aria-label="People" className="flex flex-wrap gap-1" style={{ borderBottom: `1px solid ${C.border}` }}>
        {TABS.map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className="rounded-t-lg px-3 py-2 text-[9.5px] font-bold uppercase tracking-[0.16em]"
            style={tab === k ? { color: C.navy, boxShadow: `inset 0 -2px 0 ${C.copper}` } : { color: C.muted }}>
            {k === 'cards' ? `${l} (${crm.total})` : l}
          </button>
        ))}
      </div>
      <div className="mt-3">
        {tab === 'cards' ? <ContactRolodex crm={crm} onCapture={() => navigate('/aerosync/scan')} />
          : tab === 'following' ? <FollowingLedger /> : <Classifieds embedded />}
      </div>
    </>
  );
}