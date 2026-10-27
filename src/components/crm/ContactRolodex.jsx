import { useState } from 'react';
import { Loader2, RotateCcw, Search, Users, X } from 'lucide-react';
import ContactCard from './ContactCard';
import ContactDetailPanel from './ContactDetailPanel';
import { C } from './crmConfig';

// The rolodex: every card handed over, read back as a person. The search is a query, not a
// walk through what is on screen — so the list stays one page of sixty — and the states
// are the three a member actually meets: nothing kept yet, nothing matching the word,
// and the line being down.
export default function ContactRolodex({ crm, onCapture }) {
  const [openId, setOpenId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [touching, setTouching] = useState(false);

  const openContact = crm.contacts.find((contact) => contact.id === openId) || null;
  const count = crm.contacts.length;

  const save = async (payload, id) => {
    setSaving(true);
    try {
      await crm.save(payload, id);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (contact) => {
    await crm.remove(contact.id);
    setOpenId(null);
  };

  const touch = async (contact) => {
    setTouching(true);
    try {
      await crm.touch(contact.id);
    } finally {
      setTouching(false);
    }
  };

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: C.copper }}>
            The rolodex
          </p>
          <h2 className="mt-1.5 font-heading text-2xl" style={{ color: C.navy }}>
            {crm.state.loading
              ? 'Reading your cards…'
              : count === 1
                ? 'One contact kept.'
                : `${count} contacts kept.`}
          </h2>
        </div>

        {crm.searching || count ? (
          <div
            className="flex w-full items-center gap-2 rounded-full px-3 py-2 sm:w-72"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
          >
            <Search className="h-3.5 w-3.5 shrink-0" style={{ color: C.copper }} />
            <input
              value={crm.term}
              onChange={(event) => crm.setTerm(event.target.value)}
              placeholder="A name, an organization, a show"
              aria-label="Search the rolodex"
              className="w-full bg-transparent text-[12.5px] outline-none"
              style={{ color: C.navy }}
            />
            {crm.searching ? (
              <button type="button" onClick={() => crm.setTerm('')} aria-label="Clear the search" className="shrink-0">
                <X className="h-3.5 w-3.5" style={{ color: C.muted }} />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {crm.state.failed ? (
        <div className="mt-4 rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <p className="font-heading text-lg" style={{ color: C.navy }}>
            The rolodex could not be read. Nothing is lost.
          </p>
          <button
            type="button"
            onClick={crm.reload}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em]"
            style={{ background: C.navy, color: C.cream }}
          >
            <RotateCcw className="h-3 w-3" /> Read it again
          </button>
        </div>
      ) : crm.state.loading ? (
        <div className="mt-4 space-y-2.5">
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className="flex animate-pulse items-center gap-3 rounded-2xl p-4"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <span className="h-11 w-11 rounded-xl" style={{ background: C.sand }} />
              <span className="flex-1 space-y-2">
                <span className="block h-2.5 w-40 rounded-full" style={{ background: C.sand }} />
                <span className="block h-2 w-56 rounded-full" style={{ background: C.sand }} />
              </span>
            </div>
          ))}
        </div>
      ) : count === 0 && crm.searching ? (
        <div className="mt-4 rounded-2xl p-6 text-center" style={{ background: C.paper, border: `1px solid ${C.border}` }}>
          <p className="font-heading text-lg" style={{ color: C.navy }}>
            Nothing matches “{crm.term.trim()}”.
          </p>
          <p className="mt-2 text-[12px] leading-relaxed" style={{ color: C.muted }}>
            A contact is found by name, by organization, by email, or by the show you met at.
          </p>
          <button
            type="button"
            onClick={() => crm.setTerm('')}
            className="mt-4 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em]"
            style={{ color: C.copper }}
          >
            <RotateCcw className="h-3 w-3" /> Clear the search
          </button>
        </div>
      ) : count === 0 ? (
        <div className="mt-4 rounded-2xl p-7 text-center" style={{ background: C.paper, border: `1px solid ${C.border}` }}>
          <span
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: C.sand }}
          >
            <Users className="h-5 w-5" style={{ color: C.copper }} />
          </span>
          <h3 className="mt-4 font-heading text-xl" style={{ color: C.navy }}>
            Your rolodex is empty.
          </h3>
          <p className="mx-auto mt-2 max-w-md text-[12.5px] leading-relaxed" style={{ color: C.muted }}>
            Every card handed to you at a show belongs here: the name, the organization, the room
            you met in, and the line you said would come next. Private to you — no other Fellow can
            see it.
          </p>
          <button
            type="button"
            onClick={onCapture}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em]"
            style={{ background: C.copper, color: C.cream }}
          >
            Capture the first card
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          {crm.contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} onOpen={() => setOpenId(contact.id)} />
          ))}
        </div>
      )}

      {saving && openContact ? (
        <p className="mt-3 inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em]" style={{ color: C.copper }}>
          <Loader2 className="h-3 w-3 animate-spin" /> Saving
        </p>
      ) : null}

      {openContact ? (
        <ContactDetailPanel
          contact={openContact}
          saving={saving}
          touching={touching}
          onClose={() => setOpenId(null)}
          onSave={save}
          onRemove={remove}
          onTouch={touch}
        />
      ) : null}
    </section>
  );
}