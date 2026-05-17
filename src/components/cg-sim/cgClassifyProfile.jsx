const CG01_PROFILES = [
  {
    id: 'the_builder',
    classification: 'The Builder',
    quote: 'You don\'t wait for permission. You build the thing that makes the ask obvious.',
    ecosystemRole: 'implementer',
    cta: 'Read the CommonGround Model',
    ctaLink: '/common-ground',
    trigger: (session, dice) =>
      session.stats.systems >= 14 && session.stats.resource >= 12 && dice?.outcome !== 'critical_fail',
  },
  {
    id: 'the_organizer',
    classification: 'The Organizer',
    quote: 'The coalition is the infrastructure. Everything else is logistics.',
    ecosystemRole: 'connector',
    cta: 'Nominate a CommonGround Champion',
    ctaLink: '/nominate',
    trigger: (session, dice) =>
      session.stats.coalition >= 14 && session.stats.trust >= 12,
  },
  {
    id: 'the_narrator',
    classification: 'The Narrator',
    quote: 'Policy changes when the story becomes impossible to ignore.',
    ecosystemRole: 'advocate',
    cta: 'Share the CommonGround Vision',
    ctaLink: '/common-ground',
    trigger: (session, dice) =>
      session.stats.narrative >= 13 && session.stats.trust >= 11,
  },
  {
    id: 'the_pragmatist',
    classification: 'The Pragmatist',
    quote: 'You know what the room can hold today. You build toward what it can hold tomorrow.',
    ecosystemRole: 'strategist',
    cta: 'Explore the CommonGround Model',
    ctaLink: '/common-ground',
    trigger: (session, dice) =>
      session.stats.systems >= 12 && session.stats.coalition >= 11,
  },
  {
    id: 'the_witness',
    classification: 'The Witness',
    quote: 'You lost the vote. You didn\'t lose the record. The record lasts longer.',
    ecosystemRole: 'advocate',
    cta: 'Read the CommonGround Model',
    ctaLink: '/common-ground',
    trigger: (session, dice) =>
      dice?.outcome === 'fail' || dice?.outcome === 'critical_fail',
  },
  {
    id: 'the_systems_operator',
    classification: 'The Systems Operator',
    quote: 'The infrastructure doesn\'t care about politics. You make sure it gets built anyway.',
    ecosystemRole: 'implementer',
    cta: 'Explore the Dignity Infrastructure Stack',
    ctaLink: '/common-ground',
    trigger: () => true, // fallback
  },
];

const CG02_PROFILES = [
  {
    id: 'the_floor_strategist',
    classification: 'The Floor Strategist',
    quote: 'You know how the room counts before anyone calls the vote.',
    ecosystemRole: 'strategist',
    cta: 'Read the Democratic Reform Framework',
    ctaLink: '/common-ground',
    trigger: (session, dice) =>
      session.stats.systems >= 14 && session.stats.coalition >= 13,
  },
  {
    id: 'the_moral_architect',
    classification: 'The Moral Architect',
    quote: 'You write the first draft of what justice looks like. Someone else will refine it.',
    ecosystemRole: 'advocate',
    cta: 'Share the CommonGround Vision',
    ctaLink: '/common-ground',
    trigger: (session, dice) =>
      session.stats.narrative >= 14 && session.stats.trust >= 12,
  },
  {
    id: 'the_long_arc',
    classification: 'The Long Arc',
    quote: 'You measure success in sessions, not votes. The arc is long. You hold it.',
    ecosystemRole: 'strategist',
    cta: 'Nominate a CommonGround Champion',
    ctaLink: '/nominate',
    trigger: (session, dice) =>
      (dice?.outcome === 'fail' || dice?.outcome === 'critical_fail') && session.stats.resilience >= 12,
  },
  {
    id: 'the_bridge',
    classification: 'The Bridge',
    quote: 'You find the third option when everyone else has committed to two.',
    ecosystemRole: 'connector',
    cta: 'Explore the CommonGround Model',
    ctaLink: '/common-ground',
    trigger: (session, dice) =>
      session.stats.coalition >= 13 && session.stats.narrative >= 11,
  },
  {
    id: 'the_witness',
    classification: 'The Witness',
    quote: 'You didn\'t win the room. You changed what the room said out loud.',
    ecosystemRole: 'advocate',
    cta: 'Read the CommonGround Model',
    ctaLink: '/common-ground',
    trigger: () => true, // fallback
  },
];

export function cgClassifyProfile(session, diceResult) {
  const profiles = session.campaignId === 'CG-01' ? CG01_PROFILES : CG02_PROFILES;
  const match = profiles.find(p => p.trigger(session, diceResult));
  return match || profiles[profiles.length - 1];
}