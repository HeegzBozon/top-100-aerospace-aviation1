import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Linkedin, Link2, Check, Loader2, X, Share2 } from 'lucide-react';
import { composeCard, loadImage, WREATH_URL } from '@/components/og-card/ogCardComposer';

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

// The honoree's card, composed at the 1200×630 social ratio. The preview, the
// Download PNG, native share, and the honoree's Open Graph image are all this
// one composition, so a shared link previews exactly what the file contains.
function composeCardCanvas({ nominee, rank, photoImg, wreathImg }) {
  const canvas = document.createElement('canvas');
  composeCard(canvas, {
    photoImg,
    wreathImg,
    name: nominee.name,
    rank,
    year: 2025,
    title: nominee.title || nominee.professional_role,
    company: nominee.company || nominee.organization,
    country: nominee.country,
    sixWordStory: nominee.six_word_story,
    bio: nominee.description || nominee.bio,
  });
  return canvas;
}

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
  const canvasRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = nominee.public_slug
    ? `${window.location.origin}/Top100Women2025/2025/12/${nominee.public_slug}/index.html`
    : `${window.location.origin}/Top100Women2025?nominee=${nominee.id}`;
  const shareText = [
    `Congratulations to ${nominee.name}${rank ? ` (#${rank})` : ''} — named to the TOP 100 Women in Aerospace & Aviation 2025!`,
    nominee.six_word_story ? `"${nominee.six_word_story}"` : null,
    '#TOP100Aerospace #WomenInAviation',
  ].filter(Boolean).join('\n\n');

  // Compose once, then reuse the very same canvas for every export path.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const photoSrc = nominee.avatar_url || nominee.photo_url;
      const [photoImg, wreathImg] = await Promise.all([
        photoSrc ? loadImage(photoSrc).catch(() => null) : Promise.resolve(null),
        loadImage(WREATH_URL).catch(() => null),
      ]);
      if (cancelled) return;
      const canvas = composeCardCanvas({ nominee, rank, photoImg, wreathImg });
      canvasRef.current = canvas;
      setPreviewUrl(canvas.toDataURL('image/png'));
    })();
    return () => { cancelled = true; };
  }, [nominee, rank]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    try {
      const link = document.createElement('a');
      link.download = `TOP100-${(nominee.name || 'honoree').replace(/\s+/g, '-')}-2025.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;
  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    try {
      const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
      const file = new File([blob], `TOP100-${(nominee.name || 'honoree').replace(/\s+/g, '-')}-2025.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText });
      } else {
        await navigator.share({ text: shareText, url: shareUrl });
      }
    } catch (err) {
      if (err?.name !== 'AbortError') console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  // The clean deep link is served as a real static page carrying this honoree's
  // OG tags, so crawlers read them without executing any JavaScript.
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

          {/* Card preview — the exact image every action below exports */}
          <div className="px-8 pb-6">
            <div className="rounded-2xl overflow-hidden"
              style={{ boxShadow: `0 0 0 1px ${b.gold}30, 0 20px 56px rgba(0,0,0,0.65)`, background: b.navyDark }}>
              {previewUrl ? (
                <img src={previewUrl} alt={`Share card for ${nominee.name}`} className="block w-full h-auto" />
              ) : (
                <div className="flex items-center justify-center" style={{ aspectRatio: '1200 / 630' }}>
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: b.gold }} />
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-8 mb-5" style={{ height: 1,
            background: `linear-gradient(to right,transparent,${b.gold}40,transparent)` }} />

          {/* Actions */}
          <div className="px-8 pb-8 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {canNativeShare && (
                <ActionBtn
                  onClick={handleNativeShare}
                  disabled={isExporting || !previewUrl}
                  icon={Share2}
                  label="Share Card"
                  bg={`linear-gradient(135deg,${b.rose},${b.gold})`}
                  textColor={b.navyDark}
                />
              )}
              <ActionBtn
                onClick={handleDownload}
                disabled={isExporting || !previewUrl}
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