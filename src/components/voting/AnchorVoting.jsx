import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { submitAnchorVote } from '@/functions/submitAnchorVote';
import { awardStardust } from '@/functions/awardStardust';
import { progressQuest } from '@/functions/progressQuest';
import { brand } from '@/components/nominate/NominateConfig';
import {
  Loader2, Info, X, ArrowUp, ArrowDown, Check, Linkedin, Instagram, Youtube, Globe,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Draw 5 distinct nominees, avoiding recently-seen ids when the pool allows.
function drawSet(pool, exclude = []) {
  const avail = pool.filter((n) => !exclude.includes(n.id));
  const src = avail.length >= 5 ? avail : pool;
  return shuffle(src).slice(0, 5);
}

export default function AnchorVoting({ user }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pool, setPool] = useState([]);
  const [season, setSeason] = useState(null);
  const [currentSet, setCurrentSet] = useState([]);
  const [seenIds, setSeenIds] = useState([]);
  const [phase, setPhase] = useState('best'); // best | worst | submitting | success
  const [topId, setTopId] = useState(null);
  const [bottomId, setBottomId] = useState(null);
  const [panelNominee, setPanelNominee] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);

  // Load active season + nominee pool once.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const seasons = await base44.entities.Season.list('-created_date', 100);
        const activeSeason =
          seasons.find((s) => s.status === 'voting_open') ||
          seasons.find((s) => s.status === 'active') ||
          seasons[0] ||
          null;
        if (!activeSeason) {
          toast({ variant: 'destructive', title: 'No active season', description: 'Voting is not open right now.' });
          setLoading(false);
          return;
        }
        const VOTABLE = ['active', 'approved', 'winner', 'finalist'];
        const raw = await base44.entities.Nominee.list('-created_date', 2000);
        // Dedupe by name, preferring the master record (it carries season_participation).
        const byName = new Map();
        for (const n of raw) {
          const key = (n.name || '').trim().toLowerCase();
          if (!key) continue;
          const cur = byName.get(key);
          if (!cur || (n.raw_nomination_data?.is_master && !cur.raw_nomination_data?.is_master)) {
            byName.set(key, n);
          }
        }
        // Participation-aware: a nominee is in this season's voting pool if their
        // season_participation includes the active season with a votable status,
        // or (legacy fallback) their record season_id matches with a votable status.
        const prepared = Array.from(byName.values()).filter((n) => {
          const parts = n.raw_nomination_data?.season_participation;
          if (Array.isArray(parts) && parts.length) {
            return parts.some((p) => p.season_id === activeSeason.id && VOTABLE.includes(p.status));
          }
          return n.season_id === activeSeason.id && VOTABLE.includes(n.status);
        });
        if (!active) return;
        setSeason(activeSeason);
        setPool(prepared);
        if (prepared.length >= 5) setCurrentSet(drawSet(prepared, []));
        setLoading(false);
      } catch (e) {
        if (!active) return;
        toast({ variant: 'destructive', title: 'Could not load nominees', description: e.message });
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const advance = useCallback(() => {
    setTopId(null);
    setBottomId(null);
    setPhase('best');
    setSeenIds((prev) => {
      const next = [...prev, ...(currentSet.map((n) => n.id))];
      // keep only the last 10 seen to avoid starving the pool
      return next.slice(-10);
    });
    setCurrentSet(drawSet(pool, seenIds));
    setSessionCount((c) => c + 1);
  }, [currentSet, pool, seenIds]);

  const handleSelect = async (nominee) => {
    if (phase === 'best') {
      setTopId(nominee.id);
      setPhase('worst');
      return;
    }
    if (phase === 'worst' && nominee.id !== topId) {
      const bottom = nominee.id;
      const neutrals = currentSet.filter((n) => n.id !== topId && n.id !== bottom).map((n) => n.id);
      setBottomId(bottom);
      setPhase('submitting');
      try {
        const res = await submitAnchorVote({
          top_nominee_id: topId,
          bottom_nominee_id: bottom,
          neutral_nominee_ids: neutrals,
          season_id: season.id,
        });
        if (!res.data || !res.data.success) throw new Error(res.data?.error || 'Submission failed');

        // Non-blocking rewards, mirroring the pairwise flow.
        Promise.all([awardStardust({ action_type: 'vote' }), progressQuest({ action: 'anchor_vote' })]).catch(() => {});

        setPhase('success');
        setTimeout(() => advance(), 750);
      } catch (e) {
        toast({ variant: 'destructive', title: 'Vote failed', description: e.message });
        setBottomId(null);
        setPhase('worst');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: brand.gold }} />
      </div>
    );
  }

  if (pool.length < 5) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
        <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${brand.gold}18` }}>
          <Info className="w-5 h-5" style={{ color: brand.gold }} />
        </div>
        <h2 className="text-base font-bold mb-1.5" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
          Not enough nominees to vote
        </h2>
        <p className="text-xs max-w-xs leading-relaxed" style={{ color: `${brand.navy}60` }}>
          Anchor selection needs at least five nominees in the active pool. Check back once the season is seeded.
        </p>
      </div>
    );
  }

  const prompt =
    phase === 'best' ? 'Which of these would you advance first?' :
    phase === 'worst' ? 'And which of these four would you advance last?' :
    phase === 'submitting' ? 'Recording your comparisons…' :
    'Anchored. Drawing the next set.';

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
      {/* Voting surface */}
      <div className="flex-1 flex flex-col min-w-0 px-4 pt-4 pb-6 lg:px-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-lg font-bold" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
              Anchor Selection
            </h2>
            <p className="text-[11px] leading-snug max-w-md" style={{ color: `${brand.navy}60` }}>
              Two taps. The one you advance first and the one you advance last become anchors — seven real comparisons, recorded as observations.
            </p>
          </div>
          <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: `${brand.navy}08`, color: `${brand.navy}80` }}>
            {sessionCount} sets
          </span>
        </div>

        {/* Prompt */}
        <AnimatePresence mode="wait">
          <motion.div
            key={prompt}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-3 mb-4 flex items-center gap-2"
          >
            {phase === 'best' && <ArrowUp className="w-4 h-4 shrink-0" style={{ color: brand.gold }} />}
            {phase === 'worst' && <ArrowDown className="w-4 h-4 shrink-0" style={{ color: `${brand.navy}70` }} />}
            <p className="text-sm font-semibold" style={{ color: brand.navy }}>{prompt}</p>
          </motion.div>
        </AnimatePresence>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
          {currentSet.map((nominee) => {
            const isTop = nominee.id === topId;
            const isLocked = isTop;
            const selectable = phase === 'best' || (phase === 'worst' && !isTop);
            return (
              <AnchorCard
                key={nominee.id}
                nominee={nominee}
                isTop={isTop}
                isLocked={isLocked}
                selectable={selectable && phase !== 'submitting' && phase !== 'success'}
                onInfo={() => setPanelNominee(nominee)}
                onSelect={() => handleSelect(nominee)}
              />
            );
          })}
        </div>

        {/* Success pulse */}
        <AnimatePresence>
          {phase === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mt-5 flex items-center justify-center gap-2 text-sm font-bold"
              style={{ color: brand.gold }}
            >
              <Check className="w-4 h-4" /> 7 comparisons recorded
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Persistent learn-more panel: full-screen overlay on mobile, docked on desktop */}
      <AnimatePresence>
        {panelNominee && (
          <ProfilePanel nominee={panelNominee} onClose={() => setPanelNominee(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function AnchorCard({ nominee, isTop, selectable, onInfo, onSelect }) {
  const avatar = nominee.avatar_url || nominee.photo_url;
  const subtitle = nominee.title || nominee.professional_role || nominee.organization || nominee.company || '';

  return (
    <motion.div
      layout
      whileTap={selectable ? { scale: 0.97 } : undefined}
      onClick={() => selectable && onSelect()}
      role="button"
      tabIndex={selectable ? 0 : -1}
      className="relative rounded-2xl p-3 flex items-center gap-3 transition-all border"
      style={{
        background: isTop ? `${brand.gold}12` : 'white',
        borderColor: isTop ? brand.gold : `${brand.navy}10`,
        opacity: isTop ? 0.65 : 1,
        cursor: selectable ? 'pointer' : 'default',
      }}
    >
      {/* Avatar */}
      <div
        className="h-11 w-11 rounded-xl shrink-0 flex items-center justify-center text-white text-sm font-bold overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
      >
        {avatar ? <img src={avatar} alt={nominee.name} className="w-full h-full object-cover" /> : nominee.name?.[0]?.toUpperCase()}
      </div>

      {/* Name + subtitle */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate" style={{ color: brand.navy }}>{nominee.name}</p>
        {subtitle && <p className="text-[11px] truncate" style={{ color: `${brand.navy}60` }}>{subtitle}</p>}
      </div>

      {/* Anchor badge */}
      {isTop && (
        <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: brand.gold, color: 'white' }}>
          <ArrowUp className="w-3 h-3" /> First
        </span>
      )}

      {/* Learn more */}
      <button
        onClick={(e) => { e.stopPropagation(); onInfo(); }}
        className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center"
        style={{ background: `${brand.navy}06` }}
        aria-label="Learn more"
      >
        <Info className="w-3.5 h-3.5" style={{ color: `${brand.navy}60` }} />
      </button>
    </motion.div>
  );
}

function ProfilePanel({ nominee, onClose }) {
  const avatar = nominee.avatar_url || nominee.photo_url;
  const subtitle = nominee.title || nominee.professional_role || nominee.organization || nominee.company || '';
  const hasSocials = nominee.linkedin_profile_url || nominee.instagram_url || nominee.youtube_url || nominee.website_url;

  return (
    <>
      {/* Mobile backdrop */}
      <motion.div
        className="lg:hidden fixed inset-0 z-40 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-0 z-50 lg:static lg:z-auto lg:w-96 lg:shrink-0 lg:h-auto flex flex-col border-l shadow-2xl"
        style={{ background: brand.cream, borderColor: `${brand.navy}10` }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b shrink-0" style={{ borderColor: `${brand.navy}08`, background: 'white' }}>
          <button onClick={onClose} className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: `${brand.navy}06` }}>
            <X className="w-4 h-4" style={{ color: `${brand.navy}70` }} />
          </button>
          <h3 className="text-sm font-bold flex-1 truncate" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
            Nominee Profile
          </h3>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="h-20 w-20 rounded-2xl shrink-0 flex items-center justify-center text-white text-2xl font-bold overflow-hidden" style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}>
              {avatar ? <img src={avatar} alt={nominee.name} className="w-full h-full object-cover" /> : nominee.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold leading-tight" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>{nominee.name}</h2>
              {subtitle && <p className="text-sm mt-1" style={{ color: `${brand.navy}70` }}>{subtitle}</p>}
              {nominee.country && <p className="text-[11px] mt-1" style={{ color: `${brand.navy}60` }}>{nominee.country}</p>}
            </div>
          </div>

          {nominee.description && (
            <Section label="Summary">{nominee.description}</Section>
          )}
          {nominee.bio && (
            <Section label="Biography">{nominee.bio}</Section>
          )}
          {nominee.impact_summary && (
            <Section label="Impact">{nominee.impact_summary}</Section>
          )}
          {nominee.skills?.length > 0 && (
            <div className="mb-5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: `${brand.navy}40` }}>Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {nominee.skills.map((s, i) => (
                  <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: `${brand.navy}08`, color: `${brand.navy}80` }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {hasSocials && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: `${brand.navy}40` }}>Links</h4>
              <div className="flex flex-wrap gap-2">
                {nominee.linkedin_profile_url && <SocialLink href={nominee.linkedin_profile_url} icon={Linkedin} label="LinkedIn" />}
                {nominee.instagram_url && <SocialLink href={nominee.instagram_url} icon={Instagram} label="Instagram" />}
                {nominee.youtube_url && <SocialLink href={nominee.youtube_url} icon={Youtube} label="YouTube" />}
                {nominee.website_url && <SocialLink href={nominee.website_url} icon={Globe} label="Website" />}
              </div>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}

function Section({ label, children }) {
  return (
    <div className="mb-5">
      <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: `${brand.navy}40` }}>{label}</h4>
      <p className="text-sm leading-relaxed" style={{ color: `${brand.navy}80` }}>{children}</p>
    </div>
  );
}

function SocialLink({ href, icon: Icon, label }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: `${brand.navy}08`, color: `${brand.navy}80` }}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </a>
  );
}