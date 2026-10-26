import { MAP_H, MAP_W, OBJECTS, SPAWN } from "./aeroMap";

export const TILE_PX = 16;
export const SOLID = { T: true, w: true, f: true };

export const tileAt = (grid, tx, ty) => {
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return "T";
  return grid[ty][tx];
};

export const tileSolid = (grid, tx, ty) => !!SOLID[tileAt(grid, tx, ty)];

export const DIR_VECTORS = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

// A body is a small footprint at the feet, not the whole picture: the sprite is
// sixteen pixels of somebody leaning over a wing, and only where they stand can
// anything be moved.
export const bodyBox = (px, py) => ({ x0: px - 5, x1: px + 5, y0: py - 3, y1: py + 3 });

// The tile a body is standing in, and the tile in front of it — both measured
// from the feet, so what you face is what is beside you, one tile over.
export const tileOf = (px, py) => ({ tx: Math.floor(px / TILE_PX), ty: Math.floor(py / TILE_PX) });

export const facingTile = (px, py, dir) => {
  const { dx, dy } = DIR_VECTORS[dir] || DIR_VECTORS.down;
  const feet = tileOf(px, py);
  return { tx: feet.tx + dx, ty: feet.ty + dy };
};

const overlaps = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

// A prop's foot box, in pixels: buildings and machines block, small things do not.
export function objectBox(object) {
  const w = (object.w || 1) * TILE_PX;
  const h = (object.h || 1) * TILE_PX;
  const x0 = object.x * TILE_PX;
  const y0 = object.y * TILE_PX;
  return { x0, y0, x1: x0 + w, y1: y0 + h };
}

export const isBlocking = (object) =>
  object.kind === "prop" && object.art && object.art !== "none" && !object.station
    ? true
    : object.kind === "prop"
      ? object.art !== "none"
      : !!object.solid;

// Can a body stand here? Ground first, then whatever is standing on it.
export function canStand(grid, px, py, passable = {}) {
  const box = bodyBox(px, py);
  const corners = [
    [box.x0, box.y0],
    [box.x1 - 1, box.y0],
    [box.x0, box.y1 - 1],
    [box.x1 - 1, box.y1 - 1],
  ];
  for (const [x, y] of corners) {
    if (tileSolid(grid, Math.floor(x / TILE_PX), Math.floor(y / TILE_PX))) return false;
  }
  for (const object of OBJECTS) {
    if (!isBlocking(object) || passable[object.key]) continue;
    if (overlaps(box, objectBox(object))) return false;
  }
  return true;
}

export const clampCamera = (x, y, viewW, viewH) => ({
  x: Math.max(0, Math.min(x, MAP_W * TILE_PX - viewW)),
  y: Math.max(0, Math.min(y, MAP_H * TILE_PX - viewH)),
});

// What a press of A reaches for: whatever stands in the tile in front, then
// whatever is underfoot (a crate you are standing on top of is still a crate).
export function reachable(grid, px, py, dir) {
  const front = facingTile(px, py, dir);
  const under = tileOf(px, py);
  const picks = [front, under];
  for (const spot of picks) {
    const found = OBJECTS.find((object) => {
      if (object.kind === "npc") {
        return object.x === spot.tx && object.y === spot.ty;
      }
      const box = objectBox(object);
      const cx = spot.tx * TILE_PX + 8;
      const cy = spot.ty * TILE_PX + 8;
      return cx >= box.x0 && cx < box.x1 && cy >= box.y0 && cy < box.y1;
    });
    if (found) return found;
  }
  return null;
}

export const spawnPoint = () => ({ x: SPAWN.x * TILE_PX + 8, y: SPAWN.y * TILE_PX + 8 });

// What the ground still has in it. A ditch gives up what it has once and stays
// empty; the creek brings something down every night and gives all year.
export const nodeAvailable = (object, doc) => {
  const worked = doc?.nodes?.[object.key] || 0;
  if (!worked) return true;
  return object.daily ? worked !== doc.day : false;
};