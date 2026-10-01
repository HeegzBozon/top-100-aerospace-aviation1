import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import InlineBlurbField from '@/components/fellow-home/InlineBlurbField';
import DocumentPill from '@/components/fellow-home/DocumentPill';
import LinkedInPill from '@/components/fellow-home/LinkedInPill';

const ABOUT_MAX = 600;
const ONE_WORD_MAX = 24;
const SIX_WORD_MAX = 60;

// The Masthead Journey — the editorial cluster reimagined as a completeness
// quest. Empty fields read as designed dashed "+ ADD" pills (the call to fill);
// populated fields render their content (the reward). A progress header tracks
// completion across all seven items and blooms a celebration when the masthead
// is whole. Grouped: editorial voice above, professional documents below.
export default function MastheadEditorial({ oneWord, sixWordStory, settings, user, accent, onUserUpdate, onSettingsUpdate }) {
  const [about, setAbout] = useState(settings?.about_me || '');

  // One word + six-word story live on the User record (drives essentials completeness).
  const saveUserField = async (field, value) => {
    await base44.auth.updateMe({ [field]: value });
    onUserUpdate?.({ ...user, [field]: value });
  };

  // About me lives on the FellowProfileSettings record.
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

  // Seven-item journey: three editorial voice fields + four professional documents.
  const steps = [
    !!oneWord,
    !!(sixWordStory),
    !!(about),
    !!(user?.resume_url),
    !!(user?.cover_letter_url),
    !!(user?.portfolio_url),
    !!(user?.linkedin_connected || user?.linkedin_pdf_url),
  ];
  const done = steps.filter(Boolean).length;
  const total = steps.length;
  const pct = Math.round((done / total) * 100);
  const complete = done === total;

  return (
    <div className="space-y-3">
      {/* Journey header — the dopamine meter */}
      <div>
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: B.muted }}
          >
            {complete ? 'Your masthead' : 'Build your masthead'}
          </span>
          <span
            className="text-[10px] font-semibold tabular-nums tracking-[0.14em]"
            style={{ color: accent }}
          >
            {done}/{total}
          </span>
        </div>
        <div
          className="mt-1.5 h-[3px] w-full rounded-full overflow-hidden"
          style={{ background: `${B.navy}12` }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: complete ? B.gold : accent,
              transition: 'width 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </div>
      </div>

      {/* Editorial voice — the three narrative anchors */}
      <div className="space-y-2.5">
        <InlineBlurbField
          value={oneWord}
          emptyLabel="Add one word"
          accent={accent}
          maxLength={ONE_WORD_MAX}
          onSave={(v) => saveUserField('one_word', v)}
        >
          <span
            className="block text-xl sm:text-2xl font-bold uppercase tracking-[0.22em] leading-none"
            style={{ color: accent, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {oneWord}
          </span>
        </InlineBlurbField>

        <InlineBlurbField
          value={sixWordStory}
          emptyLabel="Add six-word story"
          accent={accent}
          maxLength={SIX_WORD_MAX}
          onSave={(v) => saveUserField('six_word_story', v)}
        >
          <p
            className="italic leading-snug md:max-w-xs"
            style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(15px, 1.8vw, 19px)' }}
          >
            &ldquo;{sixWordStory}&rdquo;
          </p>
        </InlineBlurbField>

        <InlineBlurbField
          value={about}
          emptyLabel="Add about me"
          accent={accent}
          multiline
          maxLength={ABOUT_MAX}
          onSave={saveAbout}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap max-w-xs text-left" style={{ color: B.navy }}>{about}</p>
        </InlineBlurbField>
      </div>

      {/* Hairline between voice and credential */}
      <div className="border-t" style={{ borderColor: `${B.navy}12` }} />

      {/* Professional documents — the CommonApp for aerospace */}
      <div className="space-y-2.5">
        <DocumentPill field="resume_url" label="Resume" user={user} accent={accent} onUserUpdate={onUserUpdate} />
        <DocumentPill field="cover_letter_url" label="Cover Letter" user={user} accent={accent} onUserUpdate={onUserUpdate} />
        <DocumentPill field="portfolio_url" label="Portfolio" user={user} accent={accent} onUserUpdate={onUserUpdate} accept=".pdf,.png,.jpg,.jpeg" />
        <LinkedInPill user={user} accent={accent} onUserUpdate={onUserUpdate} />
      </div>

      {/* Celebration — the masthead is whole */}
      {complete && (
        <div
          className="flex items-center gap-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: B.gold }}
        >
          <Sparkles className="w-3.5 h-3.5" /> Masthead complete
        </div>
      )}
    </div>
  );
}