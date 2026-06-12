import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Link2, Linkedin, Instagram, Globe, Check } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import { useState } from 'react';

export default function ShareCard({ isOpen, onClose, rankings, userName, listName, shareCode }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/top100-list/${shareCode}`;
  const top10 = rankings.slice(0, 10);
  const top3 = rankings.slice(0, 3);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkedIn = () => {
    const text = encodeURIComponent(
      `Here's my TOP 100 Aerospace & Aviation list for 2026! 🚀\n\nI've curated my picks for the most impactful leaders in our industry. See who made my list ↓\n\n${shareUrl}\n\n#TOP100Aerospace #Aviation #Space #WomenInAerospace`
    );
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${text}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(10,18,30,0.7)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-x-4 bottom-4 z-50 rounded-3xl overflow-hidden"
            style={{ maxWidth: 480, margin: '0 auto' }}
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            {/* Card content */}
            <div style={{ background: brand.cream }}>
              {/* Preview card — this is the "shareable" visual */}
              <div
                className="relative overflow-hidden"
                style={{
                  background: `radial-gradient(circle at 70% 20%, ${brand.gold}30 0%, transparent 50%),
                    linear-gradient(160deg, #081525 0%, ${brand.navy} 55%, #0e1f38 100%)`,
                  minHeight: 220,
                }}
              >
                {/* Stars bg decoration */}
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: Math.random() > 0.7 ? 2 : 1,
                      height: Math.random() > 0.7 ? 2 : 1,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      background: 'white',
                      opacity: Math.random() * 0.6 + 0.2,
                    }}
                  />
                ))}

                <div className="relative z-10 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1" style={{ color: brand.gold }}>
                    Top 100 Aerospace & Aviation · 2026
                  </p>
                  <h3
                    className="text-lg font-bold text-white mb-3 leading-tight"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {listName || `${userName}'s Top 100`}
                  </h3>

                  {/* Top 3 podium */}
                  <div className="flex gap-2 mb-3">
                    {top3.map((item, i) => {
                      const medalColors = ['#FFD700', '#C0C0C0', '#cd7f32'];
                      return (
                        <div key={item.nominee_id} className="flex items-center gap-1.5 flex-1">
                          <div
                            className="h-5 w-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold"
                            style={{ background: medalColors[i], color: i === 1 ? '#444' : '#5a3a00' }}
                          >
                            {i + 1}
                          </div>
                          <div
                            className="h-7 w-7 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ background: `${brand.navy}80`, border: `1.5px solid ${brand.gold}40` }}
                          >
                            {item.nominee_avatar ? (
                              <img src={item.nominee_avatar} alt="" className="w-full h-full object-cover" />
                            ) : item.nominee_name?.[0]}
                          </div>
                          <p className="text-white text-[10px] font-semibold truncate leading-tight">
                            {item.nominee_name}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mini list preview */}
                  <div className="flex flex-wrap gap-1">
                    {top10.slice(3).map((item, i) => (
                      <span
                        key={item.nominee_id}
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)' }}
                      >
                        #{i + 4} {item.nominee_name?.split(' ')[0]}
                      </span>
                    ))}
                    {rankings.length > 10 && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ background: `${brand.gold}20`, color: brand.gold }}
                      >
                        +{rankings.length - 10} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Watermark */}
                <div
                  className="absolute bottom-3 right-4 text-[9px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: `${brand.gold}50` }}
                >
                  top100aerospace.com
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 space-y-3">
                <h4 className="text-sm font-bold" style={{ color: brand.navy }}>Share your list</h4>

                {/* Copy link */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-98"
                  style={{ borderColor: `${brand.navy}15`, background: `${brand.navy}04` }}
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" style={{ color: brand.navy }} />}
                  <span className="text-sm font-medium flex-1 text-left" style={{ color: brand.navy }}>
                    {copied ? 'Link copied!' : 'Copy shareable link'}
                  </span>
                  <span className="text-[10px] font-mono truncate max-w-[120px]" style={{ color: `${brand.navy}40` }}>
                    {shareUrl.replace('https://', '')}
                  </span>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={handleLinkedIn}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-98"
                  style={{ background: '#0077B5', color: 'white' }}
                >
                  <Linkedin className="w-4 h-4" />
                  <span className="text-sm font-semibold">Share on LinkedIn</span>
                </button>

                {/* Close */}
                <button
                  onClick={onClose}
                  className="w-full py-2.5 text-sm font-medium rounded-2xl transition-all"
                  style={{ color: `${brand.navy}60` }}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}