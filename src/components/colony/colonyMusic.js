import { useEffect } from 'react';
import { LIBRARY as L, HOUSE_DECK } from '@/components/handheld/musicLibrary';
import { loadPlaylist } from '@/components/handheld/consoleMusic';

// The campus soundtrack: every room carries its own deck of the record library, and
// each character carries a theme that takes over while you are talking with them.
// Same masters as the console — what makes a room sound like itself is which records
// it is dealt and in what order, never a separate set of noises.
export const ROOM_PLAYLISTS = {
  lobby: [L.downForYou, L.deepHouse, L.haussperling, L.hotToIce],
  hall: [L.ankleInjuries, L.deepHouse, L.haussperling, L.hotToIce],
  'innovation-expo': [L.deepHouse, L.electroFunk, L.haussperling],
  'space-pavilion': [L.ambientVoyager, L.ambientFlight, L.downForYou],
  'leadership-summit': [L.haussperling, L.hotToIce, L.deepHouse],
  'media-hub': [L.electroFunk, L.hotToIce, L.ankleInjuries],
  'career-center': [L.downForYou, L.deepHouse, L.electroFunk],
  'networking-lounge': [L.ambientFlight, L.ambientVoyager, L.downForYou],
  // The east wing's cabinets: the funk and the drive, kept loud.
  arcade: [L.electroFunk, L.ankleInjuries, L.deepHouse],
};

const NPC_THEMES = {
  founder: L.downForYou,
  atlas: L.deepHouse,
  quinn: L.deepHouse,
  vera: L.haussperling,
  nova: L.electroFunk,
  orion: L.ambientVoyager,
  athena: L.haussperling,
  echo: L.electroFunk,
  scout: L.downForYou,
  skye: L.ambientFlight,
  sterling: L.hotToIce,
  aurora: L.ambientVoyager,
};

// While a character is on screen their theme plays; otherwise the room's deck does.
export function useColonyMusic(room, npcId) {
  useEffect(() => {
    const theme = npcId && (NPC_THEMES[npcId] || L.downForYou);
    if (theme) loadPlaylist(`npc:${npcId}`, [theme]);
    else loadPlaylist(`room:${room}`, ROOM_PLAYLISTS[room] || HOUSE_DECK);
  }, [room, npcId]);
  useEffect(() => () => loadPlaylist('house', HOUSE_DECK), []);
}