import { useState } from 'react';
import useConferenceContacts from '@/components/crm/useConferenceContacts';
import { C } from '@/components/crm/crmConfig';
import CampusDirectoryTab from '@/components/aerosync/CampusDirectoryTab';
import { DIRECTORY_TABS } from '@/components/directory/directoryConfig';
import useDirectoryIntel from '@/components/directory/useDirectoryIntel';
import PeopleTab from '@/components/directory/PeopleTab';
import WhatTab from '@/components/directory/WhatTab';
import WhenTab from '@/components/directory/WhenTab';
import WhyTab from '@/components/directory/WhyTab';
import useProfileLink from '@/components/directory/useProfileLink';
import ProfileMeter from '@/components/directory/ProfileMeter';
import { WhoPrompt, WherePrompt, MeetDraft } from '@/components/directory/TabPrompts';

const PEOPLE_SUBTABS = ['cards', 'following', 'desk'];

// The Directory: the platform read as five questions — who, what, when, where, why. It
// teaches a newcomer what is here, and the "why" it asks back tailors the rest to them.
export default function AeroSyncPeople() {
  const crm = useConferenceContacts();
  const { intel, save, signedIn, loading } = useDirectoryIntel();
  const asked = new URLSearchParams(window.location.search).get('tab');
  const [tab, setTab] = useState(() => {
    if (asked === 'campus') return 'where';
    if (PEOPLE_SUBTABS.includes(asked)) return 'who';
    return DIRECTORY_TABS.some((t) => t.key === asked) ? asked : 'who';
  });
  const profile = useProfileLink();
  const untold = signedIn && !loading && !intel.stage && !intel.goals.length;

  return (
    <div className="min-h-screen" style={{ background: C.cream }}>
      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-12">
        <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: C.copper }}>AeroSync</p>
        <h1 className="mt-1 font-heading text-2xl md:text-4xl" style={{ color: C.navy }}>Directory</h1>

        <div role="tablist" aria-label="Directory" className="mt-5 grid grid-cols-5 gap-1">
          {DIRECTORY_TABS.map((t) => {
            const on = tab === t.key;
            return (
              <button key={t.key} type="button" role="tab" aria-selected={on} onClick={() => setTab(t.key)}
                className="relative rounded-lg px-1 py-2 text-center transition-colors"
                style={on ? { background: C.navy, color: C.cream } : { background: '#fff', color: C.navy, border: `1px solid ${C.border}` }}>
                <span className="block font-heading text-sm md:text-lg">{t.q}</span>
                <span className="block text-[8.5px] font-bold uppercase tracking-[0.14em] opacity-70">{t.label}</span>
                {t.key === 'why' && untold && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full" style={{ background: C.copper }} />}
              </button>
            );
          })}
        </div>

        {signedIn && profile.settings && <ProfileMeter settings={profile.settings} intel={intel} />}

        {untold && tab !== 'why' && (
          <button type="button" onClick={() => setTab('why')} className="mt-3 w-full rounded-lg p-3 text-left text-[12px]"
            style={{ border: `1px dashed ${C.copper}`, color: C.navy }}>
            Tell us why you're here, and the Directory will put what helps you first. →
          </button>
        )}

        <div className="mt-5">
          {tab === 'who' && <><WhoPrompt {...profile} /><PeopleTab crm={crm} initial={asked} /></>}
          {tab === 'what' && <><MeetDraft {...profile} goals={intel.goals} /><WhatTab goals={intel.goals} /></>}
          {tab === 'when' && <WhenTab />}
          {tab === 'where' && <><WherePrompt {...profile} /><CampusDirectoryTab /></>}
          {tab === 'why' && <WhyTab intel={intel} save={save} signedIn={signedIn} onDone={() => setTab('what')} />}
        </div>
        <div className="h-24" />
      </div>
    </div>
  );
}