// ─── Layout B social preview: the 100 honorees as a duotone contact sheet ─────
// Deterministic canvas composition at 1200×630 — the social preview ratio.
// A 20 × 5 band of 60px cells on top (100 cells, alphabetical so the order never
// encodes a position), and the type block beneath it. Every cell is duotoned into
// the dual-metal palette, so 100 differently lit headshots read as one artifact
// rather than a scrapbook.
import { b } from '@/components/og-card/ogCardComposer';

export const COLLAGE = {
  W: 1200,
  H: 630,
  COLS: 20,
  ROWS: 5,
  CELL: 60,
  BAND_H: 300,
  CAPACITY: 100,
  // Navy shadows, rose-gold highlights — the brand's dual metal.
  TREATMENT: { dark: b.navyDark, light: b.gold, contrast: 1.12 },
  KICKER: 'THE 2025 EDITION',
  TITLE: '100 Women in Aerospace & Aviation',
  SUBTITLE: 'The verified reputation graph for aerospace and aviation.',
  DOMAIN: 'TOP100AERO.SPACE',
  MOTTO: 'WE DON’T RANK. WE MEASURE.',
};

const PAD = 64;

const hexToRgb = (hex) => {
  const h = String(hex).replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
};

// Map each pixel's luminance onto the dark→light ramp. One pass over the band.
function duotoneInPlace(imageData, darkHex, lightHex, contrast) {
  const dark = hexToRgb(darkHex);
  const light = hexToRgb(lightHex);
  const px = imageData.data;
  for (let i = 0; i < px.length; i += 4) {
    let lum = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;
    lum = Math.min(1, Math.max(0, (lum - 0.5) * contrast + 0.5));
    px[i] = dark.r + (light.r - dark.r) * lum;
    px[i + 1] = dark.g + (light.g - dark.g) * lum;
    px[i + 2] = dark.b + (light.b - dark.b) * lum;
  }
}

// Four-point star mark, matching the star in the masthead lockup.
function drawStar(ctx, cx, cy, outer, inner) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / 4) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function composeCollage(canvas, { honorees = [], images = [] }) {
  const { W, H, COLS, ROWS, CELL, BAND_H, TREATMENT } = COLLAGE;

  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // ── Cream ground ──
  ctx.fillStyle = b.cream;
  ctx.fillRect(0, 0, W, H);

  // ── Mosaic band, composed offscreen so the duotone is one pass ──
  const band = document.createElement('canvas');
  band.width = W;
  band.height = BAND_H;
  const bctx = band.getContext('2d', { willReadFrequently: true });
  bctx.fillStyle = b.navyDark;
  bctx.fillRect(0, 0, W, BAND_H);

  const cellCount = COLS * ROWS;
  honorees.slice(0, cellCount).forEach((h, i) => {
    const img = images[i];
    if (!img) return;
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = col * CELL;
    const y = row * CELL;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    // Cover-crop each headshot into its square cell.
    const s = Math.max(CELL / iw, CELL / ih);
    bctx.drawImage(img, x + (CELL - iw * s) / 2, y + (CELL - ih * s) / 2, iw * s, ih * s);
  });

  const bandData = bctx.getImageData(0, 0, W, BAND_H);
  duotoneInPlace(bandData, TREATMENT.dark, TREATMENT.light, TREATMENT.contrast);
  bctx.putImageData(bandData, 0, 0);
  ctx.drawImage(band, 0, 0);

  // ── Designed cell for honorees without a usable photo — a mark, never a gap ──
  honorees.slice(0, cellCount).forEach((h, i) => {
    if (images[i]) return;
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = col * CELL;
    const y = row * CELL;
    ctx.fillStyle = b.navyDark;
    ctx.fillRect(x, y, CELL, CELL);
    ctx.strokeStyle = b.gold + '59';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1);
    ctx.fillStyle = b.gold;
    drawStar(ctx, x + CELL / 2, y + CELL / 2, 13, 4);
    ctx.fill();
  });

  // ── Proof-sheet hairlines ──
  ctx.strokeStyle = 'rgba(250,248,245,0.22)';
  ctx.lineWidth = 1;
  for (let c = 1; c < COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * CELL + 0.5, 0);
    ctx.lineTo(c * CELL + 0.5, BAND_H);
    ctx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * CELL + 0.5);
    ctx.lineTo(W, r * CELL + 0.5);
    ctx.stroke();
  }

  // ── Structural copper rule between band and type ──
  ctx.fillStyle = b.copper;
  ctx.fillRect(0, BAND_H, W, 3);

  // ── Type block ──
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  ctx.font = '900 15px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '0.26em';
  ctx.fillStyle = b.copper;
  ctx.fillText(COLLAGE.KICKER, PAD, 340);
  ctx.letterSpacing = '0';

  ctx.font = 'bold 48px Georgia, "Times New Roman", serif';
  ctx.fillStyle = b.navy;
  ctx.fillText(COLLAGE.TITLE, PAD, 366);

  ctx.fillStyle = b.copper;
  ctx.fillRect(PAD, 444, 84, 2);

  ctx.font = '19px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(30,58,90,0.78)';
  ctx.fillText(COLLAGE.SUBTITLE, PAD, 462);

  ctx.fillStyle = b.gold + '66';
  ctx.fillRect(PAD, 556, W - PAD * 2, 1);

  ctx.textBaseline = 'middle';
  ctx.font = '900 15px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '0.16em';
  ctx.fillStyle = b.navy;
  ctx.fillText(COLLAGE.DOMAIN, PAD, 590);
  ctx.textAlign = 'right';
  ctx.fillStyle = b.copper;
  ctx.font = '900 14px system-ui, -apple-system, sans-serif';
  ctx.fillText(COLLAGE.MOTTO, W - PAD, 590);
  ctx.letterSpacing = '0';
  ctx.textAlign = 'left';
}

// PNG export lives in the page — it downloads straight from the composed canvas.