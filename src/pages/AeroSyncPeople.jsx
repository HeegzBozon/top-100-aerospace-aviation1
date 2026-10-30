import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactRolodex from '@/components/crm/ContactRolodex';
import useConferenceContacts from '@/components/crm/useConferenceContacts';
import FollowingLedger from '@/components/following/FollowingLedger';
import Classifieds from '@/pages/Classifieds';
import { C } from '@/components/crm/crmConfig';

const TABS = [
  { key: 'cards', label: 'My Network' },
  { key: 'following', label: 'Following' },
  { key: 'desk', label: 'Classifieds' },
];

const TAB_KEYS = TABS.map((item) => item.key);

// AeroSync's People: the cards a Fellow captured, the names they follow, and the desk of who
// has a door open — read as one surface. All three are the same work, knowing who matters, so
// they are three tabs on one page rather than three keys on the title screen. Scanning lives on
// its own surface; every way into it from here leads there.
export default function AeroSyncPeople() {
  const navigate = useNavigate();
  const crm = useConferenceContacts();
  const [tab, setTab] = useState(() => {
    const asked = new URLSearchParams(window.location.search).get('tab');
    return TAB_KEYS.includes(asked) ? asked : 'cards';
  });

  const readout = useMemo(() => {
    if (tab === 'desk') return 'Three desks · positions, mandates, notices';
    if (crm.state.loading) return 'Reading your people';
    return `${crm.total} contact${crm.total === 1 ? '' : 's'} kept · private to you`;
  }, [tab, crm.state.loading, crm.total]);

  return (
    <div className="min-h-screen" style={{ background: C.cream }}>
      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-12">
        <header className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: C.copper }}>
              AeroSync
            </p>
            <h1 className="mt-1 font-heading text-2xl md:text-4xl" style={{ color: C.navy }}>
              People
            </h1>
          </div>
          <p className="text-[11px]" style={{ color: C.muted }}>{readout}</p>
        </header>

        <div
          role="tablist"
          aria-label="People"
          className="mt-5 flex flex-wrap items-center gap-1"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          {TABS.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.key)}
                className="rounded-t-lg px-3 py-2 text-[9.5px] font-bold uppercase tracking-[0.16em]"
                style={active ? { color: C.navy, boxShadow: `inset 0 -2px 0 ${C.copper}` } : { color: C.muted }}
              >
                {item.key === 'cards' ? `My Network (${crm.total})` : item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-3">
          {tab === 'cards' ? (
            <ContactRolodex crm={crm} onCapture={() => navigate('/aerosync/scan')} />
          ) : tab === 'following' ? (
            <FollowingLedger />
          ) : (
            <Classifieds embedded />
          )}
        </div>

        <div className="h-24" />
      </div>
    </div>
  );
}