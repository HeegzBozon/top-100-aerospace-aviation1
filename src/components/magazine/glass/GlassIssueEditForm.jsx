import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Send } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';

// The sheet a reader files from the Edit menu: a note to the masthead about the article
// they have just read, or a correction proposed against it.
//
// It stands over the picture the way the machine's own panels do, and it hugs the foot of
// the glass rather than filling it, so the keys rise under the lines being written. The
// fields are walked on the ring — the wheel lands on a line and the centre opens the
// keyboard over it — and nothing is filed until the reader files it.
//
// A note is not a vote and not a measurement: it goes to the masthead and nowhere else.
const LINE =
  'w-full resize-none rounded-xl px-2.5 py-2 text-[12px] leading-relaxed outline-none';

export default function GlassIssueEditForm({ mode = 'note', subject, onClose, onSubmit }) {
  const note = mode === 'note';
  const [summary, setSummary] = useState('');
  const [message, setMessage] = useState('');
  const [cursor, setCursor] = useState(0);

  const refs = useRef({});
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const sendRef = useRef(() => {});

  const fields = note
    ? [
        {
          key: 'message',
          label: 'Your note',
          value: message,
          set: setMessage,
          rows: 4,
          placeholder: 'What should the masthead know about this article?',
        },
      ]
    : [
        {
          key: 'summary',
          label: 'What should change',
          value: summary,
          set: setSummary,
          rows: 2,
          placeholder: 'One line: the correction, in the masthead’s hands',
        },
        {
          key: 'message',
          label: 'How it should read',
          value: message,
          set: setMessage,
          rows: 4,
          placeholder: 'The correction, as you would have it read',
        },
      ];

  const ready = note
    ? message.trim().length >= 4
    : summary.trim().length >= 4 && message.trim().length >= 4;

  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;
  const cursorRef = useRef(0);
  cursorRef.current = cursor;

  sendRef.current = () => {
    if (!ready) return;
    onSubmit?.({
      summary: note ? '' : summary.trim(),
      message: message.trim(),
    });
  };

  const focusField = (index) => {
    const field = fieldsRef.current[index];
    const el = field && refs.current[field.key];
    if (!el) return false;
    el.focus();
    return true;
  };

  const api = useRef(null);
  if (!api.current) {
    const step = (direction) => {
      const count = fieldsRef.current.length + 2;
      const next = cursorRef.current + direction;
      if (next < 0 || next >= count) return null;
      setCursor(next);
      return api.current.labels()[next];
    };
    api.current = {
      labels: () => [...fieldsRef.current.map((field) => field.label), 'Send', 'Cancel'],
      index: () => cursorRef.current,
      step,
      page: (direction) => step(direction),
      goTo: (index) => {
        const count = fieldsRef.current.length + 2;
        if (index < 0 || index >= count) return null;
        setCursor(index);
        return api.current.labels()[index];
      },
      enter: () => {
        const index = cursorRef.current;
        if (index < fieldsRef.current.length) return focusField(index);
        if (index === fieldsRef.current.length) {
          sendRef.current();
          return true;
        }
        closeRef.current?.();
        return true;
      },
      back: () => {
        closeRef.current?.();
        return true;
      },
    };
  }

  useEffect(() => registerPicker(api.current), []);
  useEffect(() => {
    touchPicker();
  }, [cursor, message, summary]);

  // The sheet opens on the first line, with the keyboard under it: the reader pressed an
  // entry that is nothing but writing.
  useEffect(() => {
    focusField(0);
  }, []);

  const active = (index) => cursor === index;

  return (
    <div className="hh-form-panel fixed inset-0 z-[44] flex items-end justify-center md:items-center">
      <div
        className="hh-form-panel-card w-full overflow-y-auto scrollbar-hide md:max-w-[430px]"
        style={{
          background: '#FAF8F5',
          border: '1px solid rgba(30,58,90,0.14)',
          borderRadius: 16,
          boxShadow: '0 22px 44px -18px rgba(7,17,31,0.55)',
        }}
      >
        <div className="px-3 pb-4 pt-3">
          <div
            className="flex items-center justify-between gap-3 pb-2"
            style={{ borderBottom: '1px solid rgba(30,58,90,0.12)' }}
          >
            <p className="text-[8.5px] font-bold uppercase tracking-[0.3em]" style={{ color: P.copper }}>
              Edit
            </p>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-0.5 text-[7.5px] font-bold uppercase tracking-[0.16em]"
              style={{ color: P.navy }}
            >
              <ChevronLeft className="h-3 w-3" /> Back
            </button>
          </div>

          <p className="pt-3 font-heading text-[15px] leading-snug" style={{ color: P.navy }}>
            {note ? 'Add a community note' : 'Request an edit'}
          </p>
          <p className="mt-1 text-[10.5px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.62)' }}>
            {note
              ? 'A note is filed with the masthead against the article you are reading. It is read before the next printing, and it never changes the issue on its own.'
              : 'A correction is put in the masthead’s hands, against the article you are reading. Nothing is reprinted until an editor has read it.'}
          </p>
          {subject ? (
            <p
              className="mt-2 text-[9px] font-bold uppercase tracking-[0.16em]"
              style={{ color: 'rgba(30,58,90,0.45)' }}
            >
              {subject}
            </p>
          ) : null}

          <div className="mt-3 space-y-2.5">
            {fields.map((field, i) => (
              <div key={field.key}>
                <label
                  className="text-[8px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: active(i) ? P.copper : 'rgba(30,58,90,0.45)' }}
                >
                  {field.label}
                </label>
                <textarea
                  ref={(el) => (refs.current[field.key] = el)}
                  rows={field.rows}
                  value={field.value}
                  onChange={(event) => field.set(event.target.value)}
                  onFocus={() => setCursor(i)}
                  placeholder={field.placeholder}
                  className={`${LINE} mt-1`}
                  style={{
                    background: '#fff',
                    border: `1px solid ${active(i) ? P.navy : 'rgba(30,58,90,0.14)'}`,
                    color: P.navy,
                  }}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => sendRef.current()}
            disabled={!ready}
            className="mt-3.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[9px] font-bold uppercase tracking-[0.16em] transition-opacity disabled:opacity-40"
            style={{ background: P.copper, color: P.cream }}
          >
            <Send className="h-3.5 w-3.5" /> {note ? 'File the note' : 'File the correction'}
          </button>

          <p className="mt-2 text-[9.5px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.45)' }}>
            {ready
              ? 'Filed under your name; the masthead sees who wrote it.'
              : 'A line is required before it can be filed.'}
          </p>
        </div>
      </div>
    </div>
  );
}