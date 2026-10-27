import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { MISSIONS, missionByKey, xpFor } from './missionConfig';

const LIVE_PHASES = ['nominations_open', 'voting_open', 'review', 'rollover'];
const first = (page) => (Array.isArray(page) ? page[0] : page?.items?.[0]) || null;
const hasAny = (page) => (Array.isArray(page) ? page.length : page?.items?.length || 0) > 0;

// The Fellow's place on the season's path, kept across sessions in one record.
//
// Two missions are not self-reported: a nomination and a vote are read back from the
// records the committee already keeps, so the path agrees with the ballot and never
// invents a completed nomination. Everything else is the Fellow's own word.
//
// Nothing read here is measurement. The chronicle holds cosmetics and a position.
export default function useMissionChronicle({ touch = false } = {}) {
  const [state, setState] = useState({ loading: true, failed: false });
  const [user, setUser] = useState(null);
  const [chronicle, setChronicle] = useState(null);
  const [season, setSeason] = useState(null);
  const [detected, setDetected] = useState([]);
  const [attempt, setAttempt] = useState(0);

  const recordId = useRef(null);
  const emailRef = useRef(null);
  const completedRef = useRef([]);

  useEffect(() => {
    let alive = true;
    setState({ loading: true, failed: false });

    const load = async () => {
      let me = null;
      try {
        me = await base44.auth.me();
      } catch {
        me = null; // a visitor: the path is shown, it is simply not kept
      }
      if (!alive) return;
      setUser(me);

      if (!me?.email) {
        setState({ loading: false, failed: false });
        return;
      }
      emailRef.current = me.email;

      const [page, seasonPage, intake, pairwise, ranked] = await Promise.all([
        base44.entities.MissionChronicle.filter({ fellow_email: me.email }, { sort: '-updated_date', limit: 1 }),
        base44.entities.Season.list('-start_date', 6),
        base44.entities.NominationIntake.filter({ nominator_email: me.email }, { limit: 1 }).catch(() => null),
        base44.entities.PairwiseVote.filter({ voter_email: me.email }, { limit: 1 }).catch(() => null),
        base44.entities.RankedVote.filter({ voter_email: me.email }, { limit: 1 }).catch(() => null),
      ]);
      if (!alive) return;

      const record = first(page);
      const seasons = Array.isArray(seasonPage) ? seasonPage : seasonPage?.items || [];
      const current = seasons.find((s) => LIVE_PHASES.includes(s.status)) || seasons[0] || null;

      const found = [];
      if (hasAny(intake)) found.push('nominate');
      if (hasAny(pairwise) || hasAny(ranked)) found.push('vote');

      recordId.current = record?.id || null;
      setSeason(current);
      setChronicle(record);
      setDetected(found);

      // What the records already know is written into the chronicle, once.
      const stored = record?.completed_missions || [];
      const merged = Array.from(new Set([...stored, ...found]));
      if (merged.length > stored.length) {
        const patch = { completed_missions: merged, xp: xpFor(merged) };
        if (record) {
          await base44.entities.MissionChronicle.update(record.id, patch);
          if (alive) setChronicle({ ...record, ...patch });
        } else if (touch) {
          const created = await base44.entities.MissionChronicle.create({
            fellow_email: me.email,
            season_id: current?.id || '',
            season_label: current?.name || '',
            completed_missions: merged,
            xp: xpFor(merged),
            last_seen_at: new Date().toISOString(),
          });
          recordId.current = created.id;
          if (alive) setChronicle(created);
        }
      }
      if (alive) setState({ loading: false, failed: false });
    };

    load().catch(() => {
      if (alive) setState({ loading: false, failed: true });
    });

    return () => {
      alive = false;
    };
  }, [attempt, touch]);

  const completed = Array.from(new Set([...(chronicle?.completed_missions || []), ...detected]));
  completedRef.current = completed;
  const xp = xpFor(completed);

  const save = useCallback(async (patch) => {
    const email = emailRef.current;
    if (!email) return;
    if (recordId.current) {
      await base44.entities.MissionChronicle.update(recordId.current, patch);
      setChronicle((prev) => ({ ...(prev || { fellow_email: email }), ...patch }));
      return;
    }
    const created = await base44.entities.MissionChronicle.create({
      fellow_email: email,
      season_id: season?.id || '',
      season_label: season?.name || '',
      completed_missions: [],
      choices: {},
      dismissed_nudges: [],
      ...patch,
    });
    recordId.current = created.id;
    setChronicle(created);
  }, [season]);

  const complete = useCallback(async (key, patch) => {
    const list = completedRef.current;
    if (list.includes(key)) {
      if (patch) await save(patch);
      return;
    }
    const next = [...list, key];
    completedRef.current = next;
    await save({
      ...(patch || {}),
      completed_missions: next,
      xp: xpFor(next),
      last_seen_at: new Date().toISOString(),
    });
  }, [save]);

  const choose = useCallback(async (choiceKey, value) => {
    const choices = { ...(chronicle?.choices || {}), [choiceKey]: value };
    const patch = { choices };
    if (choiceKey === 'aircraft_key') patch.aircraft_key = value;
    await save(patch);
  }, [chronicle, save]);

  // The next thing the path is asking for, in the order the chapters are walked.
  const nextMission = MISSIONS.find((mission) => {
    if (completed.includes(mission.key)) return false;
    if (mission.unlockAfter === 'all') return false;
    return true;
  }) || null;

  return {
    loading: state.loading,
    failed: state.failed,
    user,
    chronicle,
    season,
    completed,
    xp,
    missions: MISSIONS.map((mission) => ({
      ...mission,
      done: completed.includes(mission.key),
      value: chronicle?.choices?.[mission.choiceKey] || null,
    })),
    nextMission: nextMission ? missionByKey(nextMission.key) : null,
    retry: () => setAttempt((n) => n + 1),
    save,
    complete,
    choose,
  };
}