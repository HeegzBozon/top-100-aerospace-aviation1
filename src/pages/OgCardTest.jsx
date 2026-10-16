import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Download } from 'lucide-react';

// ─── Brand tokens (shared with ShareableCard) ───────────────────────────────
const b = {
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

const WREATH_URL = 'https://media.base44.com/images/public/68996845be6727838fdb822e/fa0298ddb_Gemini_Generated_Image_s3pahzs3pahzs3pa-removebg-preview.png';

// Miraslava Kazlouskaya — test subject
const TEST_NOMINEE_ID = '696ae3d7baa38cad677d48a2';
const TEST_RANK = 2;
const TEST_YEAR = 2025;

// ─── Deterministic canvas composition (portrait 1080×1350, 4:5) ───────────────
function composeCard(canvas, { photoImg, wreathImg, name, rank, year }) {
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
  // × marks
  ctx.beginPath();
  ctx.moveTo(W - 74, 66); ctx.lineTo(W - 46, 94);
  ctx.moveTo(W - 46, 66); ctx.lineTo(W - 74, 94);
  ctx.stroke();

  // ── Portrait photo centered in laurel wreath ──
  const cx = W / 2;
  const cy = 560;
  const r = 200;

  // Photo circle (clip + draw)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  if (photoImg) {
    // Cover-fit
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

  // Laurel wreath overlay (slightly larger than photo)
  if (wreathImg) {
    const wr = r + 40;
    ctx.drawImage(wreathImg, cx - wr, cy - wr, wr * 2, wr * 2);
  }

  // ── Label between two thin lines ──
  const labelY = 880;
  const label = `TOP 100 WOMEN IN AEROSPACE • ${year}`;
  ctx.font = '600 26px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = b.cream;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // letterSpacing emulation: draw char by char
  const letterSpacing = 4;
  const chars = label.split('');
  const charWidths = chars.map(c => ctx.measureText(c).width);
  const totalW = charWidths.reduce((s, w) => s + w, 0) + letterSpacing * (chars.length - 1);
  let drawX = cx - totalW / 2;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], drawX + charWidths[i] / 2, labelY);
    drawX += charWidths[i] + letterSpacing;
  }

  // Thin lines flanking the label
  const lineY = labelY;
  const lineGap = 24;
  const lineEndL = cx - totalW / 2 - lineGap;
  const lineStartR = cx + totalW / 2 + lineGap;
  ctx.strokeStyle = b.gold;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(120, lineY); ctx.lineTo(lineEndL, lineY);
  ctx.moveTo(lineStartR, lineY); ctx.lineTo(W - 120, lineY);
  ctx.stroke();

  // ── Name on faint grey box ──
  ctx.font = '600 72px Georgia, "Times New Roman", serif';
  const nameMetrics = ctx.measureText(name);
  const nameH = 110;
  const nameBoxY = 960;
  const nameBoxW = Math.min(W - 160, nameMetrics.width + 80);
  const nameBoxX = (W - nameBoxW) / 2;

  // Faint grey box
  ctx.fillStyle = 'rgba(226, 232, 240, 0.08)';
  ctx.beginPath();
  const rad = 8;
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

  // Name text
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, cx, nameBoxY + nameH / 2);

  // ── Bottom tagline (partially visible per spec) ──
  ctx.font = '400 24px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('Aerospace & Aviation', cx, nameBoxY + nameH + 50);
}

// ─── Helper: load an image with crossOrigin ──────────────────────────────────
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function OgCardTest() {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [nominee, setNominee] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const n = await base44.entities.Nominee.get(TEST_NOMINEE_ID);
        if (cancelled) return;
        setNominee(n);
        const photoSrc = n.avatar_url || n.photo_url;
        const [photoImg, wreathImg] = await Promise.all([
          loadImage(photoSrc).catch(() => null),
          loadImage(WREATH_URL).catch(() => null),
        ]);
        if (cancelled) return;
        composeCard(canvasRef.current, {
          photoImg,
          wreathImg,
          name: n.name,
          rank: TEST_RANK,
          year: TEST_YEAR,
        });
        setPreviewUrl(canvasRef.current.toDataURL('image/png'));
        setStatus('ready');
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `OG-${(nominee?.name || 'honoree').replace(/\s+/g, '-')}-2025.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-1">OG Card Test — Portrait Composition</h1>
        <p className="text-sm text-slate-400">Deterministic canvas render using the nominee's real uploaded photo.</p>
      </div>

      {status === 'loading' && (
        <div className="flex items-center gap-2 text-slate-300">
          <Loader2 className="w-5 h-5 animate-spin" /> Composing card…
        </div>
      )}
      {status === 'error' && (
        <p className="text-red-400">Failed to load nominee or compose card.</p>
      )}

      {status === 'ready' && (
        <>
          <div className="rounded-xl overflow-hidden shadow-2xl" style={{ width: 360 }}>
            <img src={previewUrl} alt="OG card preview" className="w-full block" />
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#c9a87c] text-[#0f1f35] font-semibold hover:opacity-90 transition"
          >
            <Download className="w-4 h-4" /> Download PNG
          </button>
          <p className="text-xs text-slate-500 max-w-md text-center">
            1080×1350 (4:5). Her real LinkedIn photo is composited into the copper laurel template.
            Name text is rendered deterministically — no AI, no misspellings.
          </p>
        </>
      )}

      {/* Hidden working canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}