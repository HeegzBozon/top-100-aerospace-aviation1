// THE 1993 SIDE // 1993 FEELING
//
// The console's second record: the sound of a car stereo in 1993 — Synthwave and
// Dreamwave for the drive, Vaporwave for the empty mall, Chillsynth for the ride home.
// Written as note data like the rest of the record, so nothing is fetched and no loop
// ends on a gap. These are slower and wider than the house loops: the pads sit open,
// the bass carries the melody, and the vinyl under them is turned down to tape.

const R = 0, F = 7, O = 12, B = -5, _ = null;
const FOUR = 'x...x...x...x...';
const GATED = '....x.......x...';
const OFF = '..o...o...o...o.';

const t = (title, kind, bpm, swing, chords, o = {}) => ({
  title, kind, bpm, swing, chords,
  kick: o.kick ?? FOUR,
  clap: o.clap ?? GATED,
  hatsA: o.hatsA ?? OFF,
  hatsB: o.hatsB ?? 'x.o.x.o.x.o.x.o.',
  perc: o.perc ?? '...x......x.....',
  keys: o.keys ?? '..x...x...x...x.',
  bass: o.bass ?? [R, _, _, _, _, _, F, _, R, _, _, _, B, _, _, _],
});

export const STATION_1993 = [
  t('Coastline 1993', 'synthwave', 112, 0.02,
    [[57, 60, 64, 69], [53, 57, 60, 65], [48, 52, 55, 60], [55, 59, 62, 67]],
    { kick: 'x...x...x...x...', hatsA: OFF, hatsB: 'xxxxxxxxxxxxxxxx', keys: 'x.x.x.x.x.x.x.x.', perc: '.......x.......x', bass: [R, R, _, O, _, R, _, F, R, R, _, O, _, B, O, F] }),

  t('VHS Sunrise', 'dreamwave', 96, 0.12,
    [[53, 57, 60, 64, 67], [57, 60, 64, 67, 71], [50, 53, 57, 60, 64], [55, 58, 62, 65, 69]],
    { kick: 'x.......x.......', hatsA: '....x.......x...', hatsB: '..x...x...x...x.', keys: '..x...x...x...x.', bass: [R, _, _, _, _, F, _, _, R, _, _, _, B, _, F, _] }),

  t('Mall Atrium', 'vaporwave', 88, 0.26,
    [[55, 59, 62, 65, 69], [53, 57, 60, 64], [50, 55, 59, 62, 64], [48, 53, 57, 60]],
    { kick: 'x.....x...x.....', hatsA: '..o...o...o...o.', hatsB: 'x..o..x..x..o..x', keys: 'x.....x.x.....x.', perc: '............x...', bass: [R, _, _, _, B, _, _, _, R, _, _, _, F, _, B, _] }),

  t('Tape Hiss Lullaby', 'chillsynth', 78, 0.3,
    [[60, 64, 67, 71, 74], [57, 60, 64, 67], [53, 57, 60, 64, 67], [55, 59, 62, 67]],
    { kick: 'x...............', clap: '............x...', hatsA: '....x.......x...', hatsB: '..x...x...x...x.', keys: '..x.....x...x...', perc: '................', bass: [R, _, _, _, _, _, F, _, _, _, _, _, B, _, _, _] }),

  t('Chrome Skyline', 'synthwave', 118, 0.04,
    [[52, 55, 59, 62], [48, 52, 55, 59], [50, 54, 57, 60], [55, 58, 62, 65]],
    { kick: 'x...x...x...x...', hatsA: 'x.o.x.o.x.o.x.o.', hatsB: 'x.xox.xox.xox.xo', keys: 'x..x..x...x..x..', bass: [R, _, R, _, O, _, R, _, F, _, F, _, O, _, B, _] }),
];