import { useState, useEffect, useCallback, useRef } from 'react';
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
import { registerDigits, registerFaceKeys } from '@/components/handheld/handheldKeys';
import { useConsoleFace } from '@/components/handheld/consoleMode';
import { buildHonoreeYearIndex, honoreeVolumes } from '@/components/voting/honoreeYears';
import useAnchorPicker from '@/components/voting/useAnchorPicker';
import MissionBriefing from '@/components/mission/MissionBriefing';

// The four candidates stand under the four face keys, in the order the cards are set:
// X and Y across the top row, A and B across the bottom. Y is a vote key while a set is
// standing, so the share moves to the ring's play zone for as long as the keys are held.
const VOTE_KEYS = ['X', 'Y', 'A', 'B'];

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
  return shuffle(src).slice(0, 4);
}

export default function AnchorVoting({ user, activeSeason: resolvedSeason = null, onRecorded = null }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pool, setPool] = useState([]);
  const [season, setSeason] = useState(null);
  // Closed volumes, mapped to the year they are remembered by: what makes a candidate
  // on the card a returning honoree rather than a first-time nominee.
  const [honoreeIndex, setHonoreeIndex] = useState(() => new Map());
  // Every nominee row keyed by id, so a card rendering a superseded duplicate reads the
  // archived volume through the merge chain its own record points down.
  const [nomineeIndex, setNomineeIndex] = useState(() => new Map());
  const [currentSet, setCurrentSet] = useState([]);
  const [seenIds, setSeenIds] = useState([]);
  const [phase, setPhase] = useState('best'); // best | worst | submitting | success
  const [topId, setTopId] = useState(null);
  const [bottomId, setBottomId] = useState(null);
  const [panelNominee, setPanelNominee] = useState(null);
  const [panelToken, setPanelToken] = useState('A');
  const [sessionCount, setSessionCount] = useState(0);
  const [history, setHistory] = useState([]); // completed sets for review/back
  // The briefing opens itself once, from the hub, on the Fellow's first pass through the
  // committee — this surface only offers it again from the info key beside the prompt.
  // One key, one panel: the info button IS the briefing, and it carries the vote alone.
  const [guideOpen, setGuideOpen] = useState(false);

  // Load active season + nominee pool once.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // A caller that has already resolved the cohort counting right now hands it in,
        // so the ballot never guesses at a season the window has closed.
        let activeSeason = resolvedSeason;
        // The whole calendar is read either way: the closed volumes are what the cards
        // read a returning honoree from.
        const seasons = await base44.entities.Season.list('-created_date', 100);
        if (!activeSeason) {
          activeSeason =
            seasons.find((s) => s.status === 'voting_open') ||
            seasons.find((s) => s.status === 'nominations_open') ||
            seasons.find((s) => s.status === 'rollover') ||
            seasons.find((s) => s.status !== 'archived') ||
            seasons[0] ||
            null;
        }
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
        // Unified candidate pool: a nominee is votable if they have a
        // non-rejected participation entry in ANY season (the master index
        // spans 2021 → present). Legacy records without the index fall back to
        // a votable status on the active season.
        const prepared = Array.from(byName.values()).filter((n) => {
          const parts = n.raw_nomination_data?.season_participation;
          if (Array.isArray(parts) && parts.length) {
            return parts.some((p) => p.status && p.status !== 'rejected');
          }
          return activeSeason && n.season_id === activeSeason.id && VOTABLE.includes(n.status);
        });
        if (!active) return;
        setHonoreeIndex(buildHonoreeYearIndex(seasons, activeSeason.id));
        setNomineeIndex(new Map(raw.map((n) => [n.id, n])));
        setSeason(activeSeason);
        setPool(prepared);
        if (prepared.length >= 4) setCurrentSet(drawSet(prepared, []));
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
    if (phase === 'worst' && nominee.id === topId) {
      // De-select the "first" anchor by clicking it again → back to the first prompt.
      setTopId(null);
      setBottomId(null);
      setPhase('best');
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

        onRecorded?.(res.data.progress);

        setPhase('success');
        setTimeout(() => advance(), 750);
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Vote failed',
          description: e?.response?.data?.error || e.message,
        });
        setBottomId(null);
        setPhase('worst');
      }
    }
  };

  // The ring walks the same four cards. While a set is standing, a turn of the wheel
  // moves the cursor across it — the ends hold, so the first and the last card are as
  // far as it goes — and the centre button votes for the card the cursor has reached.
  // Reading suspends the vote: while the briefing or a candidate's file is open, the ring
  // and the keys belong to the reader, not to the ballot, so no mark can be made by
  // accident.
  const reading = guideOpen || Boolean(panelNominee);
  const standing = (phase === 'best' || phase === 'worst') && !reading;
  // Which face the case is wearing. The chamber is voted from the hardware either way,
  // but the radio has no X, Y, A or B to press: its candidates stand on the digits in
  // reading order — 1–4 vote, 5–8 open the same four files — and each card prints both
  // of its own numbers.
  const radio = useConsoleFace() === 'radio';
  const setKey = currentSet.map((n) => n.id).join('|');
  const cursor = useAnchorPicker({
    count: currentSet.length,
    labelAt: (i) => currentSet[i]?.name || `Candidate ${String.fromCharCode(65 + i)}`,
    active: standing,
    setKey,
    onChoose: (i) => {
      const nominee = currentSet[i];
      if (nominee) handleSelect(nominee);
    },
    onInfo: (i) => {
      const nominee = currentSet[i];
      if (!nominee) return;
      setPanelNominee(nominee);
      setPanelToken(String.fromCharCode(65 + i));
    },
  });

  // While a set is standing, the keypad is the vote: a press puts that key's own card
  // under the same hand the tap does. Between sets, and once the set is recorded, the
  // keys go back to the console — A confirm, B back, X sections, Y share.
  const voteKeys = useRef(null);
  voteKeys.current =
    (phase === 'best' || phase === 'worst') && !reading && currentSet.length === 4
      ? (key) => {
          const i = VOTE_KEYS.indexOf(key);
          if (i < 0 || !currentSet[i]) return false;
          handleSelect(currentSet[i]);
          return true;
        }
      : null;

  useEffect(() => {
    if (!voteKeys.current) return undefined;
    return registerFaceKeys((key) => (voteKeys.current ? voteKeys.current(key) : false));
  }, [phase, currentSet, reading]);

  // The radio's half of the same claim. The digits stand in the order the cards are set:
  // 1–4 sit on the cards themselves and vote for the one they are on, and the same four
  // cards' information doors are the next four keys — 5 opens the first card's file, 6
  // the second's, and so on. The console takes the press before the pad can tune or walk,
  // exactly as it does for X, Y, A and B on the wheel.
  useEffect(() => {
    if (!radio || !voteKeys.current) return undefined;
    return registerDigits((digit) => {
      const n = Number(digit);
      const count = currentSet.length;
      const info = n > count;
      const i = info ? n - count - 1 : n - 1;
      const nominee = currentSet[i];
      if (!(i >= 0 && i < count) || !nominee) return false;
      if (info) {
        setPanelNominee(nominee);
        setPanelToken(String.fromCharCode(65 + i));
      } else {
        handleSelect(nominee);
      }
      return true;
    });
  }, [radio, phase, currentSet, reading]);

  // The desk's own keyboard answers the same way: X, Y, A and B vote for the four
  // faces exactly as the console's keys do, so the legends printed on the cards hold
  // on a laptop. A field being written into keeps its letters.
  useEffect(() => {
    if (!voteKeys.current) return undefined;
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
      const key = String(event.key || '').toUpperCase();
      if (!VOTE_KEYS.includes(key)) return;
      if (voteKeys.current && voteKeys.current(key)) event.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, currentSet, reading]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: brand.gold }} />
      </div>
    );
  }

  if (pool.length < 4) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
        <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${brand.gold}18` }}>
          <Info className="w-5 h-5" style={{ color: brand.gold }} />
        </div>
        <h2 className="text-base font-bold mb-1.5" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
          Not enough nominees to vote
        </h2>
        <p className="text-xs max-w-xs leading-relaxed" style={{ color: `${brand.navy}60` }}>
          Anchor selection needs at least four nominees in the active pool. Check back once the season is seeded.
        </p>
      </div>
    );
  }

  const prompt =
    phase === 'best' ? 'Rank 1?' :
    phase === 'worst' ? 'Rank 4?' :
    phase === 'submitting' ? 'Recording your comparisons…' :
    phase === 'review' ? 'Reviewing your last set.' :
    'Anchored. Drawing the next set.';

  // Undo, review and resume are offered only when they mean something, and they are the
  // one row the ballot ever adds: on the glass they are kept off the cards' budget
  // entirely on the phases that have nothing to offer.
  const hasControls =
    phase === 'worst' || phase === 'review' || (history.length > 0 && (phase === 'best' || phase === 'worst'));

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
      {/* Voting surface */}
      <div className="flex-1 flex flex-col min-w-0 px-2.5 pt-0.5 pb-2 md:px-4 md:pt-4 md:pb-6 lg:px-8">
        <div className="max-w-5xl mx-auto w-full flex flex-col flex-1 min-h-0">
        {/* The console names this panel on its own strip, so on the glass the title
            stands down and the prompt and the cards take the room. */}
        <div className="mb-1 hidden md:block">
          <div>
            <h2 className="text-lg font-bold" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
              Anchor Selection
            </h2>
            <p className="hidden text-[11px] leading-snug max-w-md md:block" style={{ color: `${brand.navy}60` }}>
              Two taps. The one you advance first and the one you advance last become anchors — five real comparisons, recorded as observations.
            </p>
          </div>
        </div>

        {/* Prompt, with the way into the explainer beside it and the session's tally at
            the far end of the row. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={prompt}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mb-1 mt-0 flex items-center gap-1.5 md:mb-4 md:mt-3 md:gap-2"
          >
            {phase === 'best' && (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: `${brand.gold}1F` }}>
                <ArrowUp className="h-3 w-3" style={{ color: brand.gold }} />
              </span>
            )}
            {phase === 'worst' && (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: `${brand.navy}0F` }}>
                <ArrowDown className="h-3 w-3" style={{ color: `${brand.navy}90` }} />
              </span>
            )}
            {phase === 'submitting' && (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: `${brand.navy}0F` }}>
                <Loader2 className="h-3 w-3 animate-spin" style={{ color: brand.gold }} />
              </span>
            )}
            <p className="min-w-0 truncate font-heading text-[14px] leading-none md:text-[17px]" style={{ color: brand.navy }}>{prompt}</p>
            {/* The one way in: the info key opens the briefing — the vote's own objective
                and the ladder that says it has been reached, and nothing from the other
                surface. */}
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              aria-label="Mission briefing — the vote's objective and key results"
              title="Mission briefing"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
              style={{ background: `${brand.navy}0A`, border: `1px solid ${brand.navy}1A`, color: `${brand.navy}70` }}
            >
              <Info className="h-3 w-3" />
            </button>
            <span
              className="ml-auto shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-semibold tabular-nums md:px-2.5 md:py-1 md:text-[10px]"
              style={{ background: `${brand.navy}08`, color: `${brand.navy}80` }}
            >
              {sessionCount} sets
            </span>
          </motion.div>
        </AnimatePresence>

        {/* What the keys do, printed on the desk where the console prints its own
            legends. The glass carries the same marks on the cards themselves. */}
        <div className="mb-2 hidden flex-wrap items-center gap-x-2.5 gap-y-1 md:flex">
          {[
            ['\u2190 \u2192', 'walk the set'],
            ['Enter', 'mark'],
            ['X Y A B', 'vote'],
            ['I', 'info'],
          ].map(([key, text]) => (
            <span key={key} className="inline-flex items-center gap-1.5 text-[10px]" style={{ color: `${brand.navy}55` }}>
              <span
                className="rounded-md px-1.5 py-[1px] text-[9px] font-semibold"
                style={{ background: `${brand.navy}06`, border: `1px solid ${brand.navy}16`, color: `${brand.navy}80` }}
              >
                {key}
              </span>
              {text}
            </span>
          ))}
        </div>

        {/* Controls: undo mid-set / review last set / resume */}
        <div className={hasControls ? 'mb-1 flex flex-wrap items-center gap-1.5 md:mb-3 md:gap-2' : 'hidden'}>
          {phase === 'worst' && (
            <button onClick={undoFirstPick} className="text-[11px] font-semibold px-2 py-1 md:px-3 md:py-1.5 rounded-full flex items-center gap-1.5" style={{ background: `${brand.navy}06`, color: `${brand.navy}80`, border: `1px solid ${brand.navy}14` }}>
              <Undo2 className="w-3.5 h-3.5" /> Undo first pick
            </button>
          )}
          {history.length > 0 && (phase === 'best' || phase === 'worst') && (
            <button onClick={goBack} className="text-[11px] font-semibold px-2 py-1 md:px-3 md:py-1.5 rounded-full flex items-center gap-1.5" style={{ background: `${brand.navy}06`, color: `${brand.navy}80`, border: `1px solid ${brand.navy}14` }}>
              <ArrowLeft className="w-3.5 h-3.5" /> Review last set
            </button>
          )}
          {phase === 'review' && (
            <button onClick={resumeVoting} className="text-[11px] font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full flex items-center gap-1.5" style={{ background: brand.gold, color: 'white' }}>
              Resume voting
            </button>
          )}
        </div>

        {/* Four candidates, twice two — on the glass the whole set has to stand in view
            at once, so the grid takes its rows from the height it is given. */}
        <div className="grid grid-cols-2 grid-rows-2 gap-1.5 sm:gap-3 lg:gap-4 flex-1 min-h-0">
          {currentSet.map((nominee, idx) => {
            const isTop = nominee.id === topId;
            const isBottom = nominee.id === bottomId;
            const token = String.fromCharCode(65 + idx);
            // All cards stay clickable in 'worst' so the top pick can be de-selected by tapping it again.
            const selectable = phase === 'best' || phase === 'worst';
            return (
              <JudgeCard
                key={nominee.id}
                nominee={nominee}
                token={token}
                isTop={isTop}
                isBottom={isBottom}
                honoreeVolumes={honoreeVolumes(nominee, honoreeIndex, nomineeIndex)}
                selectable={selectable && !reading && phase !== 'submitting' && phase !== 'success' && phase !== 'review'}
                cursor={standing && cursor === idx}
                onInfo={() => { setPanelNominee(nominee); setPanelToken(token); }}
                onSelect={() => handleSelect(nominee)}
                keyLabel={radio ? String(idx + 1) : VOTE_KEYS[idx]}
                infoKeyLabel={radio ? String(idx + 1 + currentSet.length) : null}
                dense={radio}
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
              className="mx-auto mt-2 flex items-center justify-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold md:mt-5 md:text-xs"
              style={{ background: `${brand.gold}18`, border: `1px solid ${brand.gold}55`, color: brand.navy }}
            >
              <Check className="w-3.5 h-3.5" style={{ color: brand.gold }} /> 5 comparisons recorded
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* The briefing: what the two surfaces are for, and the ladder each one is measured by. */}
      <MissionBriefing open={guideOpen} onOpenChange={setGuideOpen} section="vote" />

      {/* The card's information panel (anonymized) */}
      <AnimatePresence>
        {panelNominee && (
          <EvidencePopover
            nominee={panelNominee}
            token={panelToken}
            volumes={honoreeVolumes(panelNominee, honoreeIndex, nomineeIndex)}
            onClose={() => setPanelNominee(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}