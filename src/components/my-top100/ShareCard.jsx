import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Link2, Linkedin, Mail, Check, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { brand } from '@/components/nominate/NominateConfig';

// Share surface for a Fellow's TOP 100. Link points to their public profile
// (/profiles/:id). Email option is client-side copy/paste only — a pre-written
// blurb + the profile URL copied to the clipboard for the Fellow's own email
// client. PNG + PDF are rendered client-side from the card preview.
export default function ShareCard({ isOpen, onClose, rankings, userName, listName, profileUrl }) {
  const previewRef = useRef(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [exporting, setExporting] = useState('');
  const [exportError, setExportError] = useState('');

  const shareUrl = profileUrl || `${window.location.origin}/`;
  const top10 = rankings.slice(0, 10);
  const top3 = rankings.slice(0, 3);

  const emailBody = `Hi,

I've just published my TOP 100 Aerospace & Aviation list for 2026 — my personal ranking of the leaders I believe are moving our field forward. See my list and my full profile:

${shareUrl}

— ${userName || 'A TOP 100 Fellow'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailBody);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleLinkedIn = () => {
    const text = encodeURIComponent(
      `My TOP 100 Aerospace & Aviation list for 2026 — the leaders I believe are moving our field forward. See my list ↓`,
    );
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${text}`,
      '_blank',
    );
  };

  const handleExport = async (kind) => {
    if (!previewRef.current) return;
    setExporting(kind);
    setExportError('');
    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#0e1f38',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
      });
      if (kind === 'png') {
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'my-top-100.png';
          a.click();
          URL.revokeObjectURL(url);
        });
      } else {
        const img = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
        pdf.addImage(img, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('my-top-100.pdf');
      }
    } catch {
      setExportError('Could not generate the image — please try again.');
    } finally {
      setExporting('');
    }
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
            <div style={{ background: brand.cream }}>
              {/* Capturable preview card */}
              <div
                ref={previewRef}
                className="relative overflow-hidden"
                style={{
                  background: `radial-gradient(circle at 70% 20%, ${brand.gold}30 0%, transparent 50%),
                    linear-gradient(160deg, #081525 0%, ${brand.navy} 55%, #0e1f38 100%)`,
                  minHeight: 220,
                }}
              >
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: i % 3 === 0 ? 2 : 1,
                      height: i % 3 === 0 ? 2 : 1,
                      left: `${(i * 47) % 100}%`,
                      top: `${(i * 31) % 100}%`,
                      background: 'white',
                      opacity: 0.35 + (i % 5) * 0.08,
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
                        <div key={item.nominee_id} className="flex items-center gap-1.5 flex-1 min-w-0">
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
                            ) : (
                              item.nominee_name?.[0]
                            )}
                          </div>
                          <p className="text-white text-[10px] font-semibold truncate leading-tight">
                            {item.nominee_name}
                          </p>
                        </div>
                      );
                    })}
                  </div>

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

                <div
                  className="absolute bottom-3 right-4 text-[9px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: `${brand.gold}55` }}
                >
                  top100aerospace.com
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold" style={{ color: brand.navy }}>
                    Share your list
                  </h4>
                  <span className="text-[10px] font-mono truncate max-w-[150px]" style={{ color: `${brand.navy}40` }}>
                    {shareUrl.replace('https://', '')}
                  </span>
                </div>

                {/* Copy link */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-98"
                  style={{ borderColor: `${brand.navy}15`, background: `${brand.navy}04` }}
                >
                  {copiedLink ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Link2 className="w-4 h-4" style={{ color: brand.navy }} />
                  )}
                  <span className="text-sm font-medium flex-1 text-left" style={{ color: brand.navy }}>
                    {copiedLink ? 'Profile link copied!' : 'Copy profile link'}
                  </span>
                </button>

                {/* Copy email message (paste into their own email client) */}
                <button
                  onClick={handleCopyEmail}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-98"
                  style={{ borderColor: `${brand.navy}15`, background: `${brand.navy}04` }}
                >
                  {copiedEmail ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Mail className="w-4 h-4" style={{ color: brand.navy }} />
                  )}
                  <span className="text-sm font-medium flex-1 text-left" style={{ color: brand.navy }}>
                    {copiedEmail ? 'Email message copied!' : 'Copy email message + link'}
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

                {/* Downloadable image: PNG + PDF */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleExport('png')}
                    disabled={!!exporting}
                    className="flex items-center justify-center gap-2 p-3 rounded-2xl text-sm font-semibold transition-all active:scale-98 disabled:opacity-50"
                    style={{ background: `${brand.gold}18`, color: brand.navy }}
                  >
                    {exporting === 'png' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    PNG
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={!!exporting}
                    className="flex items-center justify-center gap-2 p-3 rounded-2xl text-sm font-semibold transition-all active:scale-98 disabled:opacity-50"
                    style={{ background: `${brand.gold}18`, color: brand.navy }}
                  >
                    {exporting === 'pdf' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    PDF
                  </button>
                </div>

                {exportError && (
                  <p className="text-[11px] text-center" style={{ color: '#b5651d' }}>
                    {exportError}
                  </p>
                )}

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