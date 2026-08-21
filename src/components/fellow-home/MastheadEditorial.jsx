import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import InlineBlurbField from '@/components/fellow-home/InlineBlurbField';

const ABOUT_MAX = 600;
const ONE_WORD_MAX = 24;
const SIX_WORD_MAX = 60;

// Editorial cluster: one word, six-word story, about me — each inline editable
// with a designed dashed-pill empty state when unanswered.
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

  return (
    <div className="flex flex-col gap-4 md:items-center md:text-center">
      {/* One word — the artistic anchor of the cluster */}
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

      {/* Six-word story */}
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

      {/* About me */}
      <InlineBlurbField
        value={about}
        emptyLabel="Add about me"
        accent={accent}
        multiline
        maxLength={ABOUT_MAX}
        onSave={saveAbout}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap md:max-w-xs md:mx-auto" style={{ color: B.navy }}>{about}</p>
      </InlineBlurbField>
    </div>
  );
}