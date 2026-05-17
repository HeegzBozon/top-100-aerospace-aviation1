const C01_PROFILES = [
  {
    classification: 'Pathfinder',
    quote: "The sky isn't the ceiling. It's the starting point.",
    trigger: (stats, choices, diceResult) =>
      stats.velocity >= 14 && stats.maneuver >= 12 && diceResult?.outcome === 'critical_success',
    ecosystemRole: 'fellow',
    cta: 'Nominate yourself for Season 4',
    ctaLink: '/nominate',
  },
  {
    classification: 'Iron Stick',
    quote: "You don't quit the aircraft. The aircraft quits you.",
    trigger: (stats, choices, diceResult) =>
      stats.resilience >= 13 && stats.velocity >= 12 &&
      (diceResult?.outcome === 'fail' || diceResult?.outcome === 'critical_fail'),
    ecosystemRole: 'fellow',
    cta: 'Nominate yourself for Season 4',
    ctaLink: '/nominate',
  },
  {
    classification: 'Precision Pilot',
    quote: "The manual exists for a reason. So does the pilot who wrote it.",
    trigger: (stats, choices) => {
      const techChoices = choices.filter(c => ['engineering', 'manual', 'pullback'].includes(c.choiceKey));
      return stats.payload >= 13 && stats.velocity >= 12 && techChoices.length >= 2;
    },
    ecosystemRole: 'fellow',
    cta: 'Nominate yourself for Season 4',
    ctaLink: '/nominate',
  },
  {
    classification: 'The Calculated',
    quote: "Risk is just math you haven't done yet.",
    trigger: (stats, choices) => {
      const conservativeChoices = choices.filter(c => ['engineering', 'manual', 'pullback', 'wisdom'].includes(c.choiceKey));
      return stats.altitude >= 12 && stats.payload >= 12 && conservativeChoices.length >= 3;
    },
    ecosystemRole: 'investor',
    cta: 'See the Wefunder',
    ctaLink: 'https://wefunder.com/top.100.aerospace.aviation',
  },
  {
    classification: 'The Maverick',
    quote: "The envelope was made to be pushed. Preferably past the point of comfort.",
    trigger: (stats, choices, diceResult) => {
      const boldChoices = choices.filter(c => ['military', 'instincts', 'throttle', 'challenge'].includes(c.choiceKey));
      return stats.maneuver >= 12 && boldChoices.length >= 3 && diceResult?.outcome === 'critical_success';
    },
    ecosystemRole: 'fellow',
    cta: 'Nominate yourself for Season 4',
    ctaLink: '/nominate',
  },
  {
    classification: 'The Enduring',
    quote: "The mark of a great pilot is not how many times they've succeeded. It's how many times they've recovered.",
    trigger: (stats, choices, diceResult) =>
      stats.resilience >= 13 &&
      (diceResult?.outcome === 'critical_fail' || diceResult?.outcome === 'fail'),
    ecosystemRole: 'booster',
    cta: 'Back someone you know',
    ctaLink: '/nominate',
  },
  {
    classification: 'The Architect',
    quote: "The best flights are the ones that look effortless because someone engineered them that way.",
    trigger: (stats) => stats.payload >= 12 && stats.range >= 11 && stats.altitude >= 11,
    ecosystemRole: 'partner',
    cta: 'View partnership tiers',
    ctaLink: '/moon-joy',
  },
  {
    classification: 'The Original',
    quote: "The unexpected path is still a path. Usually a better one.",
    trigger: () => true, // fallback
    ecosystemRole: 'booster',
    cta: 'Back someone you know',
    ctaLink: '/nominate',
  },
];

const C02_PROFILES = [
  {
    classification: 'The Voice in the Room',
    quote: "Every crew gets one call. My job is to make sure it's the right one.",
    trigger: (stats, choices, diceResult) =>
      stats.altitude >= 13 && stats.range >= 12 && diceResult?.outcome === 'critical_success',
    ecosystemRole: 'fellow',
    cta: 'Nominate yourself for Season 4',
    ctaLink: '/nominate',
  },
  {
    classification: 'The Calculator',
    quote: "Data doesn't lie. The question is whether you know how to ask it.",
    trigger: (stats, choices) => {
      const dataChoices = choices.filter(c => ['book', 'computer', 'payload'].includes(c.choiceKey));
      return stats.payload >= 13 && stats.altitude >= 12 && dataChoices.length >= 2;
    },
    ecosystemRole: 'fellow',
    cta: 'Nominate yourself for Season 4',
    ctaLink: '/nominate',
  },
  {
    classification: 'Flight Lead',
    quote: "A great call is built before the moment requires it.",
    trigger: (stats, choices) => {
      const collabChoices = choices.filter(c => ['engineer', 'ask_second', 'gut'].includes(c.choiceKey));
      return stats.range >= 12 && stats.altitude >= 11 && collabChoices.length >= 2;
    },
    ecosystemRole: 'fellow',
    cta: 'Nominate yourself for Season 4',
    ctaLink: '/nominate',
  },
  {
    classification: 'The Steady Hand',
    quote: "Not every NO-GO is a failure. Some of them are the mission.",
    trigger: (stats, choices, diceResult) =>
      stats.resilience >= 12 &&
      (diceResult?.outcome === 'fail' || diceResult?.outcome === 'critical_fail'),
    ecosystemRole: 'booster',
    cta: 'Back someone you know',
    ctaLink: '/nominate',
  },
  {
    classification: 'The Maverick Director',
    quote: "The flight rules are a floor, not a ceiling.",
    trigger: (stats, choices, diceResult) => {
      const boldChoices = choices.filter(c => ['chose_chair', 'gut', 'step_up'].includes(c.choiceKey));
      return stats.maneuver >= 11 && boldChoices.length >= 2 && diceResult?.outcome === 'critical_success';
    },
    ecosystemRole: 'fellow',
    cta: 'Nominate yourself for Season 4',
    ctaLink: '/nominate',
  },
  {
    classification: 'The Mentor',
    quote: "The best directors build the next ones.",
    trigger: (stats, choices) => {
      const mentorChoices = choices.filter(c => ['engineer', 'ask_second', 'couldnt_fly'].includes(c.choiceKey));
      return stats.range >= 13 && mentorChoices.length >= 2;
    },
    ecosystemRole: 'partner',
    cta: 'View partnership tiers',
    ctaLink: '/moon-joy',
  },
  {
    classification: 'The Architect of the Call',
    quote: "Every system in the room is a tool. The director is the only one who sees all of them.",
    trigger: (stats) => stats.payload >= 12 && stats.maneuver >= 11 && stats.altitude >= 11,
    ecosystemRole: 'investor',
    cta: 'See the Wefunder',
    ctaLink: 'https://wefunder.com/top.100.aerospace.aviation',
  },
  {
    classification: 'Mission First',
    quote: "The crew comes home. Everything else is a variable.",
    trigger: () => true, // fallback
    ecosystemRole: 'fellow',
    cta: 'Nominate yourself for Season 4',
    ctaLink: '/nominate',
  },
];

export function classifyProfile(session, diceResult) {
  if (!session) return C01_PROFILES[C01_PROFILES.length - 1];
  const { stats, choices, campaignId } = session;
  const profiles = campaignId === 'C-02' ? C02_PROFILES : C01_PROFILES;

  for (const profile of profiles) {
    if (profile.trigger(stats, choices, diceResult)) {
      return profile;
    }
  }
  return profiles[profiles.length - 1];
}