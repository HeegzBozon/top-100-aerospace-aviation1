import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Linkedin, Link2, Check, Loader2, X, Share2, Twitter } from 'lucide-react';
import html2canvas from 'html2canvas';

// ─── Brand tokens ────────────────────────────────────────────────────────────
const b = {
  navy:      '#1e3a5a',
  navyMid:   '#2a4f7c',
  navyDark:  '#0f1f35',
  sky:       '#4a90b8',
  gold:      '#c9a87c',
  goldLight: '#e8d4b8',
  goldDeep:  '#a07840',
  cream:     '#faf8f5',
};

const WREATH_URL = 'https://media.base44.com/images/public/68996845be6727838fdb822e/fa0298ddb_Gemini_Generated_Image_s3pahzs3pahzs3pa-removebg-preview.png';

// ─── The exportable card ──────────────────────────────────────────────────────
const HonoreeCard = React.forwardRef(({ nominee, rank }, ref) => {
  const photo = nominee.avatar_url || nominee.photo_url;
  const bio = nominee.description || nominee.bio;

  return (
    <div
      ref={ref}
      className="relative overflow-hidden"
      style={{
        width: 640,
        height: 360,
        background: `linear-gradient(135deg, ${b.navyDark} 0%, ${b.navyMid} 60%, ${b.sky}55 100%)`,
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      {/* Dot-grid texture */}
      <div className="absolute inset-0" style={{ opacity: 0.06 }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="sc-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sc-dots)" />
        </svg>
      </div>

      {/* Radial gold glow — top left */}
      <div className="absolute -top-12 -left-12 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${b.gold}20 0%, transparent 65%)` }} />

      {/* Gold top bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, transparent, ${b.gold}, ${b.goldLight}, ${b.gold}, transparent)` }} />

      {/* LEFT — Photo column */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center justify-center"
        style={{ width: 200 }}>
        {/* Wreath + photo medallion */}
        <div className="relative" style={{ width: 160, height: 160 }}>
          {/* Gold ring */}
          <div className="absolute inset-[10%] rounded-full"
            style={{ boxShadow: `0 0 0 3px ${b.gold}80, 0 0 0 6px ${b.gold}25, 0 12px 32px rgba(0,0,0,0.7)` }}>
            {photo ? (
              <img src={photo} alt={nominee.name} crossOrigin="anonymous"
                className="w-full h-full rounded-full object-cover object-top" />
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center text-4xl font-bold"
                style={{ background: `linear-gradient(135deg,${b.navyMid},${b.navy})`, color: b.goldLight }}>
                {nominee.name?.charAt(0)}
              </div>
            )}
          </div>
          {/* Wreath overlay */}
          <img src={WREATH_URL} alt="" crossOrigin="anonymous"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5)) saturate(1.1)' }} />
        </div>

        {/* Country */}
        {nominee.country && (
          <p className="mt-3 text-[11px] font-semibold tracking-wide" style={{ color: b.sky }}>
            📍 {nominee.country}
          </p>
        )}
      </div>

      {/* RIGHT — Content column */}
      <div className="absolute top-0 bottom-0 right-0 flex flex-col justify-center pr-8 pl-4"
        style={{ left: 200 }}>

        {/* Rank badge */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-[0.15em] uppercase"
            style={{ background: `linear-gradient(135deg,${b.goldDeep},${b.gold})`, color: b.navyDark }}>
            {rank ? `#${rank} · ` : ''}TOP 100 WOMEN 2025
          </span>
        </div>

        {/* Name */}
        <h2 className="font-bold leading-tight mb-1"
          style={{ fontSize: 30, color: b.cream, letterSpacing: '-0.01em', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
          {nominee.name}
        </h2>

        {/* Title + company */}
        {(nominee.title || nominee.professional_role) && (
          <p className="text-sm font-semibold mb-0.5 leading-snug" style={{ color: b.goldLight }}>
            {nominee.title || nominee.professional_role}
            {nominee.company && (
              <span style={{ color: `${b.cream}55`, fontWeight: 400 }}> · {nominee.company}</span>
            )}
          </p>
        )}

        {/* Bio excerpt */}
        {bio && (
          <p className="text-[12px] leading-relaxed mt-2"
            style={{ color: `${b.cream}90`, fontFamily: 'system-ui, sans-serif',
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {bio}
          </p>
        )}

        {/* Six-word story */}
        {nominee.six_word_story && (
          <p className="mt-3 text-[12px] italic" style={{ color: `${b.goldLight}bb` }}>
            "{nominee.six_word_story}"
          </p>
        )}
      </div>

      {/* Footer bar */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-2.5 flex items-center justify-between"
        style={{ background: `${b.navyDark}cc`, borderTop: `1px solid ${b.gold}25` }}>
        <span className="text-[10px] font-black tracking-[0.25em] uppercase" style={{ color: b.gold }}>
          TOP 100 Aerospace &amp; Aviation
        </span>
        <span className="text-[10px] font-semibold tracking-wide" style={{ color: `${b.cream}50` }}>
          The Orbital Edition · 2025
        </span>
      </div>
    </div>
  );
});
HonoreeCard.displayName = 'HonoreeCard';

// ─── Share action button ──────────────────────────────────────────────────────
function ActionBtn({ onClick, disabled, icon: Icon, label, bg, textColor = 'white', border }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.03] hover:brightness-110 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ background: bg, color: textColor, border: border || 'none', minHeight: 44 }}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </button>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function ShareableCard({ nominee, rank, onClose }) {
  const cardRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/Top100Women2025`;
  const shareText = `🚀 Congratulations to ${nominee.name} — named to the TOP 100 Women in Aerospace & Aviation 2025! #TOP100Aerospace #WomenInAviation`;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, useCORS: true, allowTaint: true,
        backgroundColor: b.navyDark,
      });
      const link = document.createElement('a');
      link.download = `TOP100-${nominee.name?.replace(/\s+/g, '-')}-2025.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  const handleTwitter = () =>
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');

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
        style={{ background: 'rgba(8,16,28,0.88)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, y: 24, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 24, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-[700px] rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: `linear-gradient(160deg, ${b.navyDark} 0%, #111e2e 100%)`, border: `1px solid ${b.gold}25` }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="px-7 pt-7 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Share2 className="w-4 h-4" style={{ color: b.gold }} />
              <p className="text-[10px] font-black tracking-[0.25em] uppercase" style={{ color: b.gold }}>
                Share Her Achievement
              </p>
            </div>
            <h3 className="text-xl font-bold" style={{ color: b.cream, fontFamily: "'Georgia', serif" }}>
              Celebrate {nominee.name?.split(' ')[0]}
            </h3>
          </div>

          {/* Card preview */}
          <div className="px-7 pb-6">
            <div className="rounded-2xl overflow-hidden shadow-2xl"
              style={{ boxShadow: `0 0 0 1px ${b.gold}30, 0 24px 64px rgba(0,0,0,0.6)` }}>
              <div className="overflow-x-auto">
                <HonoreeCard ref={cardRef} nominee={nominee} rank={rank} />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-7 mb-5 h-px" style={{ background: `linear-gradient(to right,transparent,${b.gold}40,transparent)` }} />

          {/* Action buttons */}
          <div className="px-7 pb-7 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <ActionBtn
                onClick={handleDownload}
                disabled={isExporting}
                icon={isExporting ? Loader2 : Download}
                label={isExporting ? 'Exporting…' : 'Download PNG'}
                bg={`linear-gradient(135deg,${b.goldDeep},${b.gold})`}
                textColor={b.navyDark}
              />
              <ActionBtn
                onClick={handleLinkedIn}
                icon={Linkedin}
                label="Post to LinkedIn"
                bg="linear-gradient(135deg,#0A66C2,#004182)"
              />
              <ActionBtn
                onClick={handleTwitter}
                icon={Twitter}
                label="Share on X"
                bg="linear-gradient(135deg,#14171A,#333)"
              />
              <ActionBtn
                onClick={handleCopy}
                icon={copied ? Check : Link2}
                label={copied ? 'Link Copied!' : 'Copy Link'}
                bg="transparent"
                textColor={copied ? '#4ade80' : b.goldLight}
                border={`1px solid ${copied ? '#4ade8060' : `${b.gold}40`}`}
              />
            </div>

            <p className="text-center text-[11px]" style={{ color: `${b.cream}35` }}>
              Share the recognition and help amplify women in aerospace.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}