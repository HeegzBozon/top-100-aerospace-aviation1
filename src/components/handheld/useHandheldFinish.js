import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { DEFAULT_FINISH, FINISH_KEY, FINISHES, finishByKey, isFinish } from "./handheldFinishes";

// Two memories, one device. The Fellow's saved finish travels with the account;
// this device remembers the last finish put on it. The account wins whenever it
// has something to say, and until then the device shows its own choice — so a
// visitor still gets a device they have dressed, not a default.
const EVENT = "top100:handheld-finish";

export function readLocalFinish() {
  try {
    const saved = localStorage.getItem(FINISH_KEY);
    return isFinish(saved) ? saved : DEFAULT_FINISH;
  } catch {
    return DEFAULT_FINISH;
  }
}

function writeLocalFinish(key) {
  try {
    localStorage.setItem(FINISH_KEY, key);
  } catch {
    // Storage unavailable — the finish holds for this session only.
  }
}

// Written onto the document so every piece of hardware reads one set of tones,
// wherever it happens to render from.
export function applyFinish(key) {
  const finish = finishByKey(key);
  const root = document.documentElement.style;
  Object.entries(finish.vars).forEach(([token, value]) => root.setProperty(token, value));
}

export default function useHandheldFinish() {
  const [finishKey, setFinishKey] = useState(readLocalFinish);

  useLayoutEffect(() => {
    applyFinish(finishKey);
  }, [finishKey]);

  // Every mounted piece of hardware stays in step with the one that changed.
  useEffect(() => {
    const sync = () => setFinishKey(readLocalFinish());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  // Reconcile with the account once we know who is holding the device.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (cancelled || !me?.email) return;
        const page = await base44.entities.FellowProfileSettings.filter({ fellow_email: me.email }, { limit: 1 });
        const saved = page?.items?.[0]?.hardware_finish;
        if (!isFinish(saved) || saved === readLocalFinish()) return;
        writeLocalFinish(saved);
        applyFinish(saved);
        setFinishKey(saved);
      } catch {
        // Not signed in, or settings unreachable — the device keeps its own memory.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const chooseFinish = useCallback(async (key) => {
    if (!isFinish(key)) return;
    writeLocalFinish(key);
    applyFinish(key);
    setFinishKey(key);
    window.dispatchEvent(new Event(EVENT));
    try {
      const me = await base44.auth.me();
      if (!me?.email) return;
      const page = await base44.entities.FellowProfileSettings.filter({ fellow_email: me.email }, { limit: 1 });
      const existing = page?.items?.[0];
      if (existing?.id) {
        if (existing.hardware_finish !== key) {
          await base44.entities.FellowProfileSettings.update(existing.id, { hardware_finish: key });
        }
      } else {
        await base44.entities.FellowProfileSettings.create({ fellow_email: me.email, hardware_finish: key });
      }
    } catch {
      // Not signed in — the finish simply stays on this device.
    }
  }, []);

  return { finishKey, finish: finishByKey(finishKey), finishes: FINISHES, chooseFinish };
}