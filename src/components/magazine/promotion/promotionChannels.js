// The six things an issue is announced with, and the fields each one is written into.
//
// Every asset is written from the same shared brief, so the set agrees with itself: one
// headline, one set of numbers, one call to action. Editing a field afterwards changes
// only that field — the brief stays the source of record.

export const PROMOTION_ASSETS = [
  {
    key: 'linkedin_article',
    label: 'LinkedIn Article',
    surface: 'Long form · published on your profile',
    fields: [
      { key: 'title', label: 'Headline', rows: 2, hint: 'Under 100 characters' },
      { key: 'body', label: 'Article', rows: 16, hint: '650–900 words' },
    ],
  },
  {
    key: 'personal_post',
    label: 'Personal post',
    surface: 'LinkedIn · shared from your home page',
    fields: [
      { key: 'text', label: 'Post', rows: 9, limit: 3000 },
    ],
  },
  {
    key: 'company_post',
    label: 'TOP 100 post',
    surface: 'LinkedIn · shared from the TOP 100 page',
    fields: [
      { key: 'text', label: 'Post', rows: 9, limit: 3000 },
    ],
  },
  {
    key: 'email',
    label: 'Email',
    surface: 'Newsletter · subject and two bodies',
    fields: [
      { key: 'subject', label: 'Subject line', rows: 2, hint: 'Under 60 characters' },
      { key: 'body', label: 'Plain text body', rows: 10 },
      { key: 'structured', label: 'Structured version (HTML)', rows: 10, mono: true, hint: 'Headline, three short sections, one link' },
    ],
  },
  {
    key: 'instagram_reel',
    label: 'Instagram Reel',
    surface: 'Caption · 2,200 characters',
    fields: [
      { key: 'caption', label: 'Caption', rows: 7, limit: 2200 },
    ],
  },
  {
    key: 'youtube_shorts',
    label: 'YouTube Shorts',
    surface: 'Title and description',
    fields: [
      { key: 'title', label: 'Title', rows: 2, limit: 100 },
      { key: 'caption', label: 'Description', rows: 6, limit: 5000 },
    ],
  },
];

// An empty set, so a field can be edited before anything has been generated.
export const blankDrafts = () => Object.fromEntries(
  PROMOTION_ASSETS.map((asset) => [
    asset.key,
    Object.fromEntries(asset.fields.map((field) => [field.key, ''])),
  ]),
);

// Whatever the model returned, read back as the shape the panel edits.
export const normalizeDrafts = (raw) => Object.fromEntries(
  PROMOTION_ASSETS.map((asset) => [
    asset.key,
    Object.fromEntries(asset.fields.map((field) => [field.key, String(raw?.[asset.key]?.[field.key] ?? '')])),
  ]),
);

// The response shape the generator is held to.
export const promotionSchema = () => ({
  type: 'object',
  properties: Object.fromEntries(PROMOTION_ASSETS.map((asset) => [
    asset.key,
    {
      type: 'object',
      properties: Object.fromEntries(asset.fields.map((field) => [field.key, { type: 'string' }])),
      required: asset.fields.map((field) => field.key),
    },
  ])),
  required: PROMOTION_ASSETS.map((asset) => asset.key),
});