// Where a visitor steps into a room. Coming back through a door lands you in front of
// that door; otherwise the room's own start. From there we walk outward to the nearest
// cell that is not a wall, not inside a hotspot, and keeps a step of space from others.
const inRect = (c, r, z) => c >= z.col && c < z.col + z.w && r >= z.row && r < z.row + z.h;

export function pickSpawn({ roomDef, fromRoom, occupied, others, cols, rows, fallback }) {
  const zones = roomDef?.zones || [];
  const door = fromRoom && zones.find(z => z.room === fromRoom);
  const anchor = door
    ? { col: door.col + Math.floor(door.w / 2), row: door.row + door.h + 1 }
    : roomDef?.start || fallback;

  const free = (c, r) =>
    c >= 0 && r >= 0 && c < cols && r < rows &&
    !occupied.has(`${c},${r}`) && !zones.some(z => inRect(c, r, z));
  const spaced = (c, r) => !others.some(o => Math.abs(o.col - c) <= 1 && Math.abs(o.row - r) <= 1);

  let loose = null;
  for (let d = 0; d < Math.max(cols, rows); d++) {
    for (let dc = -d; dc <= d; dc++) {
      for (let dr = -d; dr <= d; dr++) {
        if (Math.max(Math.abs(dc), Math.abs(dr)) !== d) continue;
        const c = anchor.col + dc, r = anchor.row + dr;
        if (!free(c, r)) continue;
        if (spaced(c, r)) return { col: c, row: r };
        loose = loose || { col: c, row: r };
      }
    }
    if (loose && d > 4) return loose;
  }
  return loose || anchor;
}