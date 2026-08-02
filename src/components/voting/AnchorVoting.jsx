import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { submitAnchorVote } from '@/functions/submitAnchorVote';
import { awardStardust } from '@/functions/awardStardust';
import { progressQuest } from '@/functions/progressQuest';
import { brand } from '@/components/nominate/NominateConfig';
import {
  Loader2, Info, ArrowUp, ArrowDown, Check, Undo2, ArrowLeft,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import JudgeCard from '@/components/voting/JudgeCard';
import EvidencePopover from '@/components/voting/EvidencePopover';

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
  const [panelToken, setPanelToken] = useState('A');
  const [sessionCount, setSessionCount] = useState(0);
  const [history, setHistory] = useState([]); // completed sets for review/back

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
    setHistory((prev) => [...prev, { set: currentSet, topId, bottomId }].slice(-5));
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
  }, [currentSet, pool, seenIds, topId, bottomId]);

  // Mid-set undo: clear the "first" anchor and return to the first prompt.
  const undoFirstPick = useCallback(() => {
    setTopId(null);
    setBottomId(null);
    setPhase('best');
  }, []);

  // Go back to review the last completed set (read-only — vote already recorded).
  const goBack = useCallback(() => {
    if (!history.length) return;
    const last = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setCurrentSet(last.set);
    setTopId(last.topId);
    setBottomId(last.bottomId);
    setPhase('review');
  }, [history]);

  const resumeVoting = useCallback(() => {
    setTopId(null);
    setBottomId(null);
    setPhase('best');
    setCurrentSet(drawSet(pool, seenIds));
  }, [pool, seenIds]);

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
    phase === 'review' ? 'Reviewing your last set.' :
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

        {/* Controls: undo mid-set / review last set / resume */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {phase === 'worst' && (
            <button onClick={undoFirstPick} className="text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: `${brand.navy}06`, color: `${brand.navy}80` }}>
              <Undo2 className="w-3.5 h-3.5" /> Undo first pick
            </button>
          )}
          {history.length > 0 && (phase === 'best' || phase === 'worst') && (
            <button onClick={goBack} className="text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: `${brand.navy}06`, color: `${brand.navy}80` }}>
              <ArrowLeft className="w-3.5 h-3.5" /> Review last set
            </button>
          )}
          {phase === 'review' && (
            <button onClick={resumeVoting} className="text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: brand.gold, color: 'white' }}>
              Resume voting
            </button>
          )}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
          {currentSet.map((nominee, idx) => {
            const isTop = nominee.id === topId;
            const isBottom = nominee.id === bottomId;
            const token = String.fromCharCode(65 + idx);
            const selectable = phase === 'best' || (phase === 'worst' && !isTop);
            return (
              <JudgeCard
                key={nominee.id}
                nominee={nominee}
                token={token}
                isTop={isTop}
                isBottom={isBottom}
                selectable={selectable && phase !== 'submitting' && phase !== 'success' && phase !== 'review'}
                onInfo={() => { setPanelNominee(nominee); setPanelToken(token); }}
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

      {/* Evidence popover (anonymized) */}
      <AnimatePresence>
        {panelNominee && (
          <EvidencePopover nominee={panelNominee} token={panelToken} onClose={() => setPanelNominee(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}