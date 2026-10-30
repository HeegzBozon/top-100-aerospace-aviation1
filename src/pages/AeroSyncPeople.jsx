import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactRolodex from '@/components/crm/ContactRolodex';
import useConferenceContacts from '@/components/crm/useConferenceContacts';
import FollowingLedger from '@/components/following/FollowingLedger';
import { C } from '@/components/crm/crmConfig';

const TABS = [
  { key: 'cards', label: 'Cards' },
  { key: 'following', label: 'Following' },
];

// AeroSync's People: the cards a Fellow captured and the names they follow, read as one
// surface. Both are the same work — knowing who matters and holding a way to reach them — so
// they are two tabs on one page rather than two keys on the title screen. Scanning lives on
// its own surface; every way into it from here leads there.
export default function AeroSyncPeople() {
  const navigate = useNavigate();
  const crm = useConferenceContacts();
  const [tab, setTab] = useState(() =>
    new URLSearchParams(window.location.search).get('tab') === 'following' ? 'following' : 'cards',
  );

  const readout = useMemo(() => {
    if (crm.state.loading) return 'Reading your people';
    return `${crm.total} contact${crm.total === 1 ? '' : 's'} kept · private to you`;
  }, [crm.state.loading, crm.total]);

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
          className="mt-5 flex items-center gap-1"
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
                {item.key === 'cards' ? `Cards (${crm.total})` : item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-3">
          {tab === 'cards' ? (
            <ContactRolodex crm={crm} onCapture={() => navigate('/aerosync/scan')} />
          ) : (
            <FollowingLedger />
          )}
        </div>

        <div className="h-24" />
      </div>
    </div>
  );
}