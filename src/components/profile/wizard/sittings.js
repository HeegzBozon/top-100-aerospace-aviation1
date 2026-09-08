// Sittings staged as appointments. The special editorial sits first —
// it is the highest-priority ask and the one most likely to be skipped.

export const SITTINGS = [
  {
    id: 'viral',
    name: 'Top Viral Post',
    chapter: 'Special Editorial',
    craft: 'Most Liked Posts',
    // Lobby card
    pitch:
      'Share the LinkedIn post that resonated most deeply with your audience\u2014the story, metrics, and insights that shape our field.',
    covers: 'Your most-impactful LinkedIn post, its reach, and the wisdom behind it',
    minutes: '3\u20135 minutes',
    // Overture — editorial introduction
    greeting: 'Recognition is the beginning.',
    monologue:
      'We are recreating the famous LinkedIn showcase of high-impact industry voices to document the stories, insights, and milestones that shape our field. In the \u201cMost Liked Posts\u201d series, we want to feature the LinkedIn posts of yours that resonated most deeply with your audience.\n\nPlease take 3\u20135 minutes to share one LinkedIn post that you are proud of\u2014whether it was a viral hit, a deeply personal story of resilience, or a celebration of an industry milestone. Your responses will be documented and shared to inspire the next generation of leaders.',
    signoff:
      'Let\u2019s continue pushing the boundaries of what aerospace can achieve together.',
    enterLabel: 'Begin Section',
    // Closing beat when the sitting ends
    wrap: 'That is the post. The reach is real, and so is the lesson.',
  },
  {
    id: 'photographer',
    name: 'The Photographer',
    chapter: 'Sitting I',
    craft: 'Portrait',
    // Lobby card
    pitch: 'Sits you down, adjusts the light, and takes the frame that leads your name everywhere it appears.',
    covers: 'Your portrait and the one word that signs it',
    minutes: '2 minutes',
    // Overture — spoken in character, on arrival
    greeting: 'The studio is ready for you.',
    monologue:
      'I have photographed engineers, commanders and founders. Every one of them arrived certain they were not photogenic, and every one of them was wrong. We need one frame — the one that runs beside your name in the index, on your card, in print. Then a single word, because a portrait needs a signature.',
    signoff: 'Stand where the light is. Chin level. We only need one.',
    // Closing beat when the sitting ends
    wrap: 'That is the frame. Hold still — no, that was it.',
  },
  {
    id: 'biographer',
    name: 'The Biographer',
    chapter: 'Sitting II',
    craft: 'The Record',
    pitch: 'Asks the questions a profile writer would ask, then holds you to six words when you want twenty.',
    covers: 'Your role, your story, your disciplines and links',
    minutes: '5 minutes',
    greeting: 'Sit. I have questions.',
    monologue:
      'I write the piece after you leave the room, so I would rather take it from you than from your LinkedIn. Tell me what you actually do, then tell me the arc of it in six words — six, not seven. Constraint is not cruelty. It is the only way a career fits on a page and still sounds like a person.',
    signoff: 'Speak plainly. Name the program, the aircraft, the number.',
    wrap: 'Good. That is a record, not a r\u00e9sum\u00e9.',
  },
];

export const getSitting = (id) => SITTINGS.find((s) => s.id === id);

// Fields each sitting is responsible for — drives the lobby completeness read.
// The viral email step is verification (pre-filled), so it is not counted in progress.
export const SITTING_FIELDS = {
  viral: ['viral_post_link', 'viral_post_impressions', 'viral_post_takeaway', 'viral_post_wisdom'],
  photographer: ['avatar_url', 'one_word'],
  biographer: ['industry_role', 'headline', 'location', 'six_word_story', 'bio', 'expertise_tags'],
};

export const countFilled = (fields, source) =>
  fields.filter((f) => {
    const v = source?.[f];
    if (Array.isArray(v)) return v.length > 0;
    return v !== undefined && v !== null && String(v).trim() !== '';
  }).length;