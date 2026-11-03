// The PR sweep: what is in the news that this announcement has to be careful of.
//
// A masthead never publishes into a silent room. Before a set is written, the editor is
// handed the field: accidents, groundings, layoffs, closures, controversy. Each finding
// comes back with the instruction a writer would need, and the editor decides what to
// carry into the brief. Nothing is written from this automatically.

const LOOKBACK_DAYS = 10;

export const buildSweepPrompt = ({ issueTitle }) => {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return `You are the PR advisor to TOP 100 Aerospace & Aviation, an institutional publication that covers women in aerospace and aviation through measurement, editorial and a magazine.

Today is ${today}. It is bringing out an issue titled "${issueTitle || 'an issue'}".

Search the news of the last ${LOOKBACK_DAYS} days for anything in aerospace, aviation, defence or space that a publication should be careful of before it announces anything publicly. Look for:
- accidents, crashes, incidents, injuries and fatalities
- groundings, airworthiness directives, fleet-wide safety action
- layoffs, closures, bankruptcies, programme cancellations
- regulatory action, investigations, litigation
- public controversy, misconduct allegations, named individuals in dispute

For each finding, give one line of what happened, how serious it is for us, and a concrete instruction a copywriter can act on today. Be specific about wording: name the phrases to avoid if the event makes them read as tone deaf.

Rules:
- Only include items supported by reporting from the last ${LOOKBACK_DAYS} days. Never speculate, never include rumour, never name a cause that is not established.
- Do not editorialise about blame.
- At most five items, most serious first. If the field is clear, return no items and say so in field_note.
- "source" is a short publication name and date, e.g. "Reuters, 31 Oct". Never invent a URL.

Return only the JSON object described by the schema.`;
};

export const sweepSchema = () => ({
  type: 'object',
  properties: {
    field_note: {
      type: 'string',
      description: 'One sentence on the overall climate for announcing an issue right now.',
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'A few words naming the event' },
          summary: { type: 'string', description: 'One line on what happened' },
          risk: { type: 'string', enum: ['high', 'medium', 'low'] },
          guidance: { type: 'string', description: 'What the writer must do, in one or two sentences' },
          source: { type: 'string', description: 'Publication and date' },
        },
        required: ['topic', 'summary', 'risk', 'guidance'],
      },
    },
  },
  required: ['field_note', 'items'],
});

// Whatever came back, read as the shape the panel draws.
export const normalizeSweep = (raw) => ({
  fieldNote: String(raw?.field_note || '').trim(),
  items: (Array.isArray(raw?.items) ? raw.items : []).slice(0, 5).map((item) => ({
    topic: String(item?.topic || 'Untitled item').trim(),
    summary: String(item?.summary || '').trim(),
    risk: ['high', 'medium', 'low'].includes(item?.risk) ? item.risk : 'medium',
    guidance: String(item?.guidance || '').trim(),
    source: String(item?.source || '').trim(),
  })),
});

// The line an editor drops into their own context when they accept a finding.
export const findingToNote = (item) =>
  `[${item.risk.toUpperCase()}] ${item.topic}: ${item.summary} ${item.guidance}`.replace(/\s+/g, ' ').trim();