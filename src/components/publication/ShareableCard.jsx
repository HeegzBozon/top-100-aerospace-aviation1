import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Linkedin, Link2, Check, Loader2, X, Share2 } from 'lucide-react';

// ─── Brand tokens ────────────────────────────────────────────────────────────
const b = {
  navy:      '#1e3a5a',
  navyMid:   '#2a4f7c',
  navyDark:  '#0f1f35',
  sky:       '#4a90b8',
  gold:      '#c9a87c',
  goldLight: '#e8d4b8',
  goldDeep:  '#a07840',
  rose:      '#d4a090',
  cream:     '#faf8f5',
};

const WREATH_URL = 'https://media.base44.com/images/public/68996845be6727838fdb822e/fa0298ddb_Gemini_Generated_Image_s3pahzs3pahzs3pa-removebg-preview.png';

// ─── Exportable card (1200×630 social OG ratio) ───────────────────────────────
const HonoreeCard = React.forwardRef(({ nominee, rank, photoDataUrl, wreathDataUrl }, ref) => {
  const photo = photoDataUrl;
  const bio   = nominee.description || nominee.bio;

  return (
    <div
      ref={ref}
      className="relative overflow-hidden select-none"
      style={{
        width: 700,
        height: 390,
        fontFamily: "'Georgia', 'Times New Roman', serif",
        background: `linear-gradient(145deg, ${b.navyDark} 0%, #162840 45%, #1d3d68 100%)`,
      }}
    >
      {/* ── Ambient glow spots ── */}
      <div className="absolute pointer-events-none" style={{
        top: -60, left: -60, width: 320, height: 320, borderRadius: '50%',
        background: `radial-gradient(circle, ${b.gold}18 0%, transparent 65%)`
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: -80, right: -40, width: 360, height: 360, borderRadius: '50%',
        background: `radial-gradient(circle, ${b.sky}15 0%, transparent 65%)`
      }} />

      {/* ── Dot-grid texture ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        opacity: 0.07,
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
        backgroundSize: '18px 18px',
      }} />

      {/* ── Elegant top accent bar ── */}
      <div className="absolute top-0 left-0 right-0" style={{ height: 3,
        background: `linear-gradient(90deg, transparent 0%, ${b.gold}90 20%, ${b.goldLight} 50%, ${b.gold}90 80%, transparent 100%)` }} />

      {/* ── Vertical gold rule ── */}
      <div className="absolute top-10 bottom-10" style={{ left: 220, width: 1,
        background: `linear-gradient(to bottom, transparent, ${b.gold}50, ${b.gold}70, ${b.gold}50, transparent)` }} />

      {/* ── LEFT: Photo column ── */}
      <div className="absolute top-0 bottom-0 flex flex-col items-center justify-center gap-3"
        style={{ left: 0, width: 220 }}>

        {/* Wreath medallion */}
        <div className="relative" style={{ width: 168, height: 168 }}>
          {/* Glow ring behind wreath */}
          <div className="absolute inset-0 rounded-full pointer-events-none" style={{
            boxShadow: `0 0 32px ${b.gold}35, 0 0 64px ${b.gold}15`
          }} />
          {/* Photo clipped to circle inside wreath */}
          <div className="absolute rounded-full overflow-hidden" style={{
            inset: '12%',
            boxShadow: `0 0 0 2.5px ${b.gold}70, 0 8px 28px rgba(0,0,0,0.75)`
          }}>
            {photo && photo.startsWith('data:') ? (
              <img src={photo} alt={nominee.name}
                className="w-full h-full object-cover object-top" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold"
                style={{ background: `linear-gradient(135deg,${b.navyMid},${b.navy})`, color: b.goldLight }}>
                {nominee.name?.charAt(0)}
              </div>
            )}
          </div>
          {/* Wreath on top — only rendered once data URL is ready */}
          {wreathDataUrl && wreathDataUrl.startsWith('data:') && (
            <img src={wreathDataUrl} alt="" aria-hidden
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }} />
          )}
        </div>

        {/* Country chip */}
        {nominee.country && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: `${b.sky}20`, border: `1px solid ${b.sky}35` }}>
            <span style={{ fontSize: 11, color: b.sky, fontFamily: 'system-ui', fontWeight: 600, letterSpacing: '0.04em' }}>
              📍 {nominee.country}
            </span>
          </div>
        )}
      </div>

      {/* ── RIGHT: Content column ── */}
      <div className="absolute top-0 bottom-0 flex flex-col justify-center"
        style={{ left: 236, right: 28, paddingTop: 16, paddingBottom: 48 }}>

        {/* Rank badge */}
        <div style={{ marginBottom: 12 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 14px', borderRadius: 999,
            background: `linear-gradient(135deg, ${b.goldDeep} 0%, ${b.gold} 60%, ${b.goldLight} 100%)`,
            color: b.navyDark, fontSize: 10, fontWeight: 900,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            fontFamily: 'system-ui, sans-serif',
            boxShadow: `0 2px 12px ${b.gold}50`,
          }}>
            {rank ? `#${rank} · ` : ''}TOP 100 WOMEN IN AEROSPACE 2025
          </span>
        </div>

        {/* Name */}
        <h2 style={{
          margin: 0, marginBottom: 6, lineHeight: 1.1,
          fontSize: 34, fontWeight: 700, color: b.cream,
          letterSpacing: '-0.02em',
          textShadow: '0 2px 16px rgba(0,0,0,0.6)',
        }}>
          {nominee.name}
        </h2>

        {/* Title + company */}
        {(nominee.title || nominee.professional_role) && (
          <p style={{
            margin: 0, marginBottom: 2,
            fontSize: 13, fontWeight: 600, color: b.goldLight,
            fontFamily: 'system-ui, sans-serif', lineHeight: 1.4,
          }}>
            {nominee.title || nominee.professional_role}
            {nominee.company && (
              <span style={{ color: `${b.cream}50`, fontWeight: 400 }}> · {nominee.company}</span>
            )}
          </p>
        )}

        {/* Gold rule */}
        <div style={{ margin: '10px 0', height: 1, width: 48,
          background: `linear-gradient(to right, ${b.gold}90, transparent)` }} />

        {/* Bio excerpt */}
        {bio && (
          <p style={{
            margin: 0, fontSize: 12, lineHeight: 1.65, color: `${b.cream}85`,
            fontFamily: 'system-ui, sans-serif',
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {bio}
          </p>
        )}

        {/* Six-word story */}
        {nominee.six_word_story && (
          <p style={{
            margin: '8px 0 0', fontSize: 11,
            fontStyle: 'italic', color: `${b.goldLight}cc`,
            fontFamily: 'Georgia, serif',
            flexShrink: 0,
          }}>
            "{nominee.six_word_story}"
          </p>
        )}
      </div>

      {/* ── Footer bar ── */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between"
        style={{
          padding: '8px 24px',
          background: `linear-gradient(90deg, ${b.navyDark}f0 0%, ${b.navyDark}cc 100%)`,
          borderTop: `1px solid ${b.gold}30`,
        }}>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: b.gold, fontFamily: 'system-ui' }}>
          TOP 100 Aerospace &amp; Aviation
        </span>
        <div className="flex items-center gap-2">
          <div style={{ width: 1, height: 10, background: `${b.gold}40` }} />
          <span style={{ fontSize: 10, color: `${b.cream}45`, fontFamily: 'system-ui', letterSpacing: '0.06em' }}>
            The Orbital Edition · 2025
          </span>
        </div>
      </div>
    </div>
  );
});
HonoreeCard.displayName = 'HonoreeCard';

// ─── Action button ────────────────────────────────────────────────────────────
function ActionBtn({ onClick, disabled, icon: Icon, label, bg, textColor = 'white', border }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex items-center justify-center gap-2.5 rounded-2xl text-sm font-bold transition-all hover:scale-[1.03] hover:brightness-110 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ background: bg, color: textColor, border: border || 'none', minHeight: 48, padding: '0 20px' }}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </button>
  );
}

// ─── Root modal ───────────────────────────────────────────────────────────────
export default function ShareableCard({ nominee, rank, onClose }) {
  const cardRef   = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied]           = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [wreathDataUrl, setWreathDataUrl] = useState(null);

  // Pre-convert photo + wreath to data URLs so html2canvas can capture them
  useEffect(() => {
    const toDataUrl = (src, onDone) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        try { onDone(canvas.toDataURL('image/png')); } catch { onDone(src); }
      };
      img.onerror = () => onDone(src);
      img.src = src;
    };

    const photoSrc = nominee.avatar_url || nominee.photo_url;
    if (photoSrc) toDataUrl(photoSrc, setPhotoDataUrl);
    toDataUrl(WREATH_URL, setWreathDataUrl);
  }, [nominee.avatar_url, nominee.photo_url]);

  const shareUrl  = `${window.location.origin}/Top100Women2025`;
  const shareText = `Congratulations to ${nominee.name} — named to the TOP 100 Women in Aerospace & Aviation 2025! #TOP100Aerospace #WomenInAviation`;

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const W = 700, H = 390, SCALE = 2;
      const canvas = document.createElement('canvas');
      canvas.width = W * SCALE;
      canvas.height = H * SCALE;
      const ctx = canvas.getContext('2d');
      ctx.scale(SCALE, SCALE);

      // ── Background gradient ──
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0,    b.navyDark);
      bg.addColorStop(0.45, '#162840');
      bg.addColorStop(1,    '#1d3d68');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // ── Top gold accent bar ──
      const bar = ctx.createLinearGradient(0, 0, W, 0);
      bar.addColorStop(0,    'transparent');
      bar.addColorStop(0.2,  b.gold + 'e6');
      bar.addColorStop(0.5,  b.goldLight);
      bar.addColorStop(0.8,  b.gold + 'e6');
      bar.addColorStop(1,    'transparent');
      ctx.fillStyle = bar;
      ctx.fillRect(0, 0, W, 3);

      // ── Vertical gold rule ──
      const rule = ctx.createLinearGradient(0, 40, 0, H - 40);
      rule.addColorStop(0,   'transparent');
      rule.addColorStop(0.3, b.gold + '80');
      rule.addColorStop(0.7, b.gold + 'b3');
      rule.addColorStop(1,   'transparent');
      ctx.fillStyle = rule;
      ctx.fillRect(220, 40, 1, H - 80);

      // ── Photo circle ──
      const cx = 110, cy = H / 2 - 10, r = 68;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      if (photoDataUrl && photoDataUrl.startsWith('data:')) {
        const photo = new Image();
        photo.src = photoDataUrl;
        ctx.drawImage(photo, cx - r, cy - r, r * 2, r * 2);
      } else {
        ctx.fillStyle = b.navyMid;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
        ctx.fillStyle = b.goldLight;
        ctx.font = 'bold 48px Georgia';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(nominee.name?.charAt(0) || '?', cx, cy);
      }
      ctx.restore();

      // Photo ring
      ctx.strokeStyle = b.gold + 'b3';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // ── Wreath overlay ──
      if (wreathDataUrl && wreathDataUrl.startsWith('data:')) {
        const wreath = new Image();
        wreath.src = wreathDataUrl;
        const wr = r + 16;
        ctx.drawImage(wreath, cx - wr, cy - wr, wr * 2, wr * 2);
      }

      // ── Country chip ──
      if (nominee.country) {
        ctx.font = '600 11px system-ui';
        const chipText = `📍 ${nominee.country}`;
        const chipW = ctx.measureText(chipText).width + 20;
        const chipX = cx - chipW / 2;
        const chipY = cy + r + 16;
        ctx.fillStyle = b.sky + '33';
        ctx.strokeStyle = b.sky + '59';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(chipX, chipY, chipW, 22, 11);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = b.sky;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(chipText, cx, chipY + 11);
      }

      // ── RIGHT: content ──
      const rx = 240, ry = 28, maxW = W - rx - 20;

      // Rank badge
      ctx.font = '900 10px system-ui';
      const badgeText = `${rank ? `#${rank} · ` : ''}TOP 100 WOMEN IN AEROSPACE 2025`;
      const badgeW = ctx.measureText(badgeText).width + 28;
      const badgeGrad = ctx.createLinearGradient(rx, 0, rx + badgeW, 0);
      badgeGrad.addColorStop(0, b.goldDeep);
      badgeGrad.addColorStop(0.6, b.gold);
      badgeGrad.addColorStop(1, b.goldLight);
      ctx.fillStyle = badgeGrad;
      ctx.beginPath();
      ctx.roundRect(rx, ry, badgeW, 22, 11);
      ctx.fill();
      ctx.fillStyle = b.navyDark;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '0.18em';
      ctx.fillText(badgeText, rx + 14, ry + 11);
      ctx.letterSpacing = '0';

      // Name
      ctx.font = 'bold 32px Georgia, serif';
      ctx.fillStyle = b.cream;
      ctx.textBaseline = 'top';
      let textY = ry + 34;
      // Truncate name to fit
      let nameText = nominee.name || '';
      while (ctx.measureText(nameText).width > maxW && nameText.length > 1) {
        nameText = nameText.slice(0, -1);
      }
      if (nameText !== nominee.name) nameText += '…';
      ctx.fillText(nameText, rx, textY);
      textY += 40;

      // Title + company
      const titleStr = [nominee.title || nominee.professional_role, nominee.company].filter(Boolean).join(' · ');
      if (titleStr) {
        ctx.font = '600 12px system-ui';
        ctx.fillStyle = b.goldLight;
        let t = titleStr;
        while (ctx.measureText(t).width > maxW && t.length > 1) t = t.slice(0, -1);
        if (t !== titleStr) t += '…';
        ctx.fillText(t, rx, textY);
        textY += 18;
      }

      // Gold rule
      ctx.fillStyle = b.gold + 'e6';
      ctx.fillRect(rx, textY + 6, 48, 1);
      textY += 20;

      // Bio (3 lines max)
      const bio = nominee.description || nominee.bio;
      if (bio) {
        ctx.font = '12px system-ui';
        ctx.fillStyle = b.cream + 'd9';
        const words = bio.split(' ');
        let line = '', lineCount = 0;
        for (const word of words) {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width > maxW) {
            if (lineCount >= 2) { ctx.fillText(line + '…', rx, textY); break; }
            ctx.fillText(line, rx, textY);
            textY += 18; lineCount++;
            line = word;
          } else {
            line = test;
          }
        }
        if (lineCount < 3 && line) { ctx.fillText(line, rx, textY); textY += 18; }
        textY += 4;
      }

      // Six-word story
      if (nominee.six_word_story) {
        ctx.font = 'italic 11px Georgia, serif';
        ctx.fillStyle = b.goldLight + 'cc';
        ctx.fillText(`"${nominee.six_word_story}"`, rx, textY + 4);
      }

      // ── Footer bar ──
      const footerGrad = ctx.createLinearGradient(0, 0, W, 0);
      footerGrad.addColorStop(0, b.navyDark + 'f0');
      footerGrad.addColorStop(1, b.navyDark + 'cc');
      ctx.fillStyle = footerGrad;
      ctx.fillRect(0, H - 34, W, 34);
      ctx.strokeStyle = b.gold + '4d';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H - 34); ctx.lineTo(W, H - 34);
      ctx.stroke();

      ctx.font = '900 9px system-ui';
      ctx.fillStyle = b.gold;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillText('TOP 100 AEROSPACE & AVIATION', 24, H - 17);
      ctx.font = '9px system-ui';
      ctx.fillStyle = b.cream + '73';
      ctx.textAlign = 'right';
      ctx.fillText('The Orbital Edition · 2025', W - 24, H - 17);

      // ── Download ──
      const link = document.createElement('a');
      link.download = `TOP100-${(nominee.name || 'honoree').replace(/\s+/g, '-')}-2025.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  const handleLinkedIn = () =>
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ background: 'rgba(6,12,22,0.90)', backdropFilter: 'blur(14px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.93, y: 28, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.93, y: 28, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full rounded-3xl overflow-hidden shadow-2xl"
          style={{
            maxWidth: 760,
            background: `linear-gradient(160deg, #0d1c2e 0%, #111e2e 100%)`,
            border: `1px solid ${b.gold}28`,
            boxShadow: `0 0 0 1px ${b.gold}15, 0 32px 80px rgba(0,0,0,0.7)`,
          }}
        >
          {/* Close */}
          <button onClick={onClose} aria-label="Close"
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="px-8 pt-7 pb-4">
            <div className="flex items-center gap-2 mb-0.5">
              <Share2 className="w-3.5 h-3.5" style={{ color: b.gold }} />
              <p className="text-[10px] font-black tracking-[0.28em] uppercase" style={{ color: b.gold }}>
                Share Her Achievement
              </p>
            </div>
            <h3 className="text-xl font-bold" style={{ color: b.cream, fontFamily: "'Georgia', serif" }}>
              Celebrate {nominee.name?.split(' ')[0]}
            </h3>
          </div>

          {/* Card preview */}
          <div className="px-8 pb-6">
            <div className="rounded-2xl overflow-hidden"
              style={{ boxShadow: `0 0 0 1px ${b.gold}30, 0 20px 56px rgba(0,0,0,0.65)` }}>
              <div style={{ overflowX: 'auto' }}>
                <HonoreeCard ref={cardRef} nominee={nominee} rank={rank} photoDataUrl={photoDataUrl} wreathDataUrl={wreathDataUrl} />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-8 mb-5" style={{ height: 1,
            background: `linear-gradient(to right,transparent,${b.gold}40,transparent)` }} />

          {/* Actions */}
          <div className="px-8 pb-8 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <ActionBtn
                onClick={handleDownload}
                disabled={isExporting}
                icon={isExporting ? Loader2 : Download}
                label={isExporting ? 'Saving…' : 'Download PNG'}
                bg={`linear-gradient(135deg,${b.goldDeep},${b.gold})`}
                textColor={b.navyDark}
              />
              <ActionBtn
                onClick={handleLinkedIn}
                icon={Linkedin}
                label="Post to LinkedIn"
                bg="linear-gradient(135deg,#0A66C2,#004d96)"
              />
              <ActionBtn
                onClick={handleCopy}
                icon={copied ? Check : Link2}
                label={copied ? 'Copied!' : 'Copy Link'}
                bg="transparent"
                textColor={copied ? '#4ade80' : b.goldLight}
                border={`1px solid ${copied ? '#4ade8055' : `${b.gold}40`}`}
              />
            </div>

            <p className="text-center text-[11px]" style={{ color: `${b.cream}30` }}>
              Download the card and share it to celebrate this recognition.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}