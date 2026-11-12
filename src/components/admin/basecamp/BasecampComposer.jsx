import { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { kindMeta } from './basecampConfig';

// Filing something new into the project already open. A to-do lands in one of the project's
// lists; a message lands on its message board. Nothing leaves the desk until Basecamp answers.
export default function BasecampComposer({ kind, projectId, todolists, call, onCreated, onClose }) {
  const meta = kindMeta(kind);
  const [listId, setListId] = useState(todolists?.[0]?.id || '');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [dueOn, setDueOn] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!title.trim()) {
      setError(kind === 'todos' ? 'A to-do needs a line to say what it is.' : 'A message needs a subject.');
      return;
    }
    if (kind === 'todos' && !listId) {
      setError('This project has no to-do list to file into yet. Add a list in Basecamp first.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload =
        kind === 'todos'
          ? { action: 'createTodo', projectId, listId, content: title.trim(), description: body, due_on: dueOn || null }
          : { action: 'createMessage', projectId, subject: title.trim(), content: body };
      const data = await call(payload);
      await onCreated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/65 p-3 backdrop-blur-sm md:p-8">
      <div className="desk-plate w-full max-w-xl">
        <div className="flex items-start justify-between gap-3 px-4 pb-2 pt-3.5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-editorial-gold">
              New {meta.one}
            </p>
            <h3 className="mt-1 font-heading text-[18px] text-editorial-cream">
              File it in Basecamp
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close composer"
            className="rounded p-1.5 text-editorial-cream/60 hover:text-editorial-cream"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="desk-rule" />

        <div className="space-y-2 px-4 py-3.5">
          {kind === 'todos' && (
            <>
              <label className="block text-[9px] font-bold uppercase tracking-[0.24em] text-editorial-gold">
                List
              </label>
              <select
                value={listId}
                onChange={(e) => setListId(e.target.value)}
                className="desk-face w-full rounded px-2.5 py-2 text-[12.5px] text-editorial-navy outline-none"
              >
                {!todolists?.length && <option value="">No list on this project</option>}
                {(todolists || []).map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.title || list.name}
                  </option>
                ))}
              </select>
            </>
          )}

          <label className="block text-[9px] font-bold uppercase tracking-[0.24em] text-editorial-gold">
            {kind === 'todos' ? 'The to-do' : 'Subject'}
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={kind === 'todos' ? 'What has to be done' : 'What the message is about'}
            className="desk-face w-full rounded px-2.5 py-2 text-[13px] text-editorial-navy outline-none"
          />

          <label className="block text-[9px] font-bold uppercase tracking-[0.24em] text-editorial-gold">
            Notes
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Anything the room needs to know"
            className="desk-face w-full rounded px-2.5 py-2 text-[12.5px] leading-relaxed text-editorial-navy outline-none"
          />

          {kind === 'todos' && (
            <>
              <label className="block text-[9px] font-bold uppercase tracking-[0.24em] text-editorial-gold">
                Due
              </label>
              <input
                type="date"
                value={dueOn}
                onChange={(e) => setDueOn(e.target.value)}
                className="desk-face w-full rounded px-2.5 py-2 text-[12.5px] text-editorial-navy outline-none"
              />
            </>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded px-2.5 py-2" style={{ background: 'rgba(232,161,161,0.10)' }}>
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-300" />
              <p className="text-[11px] leading-relaxed text-red-200">{error}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={submit}
              disabled={saving}
              className="desk-key desk-key-primary"
            >
              {saving ? 'Filing' : `File ${meta.one}`}
            </button>
            <button type="button" onClick={onClose} className="desk-key desk-key-quiet">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}