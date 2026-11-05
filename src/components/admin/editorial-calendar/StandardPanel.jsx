import { useState } from 'react';
import { Pencil } from 'lucide-react';
import StandardEditor from './StandardEditor';

const LABEL = 'text-[9px] font-bold uppercase tracking-[0.24em]';

function List({ heading, items, tone = '#dbe6ef' }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className={LABEL} style={{ color: '#5f7488' }}>
        {heading}
      </p>
      <ul className="mt-1 space-y-0.5">
        {items.map((item) => (
          <li key={item} className="text-[10.5px] leading-4" style={{ color: tone }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// THE STANDARD — the editorial policy every issue is drafted to and reviewed against.
//
// It is held as a version, not as a document, because a letter already sent has to stay
// readable against the rules that were in force when it was written.
export default function StandardPanel({ standard, busy, onSave }) {
  const [editing, setEditing] = useState(false);

  if (!standard) {
    return (
      <div className="desk-plate p-6">
        <p className="font-heading text-lg" style={{ color: '#f5efe4' }}>
          No standard is in force
        </p>
        <p className="mt-1.5 max-w-md text-[11px] leading-5" style={{ color: '#7d94aa' }}>
          Filing the playbook grid also files the editorial style guide as version 1. Nothing is drafted to a
          standard until one exists.
        </p>
      </div>
    );
  }

  if (editing) {
    return (
      <StandardEditor
        standard={standard}
        busy={busy}
        onSave={(patch) => {
          onSave(patch);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="desk-plate p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={LABEL} style={{ color: '#c9a87c' }}>
              {standard.title || 'Editorial standard'} · v{standard.version}
            </p>
            <p className="mt-2 max-w-2xl text-[12px] leading-6" style={{ color: '#f5efe4' }}>
              {standard.stance}
            </p>
            {standard.effective_from ? (
              <p className="mt-1.5 text-[9.5px]" style={{ color: '#5f7488' }}>
                In force from {standard.effective_from}
              </p>
            ) : null}
          </div>
          <button type="button" onClick={() => setEditing(true)} className="desk-key">
            <Pencil className="h-3 w-3" />
            File a new version
          </button>
        </div>
      </div>

      {standard.structure?.length ? (
        <div className="desk-plate p-4">
          <p className={LABEL} style={{ color: '#c9a87c' }}>
            The standard issue, in order
          </p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr style={{ color: '#5f7488' }}>
                  {['Section', 'Words', 'Byline', 'Job'].map((head) => (
                    <th key={head} className="pb-1 text-[8px] font-bold uppercase tracking-[0.16em]">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standard.structure.map((row) => (
                  <tr key={row.section} style={{ borderTop: '1px solid rgba(201,168,124,0.12)' }}>
                    <td className="py-1.5 pr-3 text-[10.5px]" style={{ color: '#f5efe4' }}>
                      {row.section}
                    </td>
                    <td className="py-1.5 pr-3 text-[10.5px]" style={{ color: '#c9a87c' }}>
                      {row.words}
                    </td>
                    <td className="py-1.5 pr-3 text-[10.5px]" style={{ color: '#8fa6ba' }}>
                      {row.byline}
                    </td>
                    <td className="py-1.5 text-[10.5px]" style={{ color: '#7d94aa' }}>
                      {row.job}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {standard.lengths?.length ? (
        <div className="desk-plate p-4">
          <p className={LABEL} style={{ color: '#c9a87c' }}>
            Lengths by issue type
          </p>
          <div className="mt-2 space-y-1">
            {standard.lengths.map((row) => (
              <div key={row.type} className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[10.5px]" style={{ color: '#f5efe4' }}>
                  {row.type}
                </p>
                <p className="text-[10px]" style={{ color: '#7d94aa' }}>
                  <span style={{ color: '#c9a87c' }}>{row.words}</span> · {row.what_changes}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="desk-plate grid gap-4 p-4 sm:grid-cols-2">
        <List heading="Voice, do" items={standard.voice_do} />
        <List heading="Voice, do not" items={standard.voice_dont} tone="#c9b8a6" />
        <List heading="Words the house uses" items={standard.use_words} />
        <List heading="Words the house never uses" items={standard.never_words} tone="#c9b8a6" />
        <List heading="Banned words" items={standard.banned_words} tone="#c9b8a6" />
        <List heading="Punctuation" items={standard.punctuation} />
        <List heading="Sourcing and attribution" items={standard.sourcing} />
        <List heading="Open decisions" items={standard.open_decisions} />
      </div>

      {standard.gates?.length ? (
        <div className="desk-plate p-4">
          <p className={LABEL} style={{ color: '#c9a87c' }}>
            What clears before an issue goes out
          </p>
          <div className="mt-2 space-y-1">
            {standard.gates.map((row) => (
              <div key={row.gate} className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[10.5px]" style={{ color: '#f5efe4' }}>
                  {row.gate} · <span style={{ color: '#c9a87c' }}>{row.owner}</span>
                </p>
                <p className="max-w-md text-[10px] text-right" style={{ color: '#7d94aa' }}>
                  {row.covers}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}