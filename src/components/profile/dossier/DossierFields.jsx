import InlineDossierField from './InlineDossierField';

const countWords = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length;

// The four lines the Fellow says about themselves. Each is edited in place and
// written to the account; the story and the bio are mirrored onto the record so
// the public profile reads the same words.
export default function DossierFields({ user, nominee, settings, onSave }) {
  const oneWord = user?.one_word || nominee?.one_word || '';
  const sixWord = settings?.six_word_story || user?.six_word_story || nominee?.six_word_story || '';
  const pitch = user?.headline || nominee?.title || nominee?.professional_role || '';
  const bio = user?.bio || nominee?.bio_extended || nominee?.bio || nominee?.description || '';

  return (
    <div>
      <InlineDossierField
        label="One word"
        value={oneWord}
        placeholder="RELENTLESS"
        maxLength={24}
        hint="The word a colleague would use about your work."
        validate={(next) => {
          if (/\s/.test(next)) return 'One word only, no spaces.';
          if (next.length > 24) return 'Keep it under 24 characters.';
          return null;
        }}
        onSave={(next) => onSave('one_word', next)}
      />

      <InlineDossierField
        label="Six word story"
        value={sixWord}
        placeholder="Grounded dreamer. Built wings. Never landed."
        maxLength={60}
        hint="Exactly six words. Punctuation is free."
        validate={(next) => {
          if (!next) return null;
          const n = countWords(next);
          if (n === 6) return null;
          return `That is ${n} word${n === 1 ? '' : 's'}. Exactly six.`;
        }}
        onSave={(next) => onSave('six_word_story', next)}
      />

      <InlineDossierField
        label="Elevator pitch"
        value={pitch}
        placeholder="Building the next generation of lunar landers"
        maxLength={140}
        hint="One line that sits under your name."
        onSave={(next) => onSave('headline', next)}
      />

      <InlineDossierField
        label="About"
        value={bio}
        multiline
        maxLength={1200}
        placeholder="What you work on, what you have shipped, and what you are chasing next."
        onSave={(next) => onSave('bio', next)}
      />
    </div>
  );
}