import { useState } from 'react';
import { Pencil, Check, X, Loader2, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';

const ABOUT_MAX = 600;
const ONE_WORD_MAX = 24;
const SIX_WORD_MAX = 60;

// Editorial slide — the Fellow's voice. One word, six-word story, and
// about-me rendered as a full-bleed editorial spread. Each is inline
// editable with a designed empty state.
export default function BlurbSlide({ user, settings, accent, onUserUpdate, onSettingsUpdate, readOnly }) {
  const [about, setAbout] = useState(settings?.about_me || '');
  const oneWord = user?.one_word || '';
  const sixWord = settings?.six_word_story || user?.six_word_story || '';
  const bio = user?.bio || user?.professional_bio || '';

  // Public read-only mode — renders text without edit affordances.
  if (readOnly) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: B.cream }}>
        <div className="text-center px-6 max-w-2xl w-full py-20">
          {oneWord && (
            <div className="mb-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4" style={{ color: B.muted }}>One word</p>
              <span className="block text-4xl sm:text-6xl font-bold uppercase tracking-[0.22em] leading-none" style={{ color: accent, fontFamily: "'Playfair Display', Georgia, serif" }}>{oneWord}</span>
            </div>
          )}
          {sixWord && (
            <div className="mb-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4" style={{ color: B.muted }}>Six-word story</p>
              <p className="italic leading-snug" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(20px, 3vw, 28px)' }}>&ldquo;{sixWord}&rdquo;</p>
            </div>
          )}
          {(about || bio) && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4" style={{ color: B.muted }}>About</p>
              <p className="text-base leading-relaxed whitespace-pre-wrap max-w-lg mx-auto text-left" style={{ color: B.navy }}>{about || bio}</p>
            </div>
          )}
          {!oneWord && !sixWord && !about && !bio && (
            <p className="text-sm" style={{ color: B.muted }}>This Fellow hasn't shared their editorial yet.</p>
          )}
        </div>
      </section>
    );
  }

  const saveUserField = async (field, value) => {
    await base44.auth.updateMe({ [field]: value });
    onUserUpdate?.({ ...user, [field]: value });
  };

  const saveAbout = async (value) => {
    const patch = { about_me: value.slice(0, ABOUT_MAX) };
    if (settings?.id) {
      await base44.entities.FellowProfileSettings.update(settings.id, patch);
    } else {
      const created = await base44.entities.FellowProfileSettings.create({
        fellow_email: user.email,
        domain_accent: settings?.domain_accent,
        ...patch,
      });
      onSettingsUpdate?.(created);
    }
    setAbout(patch.about_me);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: B.cream }}>
      <div className="text-center px-6 max-w-2xl w-full py-20">
        {/* One word — the anchor */}
        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4" style={{ color: B.muted }}>One word</p>
          {oneWord ? (
            <InlineEditor value={oneWord} accent={accent} maxLength={ONE_WORD_MAX} onSave={(v) => saveUserField('one_word', v)} variant="display">
              <span
                className="block text-4xl sm:text-6xl font-bold uppercase tracking-[0.22em] leading-none"
                style={{ color: accent, fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {oneWord}
              </span>
            </InlineEditor>
          ) : (
            <EmptyPill label="Add one word" accent={accent} onSave={(v) => saveUserField('one_word', v)} maxLength={ONE_WORD_MAX} />
          )}
        </div>

        {/* Six-word story */}
        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4" style={{ color: B.muted }}>Six-word story</p>
          {sixWord ? (
            <InlineEditor value={sixWord} accent={accent} maxLength={SIX_WORD_MAX} onSave={(v) => saveUserField('six_word_story', v)} variant="quote">
              <p
                className="italic leading-snug"
                style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(20px, 3vw, 28px)' }}
              >
                &ldquo;{sixWord}&rdquo;
              </p>
            </InlineEditor>
          ) : (
            <EmptyPill label="Add six-word story" accent={accent} onSave={(v) => saveUserField('six_word_story', v)} maxLength={SIX_WORD_MAX} />
          )}
        </div>

        {/* About me */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4" style={{ color: B.muted }}>About me</p>
          {about ? (
            <InlineEditor value={about} accent={accent} maxLength={ABOUT_MAX} multiline onSave={saveAbout} variant="body">
              <p className="text-base leading-relaxed whitespace-pre-wrap max-w-lg mx-auto text-left" style={{ color: B.navy }}>
                {about}
              </p>
            </InlineEditor>
          ) : (
            <EmptyPill label="Add about me" accent={accent} onSave={saveAbout} maxLength={ABOUT_MAX} multiline />
          )}
        </div>
      </div>
    </section>
  );
}

function InlineEditor({ value, accent, maxLength, onSave, multiline, variant, children }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const start = () => { setDraft(value || ''); setEditing(true); };
  const cancel = () => { setEditing(false); setDraft(''); };
  const save = async () => {
    const v = (draft || '').trim().slice(0, maxLength || undefined);
    setSaving(true);
    try { await onSave(v); setEditing(false); setDraft(''); } finally { setSaving(false); }
  };

  if (editing) {
    const Input = multiline ? 'textarea' : 'input';
    return (
      <div className="max-w-md mx-auto space-y-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={maxLength}
          rows={multiline ? 4 : undefined}
          autoFocus
          onKeyDown={(e) => {
            if (!multiline && e.key === 'Enter') { e.preventDefault(); save(); }
            if (e.key === 'Escape') { e.preventDefault(); cancel(); }
          }}
          placeholder={variant === 'display' ? 'One word' : variant === 'quote' ? 'Six words' : 'About me'}
          className="text-sm bg-white text-center w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
          style={{ borderColor: B.border, color: B.navy }}
        />
        <div className="flex justify-center gap-2">
          <button onClick={cancel} disabled={saving} className="text-xs font-semibold uppercase tracking-[0.14em] flex items-center gap-1 hover:opacity-70" style={{ color: B.muted }}>
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60" style={{ background: B.navy }}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={start}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(); } }}
      className="group cursor-pointer inline-block focus:outline-none"
    >
      {children}
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] opacity-50 md:opacity-0 md:group-hover:opacity-100 transition-opacity mt-2" style={{ color: accent }}>
        <Pencil className="w-2.5 h-2.5" /> Edit
      </span>
    </div>
  );
}

function EmptyPill({ label, accent, onSave, maxLength, multiline }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const v = (draft || '').trim().slice(0, maxLength || undefined);
    if (!v) { setEditing(false); return; }
    setSaving(true);
    try { await onSave(v); setEditing(false); setDraft(''); } finally { setSaving(false); }
  };

  if (editing) {
    const Input = multiline ? 'textarea' : 'input';
    return (
      <div className="max-w-md mx-auto space-y-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={maxLength}
          rows={multiline ? 4 : undefined}
          autoFocus
          onKeyDown={(e) => {
            if (!multiline && e.key === 'Enter') { e.preventDefault(); save(); }
            if (e.key === 'Escape') { setEditing(false); setDraft(''); }
          }}
          placeholder={label}
          className="text-sm bg-white text-center w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
          style={{ borderColor: B.border, color: B.navy }}
        />
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60" style={{ background: B.navy }}>
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.14em] hover:opacity-80"
      style={{ color: B.navy, border: `1px dashed ${accent}`, background: 'transparent' }}
    >
      <Plus className="w-3 h-3" style={{ color: accent }} /> {label}
    </button>
  );
}