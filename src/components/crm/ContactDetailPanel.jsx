import { useState } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';
import ContactDraftForm from './ContactDraftForm';
import ContactReadout from './ContactReadout';
import { C, initialsFor } from './crmConfig';

// One contact, opened over the page rather than taken away from it: the record read back,
// the record corrected, and the record let go of. Deleting is a two-step press, because a
// card you were handed is not a thing to lose by mis-tap.
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
        className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl md:inset-x-auto md:left-1/2 md:w-[620px] md:-translate-x-1/2 md:rounded-t-3xl"
        style={{ background: C.paper, border: `1px solid ${C.border}` }}
        role="dialog"
        aria-label={`${contact.full_name} — the record`}
      >
        <div
          className="sticky top-0 flex items-start gap-3 px-5 py-4"
          style={{ background: C.paper, borderBottom: `1px solid ${C.border}` }}
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-heading text-[15px]"
            style={{ background: C.sand, color: C.navy }}
            aria-hidden="true"
          >
            {initialsFor(contact.full_name)}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-heading text-xl leading-tight" style={{ color: C.navy }}>
              {contact.full_name}
            </h2>
            <p className="truncate text-[11.5px]" style={{ color: C.muted }}>
              {[contact.role_title, contact.company].filter(Boolean).join(' · ') || 'No role recorded'}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="mt-0.5 shrink-0">
            <X className="h-4 w-4" style={{ color: C.muted }} />
          </button>
        </div>

        <div className="px-5 py-5">
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
            <ContactReadout contact={contact} onTouch={onTouch} touching={touching} />
          )}

          {!editing ? (
            <div className="mt-6 flex flex-wrap items-center gap-2" style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em]"
                style={{ background: C.navy, color: C.cream }}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit the record
              </button>
              {confirming ? (
                <>
                  <button
                    type="button"
                    onClick={() => onRemove(contact)}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em]"
                    style={{ background: C.copper, color: C.cream }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Let it go
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="text-[9px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: C.muted }}
                  >
                    Keep it
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em]"
                  style={{ border: `1px solid ${C.border}`, color: C.muted, background: C.surface }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove from the rolodex
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}