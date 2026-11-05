import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, FileText, FileUp, Loader2, X } from 'lucide-react';
import { TC } from '@/components/admin/timecard/timecardConfig';

// The desk's reading tray. A log kept elsewhere — a Gemini Notebook session summary, a
// transcript, a CSV of timestamps, a screenshot of a timer — is dropped here, and the
// reader turns it into a draft session. Pasting the log is the second way in, set below
// the tray. Nothing is filed from this panel.
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
    const chosen = pickedFile;
    const body = pickedText;
    setError('');
    if (!body.trim() && !chosen) {
      setError('Drop the work log, or paste the session as logged.');
      return;
    }
    setReading(true);
    try {
      let fileUri = '';
      let fileName = '';
      if (chosen && !isTextual(chosen)) {
        const uploaded = await base44.integrations.Core.UploadPrivateFile({ file: chosen });
        fileUri = uploaded?.file_uri || '';
        fileName = chosen.name;
        if (!fileUri) throw new Error('That file could not be uploaded.');
      }

      const response = await base44.functions.invoke('parseWorklog', {
        text: body.trim(),
        file_uri: fileUri,
        file_name: fileName,
      });
      const data = response?.data || {};
      if (data.error) throw new Error(data.error);
      if (!data.draft) throw new Error('Nothing could be read out of that log.');

      onParsed(
        {
          ...data.draft,
          source_text: body.trim(),
          source_label: chosen ? chosen.name : 'Pasted work log',
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
      style={bare ? undefined : { background: TC.surface, border: `1px solid ${TC.copper}` }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        takeFile(event.dataTransfer.files?.[0]);
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: TC.gold }}>Read a work log</p>
          <p className="mt-1 text-xs" style={{ color: TC.soft }}>
            Nothing is filed until you have reviewed it.
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

      {/* The tray: the sheet's one loud element. A log goes in here. */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="block w-full rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors"
        style={{
          borderColor: dragging ? TC.gold : TC.copper,
          background: dragging ? 'rgba(184,115,51,0.16)' : 'rgba(255,255,255,0.025)',
        }}
      >
        <span
          className="mx-auto flex h-11 w-11 items-center justify-center rounded-full"
          style={{ background: TC.copperDeep, color: '#fdf8f0' }}
        >
          <FileUp className="h-5 w-5" />
        </span>
        <span className="mt-2.5 block font-heading text-base leading-tight" style={{ color: '#f5efe4' }}>
          Drop the work log here
        </span>
        <span className="mt-1 block text-[11px]" style={{ color: TC.soft }}>
          PDF, document, screenshot or text export — read into a draft at once
        </span>
        <span className="mt-2.5 inline-block text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: TC.gold }}>
          or choose a file
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,.markdown,.csv,.json,.log,.pdf,.docx,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={(event) => takeFile(event.target.files?.[0])}
      />

      {file && (
        <div
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px]"
          style={{ border: `1px solid ${TC.line}`, color: TC.ink }}
        >
          <FileText className="h-3.5 w-3.5 flex-shrink-0" style={{ color: TC.gold }} />
          <span className="truncate">{file.name}</span>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              if (isTextual(file)) setText('');
            }}
            className="ml-auto rounded p-0.5 hover:bg-white/10"
            title="Remove file"
            style={{ color: TC.soft }}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <p className="text-[10px]" style={{ color: TC.dim }}>
        Files are read from a private upload (stored privately).
      </p>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="h-px flex-1" style={{ background: TC.line }} />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: TC.dim }}>or paste it</span>
          <span className="h-px flex-1" style={{ background: TC.line }} />
        </div>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={4}
          className={`${FIELD} font-mono text-[12px] leading-relaxed`}
          style={fieldStyle}
          placeholder={'2 Nov 2026 — 9:10 to 11:40 · Issue 42 profile spread\n- Drafted the opening paragraphs (50 min)\nDeliverables: draft_v3.docx'}
        />
      </div>

      {error && (
        <p className="flex items-center gap-2 text-xs" style={{ color: '#f2a1a1' }}>
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => read(null, text)}
          disabled={reading || !text.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold disabled:opacity-50"
          style={{ background: TC.copperDeep, color: '#fdf8f0' }}
        >
          {reading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {reading ? 'Reading the log…' : 'Read pasted log'}
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