import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { MAX_EPISODE_CHAPTERS } from './episodeChapters';

const COPPER = '#B87333';
const LABEL = '#8F5C2C';

const fieldClass =
  'w-full rounded-md border px-3 py-2 font-body text-[13px] leading-relaxed focus:outline-none';
const fieldStyle = {
  borderColor: 'rgba(30,58,90,0.2)',
  background: '#ffffff',
  color: 'rgba(30,58,90,0.9)',
};

// The arc, written by the Fellow: up to twenty-two chapters, in their own order.
// Position is meaning here — chapter one reads as chapter one — so the only
// control the list needs is the one that moves a chapter through the sequence.
export default function EpisodeChaptersEditor({ chapters = [], onChange }) {
  const atCap = chapters.length >= MAX_EPISODE_CHAPTERS;

  const patch = (i, change) =>
    onChange(chapters.map((row, j) => (j === i ? { ...row, ...change } : row)));

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= chapters.length) return;
    const next = [...chapters];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const remove = (i) => onChange(chapters.filter((_, j) => j !== i));

  const add = () => {
    if (atCap) return;
    onChange([...chapters, { title: '', body: '' }]);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span
          className="font-body text-[9.5px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: LABEL }}
        >
          Your arc
        </span>
        <span className="font-body text-[10px] tabular-nums" style={{ color: 'rgba(30,58,90,0.45)' }}>
          {chapters.length} / {MAX_EPISODE_CHAPTERS}
        </span>
      </div>

      <p className="mt-1 font-body text-[11px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.5)' }}>
        Up to twenty-two chapters. They play in this order, inside your record.
      </p>

      <ol className="mt-3 space-y-2.5">
        {chapters.map((chapter, i) => (
          <li
            key={i}
            className="rounded-md p-3"
            style={{ border: '1px solid rgba(184,115,51,0.28)', background: 'rgba(255,255,255,0.6)' }}
          >
            <div className="flex items-center gap-2">
              <span
                className="flex h-6 w-6 flex-none items-center justify-center font-heading text-[11px]"
                style={{ color: COPPER, border: `1px solid ${COPPER}`, borderRadius: 9999 }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <input
                value={chapter.title || ''}
                onChange={(e) => patch(i, { title: e.target.value })}
                maxLength={120}
                placeholder="Chapter title"
                aria-label={`Chapter ${i + 1} title`}
                className={fieldClass}
                style={fieldStyle}
              />
              <div className="flex flex-none items-center">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move chapter ${i + 1} earlier`}
                  className="rounded p-1 disabled:opacity-25"
                  style={{ color: 'rgba(30,58,90,0.55)' }}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === chapters.length - 1}
                  aria-label={`Move chapter ${i + 1} later`}
                  className="rounded p-1 disabled:opacity-25"
                  style={{ color: 'rgba(30,58,90,0.55)' }}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Remove chapter ${i + 1}`}
                  className="rounded p-1"
                  style={{ color: '#9c3b22' }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <textarea
              value={chapter.body || ''}
              onChange={(e) => patch(i, { body: e.target.value })}
              rows={3}
              maxLength={1600}
              placeholder="What this chapter holds"
              aria-label={`Chapter ${i + 1} text`}
              className={`${fieldClass} mt-2 resize-none`}
              style={fieldStyle}
            />
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={add}
        disabled={atCap}
        className="mt-3 inline-flex items-center gap-2 px-3.5 py-2 font-body text-[10px] font-bold uppercase tracking-[0.18em] disabled:opacity-40"
        style={{ border: `1px solid ${COPPER}`, color: LABEL, background: 'transparent' }}
      >
        <Plus className="h-3.5 w-3.5" />
        {atCap ? 'Twenty-two is the whole arc' : 'Add a chapter'}
      </button>
    </div>
  );
}