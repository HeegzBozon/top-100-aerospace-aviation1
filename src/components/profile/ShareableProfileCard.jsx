import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Download, Linkedin, Copy, CheckCircle2, Sparkles, Trophy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import html2canvas from 'html2canvas';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
  skyBlue: '#4a90b8',
};

function TradingCard({ user, nominee, cardRef }) {
  const displayName = user?.full_name || 'Anonymous';
  const displayRole = user?.headline || user?.industry_role || nominee?.title || nominee?.professional_role || '';
  const displayCompany = nominee?.company || nominee?.organization || '';
  const avatar = user?.avatar_url || nominee?.avatar_url || nominee?.photo_url;
  const location = user?.location || nominee?.country || '';
  const tags = user?.expertise_tags?.slice(0, 3) || [];
  const sixWord = nominee?.six_word_story;

  // Stats for the card — aerospace research metrics
  const metrics = nominee?.impact_metrics || {};
  const stats = [];
  if (metrics.research_publications) stats.push({ label: 'Publications', value: metrics.research_publications });
  if (metrics.citations_count) stats.push({ label: 'Citations', value: metrics.citations_count });
  if (metrics.patents_count) stats.push({ label: 'Patents', value: metrics.patents_count });
  if (metrics.missions_flown) stats.push({ label: 'Missions', value: metrics.missions_flown });
  if (metrics.flight_hours) stats.push({ label: 'Flight Hrs', value: metrics.flight_hours });
  if (nominee?.holistic_score) stats.push({ label: 'Score', value: Math.round(nominee.holistic_score) });

  return (
    <div
      ref={cardRef}
      className="relative w-[360px] rounded-2xl overflow-hidden shadow-2xl"
      style={{ background: `linear-gradient(145deg, ${brandColors.navyDeep} 0%, #0a1526 60%, ${brandColors.navyDeep} 100%)` }}
    >
      {/* Decorative corner accents */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{ background: `radial-gradient(circle at top right, ${brandColors.goldPrestige}, transparent 70%)` }} />
      <div className="absolute bottom-0 left-0 w-40 h-40 opacity-10" style={{ background: `radial-gradient(circle at bottom left, ${brandColors.skyBlue}, transparent 70%)` }} />

      {/* Top brand bar */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${brandColors.navyDeep}, ${brandColors.goldPrestige}, ${brandColors.navyDeep})` }} />

      <div className="relative p-6">
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-[9px] font-bold tracking-[0.25em] uppercase" style={{ color: brandColors.goldPrestige }}>
            TOP 100 Aerospace & Aviation
          </span>
          {nominee && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: `${brandColors.goldPrestige}25`, color: brandColors.goldPrestige }}>
              <Trophy className="w-2.5 h-2.5" /> NOMINEE
            </div>
          )}
        </div>

        {/* Avatar + identity */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0" style={{ borderColor: `${brandColors.goldPrestige}40` }}>
            {avatar ? (
              <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ background: `${brandColors.goldPrestige}15`, color: brandColors.goldPrestige }}>
                {displayName.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white leading-tight mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              {displayName}
            </h2>
            {displayRole && <p className="text-sm text-white/60 mb-0.5">{displayRole}</p>}
            {displayCompany && <p className="text-xs text-white/40">{displayCompany}</p>}
            {location && <p className="text-[11px] text-white/30 mt-1">📍 {location}</p>}
          </div>
        </div>

        {/* Six-word story */}
        {sixWord && (
          <div className="mb-5 px-4 py-3 rounded-xl" style={{ background: `${brandColors.goldPrestige}08`, borderLeft: `3px solid ${brandColors.goldPrestige}40` }}>
            <p className="text-white/70 text-sm italic leading-relaxed" style={{ fontFamily: "'Playfair Display', serif" }}>
              "{sixWord}"
            </p>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] font-medium text-white/70" style={{ background: `${brandColors.skyBlue}20` }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        {stats.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {stats.slice(0, 4).map(stat => (
              <div key={stat.label} className="text-center px-2 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-[9px] uppercase tracking-wider text-white/30">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <span className="text-[9px] text-white/20 tracking-wider">top100aero.space</span>
          <span className="text-[9px] text-white/20">2026</span>
        </div>
      </div>
    </div>
  );
}

export default function ShareableProfileCard({ user, nominee }) {
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
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
    });
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
    const text = `Check out my TOP 100 Aerospace & Aviation profile! 🚀✨\n\n${profileUrl}`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`, '_blank');
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: brandColors.navyDeep }}>
            Your Trading Card
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">Share your profile card on social media</p>
      </div>

      {/* Card preview */}
      <div className="p-5 flex justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="transform scale-[0.85] origin-top sm:scale-100">
          <TradingCard user={user} nominee={nominee} cardRef={cardRef} />
        </div>
      </div>

      {/* Share actions */}
      <div className="px-5 py-4 border-t border-slate-100 flex flex-wrap gap-2">
        <Button
          onClick={handleDownload}
          disabled={downloading}
          size="sm"
          className="gap-2 rounded-full text-xs font-bold"
          style={{ background: brandColors.navyDeep }}
        >
          <Download className="w-3.5 h-3.5" />
          {downloading ? 'Saving...' : 'Download'}
        </Button>
        <Button
          onClick={handleShareLinkedIn}
          size="sm"
          variant="outline"
          className="gap-2 rounded-full text-xs font-bold border-[#0077b5]/30 text-[#0077b5] hover:bg-[#0077b5]/5"
        >
          <Linkedin className="w-3.5 h-3.5" />
          Share on LinkedIn
        </Button>
        <Button
          onClick={handleCopyLink}
          size="sm"
          variant="outline"
          className="gap-2 rounded-full text-xs font-bold"
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>
      </div>
    </div>
  );
}