// Hollow Field, in tiles.
//
// The map is painted rather than drawn by hand: a grass field, a creek across the
// north with one bridge, the strip and its aprons, the buildings, the scrub the
// salvage lives in, and a fence all the way round with one gate in the south-west
// — which is where the player arrives, because that is where the road ends.

export const MAP_W = 40;
export const MAP_H = 26;

const GRASS = ".";
const SCRUB = ",";
const DIRT = "-";
const STRIP = "=";
const APRON = "+";
const RUBBLE = "r";
const WATER = "w";
const BRIDGE = "b";
const SAND = "s";
const TREE = "T";
const FENCE = "f";

export const SOLID_TILES = { [TREE]: true, [WATER]: true, [FENCE]: true };

export const isSolidTile = (ch) => !!SOLID_TILES[ch];

function paint() {
  const grid = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(GRASS));
  const rect = (x0, y0, x1, y1, ch) => {
    for (let y = y0; y <= y1; y += 1) {
      for (let x = x0; x <= x1; x += 1) {
        if (y < 0 || y >= MAP_H || x < 0 || x >= MAP_W) continue;
        grid[y][x] = ch;
      }
    }
  };

  // The fence, and the one way in.
  rect(0, 0, MAP_W - 1, 0, FENCE);
  rect(0, MAP_H - 1, MAP_W - 1, MAP_H - 1, FENCE);
  rect(0, 0, 0, MAP_H - 1, FENCE);
  rect(MAP_W - 1, 0, MAP_W - 1, MAP_H - 1, FENCE);
  rect(4, MAP_H - 1, 6, MAP_H - 1, DIRT);

  // The creek across the north, with sand banks and one bridge at the old ford.
  rect(1, 1, 25, 1, SAND);
  rect(1, 2, 26, 3, WATER);
  rect(1, 4, 26, 4, SAND);
  rect(9, 0, 10, 5, BRIDGE);
  rect(2, 3, 3, 3, RUBBLE);
  rect(22, 3, 24, 3, RUBBLE);

  // Reeds and wet ground down the west edge of the creek.
  rect(1, 5, 3, 5, SCRUB);
  rect(24, 5, 26, 5, SCRUB);

  // The strip, running the width of the field, with an apron either side.
  rect(3, 10, 35, 10, APRON);
  rect(3, 11, 35, 13, STRIP);
  rect(3, 14, 35, 14, APRON);
  rect(18, 11, 18, 13, DIRT);
  rect(33, 11, 34, 13, RUBBLE);

  // The road in, from the gate north to the apron, and the service path west.
  rect(5, 15, 5, 24, DIRT);
  rect(5, 20, 22, 20, DIRT);
  rect(14, 15, 14, 20, DIRT);
  rect(6, 9, 6, 15, DIRT);
  rect(5, 9, 12, 9, DIRT);

  // The yard: the shed and the bench stand south of the road, on dirt.
  rect(2, 18, 8, 19, DIRT);
  rect(9, 18, 13, 19, DIRT);

  // The scrub the field gives up its salvage in, south-east, and around the edges.
  rect(24, 16, 38, 24, SCRUB);
  rect(2, 16, 12, 24, SCRUB);
  rect(28, 15, 38, 15, SCRUB);
  rect(17, 16, 23, 19, SCRUB);
  rect(15, 22, 23, 24, SCRUB);

  // Long grass along the west, rubble where the plough turned stones up.
  rect(12, 21, 14, 24, SCRUB);
  rect(30, 20, 34, 21, RUBBLE);
  rect(7, 22, 9, 23, RUBBLE);

  // Treelines: the west edge, the east edge, and a windbreak north of the strip.
  rect(1, 6, 2, 8, TREE);
  rect(1, 10, 1, 15, TREE);
  rect(1, 16, 1, 24, TREE);
  rect(38, 6, 38, 24, TREE);
  rect(37, 1, 38, 3, TREE);
  rect(16, 6, 18, 7, TREE);
  rect(20, 5, 20, 7, TREE);
  rect(12, 5, 13, 5, TREE);
  rect(30, 5, 33, 6, TREE);
  rect(35, 6, 36, 8, TREE);
  rect(15, 16, 16, 16, TREE);
  rect(10, 15, 11, 15, TREE);
  rect(2, 21, 2, 22, TREE);
  rect(24, 25, 27, 25, FENCE);

  return grid;
}

export const GRID = paint();

export const tiled = (grid) => grid.map((row) => row.join(""));

// Where the player comes in: on the gate path, looking north up the field.
export const SPAWN = { x: 5, y: 23 };

// Everything that is not ground. `solid` boxes are what a walking body cannot
// pass through; `station` and `node` are things a walking body can talk to.
export const OBJECTS = [
  // ── People ──────────────────────────────────────────────────────────────
  { key: "marla", kind: "npc", cast: "marla", x: 5, y: 8, dir: "down", solid: true },
  { key: "dex", kind: "npc", cast: "dex", x: 28, y: 10, dir: "down", solid: true },
  { key: "tup", kind: "npc", cast: "tup", x: 9, y: 19, dir: "left", solid: true },
  { key: "hollis", kind: "npc", cast: "hollis", x: 10, y: 3, dir: "down", solid: true },
  { key: "rue", kind: "npc", cast: "rue", x: 15, y: 20, dir: "right", solid: true },
  { key: "biscuit", kind: "npc", cast: "biscuit", x: 7, y: 12, dir: "right", patrol: { x0: 7, x1: 12, y: 12, speed: 14 } },

  // ── Buildings ───────────────────────────────────────────────────────────
  { key: "bunkhouse", kind: "prop", art: "bunkhouse", x: 2, y: 6, w: 4, h: 2 },
  { key: "hangar", kind: "prop", art: "hangar", x: 25, y: 7, w: 5, h: 3 },
  { key: "shed", kind: "prop", art: "shed", x: 2, y: 18, w: 3, h: 2 },
  { key: "tower", kind: "prop", art: "tower", x: 31, y: 5, w: 2, h: 2 },

  // ── The field's furniture ───────────────────────────────────────────────
  { key: "machine", kind: "prop", art: "machine", x: 6, y: 15, w: 6, h: 2 },
  { key: "bench", kind: "prop", art: "bench", x: 6, y: 18, station: "bench" },
  { key: "crates", kind: "prop", art: "crates", x: 4, y: 16 },
  { key: "pump", kind: "prop", art: "pump", x: 20, y: 14, station: "pump" },
  { key: "sock", kind: "prop", art: "sock", x: 34, y: 15, station: "sock" },
  { key: "sign", kind: "prop", art: "sign", x: 4, y: 22, station: "sign" },
  { key: "bunk", kind: "prop", art: "bunk", x: 3, y: 8, station: "bunk" },

  // ── Salvage, and what the ground gives up ───────────────────────────────
  {
    key: "n_wreck",
    kind: "node",
    art: "wreck",
    x: 13,
    y: 23,
    loot: { alu: 3, rivet: 4 },
    line: "The wing root lies in the scrub where it was laid down, and the rivets come out with a pin punch, one at a time.",
  },
  {
    key: "n_ditch",
    kind: "node",
    art: "ditch",
    x: 30,
    y: 22,
    loot: { tube: 2, alu: 2 },
    line: "The ditch is dry and full of what the field shed over nine winters: tube, sheet, and one boot with no owner.",
  },
  {
    key: "n_shed",
    kind: "node",
    art: "pile",
    x: 3,
    y: 21,
    loot: { wire: 2, tape: 2, brass: 2, bolt: 4 },
    line: "Behind the shed: a coil of wire, a tin of tape, a tin of bolts all one thread, and brass fittings off a fuel pump that died before you were born.",
  },
  {
    key: "n_pile",
    kind: "node",
    art: "pile",
    x: 31,
    y: 8,
    loot: { alu: 3, rivet: 2 },
    line: "The brush pile the plough dragged together. Sheet metal under the thorns, and a great deal of swearing.",
  },
  {
    key: "n_engine",
    kind: "node",
    art: "engine",
    x: 19,
    y: 24,
    loot: { brass: 2, gasket: 1 },
    line: "A radial, dead, sitting in the long grass with its plugs out. Brass on it still turns, if you are patient.",
  },
  {
    key: "n_tyres",
    kind: "node",
    art: "tyres",
    x: 25,
    y: 24,
    loot: { rubber: 3, gasket: 1 },
    line: "Four tyres against the south fence, perished flat, and one gasket somebody left on top of them for you.",
  },
  {
    key: "n_crates",
    kind: "node",
    art: "crates",
    x: 22,
    y: 16,
    loot: { rivet: 6, tape: 1, wire: 1 },
    line: "An open crate on the old apron. Rivets by the handful, tape that still sticks, and a reel with a little left on it.",
  },
  {
    key: "n_creek",
    kind: "node",
    art: "flotsam",
    x: 24,
    y: 4,
    daily: true,
    loot: { alu: 1, rivet: 2, tube: 1 },
    line: "The creek brings something down every night and leaves it against the bank by morning. Every morning.",
  },

  // ── Ground you can read, and one dog's find ────────────────────────────
  { key: "creek_bank", kind: "prop", art: "none", x: 12, y: 4, station: "creek" },
  { key: "dog_find", kind: "prop", art: "none", x: 8, y: 24, station: "dog" },
];

export const objectByKey = (key) => OBJECTS.find((object) => object.key === key);

// Objects the eye must draw, in the order it draws them: everything that stands
// on the ground is sorted by where its feet are.
export const drawnObjects = () => OBJECTS.filter((object) => object.art && object.art !== "none");