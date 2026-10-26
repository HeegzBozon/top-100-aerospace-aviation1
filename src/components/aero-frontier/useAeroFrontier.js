import { useCallback, useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  DAY_LINE,
  FIELD_TASKS,
  OPENING_LINE,
  START_DOC,
  SYSTEMS,
  TOTAL_STEPS,
  circuitVerdict,
  systemByKey,
  taskByKey,
} from "./aeroConfig";

const LOCAL_KEY = "aero:frontier:save";
const LOG_LIMIT = 40;

const readLocal = () => {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeLocal = (doc) => {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(doc));
  } catch {
    // Storage refused. The save lives in this session and nowhere else.
  }
};

const entry = (day, text) => ({ at: new Date().toISOString(), day, text });

const capLog = (log) => log.slice(0, LOG_LIMIT);

// The field's own save. One document per player (AeroFrontierSave), mirrored to
// this device so the prototype opens instantly and still plays if the record
// cannot be reached — `synced` is the surface's one line about where the day went.
//
// Play state is the game's alone: nothing here is read by discovery, ranking or
// scoring, and the field never writes back into the institution's measurement.
export default function useAeroFrontier() {
  const [doc, setDoc] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | failed
  const [synced, setSynced] = useState(true);
  const [attempt, setAttempt] = useState(0);

  const docRef = useRef(null);
  docRef.current = doc;
  const userRef = useRef(null);
  const recordRef = useRef(null);

  useEffect(() => {
    let alive = true;

    const open = async () => {
      let user = null;
      try {
        user = await base44.auth.me();
      } catch {
        user = null;
      }
      if (!alive) return;
      userRef.current = user;

      // A saved record wins; a device save covers the first visit and any load
      // that cannot be made.
      if (user) {
        try {
          const page = await base44.entities.AeroFrontierSave.filter(
            { player_email: user.email },
            { limit: 1 },
          );
          const found = page?.items?.[0] || null;
          if (!alive) return;
          if (found) {
            recordRef.current = found;
            const restored = { ...START_DOC, ...found, log: capLog(found.log || []) };
            docRef.current = restored;
            writeLocal(restored);
            setDoc(restored);
            setSynced(true);
            setStatus("ready");
            return;
          }
        } catch {
          if (!alive) return;
          setSynced(false);
        }
      }

      const local = readLocal();
      const start = local
        ? { ...START_DOC, ...local }
        : { ...START_DOC, log: [entry(1, OPENING_LINE)] };
      if (!alive) return;
      docRef.current = start;
      setDoc(start);
      setSynced(!!user);
      setStatus("ready");
    };

    open().catch(() => {
      if (alive) setStatus("failed");
    });

    return () => {
      alive = false;
    };
  }, [attempt]);

  const persist = useCallback(async (next) => {
    writeLocal(next);
    const user = userRef.current;
    if (!user) {
      setSynced(false);
      return;
    }
    const payload = {
      act: next.act,
      day: next.day,
      hours: next.hours,
      parts: next.parts,
      tasks: next.tasks,
      system_steps: next.system_steps,
      flights: next.flights,
      best_circuit: next.best_circuit,
      log: capLog(next.log),
      last_played: new Date().toISOString(),
    };
    try {
      if (recordRef.current?.id) {
        await base44.entities.AeroFrontierSave.update(recordRef.current.id, payload);
      } else {
        recordRef.current = await base44.entities.AeroFrontierSave.create({
          player_email: user.email,
          ...payload,
        });
      }
      setSynced(true);
    } catch {
      // The record could not be reached: the day is kept on this device, and the
      // surface says so rather than pretending it was filed.
      setSynced(false);
    }
  }, []);

  const commit = useCallback(
    (mutate) => {
      const current = docRef.current;
      if (!current) return false;
      const next = mutate(current);
      if (!next) return false;
      docRef.current = next;
      setDoc(next);
      persist(next);
      return true;
    },
    [persist],
  );

  // The work itself. Each action re-checks its own terms, so a tap that arrives
  // out of turn simply declines instead of spending hours twice.
  const workTask = useCallback(
    (key) =>
      commit((current) => {
        const task = taskByKey(key);
        if (!task || current.tasks.includes(key)) return null;
        if ((task.after || []).some((need) => !current.tasks.includes(need))) return null;
        if (current.hours < task.hours) return null;
        return {
          ...current,
          hours: current.hours - task.hours,
          parts: current.parts + task.parts,
          tasks: [...current.tasks, key],
          log: capLog([entry(current.day, task.done), ...current.log]),
        };
      }),
    [commit],
  );

  // Paying the parts opens a system; hours then go in a step at a time.
  const openSystem = useCallback(
    (key) =>
      commit((current) => {
        const system = systemByKey(key);
        if (!system) return null;
        if (current.system_steps[key] !== undefined) return null;
        if ((system.after || []).some((need) => current.system_steps[need] === undefined)) return null;
        if (current.parts < system.parts) return null;
        return {
          ...current,
          parts: current.parts - system.parts,
          system_steps: { ...current.system_steps, [key]: 0 },
          log: capLog([
            entry(current.day, `${system.label}: the parts are in and the bench is clear.`),
            ...current.log,
          ]),
        };
      }),
    [commit],
  );

  const workStep = useCallback(
    (key) =>
      commit((current) => {
        const system = systemByKey(key);
        const done = current.system_steps?.[key];
        if (!system || done === undefined) return null;
        if (done >= system.steps.length) return null;
        if (current.hours < 1) return null;
        const next = done + 1;
        const finished = next >= system.steps.length;
        return {
          ...current,
          hours: current.hours - 1,
          system_steps: { ...current.system_steps, [key]: next },
          log: capLog([
            entry(current.day, finished ? system.done : `${system.label}: ${system.steps[done].toLowerCase()}.`),
            ...current.log,
          ]),
        };
      }),
    [commit],
  );

  const turnDay = useCallback(
    () =>
      commit((current) => {
        const day = current.day + 1;
        return {
          ...current,
          day,
          hours: current.hours + 6,
          log: capLog([entry(day, DAY_LINE(day)), ...current.log]),
        };
      }),
    [commit],
  );

  const recordFlight = useCallback(
    (score) =>
      commit((current) => ({
        ...current,
        flights: current.flights + 1,
        best_circuit: Math.max(current.best_circuit || 0, score),
        log: capLog([
          entry(
            current.day,
            current.flights === 0
              ? `First flight: circuit scored ${score}. ${circuitVerdict(score)}`
              : `Another circuit, scored ${score}.`,
          ),
          ...current.log,
        ]),
      })),
    [commit],
  );

  const retry = useCallback(() => {
    setStatus("loading");
    setAttempt((n) => n + 1);
  }, []);

  // What the field looks like from here: the ground, then the airframe, then the
  // first circuit, and after that the field is kept rather than reclaimed.
  const tasksLeft = doc ? FIELD_TASKS.filter((task) => !doc.tasks.includes(task.key)) : [];
  const condition = doc
    ? Math.round(
        (SYSTEMS.reduce((sum, system) => sum + Math.min(doc.system_steps?.[system.key] || 0, system.steps.length), 0) /
          TOTAL_STEPS) *
          100,
      )
    : 0;
  const stage = !doc
    ? "field"
    : tasksLeft.length
      ? "field"
      : condition < 100
        ? "hangar"
        : doc.flights > 0
          ? "flown"
          : "airborne";

  return {
    doc,
    status,
    synced,
    stage,
    condition,
    tasksLeft,
    log: doc?.log || [],
    workTask,
    openSystem,
    workStep,
    turnDay,
    recordFlight,
    retry,
  };
}