import { useCallback, useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { START_DOC, capLog } from "./aeroConfig";

// The save behind Hollow Field.
//
// One record per player, keyed by email: the day, the light left in it, the bag,
// the bench, the airframe, the quests and the log. Reads fall back to a copy kept
// on the device, so a session that cannot reach the record still plays on; writes
// never block the world, and the surface tells the truth about whether the day
// was filed or merely kept.

const CACHE_KEY = "aero-frontier-save-v2";

const readLocal = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeLocal = (doc) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(doc));
  } catch {
    // A device that will not keep a copy is not a reason to stop playing.
  }
};

const hydrate = (record) => ({
  ...START_DOC,
  ...record,
  inventory: record.inventory || {},
  crafted: record.crafted || [],
  installed: record.installed || [],
  quests: record.quests || {},
  met: record.met || [],
  visited: record.visited || [],
  seen: record.seen || [],
  nodes: record.nodes || {},
  log: capLog(record.log || []),
});

export default function useAeroFrontier() {
  const [doc, setDoc] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | failed
  const [synced, setSynced] = useState(true);
  const [attempt, setAttempt] = useState(0);

  const docRef = useRef(null);
  const recordRef = useRef(null);
  const userRef = useRef(null);
  const posRef = useRef(START_DOC.at);
  const pendingRef = useRef(null);

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
            const restored = hydrate(found);
            docRef.current = restored;
            if (found.at?.x != null) posRef.current = found.at;
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
      const start = local ? { ...START_DOC, ...local } : { ...START_DOC };
      if (local?.at?.x != null) posRef.current = local.at;
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
      inventory: next.inventory,
      crafted: next.crafted,
      installed: next.installed,
      quests: next.quests,
      met: next.met,
      visited: next.visited,
      seen: next.seen,
      nodes: next.nodes,
      log: capLog(next.log),
      flights: next.flights,
      best_circuit: next.best_circuit,
      at: posRef.current,
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
      // Kept on the device; the HUD says so rather than pretending it was filed.
      setSynced(false);
    }
  }, []);

  // Every action in the world comes through here: one mutation, one render, one
  // write. The world never waits for the write to land.
  const apply = useCallback(
    (mutate, options = {}) => {
      const current = docRef.current;
      if (!current) return false;
      const next = mutate(current);
      if (!next) return false;
      docRef.current = next;
      setDoc(next);
      if (options.silent) pendingRef.current = next;
      else persist(next);
      return true;
    },
    [persist],
  );

  const setPos = useCallback((pos) => {
    posRef.current = pos;
  }, []);

  // A quiet save for anything that changes often and matters little (a step).
  const flush = useCallback(() => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending && pending !== docRef.current) persist(docRef.current);
    else if (pending) persist(pending);
  }, [persist]);

  const retry = useCallback(() => {
    setStatus("loading");
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    const onHide = () => flush();
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [flush]);

  return { doc, status, synced, apply, setPos, flush, retry, docRef };
}