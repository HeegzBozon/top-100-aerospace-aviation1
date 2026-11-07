import { useEffect } from 'react';
import { LIBRARY as L, HOUSE_DECK } from '@/components/handheld/musicLibrary';
import { loadPlaylist } from '@/components/handheld/consoleMusic';

// The campus soundtrack: every room carries its own deck of the record library, and
// each character carries a theme that takes over while you are talking with them.
// Same masters as the console — what makes a room sound like itself is which records
// it is dealt and in what order, never a separate set of noises.
export const ROOM_PLAYLISTS = {
  // Arrivals: slow-funk and lo-fi, the sound of a hall with people crossing it.
  lobby: [L.toTheMoon, L.distantPlanet, L.starGuide],
  // The working floor: a house record under everything that gets built.
  hall: [L.houseInSpace, L.distantPlanet, L.planetZero],
  'innovation-expo': [L.houseInSpace, L.planetZero, L.distantPlanet],
  // The pavilion is the sky: ambient, and the orchestra that sounds like orbit.
  'space-pavilion': [L.risingGalaxies, L.staringIntoSpace, L.moonWaltz],
  // The summit keeps the reading rooms' music: composed, quiet, unhurried.
  'leadership-summit': [L.nocturne, L.gymnopedie, L.moonWaltz],
  'media-hub': [L.planetZero, L.houseInSpace, L.starGuide],
  'career-center': [L.toTheMoon, L.starGuide, L.gymnopedie],
  'networking-lounge': [L.risingGalaxies, L.toTheMoon, L.nocturne],
  // The east wing's cabinets: the drive, kept loud.
  arcade: [L.planetZero, L.houseInSpace, L.starGuide],
};

const NPC_THEMES = {
  founder: L.toTheMoon,
  atlas: L.distantPlanet,
  quinn: L.starGuide,
  vera: L.nocturne,
  nova: L.houseInSpace,
  orion: L.risingGalaxies,
  athena: L.gymnopedie,
  echo: L.planetZero,
  scout: L.toTheMoon,
  skye: L.staringIntoSpace,
  sterling: L.moonWaltz,
  aurora: L.risingGalaxies,
};

// While a character is on screen their theme plays; otherwise the room's deck does.
export function useColonyMusic(room, npcId) {
  useEffect(() => {
    const theme = npcId && (NPC_THEMES[npcId] || L.toTheMoon);
    if (theme) loadPlaylist(`npc:${npcId}`, [theme]);
    else loadPlaylist(`room:${room}`, ROOM_PLAYLISTS[room] || HOUSE_DECK);
  }, [room, npcId]);
  useEffect(() => () => loadPlaylist('house', HOUSE_DECK), []);
}