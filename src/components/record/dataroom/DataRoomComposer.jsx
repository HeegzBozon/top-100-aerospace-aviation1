import { useState } from 'react';
import { Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { kindLabel, roomAudience } from './dataRoomConfig';

// Filing one document into one audience's folder.
//
// The kinds offered are the ones that audience actually asks for, and nothing is created
// until the document has a title: a room is an index, not a pile. An upload is stored
// privately and read back only through a signed address.
export default function DataRoomComposer({ email, audienceKey, onFiled, onClose }) {
  const audience = roomAudience(audienceKey);
  const [form, setForm] = useState({ kind: audience.kinds[0], title: '', note: '', url: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const file_it = async () => {
    if (!email || !form.title.trim()) {
      setError('A document needs a title before it can be filed.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      let fileUri = '';
      if (file) {
        const uploaded = await base44.integrations.Core.UploadPrivateFile({ file });
        fileUri = uploaded?.file_uri || '';
      }
      const row = await base44.entities.DataRoomItem.create({
        fellow_email: email,
        audience: audienceKey,
        kind: form.kind,
        title: form.title.trim(),
        note: form.note.trim(),
        url: form.url.trim(),
        file_uri: fileUri,
        file_name: file?.name || '',
      });
      onFiled(row);
      onClose();
    } catch (err) {
      setError(err?.message || 'The document could not be filed just now.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 border border-editorial-copper/35 bg-editorial-cream p-4">
      <p className="pd-label">File into the {audience.label} folder</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="font-body text-[9.5px] font-bold uppercase tracking-[0.16em] text-editorial-label">
            Kind
          </span>
          <select
            value={form.kind}
            onChange={(event) => set('kind', event.target.value)}
            className="mt-1 w-full border border-editorial-navy/20 bg-editorial-cream px-2.5 py-2 font-body text-[12px] text-editorial-navy focus:border-editorial-copper focus:outline-none"
          >
            {audience.kinds.map((kind) => (
              <option key={kind} value={kind}>
                {kindLabel(kind)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="font-body text-[9.5px] font-bold uppercase tracking-[0.16em] text-editorial-label">
            Title
          </span>
          <input
            value={form.title}
            onChange={(event) => set('title', event.target.value)}
            maxLength={90}
            placeholder="Series A one-pager"
            className="mt-1 w-full border border-editorial-navy/20 bg-editorial-cream px-2.5 py-2 font-body text-[12px] text-editorial-navy placeholder:text-editorial-navy/35 focus:border-editorial-copper focus:outline-none"
          />
        </label>
      </div>

      <label className="mt-3 block">
        <span className="font-body text-[9.5px] font-bold uppercase tracking-[0.16em] text-editorial-label">
          What the reader will find
        </span>
        <input
          value={form.note}
          onChange={(event) => set('note', event.target.value)}
          maxLength={140}
          placeholder="Two pages: the mission, the market, the round."
          className="mt-1 w-full border border-editorial-navy/20 bg-editorial-cream px-2.5 py-2 font-body text-[12px] text-editorial-navy placeholder:text-editorial-navy/35 focus:border-editorial-copper focus:outline-none"
        />
      </label>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="font-body text-[9.5px] font-bold uppercase tracking-[0.16em] text-editorial-label">
            Document (stored privately)
          </span>
          <span className="mt-1 flex items-center gap-2 border border-editorial-navy/20 bg-editorial-cream px-2.5 py-1.5">
            <Upload className="h-3.5 w-3.5 shrink-0 text-editorial-navy/45" aria-hidden="true" />
            <input
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="min-w-0 flex-1 font-body text-[11px] text-editorial-navy/70"
            />
          </span>
        </label>

        <label className="block">
          <span className="font-body text-[9.5px] font-bold uppercase tracking-[0.16em] text-editorial-label">
            Or an address
          </span>
          <input
            value={form.url}
            onChange={(event) => set('url', event.target.value)}
            placeholder="https://"
            className="mt-1 w-full border border-editorial-navy/20 bg-editorial-cream px-2.5 py-2 font-body text-[12px] text-editorial-navy placeholder:text-editorial-navy/35 focus:border-editorial-copper focus:outline-none"
          />
        </label>
      </div>

      {error && (
        <p className="mt-2 font-body text-[11px] leading-relaxed text-editorial-copper">{error}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={file_it}
          disabled={saving}
          className="desk-key desk-key-primary disabled:opacity-50"
        >
          {saving ? 'Filing' : 'File it'}
        </button>
        <button type="button" onClick={onClose} className="desk-key">
          Cancel
        </button>
      </div>
    </div>
  );
}