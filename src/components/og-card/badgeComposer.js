import { b } from '@/components/og-card/ogCardComposer';

// ─── The 1200×1200 badge — the avatar artifact ───────────────────────────────
// Composed to a SAFE CIRCLE: LinkedIn shows a profile photo cropped to a circle,
// from ~40px in comments up to ~200px on the profile itself. Every element sits
// inside radius SAFE_R of the center, so a circular crop loses nothing.
//
// Deliberately absent: name, position number, rank, flag. This file becomes a
// member's own public face on their personal account — it carries the portrait,
// the laurel, and one factual line of country. No mark of position, because the
// institution measures rather than ranks.
export const BADGE = {
  SIZE: 1200,
  PHOTO_R: 380,
  CENTER_Y: 540,
  WREATH_R: 465,
  PILL_Y: 1040,
  PILL_H: 56,
  SAFE_R: 570,
};

const roundRect = (ctx, x, y, w, h, rad) => {
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
};

export function composeBadge(canvas, { photoImg, wreathImg, countryLabel, name = '' }) {
  const S = BADGE.SIZE;
  const { PHOTO_R: R, CENTER_Y: cy, WREATH_R, PILL_Y, PILL_H } = BADGE;
  const cx = S / 2;

  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d');

  // ── Ground ──
  const bg = ctx.createLinearGradient(0, 0, S, S);
  bg.addColorStop(0, b.navyDark);
  bg.addColorStop(0.45, '#162840');
  bg.addColorStop(1, '#1d3d68');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, S, S);

  // Ambient light, gold at the crown and sky at the base
  const glow = (gx, gy, gr, colour) => {
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
    g.addColorStop(0, colour);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
  };
  glow(cx, -140, 780, b.gold + '18');
  glow(S + 120, S + 60, 820, b.sky + '16');

  // Dot-grid texture
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  for (let x = 0; x < S; x += 31) {
    for (let y = 0; y < S; y += 31) {
      ctx.beginPath();
      ctx.arc(x, y, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Soft vignette so the circular crop reads as a lit medallion, not a flat square
  const vig = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, S * 0.78);
  vig.addColorStop(0, 'transparent');
  vig.addColorStop(1, b.navyDark + 'cc');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, S, S);

  // ── Portrait, clipped to the medallion ──
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();
  if (photoImg) {
    const pw = photoImg.naturalWidth || photoImg.width;
    const ph = photoImg.naturalHeight || photoImg.height;
    const scale = Math.max((R * 2) / pw, (R * 2) / ph);
    const dw = pw * scale;
    const dh = ph * scale;
    ctx.drawImage(photoImg, cx - dw / 2, cy - dh / 2, dw, dh);
  } else {
    // Designed fallback — a mark, never a broken image or a gap
    ctx.fillStyle = b.navyMid;
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    ctx.fillStyle = b.goldLight;
    ctx.font = 'bold 300px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((name || '?').trim().charAt(0).toUpperCase(), cx, cy + 12);
  }
  ctx.restore();

  // Photo ring — rose gold, the masthead metal
  ctx.strokeStyle = b.gold + 'b3';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();

  // ── Laurel wreath, the framing mark ──
  if (wreathImg) {
    ctx.drawImage(wreathImg, cx - WREATH_R, cy - WREATH_R, WREATH_R * 2, WREATH_R * 2);
  }

  // ── Country: one factual line, text only ──
  // Omitted entirely when the stored value is not a country (a city or region),
  // rather than printing something the member never claimed.
  if (countryLabel) {
    const text = String(countryLabel).toUpperCase();
    ctx.font = '700 30px system-ui, -apple-system, sans-serif';
    ctx.letterSpacing = '0.16em';
    const textW = ctx.measureText(text).width;
    ctx.letterSpacing = '0';

    const pillW = textW + 64;
    const pillX = cx - pillW / 2;
    const pillY = PILL_Y - PILL_H / 2;

    ctx.fillStyle = '#1c2a3f';
    ctx.strokeStyle = b.gold + '59';
    ctx.lineWidth = 1.6;
    roundRect(ctx, pillX, pillY, pillW, PILL_H, PILL_H / 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = b.cream;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '0.16em';
    ctx.fillText(text, cx, PILL_Y + 1);
    ctx.letterSpacing = '0';
  }
}