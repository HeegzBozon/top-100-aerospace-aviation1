import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { Textarea } from '@/components/ui/textarea';

const MAX = 600;

export default function FellowBlurbs({ settings, user, accent }) {
  const [about, setAbout] = useState(settings?.about_me || '');
  const [meet, setMeet] = useState(settings?.who_id_like_to_meet || '');
  const [editing, setEditing] = useState(false);
  const [draftAbout, setDraftAbout] = useState('');
  const [draftMeet, setDraftMeet] = useState('');
  const [saving, setSaving] = useState(false);

  const name = (user?.full_name || 'Fellow').split(' ')[0];

  const startEdit = () => {
    setDraftAbout(about);
    setDraftMeet(meet);
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    const patch = { about_me: draftAbout.slice(0, MAX), who_id_like_to_meet: draftMeet.slice(0, MAX) };
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
      setMeet(patch.who_id_like_to_meet);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl overflow-hidden" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${B.border}` }}>
        <h2 className="text-sm font-bold uppercase tracking-[0.16em]" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
          {name}'s Blurbs
        </h2>
        {!editing && (
          <button onClick={startEdit} className="text-[11px] font-semibold uppercase tracking-[0.14em] flex items-center gap-1 hover:opacity-70" style={{ color: accent }}>
            <Pencil className="w-3 h-3" /> Edit
          </button>
        )}
      </div>

      <div className="px-5 py-4 space-y-4">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: B.muted }}>About me</h3>
          {editing ? (
            <Textarea value={draftAbout} onChange={(e) => setDraftAbout(e.target.value)} maxLength={MAX} rows={4} placeholder="In your own words..." className="text-sm" />
          ) : about ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: B.navy }}>{about}</p>
          ) : (
            <p className="text-xs italic" style={{ color: B.muted }}>Nothing yet. Tell people who you are.</p>
          )}
        </div>

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: B.muted }}>Who I'd like to meet</h3>
          {editing ? (
            <Textarea value={draftMeet} onChange={(e) => setDraftMeet(e.target.value)} maxLength={MAX} rows={4} placeholder="Collaborators, mentors, missions..." className="text-sm" />
          ) : meet ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: B.navy }}>{meet}</p>
          ) : (
            <p className="text-xs italic" style={{ color: B.muted }}>Who are you hoping to connect with?</p>
          )}
        </div>

        {editing && (
          <div className="flex items-center justify-end gap-2 pt-1">
            <button onClick={() => setEditing(false)} disabled={saving} className="text-xs font-semibold uppercase tracking-[0.14em] flex items-center gap-1 hover:opacity-70" style={{ color: B.muted }}>
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60" style={{ background: B.navy }}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
            </button>
          </div>
        )}
      </div>
    </section>
  );
}