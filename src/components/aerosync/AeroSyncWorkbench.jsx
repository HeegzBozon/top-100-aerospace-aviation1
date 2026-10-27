import { useState } from 'react';
import { CheckCircle2, Plus, Users } from 'lucide-react';
import ContactCapture from '@/components/crm/ContactCapture';
import ContactRolodex from '@/components/crm/ContactRolodex';
import useConferenceContacts from '@/components/crm/useConferenceContacts';
import { BTN, BTN_BASE, C } from '@/components/crm/crmConfig';

const TABS = [
  { key: 'contacts', label: 'Contacts' },
  { key: 'capture', label: 'Add a card' },
];

// The CRM worked as a tool: the count and the capture across the head, the two views as
// tabs, the panel below. Records are read and written through the shared rolodex hook, so
// the surface and the title screen read the same private records — a card captured here is
// the contact counted there.
export default function AeroSyncWorkbench({ initialTab = 'contacts' }) {
  const crm = useConferenceContacts();
  const [tab, setTab] = useState(initialTab);
  const [notice, setNotice] = useState('');

  const openTab = (key) => {
    setNotice('');
    setTab(key);
  };

  return (
    <section className="mt-5 overflow-hidden rounded-xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-2.5 px-3 py-2.5" style={{ background: C.navy }}>
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
          style={{ background: 'rgba(201,168,124,0.22)' }}
        >
          <Users className="h-4 w-4" style={{ color: C.gold }} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: C.cream }}>
            AeroSync CRM
          </p>
          <p className="truncate text-[9px] uppercase tracking-[0.14em]" style={{ color: C.gold }}>
            {crm.state.loading ? 'Reading your contacts' : `${crm.total} contact${crm.total === 1 ? '' : 's'} kept`}
          </p>
        </div>
        <button type="button" onClick={() => openTab('capture')} className={BTN_BASE} style={BTN.primary}>
          <Plus className="h-3.5 w-3.5" /> Add a card
        </button>
      </div>

      <div className="flex items-center gap-1 px-2 pt-1.5" style={{ borderBottom: `1px solid ${C.border}` }}>
        {TABS.map((item) => {
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => openTab(item.key)}
              aria-current={active ? 'page' : undefined}
              className="rounded-t-lg px-3 py-2 text-[9.5px] font-bold uppercase tracking-[0.16em]"
              style={active ? { color: C.navy, boxShadow: `inset 0 -2px 0 ${C.copper}` } : { color: C.muted }}
            >
              {item.key === 'contacts' ? `Contacts (${crm.total})` : item.label}
            </button>
          );
        })}
      </div>

      <div className="p-2.5 md:p-3.5">
        {notice ? (
          <p
            role="status"
            className="mb-2.5 inline-flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em]"
            style={{ color: C.copper }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> {notice}
          </p>
        ) : null}

        {tab === 'contacts' ? (
          <ContactRolodex crm={crm} onCapture={() => openTab('capture')} />
        ) : (
          <ContactCapture
            crm={crm}
            onSaved={(name) => {
              setNotice(`${name} added to the rolodex`);
              setTab('contacts');
            }}
          />
        )}
      </div>
    </section>
  );
}