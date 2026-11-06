import { base44 } from '@/api/base44Client';
import { guideToInstruction } from '@/components/magazine/compose/editorialGuide';
import { RUBRIC, rubricToInstruction, weightedTotal } from './editorialRubric';

// Reading the issue the way an editor reads it.
//
// One request, carrying the house standard in force and the six measures a book is
// judged by before it prints. What comes back is six marks with evidence, a summary,
// what holds and what to fix — and nothing else: it is a reading of the copy, never a
// judgement of the people in it, and never a measure of how well it might sell.

const SCHEMA = {
  type: 'object',
  properties: {
    criteria: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string', enum: RUBRIC.map((row) => row.key) },
          score: { type: 'number', description: '0 to 100. 90 and above is exceptional and rare.' },
          note: { type: 'string', description: 'One sentence of evidence from the copy above.' },
        },
        required: ['key', 'score', 'note'],
      },
    },
    summary: { type: 'string', description: 'Two sentences: what this issue is, and what stands between it and the press.' },
    strengths: { type: 'array', items: { type: 'string' } },
    fixes: { type: 'array', items: { type: 'string' } },
  },
  required: ['criteria', 'summary', 'strengths', 'fixes'],
};

const clean = (text) =>
  String(text || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const issueBrief = (issue) => {
  const sections = (issue.sections || []).map((section) => `${section.name} (${section.section_group || 'well'})`);
  const rows = [
    ['Name', issue.title],
    ['The line under it', issue.subtitle],
    ['Cover kicker', issue.cover_kicker],
    ['Stated intention', issue.opening_config?.tone],
    ['Sections, in print order', sections.join(' · ')],
    ['Editor\u2019s letter', clean(issue.preface)],
    ['Closing note', clean(issue.colophon)],
  ];
  return rows
    .filter(([, value]) => String(value || '').trim())
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');
};

const articleBrief = (articles) => {
  const rows = (articles || []).slice(0, 12).map((article) => {
    const body = clean(article.body).slice(0, 320);
    const byline = article.writer_credit ? ` by ${article.writer_credit}` : '';
    return `- "${article.title || 'Untitled'}"${byline}${body ? `: ${body}${clean(article.body).length > 320 ? '\u2026' : ''}` : ' (no copy filed)'}`;
  });
  return rows.length ? rows.join('\n') : 'No article copy is filed against this issue.';
};

// Marks are kept only where the model answered for a measure we actually asked about.
const cleanCriteria = (criteria) => {
  const keys = RUBRIC.map((row) => row.key);
  const byKey = new Map();
  (Array.isArray(criteria) ? criteria : []).forEach((row) => {
    const key = String(row?.key || '').trim();
    const score = Number(row?.score);
    if (!keys.includes(key) || !Number.isFinite(score) || byKey.has(key)) return;
    byKey.set(key, {
      key,
      score: Math.max(0, Math.min(100, Math.round(score))),
      note: clean(row?.note),
    });
  });
  return RUBRIC.filter((row) => byKey.has(row.key)).map((row) => byKey.get(row.key));
};

const cleanList = (items) =>
  (Array.isArray(items) ? items : []).map((item) => clean(item)).filter(Boolean).slice(0, 4);

export async function scoreIssue({ issue = {}, articles = [], standard }) {
  const instruction = guideToInstruction(standard);
  const prompt = `${instruction}

THE ISSUE, AS IT STANDS
${issueBrief(issue) || 'Nothing is written yet.'}

THE COPY FILED AGAINST IT
${articleBrief(articles)}

THE MEASURES
${rubricToInstruction()}

HOW TO READ IT
Read the issue as a professional editor at a print institution reads a book before it goes to press: closely, and without flattery.
Score each of the six measures from 0 to 100. Sixty is a competent draft. Eighty is work a reader would trust. Ninety and above is exceptional and should be rare. Below fifty means the issue should not print in this state.
Every note must point at something in the copy above: quote a phrase, or name the element that is missing. A note that could have been written without reading the issue is worthless.
Where no article copy is filed, judge reporting and specificity on the editorial matter given, and say so in the note rather than penalising the issue twice.
Score editorial quality only. Never consider audience size, reach, sponsorship, placement, or commercial value: those are not editorial measures, and nothing of the kind is ever read into a decision about people.
Do not rank people, do not use the vocabulary the house standard bans, and do not promise an outcome.
Return two sentences of summary, up to three things that hold, and up to three things to fix. Each fix must name the page, section or line to change and what to change it to.`;

  const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: SCHEMA });
  const criteria = cleanCriteria(res?.criteria);
  if (!criteria.length) throw new Error('The editor returned no reading.');
  return {
    criteria,
    total: weightedTotal(criteria),
    summary: clean(res?.summary),
    strengths: cleanList(res?.strengths),
    fixes: cleanList(res?.fixes),
    standardVersion: standard?.version || null,
    readAt: new Date().toISOString(),
  };
}