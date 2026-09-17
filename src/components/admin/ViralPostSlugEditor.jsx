import { useState } from 'react';
import { Check, Loader2, Link2, Pencil, X, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const NAVY = '#1e3a5a';
const COPPER = '#b87333';

// Derive a URL-safe slug from a display name: lowercase, accents stripped,
// non-alphanumeric runs collapsed to a single underscore. "Martina Dimoska"
// → "martina_dimoska". "José García-López" → "jose_garcia_lopez".
export function slugifyName(name) {
  const base = (name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
  return base || 'fellow';
}

// Append _2, _3, … until the slug is unique among the supplied existing slugs.
export function uniqueSlugFor(base, existingSlugs) {
  const set = new Set((existingSlugs || []).filter(Boolean));
  if (!set.has(base)) return base;
  let n = 2;
  while (set.has(`${base}_${n}`)) n += 1;
  return `${base}_${n}`;
}

const sanitizeDraft = (s) =>
  (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');

// Inline editor for the Fellow's durable Most Liked Posts Series URL.
// Visible/editable independent of the feature toggle, so the admin can
// prepare the URL before the post goes live.
export default function ViralPostSlugEditor({ user, otherSlugs, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(user.viral_post_slug || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const slug = user.viral_post_slug || '';
  const url = `${window.location.origin}/viralpost2026/featured/${slug}`;

  const startEditing = () => {
    setDraft(slug || slugifyName(user.full_name || user.email));
    setError(null);
    setEditing(true);
  };

  const save = async () => {
    const clean = sanitizeDraft(draft);
    if (!clean) { setError('Slug cannot be empty.'); return; }
    if (otherSlugs.includes(clean)) { setError('That URL is already used by another featured post.'); return; }
    if (clean === slug) { setEditing(false); return; }
    setSaving(true);
    setError(null);
    try {
      await base44.entities.User.update(user.id, { viral_post_slug: clean });
      onSaved({ ...user, viral_post_slug: clean });
      setDraft(clean);
      setEditing(false);
    } catch (e) {
      setError(e?.message || 'Could not save URL.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: 'rgba(30,58,90,0.55)' }}>
          Series URL
        </div>
        {!editing && (
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] hover:opacity-70"
            style={{ color: 'rgba(30,58,90,0.55)' }}
          >
            <Pencil className="w-3 h-3" /> {slug ? 'Edit' : 'Set URL'}
          </button>
        )}
      </div>

      {!editing ? (
        slug ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs break-all hover:underline"
            style={{ color: COPPER }}
          >
            <Link2 className="w-3.5 h-3.5 shrink-0" />
            {url}
          </a>
        ) : (
          <p className="text-xs" style={{ color: 'rgba(30,58,90,0.5)' }}>
            Auto-generated when featured, or set a custom URL now.
          </p>
        )
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] shrink-0 font-mono" style={{ color: 'rgba(30,58,90,0.5)' }}>
              …/viralpost2026/featured/
            </span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); save(); } }}
              className="flex-1 min-w-0 px-2 py-1 text-xs rounded border bg-white font-mono"
              style={{ borderColor: 'rgba(30,58,90,0.2)', color: NAVY }}
              placeholder="fellow_name"
              autoFocus
            />
          </div>
          {error && (
            <p className="flex items-center gap-1.5 text-xs" style={{ color: '#b3261e' }}>
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] disabled:opacity-50"
              style={{ background: NAVY, color: '#faf8f5' }}
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => { setEditing(false); setError(null); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: 'rgba(30,58,90,0.55)' }}
            >
              <X className="w-3 h-3" /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}