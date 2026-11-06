import { useEffect } from 'react';
import { PLAYLIST, HOUSE_SIDE as H, loadPlaylist } from '@/components/handheld/consoleMusic';
import { STATION_1993 } from '@/components/handheld/stations1993';

// The campus soundtrack: every room has its own playlist, and each character carries a
// theme that takes over while you are talking with them. Written as note data, like the
// console's own record, so nothing is fetched.
const R = 0, F = 7, O = 12, B = -5, _ = null;
const FOUR = 'x...x...x...x...', BACK = '....x.......x...', OFF = '..o...o...o...o.';
const t = (title, kind, bpm, swing, chords, o = {}) => ({
  title, kind, bpm, swing, chords,
  kick: o.kick ?? FOUR, clap: o.clap ?? BACK, hatsA: o.hatsA ?? OFF, hatsB: o.hatsB ?? 'x.o.x.o.x.o.x.o.',
  perc: o.perc ?? '...x......x.....', keys: o.keys ?? '..x...x...x...x.',
  bass: o.bass ?? [R, _, _, _, _, _, F, _, R, _, _, _, B, _, _, _],
});

const T = {
  concourse: t('Grand Concourse', 'lo-fi', 84, 0.28, [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64, 67], [55, 59, 62, 65]], { hatsA: 'x...x...x...x...' }),
  arrivals: t('Arrivals Board', 'house', 116, 0.12, [[62, 65, 69, 72], [58, 62, 65, 69], [60, 64, 67, 70], [57, 60, 64, 67]]),
  cleanroom: t('Clean Room', 'house', 122, 0.06, [[57, 60, 64, 67, 71], [53, 57, 60, 64], [60, 64, 67, 71], [55, 59, 62, 66]], { bass: [R, R, _, O, _, R, _, F, R, R, _, O, _, F, O, F] }),
  lowOrbit: t('Low Orbit', 'lo-fi', 72, 0.22, [[50, 57, 60, 64], [53, 57, 60, 65], [48, 55, 59, 64], [55, 59, 62, 67]], { kick: 'x.......x.......', perc: '................' }),
  podium: t('Podium', 'house', 110, 0.14, [[55, 59, 62, 66], [52, 55, 59, 62], [48, 52, 55, 59], [50, 54, 57, 60]], { keys: '..x.....x.x.....' }),
  onAir: t('On Air', 'house', 126, 0.08, [[52, 55, 59, 62], [48, 52, 55, 59], [55, 59, 62, 65], [50, 53, 57, 60]], { hatsB: 'x.oox.oox.oox.oo' }),
  openDesk: t('Open Desk', 'lo-fi', 88, 0.3, [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [55, 58, 62, 65]]),
  nightLounge: t('Night Lounge', 'lo-fi', 78, 0.34, [[56, 60, 63, 67], [53, 56, 60, 63], [51, 55, 58, 62], [55, 58, 62, 65]], { kick: 'x...x...x.....x.' }),
  // Character themes
  welcome: t('Aloha Theme', 'lo-fi', 92, 0.26, [[60, 64, 67, 72], [65, 69, 72, 76], [57, 60, 64, 67], [55, 59, 62, 67]], { keys: 'x...x.x...x...x.' }),
  machine: t('Atlas Protocol', 'house', 118, 0, [[57, 60, 64], [57, 60, 64], [53, 57, 60], [55, 59, 62]], { keys: 'x.x.x.x.x.x.x.x.', perc: '...x...x...x...x' }),
  wonder: t('Starlight Theme', 'lo-fi', 70, 0.2, [[60, 64, 67, 71, 74], [57, 60, 64, 69], [53, 57, 60, 64, 69], [55, 60, 62, 67]], { kick: 'x...............', clap: '............x...' }),
  resolve: t('Summit Theme', 'house', 104, 0.12, [[50, 54, 57, 62], [55, 59, 62, 67], [52, 55, 59, 64], [57, 61, 64, 69]]),
  spark: t('Spark Theme', 'house', 128, 0.06, [[62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 66], [57, 61, 64, 68]], { hatsA: 'x.o.x.o.x.o.x.o.' }),
};

// The 1993 side, by name, so a room can lean on it without knowing the indices.
const [coastline, vhs, atrium, lullaby, chrome] = STATION_1993;

export const ROOM_PLAYLISTS = {
  // Every room is dealt its own shuffled deck from the shared record, so two rooms built
  // from the same tracks still never sound alike, and no room repeats its own set in the
  // order it was written. The rooms with a mood keep their own themes in the mix.
  lobby: [T.concourse, H.discoArrivals, coastline, H.funkyTower, T.arrivals, H.standby],
  hall: [T.arrivals, chrome, H.discoArrivals, T.concourse, H.turbine, H.gantryGroove],
  'innovation-expo': [T.cleanroom, H.turbine, H.gantryGroove, T.spark, vhs, H.slipstream],
  'space-pavilion': [T.lowOrbit, T.wonder, lullaby, H.nightBus, coastline],
  'leadership-summit': [T.podium, T.resolve, H.gantryGroove, H.longHaul, H.nightBus],
  'media-hub': [T.onAir, H.redEye, H.turbine, H.afroTerminal, T.cleanroom, atrium],
  'career-center': [T.openDesk, H.funkyTower, H.standby, T.podium, vhs],
  'networking-lounge': [T.nightLounge, H.afroTerminal, H.nightBus, T.openDesk, atrium],
  // The east wing's cabinets: the hard house of the funky side, and the 1993 dial behind it.
  arcade: [H.turbine, chrome, H.gantryGroove, T.spark, vhs],
};

const NPC_THEMES = {
  founder: T.welcome, atlas: T.machine, quinn: T.machine, vera: T.resolve, nova: T.spark, orion: T.wonder,
  athena: T.resolve, echo: T.spark, scout: T.welcome, skye: T.nightLounge, sterling: T.podium, aurora: T.wonder,
};

// While a character is on screen their theme plays; otherwise the room's playlist does.
export function useColonyMusic(room, npcId) {
  useEffect(() => {
    const theme = npcId && (NPC_THEMES[npcId] || T.welcome);
    if (theme) loadPlaylist(`npc:${npcId}`, [theme]);
    else loadPlaylist(`room:${room}`, ROOM_PLAYLISTS[room] || PLAYLIST);
  }, [room, npcId]);
  useEffect(() => () => loadPlaylist('house', PLAYLIST), []);
}