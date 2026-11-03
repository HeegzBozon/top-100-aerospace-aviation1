import GalagaGame from '@/components/games/arcade/GalagaGame';
import AsteroidsGame from '@/components/games/arcade/AsteroidsGame';
import MissileCommandGame from '@/components/games/arcade/MissileCommandGame';

// THE CABINETS.
//
// Three machines, kept in the east wing of the campus. Each carries a house name and
// says plainly which mechanism it runs, so a visitor is never guessing what they are
// walking up to. The record held against each one is the best score this machine has
// seen — a house record, kept where it was set.
export const CABINETS = [
  {
    id: 'sentinel',
    label: 'Sentinel',
    mechanism: 'Space Invaders',
    blurb: 'A descending wall of hulls, and one line to hold above the terminator.',
    controls: 'Left and right to track, fire to answer.',
    accent: '#9ec5e0',
    component: GalagaGame,
  },
  {
    id: 'belt-run',
    label: 'Belt Run',
    mechanism: 'Asteroids',
    blurb: 'Thread the debris field, break the rock, and do not drift into your own shot.',
    controls: 'Turn, thrust, fire. The belt does not stop for you.',
    accent: '#c9a87c',
    component: AsteroidsGame,
  },
  {
    id: 'guardian',
    label: 'Guardian',
    mechanism: 'Missile Command',
    blurb: 'Six cities under the arc. Spend the battery well or watch the skyline go dark.',
    controls: 'Aim and tap the sky to intercept.',
    accent: '#d98a6a',
    component: MissileCommandGame,
  },
];

export const cabinetById = (id) => CABINETS.find((c) => c.id === id) || null;

// Whether a cabinet is steered by keys or aimed at with a pointer.
export const isAimCabinet = (cabinet) => cabinet?.mechanism === 'Missile Command';