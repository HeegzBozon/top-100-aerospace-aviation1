import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, FileUp, Loader2, X } from 'lucide-react';
import { TC } from '@/components/admin/timecard/timecardConfig';

// The desk's reading tray. A log kept elsewhere — a Gemini Notebook session summary, a
// transcript, a CSV of timestamps, a screenshot of a timer — is pasted or attached here,
// and the reader turns it into a draft session. Nothing is filed from this panel.
const TEXTUAL = /\.(txt|md|markdown|csv|json|log)$/i;

const FIELD = 'w-full rounded-lg px-2.5 py-2 text-sm outline-none focus:ring-1';
const fieldStyle = { background: '#0e141b', border: `1px solid ${TC.line}`, color: TC.ink };

const isTextual = (file) => !!file && (TEXTUAL.test(file.name) || file.type.startsWith('text/'));

export default function WorklogImport({ onParsed, onCancel, bare = false }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const [dragging, setDragging] = useState(false);

  // Attaching or dropping a file reads it straight away: one step from file to draft.
  const takeFile = async (picked) => {
    if (!picked) return;
    setError('');
    setFile(picked);
    // A plain text export is read here, on the desk; anything else is handed to the reader.
    if (isTextual(picked)) {
      let content = '';
      try {
        content = await picked.text();
        setText(content);
      } catch {
        setError('That text file could not be read. Paste its contents instead.');
        return;
      }
      read(picked, content);
    } else {
      read(picked, '');
    }
  };

  const read = async (pickedFile = file, pickedText = text) => {
    const file = pickedFile;
    const text = pickedText;
    setError('');
    if (!text.trim() && !file) {
      setError('Paste the work log, or attach the file it was exported to.');
      return;
    }
    setReading(true);
    try {
      let fileUri = '';
      let fileName = '';
      if (file && !isTextual(file)) {
        const uploaded = await base44.integrations.Core.UploadPrivateFile({ file });
        fileUri = uploaded?.file_uri || '';
        fileName = file.name;
        if (!fileUri) throw new Error('That file could not be uploaded.');
      }

      const response = await base44.functions.invoke('parseWorklog', {
        text: text.trim(),
        file_uri: fileUri,
        file_name: fileName,
      });
      const data = response?.data || {};
      if (data.error) throw new Error(data.error);
      if (!data.draft) throw new Error('Nothing could be read out of that log.');

      onParsed(
        {
          ...data.draft,
          source_text: text.trim(),
          source_label: file ? file.name : 'Pasted work log',
          fingerprint: data.fingerprint || '',
        },
        data.duplicate || null,
      );
    } catch (err) {
      setError(err?.message || 'The work log could not be read.');
    } finally {
      setReading(false);
    }
  };

  return (
    <div
      className={bare ? 'space-y-3' : 'rounded-xl p-3.5 space-y-3'}
      style={
        bare
          ? dragging
            ? { outline: `1px dashed ${TC.copper}`, outlineOffset: '4px', borderRadius: 8 }
            : undefined
          : { background: TC.surface, border: `1px ${dragging ? 'dashed' : 'solid'} ${TC.copper}` }
      }
      onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        takeFile(event.dataTransfer.files?.[0]);
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: TC.gold }}>Import a work log</p>
          <p className="mt-1 text-xs" style={{ color: TC.soft }}>
            Drop a work log here (PDF, document, screenshot or text) and it is read into a draft at once, or
            paste the session as logged. Nothing is filed until you have reviewed it.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          title="Close"
          className="rounded-md p-1.5 hover:bg-white/10"
          style={{ color: TC.soft }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={7}
        className={`${FIELD} font-mono text-[12px] leading-relaxed`}
        style={fieldStyle}
        placeholder={'2 Nov 2026 — 9:10 to 11:40 · Issue 42 profile spread\n- Drafted the opening paragraphs (50 min)\n- Laid out the portrait page\nDeliverables: draft_v3.docx'}
      />

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.md,.markdown,.csv,.json,.log,.pdf,.docx,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(event) => takeFile(event.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
          style={{ background: 'rgba(255,255,255,0.06)', color: TC.ink, border: `1px solid ${TC.line}` }}
        >
          <FileUp className="h-3.5 w-3.5" /> Attach file
        </button>
        {file && (
          <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: TC.soft }}>
            {file.name}
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (isTextual(file)) setText('');
              }}
              className="rounded p-0.5 hover:bg-white/10"
              title="Remove file"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        <span className="text-[10px]" style={{ color: TC.dim }}>
          PDFs, documents and screenshots are read from a private upload (stored privately).
        </span>
      </div>

      {error && (
        <p className="flex items-center gap-2 text-xs" style={{ color: '#f2a1a1' }}>
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => read(file, text)}
          disabled={reading}
          className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold disabled:opacity-50"
          style={{ background: TC.copperDeep, color: '#fdf8f0' }}
        >
          {reading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {reading ? 'Reading the log…' : 'Read work log'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3.5 py-2 text-xs font-medium"
          style={{ background: 'transparent', color: TC.soft, border: `1px solid ${TC.line}` }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}