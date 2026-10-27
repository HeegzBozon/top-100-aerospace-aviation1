import { useState } from 'react';
import { Pencil, Stamp, Trash2, X } from 'lucide-react';
import ContactDraftForm from './ContactDraftForm';
import ContactReadout from './ContactReadout';
import { BTN, BTN_BASE, C, initialsFor } from './crmConfig';

// One contact, opened over the list rather than taken away from it. The actions sit in a bar
// under the name — log a touch, edit, remove — so the record is worked from one place, and
// removing is still a two-step press: a card you were handed is not a thing to lose by mis-tap.
export default function ContactDetailPanel({ contact, saving, touching, onClose, onSave, onRemove, onTouch }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const save = async (payload) => {
    await onSave(payload, contact.id);
    setEditing(false);
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Close the contact"
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: 'rgba(12,22,34,0.42)' }}
      />

      <div
        className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-2xl md:inset-x-auto md:left-1/2 md:w-[620px] md:-translate-x-1/2"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
        role="dialog"
        aria-label={`${contact.full_name} — the record`}
      >
        <div className="sticky top-0 z-10 flex items-center gap-2.5 px-4 py-3" style={{ background: C.navy }}>
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold uppercase"
            style={{ background: 'rgba(201,168,124,0.22)', color: C.gold }}
            aria-hidden="true"
          >
            {initialsFor(contact.full_name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-semibold" style={{ color: C.cream }}>
              {contact.full_name}
            </p>
            <p className="truncate text-[10px] uppercase tracking-[0.12em]" style={{ color: C.gold }}>
              {[contact.role_title, contact.company].filter(Boolean).join(' · ') || 'No role recorded'}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="shrink-0 p-1">
            <X className="h-4 w-4" style={{ color: C.cream }} />
          </button>
        </div>

        {!editing ? (
          <div
            className="flex flex-wrap items-center gap-2 px-4 py-2.5"
            style={{ background: C.cream, borderBottom: `1px solid ${C.border}` }}
          >
            <button
              type="button"
              onClick={() => onTouch(contact)}
              disabled={touching}
              className={BTN_BASE}
              style={BTN.navy}
            >
              <Stamp className="h-3.5 w-3.5" /> Log a touch
            </button>
            <button type="button" onClick={() => setEditing(true)} className={BTN_BASE} style={BTN.outline}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <span className="flex-1" />
            {confirming ? (
              <>
                <button type="button" onClick={() => onRemove(contact)} className={BTN_BASE} style={BTN.primary}>
                  <Trash2 className="h-3.5 w-3.5" /> Remove it
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="px-2 py-2 text-[9px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: C.muted }}
                >
                  Keep it
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirming(true)} className={BTN_BASE} style={BTN.outline}>
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            )}
          </div>
        ) : null}

        <div className="px-4 py-4">
          {editing ? (
            <ContactDraftForm
              initial={contact}
              cardUri={contact.card_file_uri}
              saving={saving}
              submitLabel="Save the changes"
              onSave={save}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <ContactReadout contact={contact} />
          )}
        </div>
      </div>
    </div>
  );
}