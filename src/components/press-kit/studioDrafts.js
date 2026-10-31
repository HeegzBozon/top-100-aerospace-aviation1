import { base44 } from '@/api/base44Client';
import { disciplineLabel } from './kitSeed';

// The studio writes only from the record the Fellow has already confirmed. Every source
// line below is their own submitted material, it is shown beside the draft for checking,
// and the prompt is held to it: nothing outside these lines may appear in the copy.

export const SHARE_CONTEXTS = [
  { key: 'profile', label: 'Profile introduction', note: 'Invite someone to read the record.' },
  { key: 'card', label: 'Business card', note: 'The note that travels with the card.' },
  { key: 'badge', label: 'Meeting in person', note: 'What to say while handing the badge over.' },
  { key: 'episode', label: 'Episode', note: 'Introduce the conversation.' },
  { key: 'selection', label: 'How the platform works', note: 'Explain what is measured. Claim no outcome.' },
];

export const SHARE_CHANNELS = [
  { key: 'linkedin', label: 'LinkedIn post', note: 'Six hundred characters or so.' },
  { key: 'email', label: 'Email', note: 'A subject line and three short paragraphs.' },
  { key: 'spoken', label: 'Said out loud', note: 'Two or three sentences.' },
  { key: 'bio', label: 'Short biography', note: 'Third person, about forty words.' },
];

export const CALENDAR_PHASES = [
  { key: 'profile', label: 'The record' },
  { key: 'selection', label: 'Orientation' },
  { key: 'promotion', label: 'Promotion' },
];

const clean = (value) => String(value || '').trim();

export function buildSourceLines(kit, episode) {
  const lines = [];
  const add = (label, value) => {
    const text = clean(value);
    if (text) lines.push(`${label}: ${text}`);
  };
  add('Name', kit?.full_name);
  add('Standing', kit?.headline);
  add('Discipline', disciplineLabel(kit?.discipline));
  add('Based in', kit?.location);
  add('Summary', kit?.summary);
  (kit?.evidence || []).forEach((row) => add(clean(row?.label) || 'Record', row?.detail));
  (kit?.links || []).forEach((row) => {
    if (clean(row?.url)) add(clean(row?.label) || 'Link', row.url);
  });
  add('Episode angle', episode?.angle);
  if (Array.isArray(episode?.topics) && episode.topics.length) {
    add('Episode topics', episode.topics.filter(Boolean).join(' · '));
  }
  return lines;
}

const GROUND_RULES = `Write only from the SOURCE MATERIAL below. Never add a fact that is not in it: no employers, roles, projects, numbers, dates, awards or titles. If a detail the piece needs is missing, write around it rather than inventing it.

Never claim or imply a selection outcome, a position, a score, an influence tier, or that sharing affects selection. Never describe the institution as a ranking, an awards list or a list of winners. Avoid these words entirely: followers, likes, ranking, gig, freelance, services. Say the record, endorsers, introductions and availability instead. No emojis, no hashtags, no exclamation marks.`;

const CONTEXT_NOTES = {
  profile: 'The piece invites a reader to open the Fellow’s record and read it.',
  card: 'The piece travels with a business card and says what the Fellow can be reached about.',
  badge: 'The piece is said in a room, face to face, while a badge is handed over.',
  episode: 'The piece introduces a recorded conversation and gives a reason to listen.',
  selection: 'The piece explains how the institution measures: that the record is assessed on evidence, that endorsements and personal lists carry no weight, and that taking part is voluntary. It states no result.',
};

const CHANNEL_NOTES = {
  linkedin: 'A post of roughly six hundred characters, in the Fellow’s own voice, opening with the strongest true line. No hashtag block, no call to comment.',
  email: 'A subject line in the heading, then three short paragraphs in the Fellow’s voice: why I am writing, what the record holds, the one link.',
  spoken: 'Two or three sentences the Fellow can say aloud without reading from a screen.',
  bio: 'About forty words, third person, present tense, no adjectives that the source material does not earn.',
};

const sourceBlock = (sources) => (sources?.length ? sources.map((line) => `- ${line}`).join('\n') : '- (nothing yet)');

export async function draftShareCopy({ context, channel, sources }) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are drafting share material for a Fellow of TOP 100 Aerospace & Aviation, an institutional record of women in aerospace and aviation. The institution measures; individuals rank.

${CONTEXT_NOTES[context] || ''}

${CHANNEL_NOTES[channel] || ''}

${GROUND_RULES}

SOURCE MATERIAL
${sourceBlock(sources)}

Return JSON with "heading" (a subject line, a hook or a title) and "body" (the piece itself, ready to paste).`,
    response_json_schema: {
      type: 'object',
      properties: {
        heading: { type: 'string' },
        body: { type: 'string' },
      },
      required: ['heading', 'body'],
    },
  });
  return { heading: clean(result?.heading), body: clean(result?.body) };
}

export async function draftCalendar({ weeks, perWeek, assets, sources }) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are planning ${weeks} weeks of communication, ${perWeek} slot${perWeek === 1 ? '' : 's'} a week, for a Fellow of TOP 100 Aerospace & Aviation.

The plan covers the whole journey in order, and every phase must appear:
1. profile — the record itself: clarifying what it holds, filling what is thin, making each claim checkable.
2. selection — orientation: how the institution measures, how a season runs, how to take part. Never a result, never a prediction.
3. promotion — the Fellow’s own work and perspective, and the invitations worth accepting.

${GROUND_RULES}

AVAILABLE ITEMS TO POINT AT
${(assets || []).map((asset) => `- ${asset.key}: ${asset.label}`).join('\n') || '- none'}

SOURCE MATERIAL
${sourceBlock(sources)}

Each slot is one JSON object:
- week: 1 to ${weeks}
- day: Monday, Tuesday, Wednesday, Thursday or Friday
- theme: three to six words
- phase: profile, selection or promotion
- asset: one item key above, or an empty string
- channel: LinkedIn, Email, Conversation or Record
- draft: what the Fellow would actually say — a paragraph, in their voice, ready to revise
- note: one line on why this slot sits here

Keep each draft grounded in the source material, and write [square brackets] where only the Fellow can supply a detail. Return JSON with "plan_note" (two sentences on the shape of the plan) and "slots" (the array, in date order).`,
    response_json_schema: {
      type: 'object',
      properties: {
        plan_note: { type: 'string' },
        slots: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              week: { type: 'number' },
              day: { type: 'string' },
              theme: { type: 'string' },
              phase: { type: 'string' },
              asset: { type: 'string' },
              channel: { type: 'string' },
              draft: { type: 'string' },
              note: { type: 'string' },
            },
            required: ['week', 'day', 'theme', 'phase', 'channel', 'draft'],
          },
        },
      },
      required: ['slots'],
    },
  });
  return {
    planNote: clean(result?.plan_note),
    slots: Array.isArray(result?.slots) ? result.slots : [],
  };
}