import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { Textarea } from '@/components/ui/textarea';

const MAX = 600;

// Editorial cluster to the right of the name: one word, six-word story, about me — spread out.
export default function MastheadEditorial({ oneWord, sixWordStory, settings, user, accent }) {
  const [about, setAbout] = useState(settings?.about_me || '');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = () => { setDraft(about); setEditing(true); };

  const save = async () => {
    setSaving(true);
    const patch = { about_me: draft.slice(0, MAX) };
    try {
      if (settings?.id) {
        await base44.entities.FellowProfileSettings.update(settings.id, patch);
      } else {
        await base44.entities.FellowProfileSettings.create({
          fellow_email: user.email,
          domain_accent: settings?.domain_accent,
          ...patch,
        });
      }
      setAbout(patch.about_me);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 md:items-center md:text-center">
      {/* One word — the artistic anchor of the cluster */}
      {oneWord && (
        <span
          className="block text-xl sm:text-2xl font-bold uppercase tracking-[0.22em] leading-none"
          style={{ color: accent, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {oneWord}
        </span>
      )}

      {/* Six-word story */}
      {sixWordStory && (
        <p
          className="italic leading-snug md:max-w-xs"
          style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(15px, 1.8vw, 19px)' }}
        >
          &ldquo;{sixWordStory}&rdquo;
        </p>
      )}

      {/* About me */}
      {editing ? (
        <div className="w-full md:w-72 space-y-2 md:mx-auto">
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={MAX} rows={3} placeholder="About me, in your own words…" className="text-sm bg-white text-left" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditing(false)} disabled={saving} className="text-xs font-semibold uppercase tracking-[0.14em] flex items-center gap-1 hover:opacity-70" style={{ color: B.muted }}>
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60" style={{ background: B.navy }}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
            </button>
          </div>
        </div>
      ) : about ? (
        <div className="md:max-w-xs md:mx-auto">
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: B.navy }}>{about}</p>
          <button onClick={startEdit} className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] hover:opacity-70" style={{ color: accent }}>
            <Pencil className="w-3 h-3" /> Edit
          </button>
        </div>
      ) : null}
    </div>
  );
}