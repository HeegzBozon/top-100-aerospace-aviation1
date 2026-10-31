import { useState } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { B, HEAT, RELATIONSHIP_TYPES, labelOf } from './journeyConfig';
import { inputStyle } from './bits';

// One capture, read back in the evening. The only thing asked of the Fellow here is the
// thing memory will not hold until morning: the note, and what was promised.
export default function DebriefRow({ contact, onPatch }) {
  const [note, setNote] = useState(contact.notes || '');
  const [promise, setPromise] = useState(contact.promise || '');

  const thin = !contact.notes || !contact.promise;

  return (
    <div className="rounded-sm px-3 py-2.5" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-heading text-[14.5px] leading-tight" style={{ color: B.navy }}>
            {contact.full_name}
          </p>
          <p className="truncate text-[9.5px] uppercase tracking-[0.12em]" style={{ color: B.muted }}>
            {[labelOf(RELATIONSHIP_TYPES, contact.relationship_type), contact.heat && labelOf(HEAT, contact.heat), contact.company]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        {thin
          ? <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: B.copper }} />
          : <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: B.muted }} />}
      </div>

      {!contact.notes && (
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          onBlur={() => note.trim() && onPatch({ notes: note.trim() })}
          placeholder="What did they need? Fill it in while it is fresh."
          className="mt-2"
          style={{ ...inputStyle, fontSize: 11.5, padding: '6px 8px' }}
        />
      )}

      {!contact.promise && (
        <input
          value={promise}
          onChange={(event) => setPromise(event.target.value)}
          onBlur={() => promise.trim() && onPatch({ promise: promise.trim() })}
          placeholder="What did you say you would send?"
          className="mt-2"
          style={{ ...inputStyle, fontSize: 11.5, padding: '6px 8px' }}
        />
      )}
    </div>
  );
}