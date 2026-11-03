// The brief: one issue, stated once, in the terms every asset has to agree on.
//
// The editor can change any line of it. What is written here is the only source of facts
// the generator is allowed to use, which is what keeps the article, the two posts, the
// email and the two captions telling the same story with the same numbers.

const clean = (value) => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const clip = (value, max) => {
  const text = clean(value);
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
};

export const buildIssueBrief = ({ issue, articles = [], pages = [] }) => {
  if (!issue) return '';

  const lines = [];
  lines.push(`PUBLICATION — TOP 100 Aerospace & Aviation. Higher, Further, Faster.`);
  lines.push(`ISSUE — ${clean(issue.title) || 'Untitled issue'}`);
  if (issue.subtitle) lines.push(`Edition line — ${clean(issue.subtitle)}`);
  if (issue.cover_kicker) lines.push(`Cover kicker — ${clean(issue.cover_kicker)}`);
  lines.push(`Issue number — ${issue.issue_number ?? 1}`);
  if (issue.published_date) {
    lines.push(`Published — ${new Date(issue.published_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`);
  }

  const credits = issue.cover_credits || {};
  if (credits.subject) lines.push(`On the cover — ${clean(credits.subject)}`);
  if (credits.photographer) lines.push(`Cover photograph — ${clean(credits.photographer)}`);

  if (issue.id) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    lines.push(`Reader link — ${origin}/magazine/${issue.id}`);
  }

  const sections = (issue.sections || []).map((section) => clean(section.name)).filter(Boolean);
  if (sections.length) lines.push(`Sections — ${sections.slice(0, 8).join('; ')}`);

  const contents = [...articles]
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((article) => clean(article.title))
    .filter(Boolean);
  if (contents.length) lines.push(`Inside the issue — ${contents.slice(0, 10).join('; ')}`);

  if (pages.length) lines.push(`Extent — ${pages.length} pages`);

  const contributors = (issue.contributors || []).map((person) => clean(person.name)).filter(Boolean);
  if (contributors.length) lines.push(`Contributors — ${contributors.slice(0, 6).join(', ')}`);

  if (issue.preface) lines.push(`Editor's letter, in part — ${clip(issue.preface, 500)}`);

  lines.push('');
  lines.push('TONE — Institutional, not social. Authority first. Warm, editorial, aspirational. Every asset makes the same promise in its own register.');

  return lines.join('\n');
};