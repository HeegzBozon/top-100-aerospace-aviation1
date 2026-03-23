import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Twitter, Linkedin, Link2, Check, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

// The actual card that gets exported as image
const HonoreeCard = React.forwardRef(({ nominee, rank }, ref) => {
  const hasPhoto = nominee.avatar_url || nominee.photo_url;

  return (
    <div
      ref={ref}
      className="w-[600px] h-[400px] relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, ${brandColors.skyBlue}40 100%)`,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, ${brandColors.goldPrestige} 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Gold accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-2"
        style={{ background: `linear-gradient(90deg, ${brandColors.goldPrestige}, ${brandColors.goldLight})` }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex">
        {/* Left: Photo */}
        <div className="w-[200px] h-full flex items-center justify-center p-6">
          <div
            className="w-[160px] h-[160px] rounded-full overflow-hidden border-4"
            style={{ borderColor: brandColors.goldPrestige }}
          >
            {hasPhoto ? (
              <img
                src={nominee.avatar_url || nominee.photo_url}
                alt=""
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-5xl font-bold"
                style={{ background: brandColors.goldLight, color: brandColors.navyDeep }}
              >
                {nominee.name?.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex-1 py-8 pr-8 flex flex-col justify-center">
          {/* Badge */}
          <div className="mb-4">
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider"
              style={{ background: brandColors.goldPrestige, color: brandColors.navyDeep }}
            >
              {rank ? `#${rank} · ` : ''}TOP 100 WOMEN 2025
            </span>
          </div>

          {/* Name */}
          <h2
            className="text-3xl font-bold mb-2"
            style={{ color: brandColors.cream }}
          >
            {nominee.name}
          </h2>

          {/* Title */}
          <p
            className="text-lg mb-1"
            style={{ color: brandColors.goldLight }}
          >
            {nominee.title || nominee.professional_role}
          </p>

          {/* Company */}
          {nominee.company && (
            <p
              className="text-sm mb-4"
              style={{ color: `${brandColors.cream}80` }}
            >
              {nominee.company}
            </p>
          )}

          {/* Country */}
          {nominee.country && (
            <p
              className="text-sm"
              style={{ color: brandColors.skyBlue }}
            >
              📍 {nominee.country}
            </p>
          )}

          {/* Six word story */}
          {nominee.six_word_story && (
            <p
              className="mt-4 text-sm italic"
              style={{ color: `${brandColors.goldLight}90` }}
            >
              "{nominee.six_word_story}"
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="absolute bottom-0 left-0 right-0 px-6 py-3 flex items-center justify-between"
        style={{ background: `${brandColors.navyDeep}90` }}
      >
        <span className="text-xs font-semibold tracking-widest" style={{ color: brandColors.goldPrestige }}>
          TOP 100 AEROSPACE & AVIATION
        </span>
        <span className="text-xs" style={{ color: `${brandColors.cream}60` }}>
          The Orbital Edition · 2025
        </span>
      </div>
    </div>
  );
});

HonoreeCard.displayName = 'HonoreeCard';

export default function ShareableCard({ nominee, rank, onClose }) {
  const cardRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: brandColors.navyDeep
      });

      const link = document.createElement('a');
      link.download = `TOP100-${nominee.name?.replace(/\s+/g, '-')}-2025.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const shareUrl = `${window.location.origin}/ProfileView?id=${nominee.id}`;
  const shareText = `🚀 Congratulations to ${nominee.name} for being named to the TOP 100 Women in Aerospace & Aviation 2025! #TOP100Aerospace #WomenInAviation`;

  const handleTwitterShare = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleLinkedInShare = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl overflow-hidden max-w-[680px] w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Preview */}
        <div className="p-4 overflow-x-auto" style={{ background: brandColors.cream }}>
          <div className="flex justify-center">
            <HonoreeCard ref={cardRef} nominee={nominee} rank={rank} />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t" style={{ borderColor: `${brandColors.navyDeep}10` }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.navyDeep }}>
            Share This Achievement
          </h3>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              style={{ background: brandColors.navyDeep, color: 'white' }}
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download PNG
            </button>

            <button
              onClick={handleTwitterShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              style={{ background: '#1DA1F2', color: 'white' }}
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </button>

            <button
              onClick={handleLinkedInShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              style={{ background: '#0A66C2', color: 'white' }}
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-all"
              style={{ borderColor: brandColors.goldPrestige, color: brandColors.navyDeep }}
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          <p className="mt-4 text-sm" style={{ color: `${brandColors.navyDeep}60` }}>
            Share on social media or download the card to celebrate this recognition.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}