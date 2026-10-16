// ─── Brand tokens (shared with ShareableCard) ───────────────────────────────
export const b = {
  navy:      '#1e3a5a',
  navyMid:   '#2a4f7c',
  navyDark:  '#0f1f35',
  sky:       '#4a90b8',
  gold:      '#c9a87c',
  goldLight: '#e8d4b8',
  goldDeep:  '#a07840',
  copper:    '#b87333',
  copperLight: '#d9a98e',
  cream:     '#faf8f5',
  greyBox:   '#e2e8f0',
};

export const WREATH_URL = 'https://media.base44.com/images/public/68996845be6727838fdb822e/fa0298ddb_Gemini_Generated_Image_s3pahzs3pahzs3pa-removebg-preview.png';

// ─── Deterministic canvas composition (portrait 1080×1350, 4:5) ───────────────
export function composeCard(canvas, { photoImg, wreathImg, name, rank, year, label }) {
  const W = 1080, H = 1350;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // ── Background: deep navy gradient ──
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0f172a');
  bg.addColorStop(0.5, '#13263d');
  bg.addColorStop(1, '#0f1f35');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Dot-grid texture ──
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let x = 0; x < W; x += 22) {
    for (let y = 0; y < H; y += 22) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Rank numeral (top-left, large serif) ──
  ctx.font = '300 140px Georgia, "Times New Roman", serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(String(rank), 60, 40);

  // ── Close × (top-right circle) ──
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(W - 60, 80, 26, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W - 74, 66); ctx.lineTo(W - 46, 94);
  ctx.moveTo(W - 46, 66); ctx.lineTo(W - 74, 94);
  ctx.stroke();

  // ── Portrait photo centered in laurel wreath ──
  const cx = W / 2;
  const cy = 560;
  const r = 200;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  if (photoImg) {
    const pw = photoImg.naturalWidth || photoImg.width;
    const ph = photoImg.naturalHeight || photoImg.height;
    const scale = Math.max((r * 2) / pw, (r * 2) / ph);
    const dw = pw * scale;
    const dh = ph * scale;
    ctx.drawImage(photoImg, cx - dw / 2, cy - dh / 2, dw, dh);
  } else {
    ctx.fillStyle = b.navyMid;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  ctx.restore();

  // Copper ring around photo
  const ringGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  ringGrad.addColorStop(0, b.copper);
  ringGrad.addColorStop(0.5, b.copperLight);
  ringGrad.addColorStop(1, b.copper);
  ctx.strokeStyle = ringGrad;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Laurel wreath overlay
  if (wreathImg) {
    const wr = r + 40;
    ctx.drawImage(wreathImg, cx - wr, cy - wr, wr * 2, wr * 2);
  }

  // ── Label between two thin lines ──
  const labelY = 880;
  const labelText = label || `TOP 100 WOMEN IN AEROSPACE • ${year}`;
  ctx.font = '600 26px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = b.cream;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const letterSpacing = 4;
  const chars = labelText.split('');
  const charWidths = chars.map(c => ctx.measureText(c).width);
  const totalW = charWidths.reduce((s, w) => s + w, 0) + letterSpacing * (chars.length - 1);
  let drawX = cx - totalW / 2;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], drawX + charWidths[i] / 2, labelY);
    drawX += charWidths[i] + letterSpacing;
  }

  // Thin lines flanking the label
  const lineEndL = cx - totalW / 2 - 24;
  const lineStartR = cx + totalW / 2 + 24;
  ctx.strokeStyle = b.gold;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(120, labelY); ctx.lineTo(lineEndL, labelY);
  ctx.moveTo(lineStartR, labelY); ctx.lineTo(W - 120, labelY);
  ctx.stroke();

  // ── Name on faint grey box ──
  ctx.font = '600 72px Georgia, "Times New Roman", serif';
  const nameMetrics = ctx.measureText(name);
  const nameH = 110;
  const nameBoxY = 960;
  const nameBoxW = Math.min(W - 160, nameMetrics.width + 80);
  const nameBoxX = (W - nameBoxW) / 2;

  ctx.fillStyle = 'rgba(226, 232, 240, 0.08)';
  const rad = 8;
  ctx.beginPath();
  ctx.moveTo(nameBoxX + rad, nameBoxY);
  ctx.lineTo(nameBoxX + nameBoxW - rad, nameBoxY);
  ctx.quadraticCurveTo(nameBoxX + nameBoxW, nameBoxY, nameBoxX + nameBoxW, nameBoxY + rad);
  ctx.lineTo(nameBoxX + nameBoxW, nameBoxY + nameH - rad);
  ctx.quadraticCurveTo(nameBoxX + nameBoxW, nameBoxY + nameH, nameBoxX + nameBoxW - rad, nameBoxY + nameH);
  ctx.lineTo(nameBoxX + rad, nameBoxY + nameH);
  ctx.quadraticCurveTo(nameBoxX, nameBoxY + nameH, nameBoxX, nameBoxY + nameH - rad);
  ctx.lineTo(nameBoxX, nameBoxY + rad);
  ctx.quadraticCurveTo(nameBoxX, nameBoxY, nameBoxX + rad, nameBoxY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, cx, nameBoxY + nameH / 2);

  // ── Bottom tagline ──
  ctx.font = '400 24px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('Aerospace & Aviation', cx, nameBoxY + nameH + 50);
}

// ─── Helper: load an image with crossOrigin ──────────────────────────────────
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ─── Render a card to a PNG File (for upload) ────────────────────────────────
export async function renderCardToFile({ photoSrc, name, rank, year, label }, wreathImg) {
  const canvas = document.createElement('canvas');
  const photoImg = photoSrc ? await loadImage(photoSrc).catch(() => null) : null;
  composeCard(canvas, { photoImg, wreathImg, name, rank, year, label });
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  const safeName = name.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return new File([blob], `og-${rank}-${safeName}.png`, { type: 'image/png' });
}