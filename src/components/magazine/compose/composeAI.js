import { base44 } from '@/api/base44Client';
import { guideToInstruction } from './editorialGuide';
import { SECTION_GROUPS, SECTION_TYPES } from '@/components/magazine/magazineConfig';

// The editor the composer asks.
//
// Two kinds of help, and both are offered before they are taken: a handful of lines
// for the prompt standing open, or a whole section plan for the issue. Every request
// carries the house standard, so what comes back is written to the same rules a
// person would be held to — and nothing is written to the issue until the writer
// accepts it.

const OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    options: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'The line as it would be printed.' },
          why: { type: 'string', description: 'One short sentence on what it does.' },
        },
        required: ['text'],
      },
    },
  },
  required: ['options'],
};

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    note: { type: 'string', description: 'One sentence on the shape of the issue.' },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          section_group: { type: 'string', enum: SECTION_GROUPS.map((g) => g.key) },
          section_type: { type: 'string', enum: SECTION_TYPES.map((t) => t.key) },
        },
        required: ['name', 'section_group', 'section_type'],
      },
    },
  },
  required: ['sections'],
};

function issueBrief(values, sections) {
  const rows = [
    ['Title', values.title],
    ['Subtitle', values.subtitle],
    ['Cover kicker', values.cover_kicker],
    ['Stated intention', values.direction],
    ['Sections', (sections || []).map((s) => s.name).join(' · ')],
  ];
  return rows
    .filter(([, value]) => String(value || '').trim())
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');
}

const cleanOptions = (options) =>
  (Array.isArray(options) ? options : [])
    .map((option) => ({ text: String(option?.text || '').trim(), why: String(option?.why || '').trim() }))
    .filter((option) => option.text);

// A few lines for the prompt standing open.
export async function askForLines({ step, values, standard }) {
  const instruction = guideToInstruction(standard);
  const prompt = `${instruction}

THE ISSUE SO FAR
${issueBrief(values, values.sections) || 'Nothing is set yet.'}

THE TASK
Write ${step.count || 3} candidates for: ${step.question}
The candidates are: ${step.ask}.
Write only what would be printed, with no labels, quotation marks or explanation in the line itself. Each candidate must stand on its own and sound like it belongs in a printed institutional issue.
Return each candidate with one short sentence, in second person, on what it does.`;

  const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: OPTIONS_SCHEMA });
  const options = cleanOptions(res?.options);
  if (!options.length) throw new Error('The editor returned nothing to read.');
  return options;
}

// The whole plan: what runs through the issue, in print order.
export async function askForPlan({ values, standard }) {
  const instruction = guideToInstruction(standard);
  const prompt = `${instruction}

THE ISSUE SO FAR
${issueBrief(values, values.sections) || 'Nothing is set yet.'}

THE TASK
Propose the issue's editorial blueprint: six to nine sections, in print order, from the front of book through the well to the back of the book. The well is the heart of the issue and carries the largest share. Every section must have a name in the house voice and be assigned one place (front_of_book, well, back_of_book) and one type (evergreen, feature, profile, results, colophon). Do not rename or invent measurement vocabulary. Return one sentence on the shape of the issue.`;

  const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: PLAN_SCHEMA });
  const groups = SECTION_GROUPS.map((g) => g.key);
  const types = SECTION_TYPES.map((t) => t.key);
  const sections = (Array.isArray(res?.sections) ? res.sections : [])
    .filter((section) => String(section?.name || '').trim())
    .map((section, i) => ({
      id: `sec-ai-${Date.now()}-${i}`,
      name: String(section.name).trim(),
      section_group: groups.includes(section.section_group) ? section.section_group : 'well',
      section_type: types.includes(section.section_type) ? section.section_type : 'evergreen',
      order: i,
    }));
  if (!sections.length) throw new Error('The editor returned no plan.');
  return { sections, note: String(res?.note || '').trim() };
}