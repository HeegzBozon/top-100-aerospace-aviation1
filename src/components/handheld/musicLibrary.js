// THE RECORD LIBRARY
//
// The machine's music is recorded, not synthesized. Ten masters, each one cleared for
// commercial use under Creative Commons Attribution (BY or BY-SA), held with the app's
// own files so nothing is hotlinked from a third party while a record plays.
//
// The library is built to the house's own subject: space and the air above it. A record
// carries its mood in its title — the house on the working floor, the lo-fi in the
// lounge, the ambient in the pavilion, the classical in the summit and the reading
// rooms — so a room sounds like the room it is, and never like a playlist.
//
// The credit travels with the record — artist, licence and the page it came from — and
// is printed wherever the record is playing. That credit is the condition of the licence,
// not a courtesy: it must not be dropped from a surface that shows the title.
//
// The audio host below is the platform's own media delivery for this app's public
// files. If a master is ever replaced, put the new file's address here and nothing
// else on the machine has to move.

const HOST = 'https://media.base44.com/files/public/68996845be6727838fdb822e';

const jamendo = (id) => `https://www.jamendo.com/track/${id}`;

const record = (id, title, artist, file, licence, credit) => ({
  id,
  title,
  artist,
  licence,
  credit,
  src: `${HOST}/${file}`,
});

export const LIBRARY = {
  // ── House: the working floor, and the floor that fills ──
  houseInSpace: record(
    'house-in-space', 'House in Space', 'Time Sequencers', 'd7b8b28e8_house-in-space.mp3',
    'CC BY-SA 3.0', jamendo(1040609),
  ),
  distantPlanet: record(
    'distant-planet', 'Orbiting a Distant Planet', 'Quantum Jazz', 'e44df30fd_orbiting-a-distant-planet.mp3',
    'CC BY-SA 3.0', jamendo(887683),
  ),
  planetZero: record(
    'planet-zero', 'Planet Zero', 'Jahzzar', 'b7845e2ff_planet-zero.mp3',
    'CC BY-SA 3.0', jamendo(493283),
  ),

  // ── Lo-fi and slow funk: the lounge, the desk, the long afternoon ──
  starGuide: record(
    'star-guide', 'Star Guide', 'Tryad', 'ac55867a9_star-guide.mp3',
    'CC BY-SA 2.5', jamendo(6578),
  ),
  toTheMoon: record(
    'to-the-moon', 'To the Moon', 'Ton in Ton', '624963698_to-the-moon.mp3',
    'CC BY 3.0', jamendo(1245186),
  ),

  // ── Ambient: the space pavilion, and the room after hours ──
  risingGalaxies: record(
    'rising-galaxies', 'Rising Galaxies', 'Ostenvegr', 'fe49aeb71_rising-galaxies.mp3',
    'CC BY-SA 3.0', jamendo(943814),
  ),
  cosmosThreshold: record(
    'cosmos-threshold', 'Crossing the Threshold of Cosmos', 'Ostenvegr', '3feb3065b_threshold-of-cosmos.mp3',
    'CC BY 3.0', jamendo(1129342),
  ),

  // ── Classical: the summit, the reading rooms, the quiet hours ──
  nocturne: record(
    'nocturne', 'Nocturne in E-Flat Major, Op. 9 No. 2', 'Felted Classics', 'a18c020a5_nocturne-in-e-flat.mp3',
    'CC BY 3.0', jamendo(2327378),
  ),
  gymnopedie: record(
    'gymnopedie', 'Gymnopédie No. 1', 'Daniel Bautista', 'da5677fa2_gymnopedie-no-1.mp3',
    'CC BY-SA 3.0', jamendo(891470),
  ),
  moonWaltz: record(
    'moon-waltz', 'Moon Waltz', 'zero-project', 'd1e7dfda1_moon-waltz.mp3',
    'CC BY 4.0', 'https://commons.wikimedia.org/wiki/File:Zero-project_-_02_-_Moon_waltz.ogg',
  ),
};

// The console's own deck: the record that plays when no room has asked for its own.
// House leads it, so the machine opens on a floor rather than on a slow movement.
export const HOUSE_DECK = [
  LIBRARY.houseInSpace,
  LIBRARY.distantPlanet,
  LIBRARY.starGuide,
  LIBRARY.planetZero,
  LIBRARY.toTheMoon,
  LIBRARY.moonWaltz,
];