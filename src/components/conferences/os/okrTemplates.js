// Curated metrics a key result can measure, and the starter objectives built from them.
// Templates are foundations: the Fellow edits the line and the targets from there.
export const METRICS = {
  declared: 'Conferences declared',
  captured: 'Contacts captured',
  sent: 'Follow-ups sent',
  outcomes: 'Meetings & opportunities',
  won: 'Relationships won',
};

export const OKR_TEMPLATES = [
  {
    key: 'pipeline',
    label: 'Build pipeline',
    objective: 'Turn every show into relationships that move',
    key_results: [{ metric: 'captured', target: 25 }, { metric: 'sent', target: 25 }, { metric: 'outcomes', target: 5 }],
  },
  {
    key: 'circuit',
    label: 'Work the circuit',
    objective: 'Be in the room where the industry gathers',
    key_results: [{ metric: 'declared', target: 4 }, { metric: 'captured', target: 40 }, { metric: 'sent', target: 40 }],
  },
  {
    key: 'close',
    label: 'Close deals',
    objective: 'Convert conversations into signed work',
    key_results: [{ metric: 'outcomes', target: 10 }, { metric: 'won', target: 3 }, { metric: 'sent', target: 30 }],
  },
];