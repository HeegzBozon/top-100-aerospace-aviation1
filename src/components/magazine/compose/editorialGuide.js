import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// The house standard, handed to the editor.
//
// Composing is not a blank page: the issue is drafted to a standard the masthead has
// already set. The active version of that standard is read straight from the studio's
// own record, so a draft is written against the rules in force — and when no version
// has been filed yet, the same rules are carried here as the house brief so the
// composer never drafts to nothing.

const HOUSE_BRIEF = {
  title: 'The house brief',
  stance:
    'TOP 100 Aerospace & Aviation is a verified professional record for women in aerospace and aviation. It is recognition, not a ranking: we measure, and individuals order. Institutional before social.',
  voice_do: [
    'Editorial, warm, aspirational. Authority first.',
    'Write to one reader, in the house voice: Vogue meets NASA.',
    'Name people as Fellows; before induction, as nominees.',
    'Count in Volumes, Issues and editions.',
    'State what was done, then who did it.',
  ],
  voice_dont: [
    'Never rank as a verb. We measure and order.',
    'Never followers, likes, users, gigs, marketplace or star ratings.',
    'Never promise placement, reach or influence.',
    'Never write to a market. Write to a reader.',
  ],
  never_words: ['followers', 'likes', 'users', 'gigs', 'freelance', 'ranking', 'star rating'],
  punctuation: ['No em dashes.', 'No semicolons in display copy.', 'No exclamation marks.'],
};

const list = (items) => (items || []).map((item) => `- ${item}`).join('\n');

// The standard as instruction text: what a model is told before it drafts a line.
export function guideToInstruction(standard) {
  const guide = standard || HOUSE_BRIEF;
  const blocks = [
    `THE HOUSE STANDARD${standard ? ` (version ${standard.version})` : ' (the house brief)'}`,
    guide.stance ? `Stance: ${guide.stance}` : '',
    guide.voice_do?.length ? `Voice — do:\n${list(guide.voice_do)}` : '',
    guide.voice_dont?.length ? `Voice — never:\n${list(guide.voice_dont)}` : '',
    guide.use_words?.length ? `House words: ${guide.use_words.join(', ')}.` : '',
    guide.never_words?.length ? `Never print: ${guide.never_words.join(', ')}.` : '',
    guide.punctuation?.length ? `Punctuation:\n${list(guide.punctuation)}` : '',
    guide.lengths?.length
      ? `Lengths:\n${list(guide.lengths.map((l) => `${l.type}: ${l.words}`))}`
      : '',
  ];
  return blocks.filter(Boolean).join('\n\n');
}

export const guideLabel = (standard) =>
  standard ? `Drafted to the house standard, v${standard.version}` : 'Drafted to the house brief';

// One read per composer: the version in force, or nothing if none has been filed.
export default function useEditorialGuide() {
  const [standard, setStandard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    base44.entities.EditorialStandard.filter({ status: 'active' }, { sort: '-version', limit: 1 })
      .then((page) => {
        if (!live) return;
        const items = page?.items || [];
        setStandard(items[0] || null);
      })
      .catch(() => {
        if (live) setStandard(null);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);

  return { standard, loading };
}