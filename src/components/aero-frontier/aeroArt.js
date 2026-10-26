// How Hollow Field is drawn.
//
// Everything is rectangles, deliberately: sixteen-pixel tiles, hard edges, two
// tones per surface, and a dither so a big field of grass is not a flat colour.
// People are built the same way from a handful of boxes and colours taken from
// the cast, which is why six pilots and a dog cost one function rather than eight
// sheets of pixels.
//
// The canvas is never smoothed and the camera is always on a whole pixel, so the
// picture stays as sharp as the tiles it is made of.

import { nodeAvailable } from "./aeroEngine";
import { ITEMS } from "./aeroItems";
import { CAST, YOU } from "./aeroScripts";

const T = 16;

export const VIEW = { w: 16 * T, h: 12 * T };

const rect = (ctx, x, y, w, h, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
};

const hash2 = (x, y) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

// ── Ground ────────────────────────────────────────────────────────────────
const GROUND = {
  ".": ["#5d7040", "#687b4c"],
  ",": ["#55663c", "#6d7f4c"],
  "-": ["#8a734f", "#9c8560"],
  "=": ["#5a5f63", "#6c7176"],
  "+": ["#7d7b73", "#8b8980"],
  r: ["#6f6a5c", "#847e6d"],
  w: ["#2f4f6a", "#3a5f7d"],
  b: ["#6b5030", "#7d5d38"],
  s: ["#a89878", "#b5a486"],
};

function drawGround(ctx, ch, px, py, tx, ty, t) {
  const tones = GROUND[ch] || GROUND["."];
  const pick = hash2(tx, ty) > 0.5 ? 0 : 1;
  rect(ctx, px, py, T, T, tones[pick]);

  if (ch === "." || ch === ",") {
    const second = tones[1 - pick];
    rect(ctx, px + 2, py + 3, 5, 2, second);
    rect(ctx, px + 9, py + 10, 4, 2, second);
    if (ch === ",") {
      rect(ctx, px + 4, py + 11, 2, 3, "#7d8f5a");
      rect(ctx, px + 11, py + 4, 2, 3, "#7d8f5a");
    }
  } else if (ch === "=" || ch === "+") {
    rect(ctx, px, py, T, 1, "#4c5155");
    if (hash2(tx, ty) > 0.62) rect(ctx, px + 3, py + 6, 6, 1, "#4c5155");
  } else if (ch === "w") {
    const wobble = Math.sin((tx * 0.9 + ty * 1.3 + t * 1.6)) * 4;
    rect(ctx, px + wobble + 2, py + 5, 8, 1, "#5f86a4");
    rect(ctx, px + 6 - wobble, py + 11, 7, 1, "#27435c");
  } else if (ch === "s") {
    rect(ctx, px + 2, py + 2, 4, 1, "#c0b096");
  } else if (ch === "r") {
    rect(ctx, px + 3, py + 5, 6, 4, "#5c574c");
    rect(ctx, px + 9, py + 9, 4, 3, "#5c574c");
  } else if (ch === "b") {
    rect(ctx, px, py + 4, T, 1, "#4f3a22");
    rect(ctx, px, py + 11, T, 1, "#4f3a22");
  }
}

function drawTree(ctx, px, py, tx, ty) {
  rect(ctx, px + 6, py + 9, 4, 7, "#4a3524");
  rect(ctx, px + 7, py + 9, 1, 7, "#5c4229");
  const shade = hash2(tx, ty) > 0.5 ? "#2c3a24" : "#314027";
  rect(ctx, px + 1, py + 1, 14, 10, shade);
  rect(ctx, px + 2, py + 1, 12, 8, "#3a4a30");
  rect(ctx, px + 4, py + 2, 8, 4, "#455a38");
  rect(ctx, px + 5, py + 2, 5, 2, "#4f6640");
}

function drawFence(ctx, px, py) {
  rect(ctx, px + 7, py + 2, 2, 13, "#6b5030");
  rect(ctx, px + 1, py + 6, 14, 1, "#7d5d38");
  rect(ctx, px + 1, py + 10, 14, 1, "#6b5030");
}

// ── Characters ────────────────────────────────────────────────────────────
const HAIR_BACK = 0.62;

function drawShadow(ctx, x, y) {
  rect(ctx, x - 5, y - 1, 11, 2, "rgba(20,28,24,0.35)");
}

export function drawCharacter(ctx, cast, x, y, dir, frame) {
  const c = cast || CAST.marla;
  const ox = Math.round(x - 8);
  const oy = Math.round(y - 16);
  const swing = frame === 1 ? 1 : frame === 2 ? -1 : 0;
  const width = c.big ? 1 : 0;

  drawShadow(ctx, x, y);

  // Legs
  rect(ctx, ox + 4, oy + 12 + Math.max(0, swing), 3, 4, c.pants);
  rect(ctx, ox + 9, oy + 12 + Math.max(0, -swing), 3, 4, c.pants);
  rect(ctx, ox + 4, oy + 15, 3, 1, "#2a2420");
  rect(ctx, ox + 9, oy + 15, 3, 1, "#2a2420");

  // Torso
  rect(ctx, ox + 4 - width, oy + 7, 8 + width * 2, 6, c.shirt);
  rect(ctx, ox + 4 - width, oy + 11, 8 + width * 2, 2, "rgba(0,0,0,0.16)");
  if (c.apron) rect(ctx, ox + 5, oy + 8, 6, 5, "#c9b48c");

  // Arms
  rect(ctx, ox + 2, oy + 8 + swing, 2, 4, c.shirt);
  rect(ctx, ox + 12, oy + 8 - swing, 2, 4, c.shirt);
  rect(ctx, ox + 2, oy + 11 + swing, 2, 1, c.skin);
  rect(ctx, ox + 12, oy + 11 - swing, 2, 1, c.skin);

  // Head
  rect(ctx, ox + 4, oy + 1, 8, 6, c.skin);
  rect(ctx, ox + 4, oy + 1, 8, 5, c.skin);
  if (dir === "up") {
    rect(ctx, ox + 4, oy + 0, 8, 5, c.hair);
  } else {
    rect(ctx, ox + 4, oy + 0, 8, 2, c.hair);
    rect(ctx, ox + 4, oy + 2, 1, 2, c.hair);
    rect(ctx, ox + 11, oy + 2, 1, 2, c.hair);
    if (dir === "down") {
      rect(ctx, ox + 6, oy + 4, 1, 1, "#241c16");
      rect(ctx, ox + 9, oy + 4, 1, 1, "#241c16");
    } else if (dir === "left") {
      rect(ctx, ox + 5, oy + 4, 1, 1, "#241c16");
      rect(ctx, ox + 4, oy + 5, 1, 1, c.skin);
    } else {
      rect(ctx, ox + 10, oy + 4, 1, 1, "#241c16");
      rect(ctx, ox + 11, oy + 5, 1, 1, c.skin);
    }
    if (c.beard) rect(ctx, ox + 5, oy + 6, 6, 1, c.beard);
  }

  if (c.hat) {
    rect(ctx, ox + 3, oy + 0, 10, 1, c.hat.brim || c.hat.tone);
    rect(ctx, ox + 5, oy - 2, 6, 2, c.hat.tone);
    rect(ctx, ox + 5, oy - 2, 6, 1, c.hat.brim || c.hat.tone);
  }
}

export function drawDog(ctx, c, x, y, dir, frame) {
  const ox = Math.round(x - 7);
  const oy = Math.round(y - 10);
  const wag = frame === 1 ? 2 : frame === 0 ? 0 : 1;
  drawShadow(ctx, x, y);
  const body = c?.shirt || "#8a6a3c";
  const light = c?.skin || "#c9a87c";

  rect(ctx, ox + 1, oy + 3, 9, 5, body);
  rect(ctx, ox + 1, oy + 6, 9, 2, "rgba(0,0,0,0.18)");
  rect(ctx, ox + 9 - (dir === "left" ? 1 : 0), oy + 1, 5, 5, light);
  rect(ctx, ox + (dir === "left" ? 8 : 13), oy + 2, 2, 3, light);
  rect(ctx, ox + (dir === "left" ? 9 : 12), oy + 1, 2, 2, body);
  rect(ctx, ox + 2, oy + 8, 2, 2, body);
  rect(ctx, ox + 6, oy + 8, 2, 2, body);
  rect(ctx, ox + 1 - wag, oy, 2, 3, body);
}

// A portrait for the dialogue box: the same sprite, blown up and framed.
export function drawPortrait(ctx, castKey) {
  const cast = CAST[castKey] || CAST.marla;
  ctx.clearRect(0, 0, 64, 64);
  ctx.save();
  ctx.scale(4, 4);
  if (cast.dog) drawDog(ctx, cast, 8, 13, "right", 1);
  else drawCharacter(ctx, cast, 8, 15, "down", 0);
  ctx.restore();
}

// ── Props ─────────────────────────────────────────────────────────────────
const PLANK = "#6b5030";
const PLANK_LIGHT = "#8a6a3c";
const ROOF = "#4a4a52";
const ROOF_LIGHT = "#5c5c66";

function drawBunkhouse(ctx, px, py, w, h, opened) {
  rect(ctx, px, py + 8, w, h - 8, PLANK);
  for (let x = px + 4; x < px + w; x += 8) rect(ctx, x, py + 8, 1, h - 8, "#5a4228");
  rect(ctx, px - 2, py + 4, w + 4, 6, ROOF);
  rect(ctx, px - 2, py + 4, w + 4, 2, ROOF_LIGHT);
  rect(ctx, px + 6, py + 12, 6, 12, "#3a2c1c");
  rect(ctx, px + w - 12, py + 12, 6, 5, opened ? "#c9a87c" : "#3f4a52");
  rect(ctx, px + w - 12, py + 12, 6, 1, "#2a2420");
}

function drawHangar(ctx, px, py, w, h, opened) {
  rect(ctx, px, py + 10, w, h - 10, "#5c5c62");
  for (let x = px + 4; x < px + w; x += 6) rect(ctx, x, py + 10, 1, h - 10, "#4c4c52");
  rect(ctx, px - 2, py + 4, w + 4, 8, ROOF);
  rect(ctx, px - 2, py + 4, w + 4, 2, ROOF_LIGHT);
  const doorW = opened ? w - 14 : w - 8;
  rect(ctx, px + 4, py + 14, doorW, h - 14, "#7d7d84");
  for (let x = px + 6; x < px + 4 + doorW; x += 5) rect(ctx, x, py + 14, 1, h - 14, "#6a6a70");
  rect(ctx, px + w - 10, py + 14, 6, 5, opened ? "#c9a87c" : "#3f4a52");
  rect(ctx, px + 4, py + 14 + (h - 14) - 2, doorW, 2, "#3a3a40");
}

function drawShed(ctx, px, py, w, h) {
  rect(ctx, px, py + 6, w, h - 6, PLANK);
  rect(ctx, px - 2, py + 2, w + 4, 5, "#5a6268");
  rect(ctx, px - 2, py + 2, w + 4, 1, "#7b838a");
  rect(ctx, px + 5, py + 12, 7, 12, "#3a2c1c");
}

function drawTower(ctx, px, py, w, h) {
  rect(ctx, px + 2, py + 6, 2, h - 4, "#5a5a60");
  rect(ctx, px + w - 4, py + 6, 2, h - 4, "#5a5a60");
  rect(ctx, px + 2, py + 10, w - 4, 1, "#5a5a60");
  rect(ctx, px + 4, py + 16, w - 8, 1, "#5a5a60");
  rect(ctx, px - 2, py - 10, w + 4, 14, "#7b838a");
  rect(ctx, px - 2, py - 10, w + 4, 3, "#9aa2a8");
  rect(ctx, px + 4, py - 16, 6, 6, "#6a7278");
}

// The monoplane under its tarp. The tarp retreats exactly as far as the parts
// fitted take it: this is the one drawing in the game that is a progress bar.
function drawMachine(ctx, px, py, w, fitted, total, t, carbFitted) {
  const y = py + 6;
  // Tail and fuselage
  rect(ctx, px + w - 10, y - 12, 3, 12, "#7f8a8f");
  rect(ctx, px + w - 14, y - 12, 12, 2, "#8f9a9f");
  rect(ctx, px + 6, y, w - 14, 7, "#8f9a9f");
  rect(ctx, px + 6, y + 5, w - 14, 2, "rgba(0,0,0,0.20)");

  // Wing, in fabric, once the panel and spar are on
  if (fitted >= 2) {
    rect(ctx, px + 2, y - 8, 30, 5, "#c9b48c");
    rect(ctx, px + 2, y - 8, 30, 1, "#dccaa4");
    rect(ctx, px + 2, y - 3, 30, 1, "#8a7a5c");
  } else {
    rect(ctx, px + 4, y - 6, 26, 3, "#6f7a80");
    rect(ctx, px + 4, y - 6, 26, 1, "#8f9a9f");
  }

  // The tarp: over the machine, retreating with the work
  const cover = Math.max(0, 1 - fitted / Math.max(1, total));
  if (cover > 0.02) {
    const cw = Math.round((w - 8) * cover);
    const cx = px + 6;
    rect(ctx, cx, y - 14, cw, 22, "#5f6b4a");
    rect(ctx, cx, y - 14, cw, 2, "#74805a");
    rect(ctx, cx, y + 6, cw, 2, "#4a5438");
    for (let x = cx + 4; x < cx + cw; x += 7) rect(ctx, x, y - 10, 1, 16, "#54603f");
  }

  // The radial, sitting on the dirt in front of it, until its carburettor is back
  if (!carbFitted) drawRadial(ctx, px + 14, y + 22, t);
}

function drawRadial(ctx, x, y, t) {
  rect(ctx, x - 9, y - 9, 18, 18, "#4a4a50");
  rect(ctx, x - 7, y - 7, 14, 14, "#5c5c62");
  rect(ctx, x - 3, y - 3, 6, 6, "#3a3a40");
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2 + t * 0.02;
    rect(ctx, x + Math.cos(a) * 6 - 1, y + Math.sin(a) * 6 - 1, 3, 3, "#6f6f76");
  }
}

function drawBench(ctx, px, py) {
  rect(ctx, px - 2, py + 4, 22, 4, PLANK_LIGHT);
  rect(ctx, px - 2, py + 8, 2, 8, PLANK);
  rect(ctx, px + 18, py + 8, 2, 8, PLANK);
  rect(ctx, px + 1, py - 2, 5, 6, "#4a4a50");
  rect(ctx, px + 16, py + 0, 5, 4, "#3a5a6a");
  rect(ctx, px + 8, py + 1, 6, 3, "#8a8a90");
}

function drawCrates(ctx, px, py) {
  rect(ctx, px - 2, py + 8, 14, 8, PLANK);
  rect(ctx, px - 2, py + 8, 14, 1, PLANK_LIGHT);
  rect(ctx, px + 2, py + 2, 11, 7, "#7d5d38");
  rect(ctx, px + 2, py + 2, 11, 1, "#9a7648");
  rect(ctx, px + 12, py + 5, 5, 5, "#6b5030");
}

function drawPump(ctx, px, py) {
  rect(ctx, px, py - 4, 12, 20, "#8a6a3c");
  rect(ctx, px, py - 4, 12, 2, "#a8875c");
  rect(ctx, px + 2, py + 2, 8, 6, "#2a2420");
  rect(ctx, px + 3, py + 3, 6, 2, "#c9a87c");
  rect(ctx, px + 13, py + 6, 6, 2, "#3a3a40");
  rect(ctx, px + 17, py + 6, 2, 8, "#3a3a40");
}

function drawSock(ctx, px, py, t) {
  const sway = Math.sin(t * 1.1) * 2;
  rect(ctx, px + 6, py - 18, 2, 34, "#9aa2a8");
  rect(ctx, px + 6, py - 22, 6, 3, "#7b838a");
  rect(ctx, px + 8, py - 20, 12, 4, "#c96a3a");
  rect(ctx, px + 8 + 12, py - 20 + sway, 4, 4, "#b85a2c");
}

function drawSign(ctx, px, py) {
  rect(ctx, px + 6, py + 2, 2, 14, "#6b5030");
  rect(ctx, px - 6, py - 6, 24, 10, "#8a6a3c");
  rect(ctx, px - 6, py - 6, 24, 1, "#a8875c");
  rect(ctx, px - 3, py - 3, 16, 1, "#4a3a24");
  rect(ctx, px - 3, py, 12, 1, "#4a3a24");
}

function drawBunk(ctx, px, py) {
  rect(ctx, px, py + 8, 16, 7, "#8a8a90");
  rect(ctx, px, py + 8, 16, 2, "#c9b48c");
  rect(ctx, px + 1, py + 4, 5, 4, "#e0d3b4");
}

function drawWreck(ctx, px, py) {
  rect(ctx, px - 4, py + 6, 20, 4, "#7f8a8f");
  rect(ctx, px - 4, py + 6, 20, 1, "#9aa2a8");
  rect(ctx, px + 6, py + 10, 3, 6, "#6f7a80");
  rect(ctx, px + 2, py + 2, 10, 5, "#b9c3cc");
  rect(ctx, px + 2, py + 2, 10, 1, "#d5dce2");
}

function drawDitch(ctx, px, py) {
  rect(ctx, px - 6, py + 8, 26, 5, "#6f6248");
  rect(ctx, px - 6, py + 12, 26, 2, "#5a4f3a");
  rect(ctx, px + 2, py + 4, 14, 3, "#98a3ad");
  rect(ctx, px + 4, py, 10, 3, "#b9c3cc");
}

function drawPile(ctx, px, py) {
  rect(ctx, px - 4, py + 6, 22, 8, "#5a4a30");
  for (let i = 0; i < 5; i += 1) {
    rect(ctx, px - 2 + i * 4, py + 2 + (i % 2) * 3, 3, 8, "#6b5a38");
  }
  rect(ctx, px + 4, py + 10, 10, 3, "#b9c3cc");
}

function drawEngine(ctx, px, py, t) {
  drawRadial(ctx, px + 8, py + 6, t);
}

function drawTyres(ctx, px, py) {
  rect(ctx, px - 4, py + 4, 22, 9, "#31363c");
  rect(ctx, px - 2, py + 1, 20, 8, "#3c4249");
  rect(ctx, px, py - 2, 18, 7, "#464d55");
  rect(ctx, px + 6, py + 6, 6, 3, "#5a5f66");
}

function drawFlotsam(ctx, px, py, t) {
  const bob = Math.sin(t * 1.4) * 1;
  rect(ctx, px + 2, py + 6 + bob, 12, 3, "#8a7a5c");
  rect(ctx, px - 2, py + 9 + bob, 8, 2, "#98a3ad");
  rect(ctx, px + 6, py + 2 + bob, 6, 3, "#b9c3cc");
}

function drawNodeArt(ctx, art, px, py, t) {
  if (art === "wreck") drawWreck(ctx, px, py);
  else if (art === "ditch") drawDitch(ctx, px, py);
  else if (art === "pile") drawPile(ctx, px, py);
  else if (art === "engine") drawEngine(ctx, px, py, t);
  else if (art === "tyres") drawTyres(ctx, px, py);
  else if (art === "crates") drawCrates(ctx, px, py);
  else if (art === "flotsam") drawFlotsam(ctx, px, py, t);
}

function drawPropArt(ctx, object, state) {
  const px = object.x * T;
  const py = object.y * T;
  const w = (object.w || 1) * T;
  const h = (object.h || 1) * T;
  const { t, fitted, total, opened } = state;

  switch (object.art) {
    case "bunkhouse":
      drawBunkhouse(ctx, px, py, w, h, state.lit);
      break;
    case "hangar":
      drawHangar(ctx, px, py, w, h, opened);
      break;
    case "shed":
      drawShed(ctx, px, py, w, h);
      break;
    case "tower":
      drawTower(ctx, px, py, w, h);
      break;
    case "machine":
      drawMachine(ctx, px, py, w, fitted, total, t, state.carbFitted);
      break;
    case "bench":
      drawBench(ctx, px, py);
      break;
    case "crates":
      drawCrates(ctx, px, py);
      break;
    case "pump":
      drawPump(ctx, px, py);
      break;
    case "sock":
      drawSock(ctx, px, py, t);
      break;
    case "sign":
      drawSign(ctx, px, py);
      break;
    case "bunk":
      drawBunk(ctx, px, py);
      break;
    default:
      drawNodeArt(ctx, object.art, px, py, t);
  }
}

// ── Icons ─────────────────────────────────────────────────────────────────
export function drawItemIcon(ctx, key, x, y, s = 3) {
  const item = ITEMS[key] || ITEMS.alu;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const tint = item.tint;
  const shade = item.shade;

  switch (key) {
    case "alu":
      rect(ctx, 1, 3, 9, 6, tint);
      rect(ctx, 1, 3, 9, 1, "#e3e9ee");
      rect(ctx, 1, 8, 9, 1, shade);
      break;
    case "rivet":
      rect(ctx, 1, 4, 3, 3, tint);
      rect(ctx, 5, 2, 3, 3, tint);
      rect(ctx, 8, 6, 3, 3, tint);
      break;
    case "tube":
      rect(ctx, 1, 4, 10, 4, tint);
      rect(ctx, 1, 4, 10, 1, "#cdd6dd");
      rect(ctx, 1, 7, 10, 1, shade);
      rect(ctx, 10, 3, 1, 6, "#6f7a85");
      break;
    case "wire":
      rect(ctx, 2, 3, 8, 2, tint);
      rect(ctx, 1, 5, 7, 2, shade);
      rect(ctx, 3, 7, 8, 2, tint);
      break;
    case "tape":
      rect(ctx, 2, 2, 8, 8, tint);
      rect(ctx, 4, 4, 4, 4, shade);
      break;
    case "brass":
      rect(ctx, 1, 2, 4, 8, tint);
      rect(ctx, 1, 6, 9, 4, tint);
      rect(ctx, 1, 6, 9, 1, "#e0c9a4");
      break;
    case "gasket":
      rect(ctx, 1, 1, 10, 9, tint);
      rect(ctx, 3, 3, 6, 5, shade);
      break;
    case "rubber":
      rect(ctx, 1, 2, 10, 8, tint);
      rect(ctx, 3, 4, 6, 4, shade);
      break;
    case "bolt":
      rect(ctx, 3, 1, 6, 3, tint);
      rect(ctx, 5, 4, 2, 7, shade);
      break;
    default:
      rect(ctx, 2, 2, 8, 8, tint);
  }
  ctx.restore();
}

// ── The world ─────────────────────────────────────────────────────────────
const HOUR_TINT = (hours) => {
  if (hours >= 7) return "rgba(232,178,74,0.10)";
  if (hours >= 5) return "rgba(232,178,74,0.04)";
  if (hours >= 3) return "rgba(201,168,124,0.10)";
  if (hours >= 1) return "rgba(168,85,31,0.18)";
  return "rgba(14,28,38,0.42)";
};

export function renderWorld(ctx, state) {
  const { grid, cam, player, npcs, objects, markers, doc, t } = state;
  const camX = Math.round(cam.x);
  const camY = Math.round(cam.y);

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, VIEW.w, VIEW.h);

  const tx0 = Math.floor(camX / T) - 1;
  const ty0 = Math.floor(camY / T) - 1;
  const tx1 = tx0 + 18;
  const ty1 = ty0 + 14;

  for (let ty = ty0; ty <= ty1; ty += 1) {
    for (let tx = tx0; tx <= tx1; tx += 1) {
      if (tx < 0 || ty < 0 || ty >= grid.length || tx >= grid[0].length) continue;
      const px = tx * T - camX;
      const py = ty * T - camY;
      const ch = grid[ty][tx];
      if (ch === "T") {
        rect(ctx, px, py, T, T, "#41522f");
        drawTree(ctx, px, py, tx, ty);
      } else if (ch === "f") {
        rect(ctx, px, py, T, T, "#4a5438");
        drawFence(ctx, px, py);
      } else {
        drawGround(ctx, ch, px, py, tx, ty, t);
      }
    }
  }

  // Shadows and glints first, then everything standing, sorted by its feet.
  const standing = [];

  objects
    .filter((object) => object.kind === "prop" && object.art && object.art !== "none")
    .forEach((object) => {
      const baseY = (object.y + (object.h || 1)) * T;
      standing.push({
        baseY,
        draw: () =>
          drawPropArt(ctx, object, {
            t,
            fitted: state.fitted,
            total: state.total,
            carbFitted: state.carbFitted,
            opened: state.opened,
            lit: state.lit,
          }),
      });
    });

  objects
    .filter((object) => object.kind === "node" && nodeAvailable(object, doc))
    .forEach((object) => {
      const px = object.x * T - camX + 8;
      const py = object.y * T - camY - 2;
      const bob = Math.sin(t * 2.4 + object.x) * 1.5;
      rect(ctx, px - 1, py + bob, 3, 3, "#e8b24a");
      rect(ctx, px, py + 1 + bob, 1, 1, "#fff3d0");
      standing.push({
        baseY: object.y * T + 16,
        draw: () => drawNodeArt(ctx, object.art, object.x * T - camX, object.y * T - camY, t),
      });
    });

  npcs.forEach((npc) => {
    const px = npc.x - camX;
    const py = npc.y - camY;
    standing.push({
      baseY: npc.y,
      draw: () => {
        if (npc.cast.dog) drawDog(ctx, npc.cast, px, py, npc.dir, npc.frame);
        else drawCharacter(ctx, npc.cast, px, py, npc.dir, npc.frame);
        const mark = markers[npc.key];
        if (mark) {
          const bob = Math.sin(t * 3) * 1.5;
          rect(ctx, px - 1, py - 26 + bob, 3, 7, "#e8b24a");
          rect(ctx, px - 1, py - 18 + bob, 3, 3, "#e8b24a");
          if (mark === "?") rect(ctx, px - 1, py - 26 + bob, 3, 3, "#f2e8d5");
        }
      },
    });
  });

  standing.push({
    baseY: player.y,
    draw: () => drawCharacter(ctx, CAST[YOU], player.x - camX, player.y - camY, player.dir, player.frame),
  });

  standing.sort((a, b) => a.baseY - b.baseY).forEach((item) => item.draw());

  // The hour, over everything.
  const tint = HOUR_TINT(doc.hours ?? 8);
  rect(ctx, 0, 0, VIEW.w, VIEW.h, tint);

  // One slow cloud, for the field to be under.
  const cloud = (t * 9) % (VIEW.w + 220) - 110;
  ctx.fillStyle = "rgba(24,36,30,0.10)";
  ctx.beginPath();
  ctx.ellipse(cloud, 58, 96, 40, 0, 0, Math.PI * 2);
  ctx.fill();
}