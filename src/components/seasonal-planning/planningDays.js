// The two-day PI Planning itinerary, as two modules of steps to complete.
export const PLANNING_DAYS = [
  {
    key: 'day1', title: 'Day 1', subtitle: 'Alignment, Vision & Draft Plans',
    steps: [
      ['business-context', 'Business Context', 'Executive presentation on market context, state of the business, and strategic themes.'],
      ['product-vision', 'Product & Solution Vision', 'Product Management outlines upcoming PI features, vision roadmap, and major milestones.'],
      ['architecture-vision', 'Architecture Vision & Development Practices', 'System Architecture presents infrastructure updates, Architectural Runway, and engineering practices.'],
      ['planning-context', 'Planning Context & Breakout Instructions', 'RTE reviews event logistics, rules of engagement, and target outcomes.'],
      ['breakouts-1', 'Team Breakouts #1 (Draft Planning)', 'Agile teams break out to decompose features into stories, map dependencies on the Program Board, draft initial PI Objectives, and identify risks.'],
      ['draft-review', 'Draft Plan Review', 'Teams present draft plans, capacity, preliminary objectives, and dependencies to stakeholders.'],
      ['management-review', 'Management Review & Problem Solving', 'Leadership aligns on scope tradeoffs, capacity bottlenecks, and adjustments to resolve Day 1 issues.'],
    ],
  },
  {
    key: 'day2', title: 'Day 2', subtitle: 'Finalization, Risk ROAMing & Commitment',
    steps: [
      ['adjustments', 'Planning Adjustments', 'Product Management presents executive decisions and scope/priority adjustments from Day 1.'],
      ['breakouts-2', 'Team Breakouts #2 (Final Planning)', 'Teams refine plans, finalize Team PI Objectives, and assign Business Value with Business Owners.'],
      ['final-review', 'Final Plan Review', 'Teams present final plans, program board dependencies, and committed objectives to the train.'],
      ['roam', 'Program Risk ROAMing', 'RTE leads the ART in categorizing program risks into Resolved, Owned, Accepted, or Mitigated.'],
      ['confidence', 'Confidence Vote', 'The ART conducts a Fist-of-Five confidence vote; plans are reworked if confidence is below target.'],
      ['retro', 'Planning Retrospective & Next Steps', 'RTE conducts a brief retrospective on the event and outlines execution tooling setup.'],
    ],
  },
];