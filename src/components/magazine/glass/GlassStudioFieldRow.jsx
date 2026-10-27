import { useEffect, useState } from 'react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// One thing an editor can change, on the glass. The ring walks the rows; A puts the
// cursor into a line of copy — the keys come up and the chin goes, exactly as it does
// anywhere else — and a row of choices steps to the next option on the same press,
// so a status or a section type is set without ever opening a keyboard. A line is
// banked when the cursor leaves it.
export default function GlassStudioFieldRow({ field, index, focused, inputRef, onCommit }) {
  const [draft, setDraft] = useState(field.value ?? '');

  useEffect(() => {
    if (!focused) setDraft(field.value ?? '');
  }, [field.value, focused]);

  const bank = () => {
    if (draft !== (field.value ?? '')) onCommit?.(field.key, draft);
  };

  const rowStyle = {
    background: focused ? P.navy : '#fff',
    border: `1px solid ${focused ? P.navy : 'rgba(30,58,90,0.1)'}`,
  };

  if (field.kind === 'action') {
    return (
      <button
        type="button"
        onClick={() => onCommit?.(field.key, true)}
        className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left"
        style={{ ...rowStyle, background: focused ? P.copper : '#fff', border: `1px solid ${focused ? P.copper : 'rgba(184,115,51,0.35)'}` }}
      >
        <span className="w-6 flex-none font-mono text-[10px]" style={{ color: focused ? P.cream : 'rgba(184,115,51,0.7)' }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="flex-1 text-[12px] font-medium" style={{ color: focused ? P.cream : P.copper }}>
          {field.label}
        </span>
      </button>
    );
  }

  if (field.kind === 'choice') {
    return (
      <div className="rounded-xl px-2.5 py-2" style={rowStyle}>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px]" style={{ color: focused ? P.gold : 'rgba(30,58,90,0.35)' }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="flex-1 text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: focused ? 'rgba(250,248,245,0.6)' : 'rgba(30,58,90,0.45)' }}>
            {field.label}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-[0.14em]" style={{ color: focused ? P.gold : 'rgba(30,58,90,0.35)' }}>
            A Next
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {field.options.map((option) => {
            const on = option.value === field.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onCommit?.(field.key, option.value)}
                className="rounded-full px-2 py-1 text-[10px] font-medium"
                style={{
                  background: on ? (focused ? P.cream : P.navy) : focused ? 'rgba(250,248,245,0.12)' : 'rgba(30,58,90,0.06)',
                  color: on ? (focused ? P.navy : P.cream) : focused ? 'rgba(250,248,245,0.75)' : 'rgba(30,58,90,0.6)',
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const shared = {
    value: draft,
    onChange: (event) => setDraft(event.target.value),
    onBlur: bank,
    className: 'mt-1.5 w-full rounded-lg px-2 py-2 text-[12px] leading-relaxed outline-none',
    style: {
      background: focused ? 'rgba(250,248,245,0.96)' : '#fff',
      border: `1px solid ${focused ? P.gold : 'rgba(30,58,90,0.14)'}`,
      color: P.navy,
      resize: 'none',
    },
  };

  return (
    <div className="rounded-xl px-2.5 py-2" style={rowStyle}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px]" style={{ color: focused ? P.gold : 'rgba(30,58,90,0.35)' }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="flex-1 text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: focused ? 'rgba(250,248,245,0.6)' : 'rgba(30,58,90,0.45)' }}>
          {field.label}
        </span>
        <span className="text-[8px] font-bold uppercase tracking-[0.14em]" style={{ color: focused ? P.gold : 'rgba(30,58,90,0.35)' }}>
          A Write
        </span>
      </div>
      {field.kind === 'long' ? (
        <textarea {...shared} ref={inputRef} rows={7} placeholder={field.placeholder} />
      ) : (
        <input {...shared} ref={inputRef} type="text" placeholder={field.placeholder} />
      )}
      <p className="mt-1 text-[8.5px]" style={{ color: focused ? 'rgba(250,248,245,0.55)' : 'rgba(30,58,90,0.35)' }}>
        Saved when the cursor leaves the line.
      </p>
    </div>
  );
}