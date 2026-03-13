import React from 'react';

const quickActionsByStage = {
  FORM: [
    { label: 'Note to Self', prefix: 'Note to self: ' },
    { label: 'Save Insight', prefix: 'Insight: ' },
    { label: 'Flag for Follow-up', prefix: 'Follow up on: ' },
  ],
  STORM: [
    { label: 'Re-engage', prefix: 'Re-engaging on: ' },
    { label: 'Ask Question', prefix: 'Question: ' },
    { label: 'Research Note', prefix: 'Research: ' },
  ],
  NORM: [
    { label: 'Propose', prefix: 'Proposal: ' },
    { label: 'Collaborate', prefix: 'Collaborative approach: ' },
    { label: 'Draft Agreement', prefix: 'Agreement structure: ' },
  ],
  PERFORM: [
    { label: 'Send Pitch', prefix: 'Pitch: ' },
    { label: 'Request Commitment', prefix: 'Commitment request: ' },
    { label: 'Close Loop', prefix: 'Closing: ' },
  ],
};

const perryQuickActions = [
  { label: '⚡ Diagnose Thread', prefix: 'Perry, analyze this thread and tell me the lowest Ten: ' },
  { label: 'Draft Sequence', prefix: 'Perry, draft a Straight Line sequence for this contact: ' },
  { label: 'Loop on Objection', prefix: 'Perry, help me loop on this objection: ' },
];

export default function RRFQuickActions({ stage = 'FORM', onActionSelect, isPerry = false }) {
  const actions = isPerry ? perryQuickActions : (quickActionsByStage[stage] || []);

  return (
    <div className="flex flex-wrap gap-2 px-6 py-2">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => onActionSelect?.(action.prefix)}
          className="text-xs px-3 py-1.5 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-gray-600 hover:bg-gray-800/50 text-gray-300 hover:text-gray-200 transition-colors min-h-[36px] flex items-center"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}