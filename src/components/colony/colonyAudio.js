// Who hears whom. Rooms carry two kinds of audio area, in grid cells:
//   stage — whoever stands on it is heard by the whole room.
//   table — a private circle: people at it hear only each other.
// Everywhere else is open floor, where you hear the people within NEAR cells.
export const NEAR = 8;

export const AUDIO_AREAS = {
  'leadership-summit': [{ kind: 'stage', label: 'Summit Stage', col: 22, row: 17, w: 20, h: 3 }],
  'space-pavilion': [{ kind: 'stage', label: 'Keynote Stage', col: 25, row: 13, w: 14, h: 3 }],
  'media-hub': [{ kind: 'stage', label: 'Studio Floor', col: 22, row: 16, w: 20, h: 3 }],
  'networking-lounge': [
    { kind: 'table', label: 'Table 1', col: 6, row: 12, w: 8, h: 6 },
    { kind: 'table', label: 'Table 2', col: 6, row: 21, w: 8, h: 6 },
    { kind: 'table', label: 'Table 3', col: 50, row: 12, w: 8, h: 6 },
    { kind: 'table', label: 'Table 4', col: 50, row: 21, w: 8, h: 6 },
  ],
};

export const areaAt = (room, col, row) =>
  (AUDIO_AREAS[room] || []).find(a => col >= a.col && col < a.col + a.w && row >= a.row && row < a.row + a.h) || null;

// Can `me` hear `them`? Both are { room, col, row }.
export function canHear(me, them) {
  if (them.room !== me.room) return false;
  const mine = areaAt(me.room, me.col, me.row);
  const theirs = areaAt(them.room, them.col, them.row);
  if (mine?.kind === 'table' || theirs?.kind === 'table') return mine === theirs;
  if (theirs?.kind === 'stage') return true;
  return Math.hypot(them.col - me.col, them.row - me.row) <= NEAR;
}