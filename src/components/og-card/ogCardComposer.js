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

// ─── Deterministic canvas composition (landscape 1200×630, the social ratio) ──
// Single source of truth for the shareable card. The Download PNG, native share,
// and every honoree's Open Graph image all render this one composition at this
// one size, so a shared link previews exactly what the card file contains.
export function composeCard(canvas, {
  photoImg,
  wreathImg,
  name = '',
  rank,
  year = 2025,
  label,
  title,
  company,
  country,
  sixWordStory,
  bio,
}) {
  const W = 1200, H = 630;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const roundRect = (x, y, w, h, rad) => {
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

  // Truncate to the column width with a clean ellipsis
  const fit = (text, maxW) => {
    let t = String(text ?? '');
    if (ctx.measureText(t).width <= maxW) return t;
    while (t.length > 1 && ctx.measureText(t).width > maxW) t = t.slice(0, -1);
    return t.replace(/[,;:.\s]+$/, '') + '…';
  };

  // ── Background gradient ──
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, b.navyDark);
  bg.addColorStop(0.45, '#162840');
  bg.addColorStop(1, '#1d3d68');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Ambient glow spots ──
  const glow = (gx, gy, gr, colour) => {
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
    g.addColorStop(0, colour);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
  };
  glow(-103, -103, 549, b.gold + '18');
  glow(1131, 767, 617, b.sky + '15');

  // ── Dot-grid texture ──
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  for (let x = 0; x < W; x += 31) {
    for (let y = 0; y < H; y += 31) {
      ctx.beginPath();
      ctx.arc(x, y, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Top gold accent bar ──
  const bar = ctx.createLinearGradient(0, 0, W, 0);
  bar.addColorStop(0, 'transparent');
  bar.addColorStop(0.2, b.gold + 'e6');
  bar.addColorStop(0.5, b.goldLight);
  bar.addColorStop(0.8, b.gold + 'e6');
  bar.addColorStop(1, 'transparent');
  ctx.fillStyle = bar;
  ctx.fillRect(0, 0, W, 5);

  // ── Vertical gold rule between the two columns ──
  const rule = ctx.createLinearGradient(0, 65, 0, H - 65);
  rule.addColorStop(0, 'transparent');
  rule.addColorStop(0.3, b.gold + '80');
  rule.addColorStop(0.7, b.gold + 'b3');
  rule.addColorStop(1, 'transparent');
  ctx.fillStyle = rule;
  ctx.fillRect(377, 65, 2, H - 130);

  // ── LEFT: photo medallion inside the laurel wreath ──
  const cx = 188, cy = 299, r = 117;

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
    ctx.fillStyle = b.goldLight;
    ctx.font = 'bold 90px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((name || '?').charAt(0), cx, cy);
  }
  ctx.restore();

  // Photo ring
  ctx.strokeStyle = b.gold + 'b3';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Wreath overlay
  if (wreathImg) {
    const wr = r + 27;
    ctx.drawImage(wreathImg, cx - wr, cy - wr, wr * 2, wr * 2);
  }

  // ── Country chip ──
  if (country) {
    ctx.font = '600 18px system-ui, -apple-system, sans-serif';
    const chipText = `📍 ${country}`;
    const chipH = 36;
    const chipW = ctx.measureText(chipText).width + 36;
    const chipX = cx - chipW / 2;
    const chipY = cy + r + 26;
    ctx.fillStyle = b.sky + '33';
    ctx.strokeStyle = b.sky + '59';
    ctx.lineWidth = 1.6;
    roundRect(chipX, chipY, chipW, chipH, chipH / 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = b.sky;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(chipText, cx, chipY + chipH / 2);
  }

  // ── RIGHT: content column ──
  const rx = 411, ry = 96, maxW = W - rx - 34;

  // Recognition badge
  ctx.font = '900 16px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '0';
  const badgeText = `${rank ? `#${rank} · ` : ''}${label || `TOP 100 WOMEN IN AEROSPACE ${year}`}`;
  const badgeW = ctx.measureText(badgeText).width + badgeText.length * 2.9 + 48;
  const badgeGrad = ctx.createLinearGradient(rx, 0, rx + badgeW, 0);
  badgeGrad.addColorStop(0, b.goldDeep);
  badgeGrad.addColorStop(0.6, b.gold);
  badgeGrad.addColorStop(1, b.goldLight);
  ctx.fillStyle = badgeGrad;
  roundRect(rx, ry, badgeW, 36, 18);
  ctx.fill();
  ctx.fillStyle = b.navyDark;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '0.18em';
  ctx.fillText(badgeText, rx + 24, ry + 18);
  ctx.letterSpacing = '0';

  // Name
  ctx.font = 'bold 52px Georgia, "Times New Roman", serif';
  ctx.fillStyle = b.cream;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  let textY = ry + 55;
  ctx.fillText(fit(name, maxW), rx, textY);
  textY += 65;

  // Title · Company
  const titleStr = [title, company].filter(Boolean).join(' · ');
  if (titleStr) {
    ctx.font = '600 19px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = b.goldLight;
    ctx.fillText(fit(titleStr, maxW), rx, textY);
    textY += 29;
  }

  // Gold rule
  ctx.fillStyle = b.gold + 'e6';
  ctx.fillRect(rx, textY + 10, 82, 2);
  textY += 32;

  // Six-word story — the headline
  if (sixWordStory) {
    ctx.font = 'italic 600 24px Georgia, "Times New Roman", serif';
    ctx.fillStyle = b.goldLight;
    const words = `“${sixWordStory}”`.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(test).width > maxW) {
        ctx.fillText(line, rx, textY);
        textY += 36;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, rx, textY);
      textY += 36;
    }
    textY += 7;
  }

  // Bio — two lines maximum
  if (bio) {
    ctx.font = '19px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = b.cream + 'd9';
    const words = String(bio).split(' ');
    let line = '';
    let lines = 0;
    let truncated = false;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(test).width > maxW) {
        if (lines >= 1) {
          ctx.fillText(line.replace(/[,;:.]?$/, '') + '…', rx, textY);
          truncated = true;
          break;
        }
        ctx.fillText(line, rx, textY);
        textY += 29;
        lines++;
        line = word;
      } else {
        line = test;
      }
    }
    if (!truncated && line) ctx.fillText(line, rx, textY);
  }

  // ── Footer bar ──
  const footerH = 55;
  const footerGrad = ctx.createLinearGradient(0, 0, W, 0);
  footerGrad.addColorStop(0, b.navyDark + 'f0');
  footerGrad.addColorStop(1, b.navyDark + 'cc');
  ctx.fillStyle = footerGrad;
  ctx.fillRect(0, H - footerH, W, footerH);
  ctx.strokeStyle = b.gold + '4d';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, H - footerH);
  ctx.lineTo(W, H - footerH);
  ctx.stroke();

  ctx.font = '900 14px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = b.gold;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('TOP 100 AEROSPACE & AVIATION', 39, H - footerH / 2);
  ctx.font = '14px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = b.cream + '73';
  ctx.textAlign = 'right';
  ctx.fillText(`The Orbital Edition · ${year}`, W - 39, H - footerH / 2);
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

// ─── Render the card to a PNG File (for upload) ──────────────────────────────
export async function renderCardToFile(card, wreathImg) {
  const canvas = document.createElement('canvas');
  const photoImg = card.photoSrc ? await loadImage(card.photoSrc).catch(() => null) : null;
  composeCard(canvas, { ...card, photoImg, wreathImg });
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  const safeName = String(card.name || 'honoree').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return new File([blob], `og-${card.rank ?? ''}-${safeName}.png`.replace(/--+/g, '-'), { type: 'image/png' });
}