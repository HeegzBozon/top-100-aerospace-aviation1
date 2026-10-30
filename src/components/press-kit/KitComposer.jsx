import { B } from '@/components/fellow-home/fellowHomeConfig';
import { ACCENTS } from '@/components/fellow-home/fellowHomeConfig';
import KitField, { kitInputClass } from './KitField';
import KitEvidenceEditor from './KitEvidenceEditor';
import KitLinksEditor from './KitLinksEditor';

const inputStyle = { border: `1px solid ${B.border}`, color: B.navy };

// The composer. Every field is the Fellow's to write: the kit is seeded from their record
// so they begin with their own words in place, and nothing here invites a claim the record
// cannot carry.
export default function KitComposer({ draft, onChange }) {
  const set = (patch) => onChange({ ...draft, ...patch });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <KitField label="Name as printed">
          <input
            value={draft.full_name}
            onChange={(event) => set({ full_name: event.target.value })}
            placeholder="Your name"
            className={kitInputClass}
            style={inputStyle}
          />
        </KitField>
        <KitField label="Standing line">
          <input
            value={draft.headline}
            onChange={(event) => set({ headline: event.target.value })}
            placeholder="Role · Organisation"
            className={kitInputClass}
            style={inputStyle}
          />
        </KitField>
      </div>

      <KitField label="Summary" hint="One paragraph a journalist can lift whole.">
        <textarea
          rows={4}
          value={draft.summary}
          onChange={(event) => set({ summary: event.target.value })}
          placeholder="What you do, and the work you are known for."
          className={`${kitInputClass} resize-y`}
          style={inputStyle}
        />
      </KitField>

      <div className="grid gap-4 sm:grid-cols-2">
        <KitField label="Domain">
          <select
            value={draft.discipline}
            onChange={(event) => set({ discipline: event.target.value })}
            className={kitInputClass}
            style={inputStyle}
          >
            <option value="">Not stated</option>
            {ACCENTS.map((accent) => (
              <option key={accent.key} value={accent.key}>
                {accent.label}
              </option>
            ))}
          </select>
        </KitField>
        <KitField label="Based in">
          <input
            value={draft.location}
            onChange={(event) => set({ location: event.target.value })}
            placeholder="Country or city"
            className={kitInputClass}
            style={inputStyle}
          />
        </KitField>
      </div>

      <KitField
        label="Press enquiries"
        hint="Printed on the kit. Clear this line and no address appears anywhere on it."
      >
        <input
          value={draft.contact_email}
          onChange={(event) => set({ contact_email: event.target.value })}
          inputMode="email"
          placeholder="name@organisation.com"
          className={kitInputClass}
          style={inputStyle}
        />
      </KitField>

      <div className="h-px" style={{ background: B.border }} />

      <KitEvidenceEditor rows={draft.evidence || []} onChange={(evidence) => set({ evidence })} />

      <div className="h-px" style={{ background: B.border }} />

      <KitLinksEditor rows={draft.links || []} onChange={(links) => set({ links })} />
    </div>
  );
}