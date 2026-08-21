// Two sittings, two craftspeople. The update flow is staged as a pair of
// appointments rather than a form: first the portrait, then the interview.

export const SITTINGS = [
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
    wrap: 'Good. That is a record, not a résumé.',
  },
];

export const getSitting = (id) => SITTINGS.find((s) => s.id === id);

// Fields each sitting is responsible for — drives the lobby completeness read.
export const SITTING_FIELDS = {
  photographer: ['avatar_url', 'one_word'],
  biographer: ['industry_role', 'headline', 'location', 'six_word_story', 'bio', 'expertise_tags'],
};

export const countFilled = (fields, source) =>
  fields.filter((f) => {
    const v = source?.[f];
    if (Array.isArray(v)) return v.length > 0;
    return v !== undefined && v !== null && String(v).trim() !== '';
  }).length;