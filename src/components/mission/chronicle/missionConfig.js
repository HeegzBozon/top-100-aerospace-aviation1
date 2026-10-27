// The season's path: the narrative spine a Fellow walks at their own pace.
//
// The structure is the hero's journey told in the institution's own register — a
// hangar, a call, a threshold, trials, a return, and the turning of the cycle. It is
// narrative framing, not a card game: chapters are named for the stages a person
// actually passes through, and each holds the work of that stage.
//
// Progress here is cosmetic. No field in this file is read by discovery,
// measurement, scoring, or selection: points buy airframes and nothing else.

export const GUIDE = { name: 'The Founder', role: 'Masthead' };

const IMG = 'https://media.base44.com/images/public/68996845be6727838fdb822e';

// The hangar backdrop behind the header: the field at night, seen from the apron.
export const SCENE_IMAGE = `${IMG}/972b174dc_generated_image.png`;

export const AIRCRAFT = [
  {
    key: 'sparrow',
    name: 'Sparrow',
    role: 'Light jet trainer',
    note: 'Patient, and honest about the wind.',
    image: `${IMG}/f5361a548_generated_image.png`,
    unlockXp: 0,
  },
  {
    key: 'albatross',
    name: 'Albatross',
    role: 'Long-range propliner',
    note: 'For the ones who go the long way on purpose.',
    image: `${IMG}/da8c3904a_generated_image.png`,
    unlockXp: 0,
  },
  {
    key: 'kite',
    name: 'Kite',
    role: 'Bare-frame glider',
    note: 'Nothing between you and the air but judgement.',
    image: `${IMG}/ae9ddde77_generated_image.png`,
    unlockXp: 0,
  },
  {
    key: 'halcyon',
    name: 'Halcyon',
    role: 'Stratospheric platform',
    note: 'Earned, never bought. For a Fellow who has already done the work.',
    image: `${IMG}/dcbc81821_generated_image.png`,
    unlockXp: 90,
  },
];

export const STARTERS = AIRCRAFT.filter((craft) => craft.unlockXp === 0);
export const aircraftByKey = (key) => AIRCRAFT.find((craft) => craft.key === key) || null;
export const nextAircraft = (xp) => AIRCRAFT.find((craft) => xp < craft.unlockXp) || null;

const DOMAINS = [
  { key: 'space_rd', label: 'Space R&D' },
  { key: 'commercial_aviation', label: 'Commercial aviation' },
  { key: 'defense', label: 'Defense' },
  { key: 'manufacturing', label: 'Manufacturing' },
  { key: 'operations', label: 'Operations' },
  { key: 'engineering', label: 'Engineering' },
  { key: 'policy', label: 'Policy' },
  { key: 'entrepreneurship', label: 'Entrepreneurship' },
];

export const CHAPTERS = [
  {
    key: 'hangar',
    index: '00',
    stage: 'Ordinary world',
    label: 'The Hangar',
    lede: 'Where you find out what this is, and who is asking.',
    missions: [
      {
        key: 'roll_call',
        index: '0.1',
        kind: 'dialogue',
        xp: 10,
        title: 'Report to the tower',
        lede: 'The guide is waiting at the end of the hangar.',
        field: { key: 'guide_name', label: 'What do I call you?', placeholder: 'Your name', maxLength: 60 },
        lines: [
          'You found the hangar. Most people walk past it twice before they realise the door is open.',
          'I started this because the record of our field was being written by whoever was easiest to find. Not whoever did the work. Whoever was easiest to find.',
          'So the work became an instrument: names put forward by peers, positions held with a written reason beside them, and a cycle that closes into something you can read back years later.',
          'Nothing here is a race, and nothing here is for sale. Take it at your own pace — the path waits.',
          'Before we go further: what do I call you?',
        ],
      },
      {
        key: 'origin',
        index: '0.2',
        kind: 'dialogue',
        xp: 15,
        title: 'Where this began',
        lede: 'The founding record, in the guide’s own words.',
        aside: { label: 'Read the founding record', to: '/mission-briefing' },
        lines: [
          'It began as an editorial question, not a product. If you had to name the people carrying this field forward, where would you go to check?',
          'There were lists. Lists remembered who was loudest.',
          'So this became an archive first, and an instrument second. The archive kept the careers; the instrument learned to measure them.',
          'That is still the point. One record, verifiable, and readable in ten years exactly as it was measured today.',
        ],
      },
      {
        key: 'starter',
        index: '0.3',
        kind: 'choice',
        xp: 20,
        title: 'Take an airframe',
        lede: 'One choice, yours to change later.',
        choiceKey: 'aircraft_key',
        lines: [
          'Every Fellow starts with one airframe. It carries you through this cycle.',
          'Pick the one that sounds like you. It measures nothing — it is not read by discovery, by measurement, or by selection. It is yours for as long as you want it.',
        ],
        choices: STARTERS.map((craft) => ({ key: craft.key, label: craft.name, note: `${craft.role}. ${craft.note}`, image: craft.image })),
      },
    ],
  },
  {
    key: 'call',
    index: '01',
    stage: 'The call',
    label: 'The Call',
    lede: 'Someone you know belongs in the record. Name them, with a reason.',
    missions: [
      {
        key: 'nominate',
        index: '1.1',
        kind: 'route',
        xp: 40,
        detect: 'nomination',
        title: 'Put a name forward',
        lede: 'A nomination is not a vote. It is a claim that someone belongs in the record, and the reason is the whole of it.',
        cta: 'Open the nomination',
        to: '/selection-committee?tab=nominate',
        doneNote: 'A name is in the record under your hand.',
      },
    ],
  },
  {
    key: 'threshold',
    index: '02',
    stage: 'The threshold',
    label: 'The Threshold',
    lede: 'Measuring the field is the work. Two names at a time.',
    missions: [
      {
        key: 'vote',
        index: '2.1',
        kind: 'route',
        xp: 40,
        detect: 'vote',
        title: 'Measure the field',
        lede: 'Two names at a time, and the one you would argue for. There are no wrong answers here, only considered ones.',
        cta: 'Take a seat',
        to: '/selection-committee?tab=vote',
        doneNote: 'Your seat is on the record for this cycle.',
      },
    ],
  },
  {
    key: 'trials',
    index: '03',
    stage: 'The trials',
    label: 'The Trials',
    lede: 'How the measurement actually works — and what it refuses to weigh.',
    missions: [
      {
        key: 'reflect',
        index: '3.1',
        kind: 'choice',
        xp: 25,
        title: 'What cannot be weighed',
        lede: 'Three rules, then the one question of your own.',
        choiceKey: 'domain_accent',
        lines: [
          'Influence bands are visible. The weights behind them are not — a measurement you can argue with is not a measurement, it is a negotiation.',
          'A written reason is required on every position, because a name without a reason is only a preference.',
          'And the firewall is absolute. Nothing bought, nothing sponsored, no amount of activity ever moves a number. Participation earns airframes. It earns nothing else.',
          'Which of these is closest to your work?',
        ],
        choices: DOMAINS,
      },
    ],
  },
  {
    key: 'return',
    index: '04',
    stage: 'The return',
    label: 'The Return',
    lede: 'The rest of the building, at the pace you choose.',
    missions: [
      {
        key: 'explore',
        index: '4.1',
        kind: 'choice',
        xp: 25,
        title: 'Choose a door',
        lede: 'The path is the guide, not the gate.',
        choiceKey: 'first_surface',
        lines: [
          'The path is the guide, not the gate. Everything in the building is open to you now.',
          'Where would you go first?',
        ],
        choices: [
          { key: 'profile', label: 'My record', note: 'Your profile is the home surface — identity, verification, then the rest in your own order.', to: '/Profile' },
          { key: 'edition', label: 'The published edition', note: 'The record as it is actually read.', to: '/women-2025' },
          { key: 'events', label: 'Mission rooms', note: 'Where the field meets, and who is in the room.', to: '/events' },
          { key: 'frontier', label: 'Aero-Frontier', note: 'The field, as a game played for its own sake.', to: '/aero-frontier' },
        ],
      },
    ],
  },
  {
    key: 'turning',
    index: '05',
    stage: 'The turning',
    label: 'The Turning',
    lede: 'A cycle closes, a record is fixed, and the next one opens.',
    missions: [
      {
        key: 'renewal',
        index: '5.1',
        kind: 'route',
        xp: 0,
        unlockAfter: 'all',
        title: 'Begin again',
        lede: 'The record you helped measure is fixed in the archive. When the next cycle opens, the path begins again with it.',
        cta: 'See the record',
        to: '/board',
        doneNote: 'A cycle of yours is closed.',
      },
    ],
  },
];

export const MISSIONS = CHAPTERS.flatMap((chapter) =>
  chapter.missions.map((mission) => ({ ...mission, chapterKey: chapter.key })),
);

export const missionByKey = (key) => MISSIONS.find((mission) => mission.key === key) || null;

export const xpFor = (keys = []) =>
  keys.reduce((total, key) => total + (missionByKey(key)?.xp || 0), 0);

export const XP_TOTAL = MISSIONS.reduce((n, mission) => n + mission.xp, 0);