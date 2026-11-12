import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, CornerDownRight, RotateCcw, Trash2, X } from 'lucide-react';
import { formatDay, kindMeta, recordMeta, recordTitle, toPlain } from './basecampConfig';

// One record, opened: what it says, who it is with, the conversation under it, and the keys
// the house holds over it. Every write goes back through the server, so the record on the
// screen is re-read after the account has answered.
export default function BasecampRecordPanel({ kind, record, projectId, call, onClose, onChanged }) {
  const meta = kindMeta(kind);
  const [comments, setComments] = useState([]);
  const [commentsState, setCommentsState] = useState(kind === 'people' ? 'none' : 'loading');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: recordTitle(record),
    content: toPlain(record.content),
    due_on: record.due_on ? String(record.due_on).slice(0, 10) : '',
  });
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (kind === 'people') return;
    let live = true;
    call({ action: 'comments', projectId, recordId: record.id })
      .then((data) => {
        if (!live) return;
        setComments(data.comments || []);
        setCommentsState('ready');
      })
      .catch((err) => {
        if (!live) return;
        setError(err.message);
        setCommentsState('error');
      });
    return () => {
      live = false;
    };
  }, [call, kind, projectId, record.id]);

  const run = async (label, payload) => {
    setBusy(label);
    setError('');
    try {
      const data = await call(payload);
      await onChanged(data);
      if (label === 'save') {
        setEditing(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const postComment = async () => {
    const content = draft.trim();
    if (!content) return;
    setSending(true);
    setError('');
    try {
      const data = await call({
        action: 'createComment',
        projectId,
        recordId: record.id,
        content,
      });
      setComments((prev) => [...prev, ...(data.comments || [])]);
      setDraft('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const save = () => {
    const payload = { action: kind === 'todos' ? 'updateTodo' : 'updateMessage', projectId, recordId: record.id };
    if (kind === 'todos') {
      payload.content = form.title.trim();
      payload.description = form.content;
      payload.due_on = form.due_on || null;
    } else {
      payload.subject = form.title.trim();
      payload.content = form.content;
    }
    run('save', payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/65 p-3 backdrop-blur-sm md:p-8">
      <div className="desk-plate w-full max-w-2xl">
        <div className="flex items-start justify-between gap-3 px-4 pb-2 pt-3.5">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-editorial-gold">
              {meta.one}
            </p>
            <h3 className="mt-1 font-heading text-[18px] leading-tight text-editorial-cream">
              {recordTitle(record)}
            </h3>
            {recordMeta(record, kind) && (
              <p className="mt-1 text-[10.5px] text-editorial-cream/50">{recordMeta(record, kind)}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close record"
            className="rounded p-1.5 text-editorial-cream/60 hover:text-editorial-cream"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="desk-rule" />

        <div className="space-y-3 px-4 py-3.5">
          {record.due_on && kind === 'todos' && (
            <p className="text-[10.5px] uppercase tracking-[0.14em] text-editorial-cream/50">
              Due {formatDay(record.due_on)}
              {record.completed ? ' · complete' : ''}
            </p>
          )}

          {editing ? (
            <div className="space-y-2">
              <label className="block text-[9px] font-bold uppercase tracking-[0.24em] text-editorial-gold">
                {kind === 'todos' ? 'To-do' : 'Subject'}
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="desk-face w-full rounded px-2.5 py-2 text-[13px] text-editorial-navy outline-none"
              />
              <label className="block text-[9px] font-bold uppercase tracking-[0.24em] text-editorial-gold">
                Notes
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                rows={5}
                className="desk-face w-full rounded px-2.5 py-2 text-[12.5px] leading-relaxed text-editorial-navy outline-none"
              />
              {kind === 'todos' && (
                <>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.24em] text-editorial-gold">
                    Due
                  </label>
                  <input
                    type="date"
                    value={form.due_on}
                    onChange={(e) => setForm((prev) => ({ ...prev, due_on: e.target.value }))}
                    className="desk-face w-full rounded px-2.5 py-2 text-[12.5px] text-editorial-navy outline-none"
                  />
                </>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={save}
                  disabled={busy === 'save'}
                  className="desk-key desk-key-primary"
                >
                  {busy === 'save' ? 'Saving' : 'Save changes'}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="desk-key desk-key-quiet">
                  Leave as it was
                </button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-editorial-cream/80">
              {toPlain(record.content) || 'This record carries no notes.'}
            </p>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded px-2.5 py-2" style={{ background: 'rgba(232,161,161,0.10)' }}>
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-300" />
              <p className="text-[11px] leading-relaxed text-red-200">{error}</p>
            </div>
          )}

          {!editing && meta.writable && (
            <div className="flex flex-wrap gap-2 border-t pt-3" style={{ borderColor: 'rgba(201,168,124,0.22)' }}>
              {kind === 'todos' && (
                <button
                  type="button"
                  onClick={() =>
                    run('toggle', {
                      action: 'toggleTodo',
                      projectId,
                      recordId: record.id,
                      complete: !record.completed,
                    })
                  }
                  disabled={busy === 'toggle'}
                  className="desk-key"
                >
                  {record.completed ? <RotateCcw className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                  {record.completed ? 'Reopen' : 'Mark complete'}
                </button>
              )}
              <button type="button" onClick={() => setEditing(true)} className="desk-key">
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm(`Send "${recordTitle(record)}" to Basecamp's trash?`)) return;
                  run('trash', { action: 'trash', projectId, recordId: record.id, kind });
                }}
                disabled={busy === 'trash'}
                className="desk-key desk-key-quiet"
              >
                <Trash2 className="h-3 w-3" /> Trash
              </button>
            </div>
          )}

          {commentsState !== 'none' && (
            <div className="border-t pt-3" style={{ borderColor: 'rgba(201,168,124,0.22)' }}>
              <p className="text-[9px] font-bold uppercase tracking-[0.26em] text-editorial-gold">
                Comments
              </p>
              {commentsState === 'loading' && (
                <div className="mt-2 h-10 animate-pulse rounded" style={{ background: '#111d2a' }} />
              )}
              {commentsState === 'error' && (
                <p className="mt-2 text-[11px] text-editorial-cream/55">
                  The comments under this record could not be read.
                </p>
              )}
              {commentsState === 'ready' && !comments.length && (
                <p className="mt-1.5 text-[11px] text-editorial-cream/50">
                  No one has commented on this record.
                </p>
              )}
              <div className="mt-2 space-y-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2">
                    <CornerDownRight className="mt-1 h-3 w-3 flex-shrink-0 text-editorial-cream/25" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-editorial-cream/45">
                        {comment.creator?.name || 'Someone'} · {formatDay(comment.created_at)}
                      </p>
                      <p className="whitespace-pre-line text-[11.5px] leading-relaxed text-editorial-cream/75">
                        {toPlain(comment.content)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2.5 flex flex-col gap-1.5 sm:flex-row">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Add a comment"
                  className="desk-face min-w-0 flex-1 rounded px-2.5 py-2 text-[12px] text-editorial-navy outline-none"
                />
                <button
                  type="button"
                  onClick={postComment}
                  disabled={sending || !draft.trim()}
                  className="desk-key desk-key-primary justify-center"
                >
                  {sending ? 'Sending' : 'Comment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}