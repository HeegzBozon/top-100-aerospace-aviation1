import { useState } from 'react';
import { Loader2, Plus, RotateCcw, Search, Users, X } from 'lucide-react';
import ContactCard from './ContactCard';
import ContactDetailPanel from './ContactDetailPanel';
import { BTN, BTN_BASE, C, SORT_OPTIONS } from './crmConfig';

// The rolodex: the working list. Search and order are queries, not walks through what is on
// screen, and the readout is honest about the page — how many of the whole rolodex are here.
// The states a member meets are the four: reading, nothing kept, nothing matching, and the
// line being down.
export default function ContactRolodex({ crm, onCapture }) {
  const [openId, setOpenId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [touchingId, setTouchingId] = useState('');

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
    setTouchingId(contact.id);
    try {
      await crm.touch(contact.id);
    } finally {
      setTouchingId('');
    }
  };

  const readout = crm.state.loading
    ? 'Reading'
    : crm.searching
      ? `${count} of ${crm.total} match`
      : `Showing ${count} of ${crm.total}`;

  return (
    <section>
      <div className="flex flex-wrap items-center gap-2">
        <div
          className="flex min-w-[168px] flex-1 items-center gap-2 rounded-lg px-2.5 py-2"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}
        >
          <Search className="h-3.5 w-3.5 shrink-0" style={{ color: C.copper }} />
          <input
            value={crm.term}
            onChange={(event) => crm.setTerm(event.target.value)}
            placeholder="Name, organization, email or show"
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

        <select
          value={crm.sortKey}
          onChange={(event) => crm.setSortKey(event.target.value)}
          aria-label="Order the rolodex"
          className="rounded-lg px-2 py-2 text-[9.5px] font-bold uppercase tracking-[0.14em] outline-none"
          style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.navy }}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>

        <button type="button" onClick={onCapture} className={BTN_BASE} style={BTN.primary}>
          <Plus className="h-3.5 w-3.5" /> Scan
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 px-0.5">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: C.muted }}>
          {readout}
        </p>
        {crm.state.failed ? null : (
          <p className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: C.muted }}>
            Ordered by {SORT_OPTIONS.find((option) => option.key === crm.sortKey)?.label || 'recent activity'}
          </p>
        )}
      </div>

      {crm.state.failed ? (
        <div className="mt-2 rounded-lg p-4" style={{ background: C.paper, border: `1px solid ${C.border}` }}>
          <p className="text-[13px] font-semibold" style={{ color: C.navy }}>
            The rolodex could not be read. Nothing is lost.
          </p>
          <button type="button" onClick={crm.reload} className={`${BTN_BASE} mt-3`} style={BTN.navy}>
            <RotateCcw className="h-3.5 w-3.5" /> Read it again
          </button>
        </div>
      ) : crm.state.loading ? (
        <div className="mt-2 space-y-1.5">
          {[0, 1, 2, 3].map((row) => (
            <div
              key={row}
              className="flex animate-pulse items-center gap-2.5 rounded-lg px-2.5 py-2.5"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <span className="h-9 w-9 shrink-0 rounded-lg" style={{ background: C.sand }} />
              <span className="flex-1 space-y-2">
                <span className="block h-2.5 w-32 rounded-full" style={{ background: C.sand }} />
                <span className="block h-2 w-48 rounded-full" style={{ background: C.sand }} />
              </span>
            </div>
          ))}
        </div>
      ) : count === 0 && crm.searching ? (
        <div className="mt-2 rounded-lg p-5 text-center" style={{ background: C.paper, border: `1px solid ${C.border}` }}>
          <p className="text-[13px] font-semibold" style={{ color: C.navy }}>
            Nothing matches “{crm.term.trim()}”.
          </p>
          <p className="mt-1.5 text-[11.5px]" style={{ color: C.muted }}>
            A contact is found by name, by organization, by email, or by the show you met at.
          </p>
          <button type="button" onClick={() => crm.setTerm('')} className={`${BTN_BASE} mt-3`} style={BTN.outline}>
            <RotateCcw className="h-3.5 w-3.5" /> Clear the search
          </button>
        </div>
      ) : count === 0 ? (
        <div className="mt-2 rounded-lg p-5" style={{ background: C.paper, border: `1px dashed ${C.border}` }}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: C.sand }}>
            <Users className="h-4 w-4" style={{ color: C.copper }} />
          </span>
          <p className="mt-3 text-[13px] font-semibold" style={{ color: C.navy }}>
            No contacts yet.
          </p>
          <p className="mt-1 max-w-md text-[11.5px] leading-relaxed" style={{ color: C.muted }}>
            Photograph a card or type one in. Each contact keeps the show you met at and the line
            that was agreed next — private to you, and visible to no other Fellow.
          </p>
          <button type="button" onClick={onCapture} className={`${BTN_BASE} mt-3`} style={BTN.primary}>
            <Plus className="h-3.5 w-3.5" /> Scan
          </button>
        </div>
      ) : (
        <div className="mt-2 space-y-1.5">
          {crm.contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onOpen={() => setOpenId(contact.id)}
              onTouch={touch}
              touching={touchingId === contact.id}
            />
          ))}
        </div>
      )}

      {saving && openContact ? (
        <p
          className="mt-3 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em]"
          style={{ color: C.copper }}
        >
          <Loader2 className="h-3 w-3 animate-spin" /> Saving
        </p>
      ) : null}

      {openContact ? (
        <ContactDetailPanel
          contact={openContact}
          saving={saving}
          touching={touchingId === openContact.id}
          onClose={() => setOpenId(null)}
          onSave={save}
          onRemove={remove}
          onTouch={touch}
        />
      ) : null}
    </section>
  );
}