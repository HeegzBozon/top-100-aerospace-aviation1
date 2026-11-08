import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { submitAnchorVote } from '@/functions/submitAnchorVote';
import { awardStardust } from '@/functions/awardStardust';
import { progressQuest } from '@/functions/progressQuest';
import { brand, ink } from '@/components/nominate/NominateConfig';
import {
  Loader2, Info, Check, Undo2, ArrowLeft, Bookmark, BookmarkPlus, SkipForward,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { CROSSCHECK_SKIP_LABEL, CROSSCHECK_HOLD_LABEL } from '@/components/voting/ballotNaming';
import JudgeCard from '@/components/voting/JudgeCard';
import CrosscheckDeal, { DealtCard } from '@/components/voting/CrosscheckDeal';
import EvidencePopover from '@/components/voting/EvidencePopover';
import RecordContributionSheet from '@/components/voting/RecordContributionSheet';
import LadderCelebration from '@/components/voting/LadderCelebration';
import { markAhead, markReached, marksClimbedBetween } from '@/components/voting/ladderMarks';
import { registerDigits, registerFaceKeys } from '@/components/handheld/handheldKeys';
import { useConsoleFace } from '@/components/handheld/consoleMode';
import { buildHonoreeYearIndex, honoreeVolumes } from '@/components/voting/honoreeYears';
import useAnchorPicker from '@/components/voting/useAnchorPicker';
import MissionBriefing from '@/components/mission/MissionBriefing';
import ReviewProgressStrip from '@/components/voting/ReviewProgressStrip';
import useGlass from '@/hooks/useGlass';

// The four candidates stand under the four face keys, in the order the cards are set:
// X and Y across the top row, A and B across the bottom. Y is a vote key while a set is
// standing, so the share moves to the ring's play zone for as long as the keys are held.
const VOTE_KEYS = ['X', 'Y', 'A', 'B'];

// On a desk the same four cards answer the letters a hand already rests on: D F on the
// top row and J K on the bottom, each directly under the card it votes for, with E R and
// Y U on the row above opening those same four files. The pair is read as one block of
// the keyboard because it is one block: what the plate prints is what the hand presses.
const DESK_VOTE_KEYS = ['D', 'F', 'J', 'K'];
const DESK_INFO_KEYS = ['E', 'R', 'Y', 'U'];

// One completed set is ten XP on the ladder (see base44/shared/votingProgress.ts). Held
// here so the tally can turn the points still owed into the sets still owed.
const XP_PER_REVIEW = 10;

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

export default function AnchorVoting({ user, activeSeason: resolvedSeason = null, onRecorded = null, progress = null, readOnly = false }) {
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
  // The order as it is tapped: first, then second, then third. The fourth record places
  // itself, so no screen ever asks a voter to name a last place. The question is the place
  // being filled — First? Second? Third? — never a comparison between two people.
  const [phase, setPhase] = useState('ordering'); // ordering | submitting | success | skipped | review
  const [order, setOrder] = useState([]);
  const [panelNominee, setPanelNominee] = useState(null);
  const [panelToken, setPanelToken] = useState('A');
  // A record the voter is saying something about — a correction or a note — rather than
  // reading. It opens from the card's own door, so the mark is made where it is noticed.
  const [noteNominee, setNoteNominee] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [history, setHistory] = useState([]); // completed sets for review/back
  // The briefing opens itself once, from the hub, on the Fellow's first pass through the
  // committee — this surface only offers it again from the info key beside the prompt.
  // One key, one panel: the info button IS the briefing, and it carries the vote alone.
  const [guideOpen, setGuideOpen] = useState(false);
  // Reviews set aside rather than weighed now: the four records as they were dealt, kept
  // so the same review can be taken up again. `heldId` is the one standing on the glass.
  const [holds, setHolds] = useState([]);
  const [heldId, setHeldId] = useState(null);
  // The beat the ladder is given when a rung turns over: the mark that was reached, the
  // figure it stands for, and the name of what is next.
  const [moment, setMoment] = useState(null);

  // The record, not the session: what the Fellow has already weighed is read back from the
  // ladder the house keeps, so closing the tab no longer loses the count. The session's own
  // tally is only a fallback for a context that could not report one.
  //
  // An administrator walking the ballot is read from the tester's own lane instead, so a
  // rehearsal is never mistaken for a Fellow's contribution — and the walkthrough still
  // shows a tally, which is what makes it testable.
  // The context arrives with the caller's own lane already chosen (a tester's ladder or
  // the community's), so the surface reads it as it is.
  const testing = progress?.lane === 'test';
  const lane = progress;
  const reviews = progress?.sets_completed ?? sessionCount;

  // Two rungs stand ahead of a Fellow — the next named office, and the next named mark.
  // Whichever is nearer is the one the measure carries them towards, so the bar moves on
  // the small increments and not only when a whole office turns over. The marks are read
  // from the surface's own table so a mark is named the moment it is reached.
  const ahead = markAhead(reviews);
  const mileTo = ahead ? ahead.sets - reviews : 0;
  const behind = markReached(reviews);
  const mileProgress = ahead
    ? (reviews - (behind?.sets || 0)) / (ahead.sets - (behind?.sets || 0))
    : 0;
  const levelSetsTo = lane?.next_name
    ? Math.ceil((lane.to_next || 0) / XP_PER_REVIEW)
    : Infinity;
  const mileFirst = Boolean(ahead) && mileTo <= levelSetsTo;
  const nextRung = mileFirst
    ? `${mileTo} ${mileTo === 1 ? 'set' : 'sets'} to ${ahead.name}`
    : lane?.next_name
      ? `${levelSetsTo} ${levelSetsTo === 1 ? 'set' : 'sets'} to ${lane.next_name}`
      : null;
  const rungProgress = lane ? (mileFirst ? mileProgress : lane.progress) : 0;

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
        // The monitor no longer takes the pool from here: both desks read the cohort's own
        // pool server-side (getBallotMeasurement), so the scale and the cards are measured
        // against one field that neither surface can disagree about.
        if (prepared.length >= 4) setCurrentSet(drawSet(prepared, []));
        // Anything the Fellow set aside, newest first. A hold is a convenience queue, so a
        // read that fails never stops the ballot opening.
        const saved = readOnly ? null : await base44.entities.CrosscheckHold
          .filter({ fellow_email: user?.email }, { sort: '-saved_at', limit: 20 })
          .catch(() => null);
        if (active) setHolds(saved?.items || (Array.isArray(saved) ? saved : []));
        setLoading(false);
      } catch (e) {
        if (!active) return;
        toast({ variant: 'destructive', title: 'Could not load nominees', description: e.message });
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const advance = useCallback((completed = null) => {
    // A held review leaves the queue once it has been taken up: it was either weighed or
    // skipped, and either way it is finished with.
    if (heldId) {
      base44.entities.CrosscheckHold.delete(heldId).catch(() => {});
      setHolds((prev) => prev.filter((h) => h.id !== heldId));
      setHeldId(null);
    }
    setHistory((prev) => [...prev, ...(completed ? [completed] : [])].slice(-5));
    setOrder([]);
    setPhase('ordering');
    setSeenIds((prev) => {
      const next = [...prev, ...(currentSet.map((n) => n.id))];
      // keep only the last 10 seen to avoid starving the pool
      return next.slice(-10);
    });
    setCurrentSet(drawSet(pool, seenIds));
    setSessionCount((c) => c + 1);
  }, [currentSet, pool, seenIds, heldId]);

  // Undo the last tap while the set is still standing: the record goes back into the field
  // and the question it answered is asked again.
  const undoLastTap = useCallback(() => {
    setOrder((prev) => prev.slice(0, -1));
  }, []);

  // A review the Fellow passes over. Nothing is recorded from it: the instrument measures
  // four records or it measures none, so a set nobody wanted to weigh is not evidence.
  const skipSet = useCallback(() => {
    if (phase !== 'ordering') return;
    setPhase('skipped');
    setTimeout(() => advance(), 700);
  }, [phase, advance]);

  // Holding a review keeps the four records exactly as the house dealt them, so the Fellow
  // comes back to the same comparison rather than being dealt a different one.
  const holdReview = useCallback(async () => {
    if (phase !== 'ordering' || currentSet.length !== 4) return;
    try {
      const saved = await base44.entities.CrosscheckHold.create({
        fellow_email: user?.email,
        fellow_name: user?.full_name || null,
        season_id: season?.id || null,
        nominee_ids: currentSet.map((n) => n.id),
        labels: currentSet.map((n) => n.name || ''),
        saved_at: new Date().toISOString(),
      });
      setHolds((prev) => [saved, ...prev]);
      toast({ title: 'Held for later', description: 'It is waiting under Held.' });
      advance();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Could not hold this review', description: e.message });
    }
  }, [phase, currentSet, user, season, advance, toast]);

  // Take up the review that has waited longest. A hold whose records have left the field
  // retires itself and the next one is offered, so a stale queue never blocks the ballot.
  const openHeld = useCallback(() => {
    if (!holds.length) return;
    const hold = holds[0];
    const four = (hold.nominee_ids || []).map((id) => nomineeIndex.get(id)).filter(Boolean);
    if (four.length < 4) {
      base44.entities.CrosscheckHold.delete(hold.id).catch(() => {});
      setHolds((prev) => prev.slice(1));
      toast({ title: 'That review has retired', description: 'One of the four has left the field.' });
      return;
    }
    setHeldId(hold.id);
    setOrder([]);
    setPhase('ordering');
    setCurrentSet(four);
  }, [holds, nomineeIndex, toast]);

  // Go back to read the last completed set (read-only — the set is already recorded).
  const goBack = useCallback(() => {
    if (!history.length) return;
    const last = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setCurrentSet(last.set);
    setOrder(last.order || []);
    setPhase('review');
  }, [history]);

  const resumeVoting = useCallback(() => {
    setOrder([]);
    setPhase('ordering');
    setCurrentSet(drawSet(pool, seenIds));
  }, [pool, seenIds]);

  const handleSelect = async (nominee) => {
    if (readOnly || phase !== 'ordering' || !nominee) return;
    if (order.includes(nominee.id)) return;

    const next = [...order, nominee.id];
    // Three taps are all the set asks for. The fourth record places itself.
    if (next.length < 3) {
      setOrder(next);
      return;
    }

    const lastId = currentSet.map((n) => n.id).find((id) => !next.includes(id));
    const ordered = [...next, lastId].filter(Boolean);
    if (ordered.length < 4) return;

    setOrder(next);
    setPhase('submitting');
    try {
      // The record is kept by the instrument as its two anchors and the two between them.
      const res = await submitAnchorVote({
        top_nominee_id: ordered[0],
        bottom_nominee_id: ordered[3],
        neutral_nominee_ids: [ordered[1], ordered[2]],
        season_id: season.id,
      });
      if (!res.data || !res.data.success) throw new Error(res.data?.error || 'Submission failed');

      // Non-blocking rewards, mirroring the other ballot.
      Promise.all([awardStardust({ action_type: 'vote' }), progressQuest({ action: 'anchor_vote' })]).catch(() => {});

      // The whole receipt, not just its rung: the surface needs `recorded`, the level-up
      // and any fresh milestone as well as the progress itself.
      onRecorded?.(res.data);

      // What the ladder answers with, if this set turned a rung over. An office outranks a
      // mark reached on the same set, so the plate carries the promotion and the rail keeps
      // the mark. The mark ahead is read from the ladder the context already handed in.
      const receipt = res.data?.progress;
      const movedSets = receipt?.progress?.sets_completed ?? reviews + 1;
      const climbed = marksClimbedBetween(reviews, movedSets);
      const top = climbed[climbed.length - 1] || null;
      if (receipt?.leveled_up || top) {
        const onward = markAhead(movedSets);
        const office = receipt?.leveled_up ? receipt.progress?.name : null;
        setMoment({
          kind: receipt?.leveled_up ? 'level' : 'mark',
          name: office || top?.name || '',
          sets: movedSets,
          next: onward ? { name: onward.name, sets: onward.sets } : null,
        });
      }

      setPhase('success');
      setTimeout(() => advance({ set: currentSet, order: ordered }), 700);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Review not recorded',
        description: e?.response?.data?.error || e.message,
      });
      setOrder(next.slice(0, -1));
      setPhase('ordering');
    }
  };

  // The ring walks the same four cards. While a set is standing, a turn of the wheel
  // moves the cursor across it — the ends hold, so the first and the last card are as
  // far as it goes — and the centre button votes for the card the cursor has reached.
  // Reading suspends the vote: while the briefing or a candidate's file is open, the ring
  // and the keys belong to the reader, not to the ballot, so no mark can be made by
  // accident.
  const reading = readOnly || guideOpen || Boolean(panelNominee) || Boolean(noteNominee);
  const standing = phase === 'ordering' && !reading;
  // Which face the case is wearing. The chamber is voted from the hardware either way,
  // but the radio has no X, Y, A or B to press: its candidates stand on the digits in
  // reading order — 1–4 vote, 5–8 open the same four files — and each card prints both
  // of its own numbers.
  const radio = useConsoleFace() === 'radio';
  // Which machine is standing here. The glass prints the console's own legends; the desk
  // prints the letters of the keyboard it is being worked from.
  const glass = useGlass();
  const desk = !glass;
  const setKey = currentSet.map((n) => n.id).join('|');
  const { cursor, land: landOn } = useAnchorPicker({
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
    phase === 'ordering' && !reading && currentSet.length === 4
      ? (key) => {
          const i = VOTE_KEYS.indexOf(key);
          if (i < 0 || !currentSet[i]) return false;
          // The ring follows the key that was pressed, so the card marked on the glass
          // and the card being marked are the same card.
          landOn(i);
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
  //
  // The claim is held for as long as a review is standing, the file it opens included:
  // while a candidate's file is up the pad belongs to the reader, so the press is taken
  // and does nothing rather than falling through to the console's own numbers and moving
  // the menu off the card being read.
  //
  // The handler is kept in a ref and re-pointed on every render, exactly as the face keys
  // are: the mark it makes reads the order as it now stands. Registered once per standing
  // review instead, it held the order from the render it was made in — so every press
  // re-placed the first choice and no review could ever reach its third tap.
  const digitKeys = useRef(null);
  digitKeys.current =
    radio && phase === 'ordering' && currentSet.length === 4
      ? (digit) => {
          if (reading) return true;
          const n = Number(digit);
          const count = currentSet.length;
          const info = n > count;
          const i = info ? n - count - 1 : n - 1;
          const nominee = currentSet[i];
          if (!(i >= 0 && i < count) || !nominee) return false;
          // The ring lands on the card the digit names, so # and the centre key act on it
          // rather than on the first card of the review.
          landOn(i);
          if (info) {
            setPanelNominee(nominee);
            setPanelToken(String.fromCharCode(65 + i));
          } else {
            handleSelect(nominee);
          }
          return true;
        }
      : null;

  useEffect(() => {
    if (!digitKeys.current) return undefined;
    return registerDigits((digit) => (digitKeys.current ? digitKeys.current(digit) : false));
  }, [radio, phase, currentSet, reading]);

  // The desk answers with the letters under the fingers rather than the console's own
  // face keys: D F and J K vote for the card standing under each of them, E R and Y U
  // open the same four files. Held in a ref and re-pointed every render for the same
  // reason the face keys are — the mark it makes has to read the order as it now stands.
  const deskKeys = useRef(null);
  deskKeys.current =
    desk && phase === 'ordering' && currentSet.length === 4
      ? (key) => {
          const voteAt = DESK_VOTE_KEYS.indexOf(key);
          const infoAt = DESK_INFO_KEYS.indexOf(key);
          // Anything else is the reader's, not the ballot's: no other key on the desk
          // belongs to this surface, so nothing else is ever taken from it.
          if (voteAt < 0 && infoAt < 0) return false;
          // While a file or the briefing is open the keys belong to the reader, so a
          // press is taken and does nothing rather than marking a card behind the panel.
          if (reading) return true;
          if (voteAt >= 0) {
            const nominee = currentSet[voteAt];
            if (!nominee) return false;
            landOn(voteAt);
            handleSelect(nominee);
            return true;
          }
          const nominee = currentSet[infoAt];
          if (!nominee) return false;
          landOn(infoAt);
          setPanelNominee(nominee);
          setPanelToken(String.fromCharCode(65 + infoAt));
          return true;
        }
      : null;

  // The desk's own keyboard: the two rows of letters above, and the console's face keys
  // as well for a laptop that is being worked with the glass legends in mind. A field
  // being written into keeps its letters.
  useEffect(() => {
    if (!deskKeys.current && !voteKeys.current) return undefined;
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
      const key = String(event.key || '').toUpperCase();
      if (deskKeys.current && deskKeys.current(key)) {
        event.preventDefault();
        return;
      }
      if (VOTE_KEYS.includes(key) && voteKeys.current) {
        voteKeys.current(key);
        event.preventDefault();
      }
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
        <p className="text-xs max-w-xs leading-relaxed" style={{ color: ink.soft }}>
          The Crosscheck needs at least four professionals in the field. Check back once the season is seeded.
        </p>
      </div>
    );
  }

  // Where each record stands, for the plates. The fourth has no tap of its own: once three
  // are placed, the one left standing is fourth by elimination.
  const positionOf = (id) => {
    const placed = order.indexOf(id);
    if (placed >= 0) return placed + 1;
    if (order.length === 3) {
      const rest = currentSet.find((n) => !order.includes(n.id));
      if (rest && rest.id === id) return 4;
    }
    return null;
  };

  // A standing set asks no question of its own: the plate prints the place each tap fills,
  // and how the ballot works is the briefing's job. The row only speaks while something is
  // happening to the set — being recorded, recorded, skipped, or read back.
  const status =
    phase === 'submitting' ? 'Recording the review…' :
    phase === 'success' ? 'Review recorded' :
    phase === 'skipped' ? 'Skipped · nothing recorded' :
    phase === 'review' ? 'Reading back your last review' :
    null;

  // Undo, skip, hold, review and resume are offered only when they mean something: the one
  // row the ballot ever adds, and on the glass it is kept to a single line of small keys.
  const hasControls = !readOnly && (phase === 'ordering' || phase === 'review');

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
      {/* Voting surface */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 px-2.5 pt-1 pb-2 md:px-4 md:pt-3 md:pb-4 lg:px-6 lg:pt-2 lg:pb-2">
        <div className="max-w-5xl mx-auto w-full flex flex-col flex-1 min-h-0">
        {/* One instrument across the head of the set: the office, the tally, the
            experience and the measure. Everything the ladder reports lives here. */}
        {lane && (
          <ReviewProgressStrip
            progress={rungProgress}
            levelName={testing ? `Test · ${lane.name}` : lane.name}
            reviews={reviews}
            xp={lane.xp}
            nextRung={nextRung}
            flash={phase === 'success'}
            flashLabel={`Recorded · +${XP_PER_REVIEW} XP`}
            label={nextRung}
            lane={lane}
          />
        )}
        {/* The bar names this surface, so nothing is printed over the set to name it
            again — the desk reads exactly as the glass does. What the surface is and what
            it is measured by live in the info key, and everything a hand can press stands
            on the one line under it, so the four cards keep the whole of the height. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={status || 'standing'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mb-1.5 mt-0 flex min-w-0 flex-wrap items-center gap-1.5 md:mb-3 md:mt-1 md:flex-nowrap md:gap-2"
          >
            {/* The one way in. The briefing is the instruction: what the ballot is, how a
                set is ordered, and what it is measured by — so the surface itself carries
                no question and no helper line, and the four cards keep the height. */}
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              aria-label="How this works — open the briefing"
              title="How this works"
              className="flex h-7 shrink-0 items-center gap-1.5 rounded-full pl-2 pr-2.5 text-[9.5px] font-bold uppercase tracking-[0.14em] transition-[filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:brightness-110"
              style={{
                background: `linear-gradient(180deg, #26486E, ${brand.navy})`,
                color: '#F4F0E7',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20), 0 4px 10px -6px rgba(7,17,31,0.8)',
              }}
            >
              <Info className="h-3.5 w-3.5" /> How this works
            </button>

            {status && (
              <span className="flex min-w-0 items-center gap-1.5">
                {phase === 'submitting' ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" style={{ color: brand.gold }} />
                ) : phase === 'review' ? null : (
                  <Check className="h-3.5 w-3.5 shrink-0" style={{ color: phase === 'success' ? brand.gold : `${brand.navy}70` }} />
                )}
                <p className="min-w-0 truncate font-heading text-[13px] leading-none md:text-[15px]" style={{ color: brand.navy }}>
                  {status}
                </p>
              </span>
            )}

              {/* Everything that acts on the set stands on this same line, held to the far
                end of it: one row for the briefing key, the status and the keys, so the
                four cards keep every other row of the height. */}
              {hasControls && (
              <>
                <span aria-hidden className="ml-auto mr-0.5 h-3.5 w-px shrink-0" style={{ background: `${brand.navy}16` }} />
                {phase === 'ordering' && (
                  <button onClick={skipSet} className="text-[11px] font-semibold px-2 py-1 md:px-3 md:py-1.5 rounded-full flex shrink-0 items-center gap-1.5" style={{ background: `${brand.navy}06`, color: ink.soft, border: `1px solid ${brand.navy}14` }}>
                    <SkipForward className="w-3.5 h-3.5" /> {CROSSCHECK_SKIP_LABEL}
                  </button>
                )}
                {phase === 'ordering' && (
                  <button onClick={holdReview} className="text-[11px] font-semibold px-2 py-1 md:px-3 md:py-1.5 rounded-full flex shrink-0 items-center gap-1.5" style={{ background: `${brand.navy}06`, color: ink.soft, border: `1px solid ${brand.navy}14` }}>
                    <BookmarkPlus className="w-3.5 h-3.5" /> {CROSSCHECK_HOLD_LABEL}
                  </button>
                )}
                {phase === 'ordering' && holds.length > 0 && (
                  <button onClick={openHeld} className="text-[11px] font-semibold px-2 py-1 md:px-3 md:py-1.5 rounded-full flex shrink-0 items-center gap-1.5" style={{ background: `${brand.gold}1F`, color: brand.navy, border: `1px solid ${brand.gold}66` }}>
                    <Bookmark className="w-3.5 h-3.5" /> Held · {holds.length}
                  </button>
                )}
                {phase === 'ordering' && order.length > 0 && (
                  <button onClick={undoLastTap} className="text-[11px] font-semibold px-2 py-1 md:px-3 md:py-1.5 rounded-full flex shrink-0 items-center gap-1.5" style={{ background: `${brand.navy}06`, color: ink.soft, border: `1px solid ${brand.navy}14` }}>
                    <Undo2 className="w-3.5 h-3.5" /> Undo<span className="hidden md:inline"> last tap</span>
                  </button>
                )}
                {history.length > 0 && phase === 'ordering' && (
                  <button onClick={goBack} className="text-[11px] font-semibold px-2 py-1 md:px-3 md:py-1.5 rounded-full flex shrink-0 items-center gap-1.5" style={{ background: `${brand.navy}06`, color: ink.soft, border: `1px solid ${brand.navy}14` }}>
                    <ArrowLeft className="w-3.5 h-3.5" /> Last review
                  </button>
                )}
                {phase === 'review' && (
                  <button onClick={resumeVoting} className="text-[11px] font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full flex shrink-0 items-center gap-1.5" style={{ background: brand.gold, color: 'white' }}>
                    Resume voting
                  </button>
                )}
              </>
              )}
              </motion.div>
        </AnimatePresence>

        {/* Four candidates, twice two — on the glass the whole set has to stand in view
            at once, so the grid takes its rows from the height it is given. */}
        <CrosscheckDeal
          dealKey={setKey}
          className="grid grid-cols-2 content-start gap-2 sm:gap-3 lg:gap-3 flex-1 min-h-0 overflow-y-auto scrollbar-hide"
        >
          {currentSet.map((nominee, idx) => {
            const token = String.fromCharCode(65 + idx);
            // The plates answer a tap only while the set is being ordered: once the third
            // record is placed, the fourth places itself and the set is read, not pressed.
            const selectable = phase === 'ordering' && !reading;
            return (
              <DealtCard
                key={nominee.id}
                index={idx}
                order={Math.max(0, (positionOf(nominee.id) || idx + 1) - 1)}
                mode={phase === 'skipped' ? 'passed' : 'filed'}
              >
              <JudgeCard
                nominee={nominee}
                token={token}
                position={positionOf(nominee.id)}
                honoreeVolumes={honoreeVolumes(nominee, honoreeIndex, nomineeIndex)}
                selectable={selectable}
                cursor={standing && cursor === idx}
                onInfo={readOnly ? undefined : () => { setPanelNominee(nominee); setPanelToken(token); }}
                onNote={readOnly ? undefined : () => { setNoteNominee(nominee); setPanelToken(token); }}
                onSelect={() => handleSelect(nominee)}
                keyLabel={radio ? String(idx + 1) : glass ? VOTE_KEYS[idx] : DESK_VOTE_KEYS[idx]}
                infoKeyLabel={
                  radio
                    ? String(idx + 1 + currentSet.length)
                    : glass
                      ? null
                      : DESK_INFO_KEYS[idx]
                }
                dense={radio}
              />
              </DealtCard>
            );
          })}
        </CrosscheckDeal>

        </div>
      </div>

      {/* The briefing: what the two surfaces are for, and the ladder each one is measured by. */}
      <MissionBriefing
        open={guideOpen}
        onOpenChange={setGuideOpen}
        section="vote"
        hasStarted={reviews > 0}
      />

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

      {/* The rung turning over: the one moment on the ballot that is the Fellow's own. */}
      <LadderCelebration moment={moment} onClose={() => setMoment(null)} />

      {/* The card's other door: a correction or a note, filed without leaving the set. */}
      {noteNominee && (
        <RecordContributionSheet
          open
          mode="edit"
          nominee={noteNominee}
          token={panelToken}
          onClose={() => setNoteNominee(null)}
        />
      )}
    </div>
  );
}