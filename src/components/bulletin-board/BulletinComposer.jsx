import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useState, useEffect } from 'react';
import { X, Loader2, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { POST_TYPES } from './bulletinConfig';

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'blockquote'],
    [{ list: 'bullet' }, { list: 'ordered' }],
    ['link'],
    ['clean'],
  ],
};

// Format-aware composer. Builds the payload, creates the Bulletin, and closes.
// The tool list refreshes via the useBulletins subscription on create.
export default function BulletinComposer({ open, onClose, user, accent, postType = 'note', editing = null, onSaved }) {
  const cfg = POST_TYPES[postType] || POST_TYPES.note;
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [richBody, setRichBody] = useState('');
  const [tags, setTags] = useState('');
  const [busy, setBusy] = useState(false);

  // Prefill when opening for edit; clear when opening fresh.
  useEffect(() => {
    if (!open) return;
    setTitle(editing?.title || '');
    setBody(editing?.body || '');
    setRichBody(editing?.rich_body || '');
    setTags(editing?.tags?.join(', ') || '');
  }, [open, editing]);

  if (!open) return null;

  const reset = () => { setTitle(''); setBody(''); setRichBody(''); setTags(''); };

  const handleClose = () => { reset(); onClose?.(); };

  const submit = async (status) => {
    if (cfg.hasTitle && !title.trim()) return;
    if (!cfg.hasRichBody && !body.trim()) return;
    if (cfg.hasRichBody && !richBody.trim()) return;
    setBusy(true);
    try {
      const base = {
        scope: 'network',
        post_type: postType,
        status,
        published_date: status === 'published' ? (editing?.published_date || new Date().toISOString()) : editing?.published_date,
        title: cfg.hasTitle ? title.trim().slice(0, 120) : undefined,
        body: cfg.hasRichBody ? undefined : body.trim().slice(0, cfg.bodyMax || 1000),
        rich_body: cfg.hasRichBody ? richBody : undefined,
        tags: cfg.hasTags ? tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 8) : undefined,
      };
      Object.keys(base).forEach((k) => base[k] === undefined && delete base[k]);
      if (editing) {
        await base44.entities.Bulletin.update(editing.id, base);
      } else {
        await base44.entities.Bulletin.create({
          author_email: user.email,
          author_name: user.full_name,
          author_avatar_url: user.avatar_url || '',
          ...base,
        });
      }
      reset();
      onSaved?.();
      onClose?.();
    } catch (e) {
      console.error('Bulletin save failed', e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-[0.16em]" style={{ color: B.navy }}>
            {editing ? 'Edit' : 'New'} {cfg.label}
          </h3>
          <button onClick={handleClose}><X className="w-4 h-4" style={{ color: B.muted }} /></button>
        </div>

        {cfg.hasTitle && (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Subject"
            maxLength={120}
            className="w-full text-sm font-semibold px-3 py-2 rounded-lg mb-2 outline-none"
            style={{ border: `1px solid ${B.border}`, color: B.navy }}
          />
        )}

        {cfg.hasRichBody ? (
          <div className="mb-3">
            <ReactQuill
              theme="snow"
              value={richBody}
              onChange={setRichBody}
              modules={QUILL_MODULES}
              placeholder="Write your dispatch…"
              style={{ background: '#fff' }}
            />
          </div>
        ) : (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a note…"
            maxLength={cfg.bodyMax || 1000}
            rows={4}
            className="w-full text-sm px-3 py-2 rounded-lg mb-3 outline-none resize-y"
            style={{ border: `1px solid ${B.border}`, color: B.navy }}
          />
        )}

        {cfg.hasTags && (
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags, comma-separated"
            className="w-full text-sm px-3 py-2 rounded-lg mb-3 outline-none"
            style={{ border: `1px solid ${B.border}`, color: B.navy }}
          />
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => submit('draft')}
            disabled={busy}
            className="flex-1 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.14em] disabled:opacity-60"
            style={{ border: `1px solid ${B.border}`, color: B.navy, background: 'transparent' }}
          >
            Save draft
          </button>
          <button
            onClick={() => submit('published')}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60"
            style={{ background: B.navy }}
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Publish
          </button>
        </div>
      </div>
    </div>
  );
}