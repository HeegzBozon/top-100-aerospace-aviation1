import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Linkedin, Copy, CheckCircle2, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import html2canvas from 'html2canvas';
import TradingCard from './TradingCard';
import CardThemePicker from './CardThemePicker';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function ShareableProfileCard({ user, nominee, onUserUpdate, readOnly = false }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/ProfileView?user=${encodeURIComponent(user?.email || '')}`
    : '';

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: null, useCORS: true });
    const link = document.createElement('a');
    link.download = `TOP100_${user?.full_name?.replace(/\s+/g, '_') || 'Profile'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setDownloading(false);
    toast({ title: 'Card downloaded!' });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast({ title: 'Profile link copied!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`, '_blank');
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: brandColors.navyDeep }}>
            {readOnly ? 'Trading Card' : 'Your Trading Card'}
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {readOnly ? 'Professional profile card' : 'Share your profile card on social media'}
        </p>
      </div>

      {/* Theme picker (only when editable) */}
      {!readOnly && onUserUpdate && (
        <div className="px-5 pt-4 pb-2">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">Theme</p>
          <CardThemePicker user={user} onUserUpdate={onUserUpdate} />
        </div>
      )}

      {/* Card preview */}
      <div className="p-5 flex justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="transform scale-[0.85] origin-top sm:scale-100">
          <TradingCard user={user} nominee={nominee} cardRef={cardRef} />
        </div>
      </div>

      {/* Share actions */}
      {!readOnly && (
        <div className="px-5 py-4 border-t border-slate-100 flex flex-wrap gap-2">
          <Button onClick={handleDownload} disabled={downloading} size="sm" className="gap-2 rounded-full text-xs font-bold" style={{ background: brandColors.navyDeep }}>
            <Download className="w-3.5 h-3.5" />
            {downloading ? 'Saving...' : 'Download'}
          </Button>
          <Button onClick={handleShareLinkedIn} size="sm" variant="outline" className="gap-2 rounded-full text-xs font-bold border-[#0077b5]/30 text-[#0077b5] hover:bg-[#0077b5]/5">
            <Linkedin className="w-3.5 h-3.5" />
            Share on LinkedIn
          </Button>
          <Button onClick={handleCopyLink} size="sm" variant="outline" className="gap-2 rounded-full text-xs font-bold">
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>
      )}
    </div>
  );
}