import { useState } from 'react';
import { Loader2, Plus, Save, Trash2, X } from 'lucide-react';

const FIELD = 'w-full rounded px-2 py-1 text-[11px] outline-none focus:border-editorial-gold/60';
const FIELD_STYLE = { background: 'rgba(6,12,20,0.55)', border: '1px solid rgba(201,168,124,0.22)', color: '#f5efe4' };
const LABEL = 'text-[8px] font-bold uppercase tracking-[0.18em]';

const asLines = (list) => (Array.isArray(list) ? list.join('\n') : '');
const toLines = (text) => String(text || '').split('\n').map((line) => line.trim()).filter(Boolean);

const LIST_FIELDS = [
  { key: 'voice_do', label: 'Voice, do' },
  { key: 'voice_dont', label: 'Voice, do not' },
  { key: 'use_words', label: 'Words the house uses' },
  { key: 'never_words', label: 'Words the house never uses' },
  { key: 'banned_words', label: 'Banned words' },
  { key: 'punctuation', label: 'Punctuation' },
  { key: 'sourcing', label: 'Sourcing and attribution' },
  { key: 'open_decisions', label: 'Open decisions' },
];

const EMPTY_ROW = { section: '', words: '', byline: '', job: '' };

// Filing a new version of the standard. A version is added, never edited, so a letter can
// always be read against the guide that was in force when it was written.
export default function StandardEditor({ standard, busy, onSave, onCancel }) {
  const [stance, setStance] = useState(standard?.stance || '');
  const [structure, setStructure] = useState(standard?.structure?.length ? standard.structure : [EMPTY_ROW]);
  const [lists, setLists] = useState(() => {
    const seed = {};
    LIST_FIELDS.forEach((field) => {
      seed[field.key] = asLines(standard?.[field.key]);
    });
    return seed;
  });
  const [gates, setGates] = useState(standard?.gates?.length ? standard.gates : [{ gate: '', owner: '', covers: '' }]);

  const setRow = (index, key, value) =>
    setStructure((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  const setGate = (index, key, value) =>
    setGates((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

  const submit = () => {
    const patch = { stance, structure: structure.filter((row) => row.section), gates: gates.filter((row) => row.gate) };
    LIST_FIELDS.forEach((field) => {
      patch[field.key] = toLines(lists[field.key]);
    });
    patch.body = stance;
    onSave(patch);
  };

  return (
    <div className="desk-plate p-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: '#c9a87c' }}>
        Filing version {(standard?.version || 0) + 1}
      </p>

      <label className="mt-2.5 block">
        <span className={LABEL} style={{ color: '#5f7488' }}>
          The stance
        </span>
        <textarea
          className={`mt-1 ${FIELD}`}
          style={FIELD_STYLE}
          rows={3}
          value={stance}
          onChange={(event) => setStance(event.target.value)}
        />
      </label>

      <p className={`mt-4 ${LABEL}`} style={{ color: '#5f7488' }}>
        Standard structure, in print order
      </p>
      <div className="mt-1.5 space-y-1.5">
        {structure.map((row, index) => (
          <div key={index} className="grid grid-cols-[1.1fr_.8fr_.8fr_1.4fr_auto] gap-1.5">
            {['section', 'words', 'byline', 'job'].map((key) => (
              <input
                key={key}
                className={FIELD}
                style={FIELD_STYLE}
                value={row[key] || ''}
                placeholder={key}
                onChange={(event) => setRow(index, key, event.target.value)}
              />
            ))}
            <button
              type="button"
              onClick={() => setStructure((rows) => rows.filter((_, i) => i !== index))}
              className="desk-key desk-key-quiet px-2"
              aria-label="Remove section"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setStructure((rows) => [...rows, EMPTY_ROW])} className="desk-key mt-2">
        <Plus className="h-3 w-3" />
        Add a section
      </button>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {LIST_FIELDS.map((field) => (
          <label key={field.key}>
            <span className={LABEL} style={{ color: '#5f7488' }}>
              {field.label}, one a line
            </span>
            <textarea
              className={`mt-1 ${FIELD}`}
              style={FIELD_STYLE}
              rows={field.key === 'sourcing' ? 4 : 3}
              value={lists[field.key]}
              onChange={(event) => setLists((prev) => ({ ...prev, [field.key]: event.target.value }))}
            />
          </label>
        ))}
      </div>

      <p className={`mt-4 ${LABEL}`} style={{ color: '#5f7488' }}>
        The gates
      </p>
      <div className="mt-1.5 space-y-1.5">
        {gates.map((row, index) => (
          <div key={index} className="grid grid-cols-[1fr_.7fr_1.6fr_auto] gap-1.5">
            {['gate', 'owner', 'covers'].map((key) => (
              <input
                key={key}
                className={FIELD}
                style={FIELD_STYLE}
                value={row[key] || ''}
                placeholder={key}
                onChange={(event) => setGate(index, key, event.target.value)}
              />
            ))}
            <button
              type="button"
              onClick={() => setGates((rows) => rows.filter((_, i) => i !== index))}
              className="desk-key desk-key-quiet px-2"
              aria-label="Remove gate"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setGates((rows) => [...rows, { gate: '', owner: '', covers: '' }])} className="desk-key mt-2">
        <Plus className="h-3 w-3" />
        Add a gate
      </button>

      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="desk-key desk-key-quiet">
          <X className="h-3 w-3" />
          Cancel
        </button>
        <button type="button" onClick={submit} disabled={busy} className="desk-key desk-key-primary disabled:opacity-50">
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          File the version
        </button>
      </div>
    </div>
  );
}