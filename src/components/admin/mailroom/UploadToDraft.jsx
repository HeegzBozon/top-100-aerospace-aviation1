import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, FileUp, Loader2, X } from 'lucide-react';

// THE READING TRAY OF THE COMPOSER.
//
// A document is dropped in — a report, a set of notes, a rough article, a screenshot of one —
// and it comes back as a draft issue: headline, the gist of each item, why it matters, the
// quick hits and a sign-off. Several files may go in at once; they are read together, as one
// issue, never as one issue each.
//
// Nothing is posted from here. The draft lands in the composer, where it is read, changed and
// saved like any other letter.

const input =
  'w-full rounded-md px-2.5 py-1.5 text-xs outline-none placeholder:text-[#5f7387]';
const style = {
  background: 'rgba(6,12,20,0.55)',
  color: '#efe9dc',
  border: '1px solid rgba(201,168,124,0.22)',
};

export default function UploadToDraft({ onDraft, onClose }) {
  const [files, setFiles] = useState([]);
  const [note, setNote] = useState('');
  const [reading, setReading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const addFiles = (picked) => {
    const incoming = Array.from(picked || []).filter(Boolean);
    if (!incoming.length) return;
    setError('');
    setFiles((current) => [...current, ...incoming].slice(0, 5));
  };

  const write = async () => {
    if (!files.length) {
      setError('Drop a document in, or choose a file.');
      return;
    }
    setError('');
    setReading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const result = await base44.integrations.Core.UploadPrivateFile({ file });
        const fileUri = result?.file_uri || '';
        if (!fileUri) throw new Error(`${file.name} could not be uploaded.`);
        uploaded.push({ file_uri: fileUri, name: file.name });
      }

      const response = await base44.functions.invoke('draftLetterFromUpload', {
        files: uploaded,
        note: note.trim(),
      });
      const data = response?.data || {};
      if (data.error) throw new Error(data.error);
      if (!data.draft) throw new Error('Nothing could be read out of that material.');

      onDraft(data.draft);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'That material could not be read.');
    } finally {
      setReading(false);
    }
  };

  return (
    <div
      className="desk-plate space-y-3 p-3.5"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        addFiles(event.dataTransfer.files);
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.22em]" style={{ color: '#c9a87c' }}>
            Draft an issue from a document
          </p>
          <p className="mt-1 text-[11px]" style={{ color: '#7d94aa' }}>
            The material is read into a draft. Nothing is posted, and nothing is saved until you save it.
          </p>
        </div>
        <button type="button" onClick={onClose} className="rounded p-1 hover:bg-white/10" title="Close" style={{ color: '#7d94aa' }}>
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="block w-full rounded-lg border-2 border-dashed px-4 py-6 text-center"
        style={{
          borderColor: dragging ? '#c9a87c' : 'rgba(201,168,124,0.32)',
          background: dragging ? 'rgba(184,115,51,0.16)' : 'rgba(255,255,255,0.02)',
        }}
      >
        <FileUp className="mx-auto h-5 w-5" style={{ color: '#c9a87c' }} />
        <span className="mt-2 block font-heading text-sm leading-tight" style={{ color: '#f5efe4' }}>
          Drop the material here
        </span>
        <span className="mt-1 block text-[10.5px]" style={{ color: '#7d94aa' }}>
          PDF, document, text export or screenshot · up to five files, read as one issue
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".txt,.md,.markdown,.csv,.json,.log,.pdf,.docx,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = '';
        }}
      />

      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 rounded px-2.5 py-1.5 text-[11px]"
              style={{ border: '1px solid rgba(250,248,245,0.08)', color: '#dbe6ef' }}
            >
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => setFiles((current) => current.filter((_, position) => position !== index))}
                className="ml-auto rounded p-0.5 hover:bg-white/10"
                title="Remove"
                style={{ color: '#7d94aa' }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <p className="text-[10px]" style={{ color: '#5f7387' }}>
            Files are read from a private upload (stored privately).
          </p>
        </div>
      )}

      <label className="block">
        <span className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: '#7d94aa' }}>
          What should this become?
        </span>
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Optional — e.g. lead on the 2026 cohort, keep it to one item"
          className={`${input} mt-1`}
          style={style}
        />
      </label>

      {error && (
        <p className="flex items-center gap-2 rounded px-2.5 py-2 text-[11px]" style={{ background: 'rgba(242,161,161,0.1)', color: '#f2a1a1' }}>
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button type="button" onClick={write} disabled={reading || !files.length} className="desk-key desk-key-primary">
          {reading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileUp className="h-3.5 w-3.5" />}
          {reading ? 'Reading the material…' : 'Write the draft'}
        </button>
        <button type="button" onClick={onClose} className="desk-key desk-key-quiet">
          Cancel
        </button>
      </div>
    </div>
  );
}