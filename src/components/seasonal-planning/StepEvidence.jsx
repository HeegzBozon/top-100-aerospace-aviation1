import { useState } from 'react';
import { Link2, Loader2, Upload, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AttachmentChip from './AttachmentChip';

// The open agenda item: rename it, write whatever happened, attach any file or link.
export default function StepEvidence({ record, defaults, canEdit, onSave }) {
  const [title, setTitle] = useState(record.title || defaults.title);
  const [detail, setDetail] = useState(record.detail || defaults.detail);
  const [notes, setNotes] = useState(record.notes || '');
  const [files, setFiles] = useState(record.attachments || []);
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const upload = async (e) => {
    const list = Array.from(e.target.files || []);
    e.target.value = '';
    if (!list.length) return;
    setBusy(true);
    const added = await Promise.all(list.map(async (f) => {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: f });
      return { name: f.name, file_uri, mime: f.type };
    }));
    setFiles((x) => [...x, ...added]);
    setBusy(false);
  };

  const addLink = () => { if (!link.trim()) return; setFiles((x) => [...x, { name: link.trim(), url: link.trim() }]); setLink(''); };

  const save = async () => {
    setBusy(true);
    await onSave({ title: title === defaults.title ? '' : title, detail: detail === defaults.detail ? '' : detail, notes, attachments: files });
    setBusy(false); setMsg('Saved'); setTimeout(() => setMsg(''), 1500);
  };

  if (!canEdit) {
    return (
      <div className="space-y-2 px-10 pb-3">
        {record.notes ? <p className="whitespace-pre-wrap font-body text-[12px] text-editorial-navy">{record.notes}</p> : <p className="font-body text-[11px] italic text-editorial-navy/50">No evidence recorded yet.</p>}
        <div className="flex flex-wrap gap-1.5">{files.map((a, i) => <AttachmentChip key={i} a={a} />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-2 px-10 pb-3">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-[13px]" aria-label="Title" />
      <Textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={2} className="text-[12px]" aria-label="Description" />
      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Notes, decisions, outcomes — whatever you captured" className="text-[12px]" />
      <div className="flex flex-wrap gap-1.5">
        {files.map((a, i) => (
          <span key={i} className="flex items-center">
            <AttachmentChip a={a} />
            <button type="button" onClick={() => setFiles((x) => x.filter((_, j) => j !== i))} aria-label="Remove" className="ml-0.5 text-editorial-navy/40 hover:text-editorial-navy"><X className="h-3 w-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex cursor-pointer items-center gap-1 rounded border border-editorial-navy/20 px-2 py-1 font-body text-[11px] font-semibold text-editorial-navy hover:bg-editorial-cream">
          <Upload className="h-3 w-3" />Attach files
          <input type="file" multiple className="hidden" onChange={upload} />
        </label>
        <div className="flex flex-1 items-center gap-1">
          <Input value={link} onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addLink()} placeholder="Paste a link" className="h-7 min-w-0 text-[12px]" />
          <button type="button" onClick={addLink} aria-label="Add link" className="text-editorial-navy"><Link2 className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={save} disabled={busy} className="flex items-center gap-1 rounded bg-editorial-copper px-3 py-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-editorial-cream disabled:opacity-60">
          {busy && <Loader2 className="h-3 w-3 animate-spin" />}Save
        </button>
        {msg && <span className="font-body text-[11px] text-editorial-label">{msg}</span>}
      </div>
    </div>
  );
}