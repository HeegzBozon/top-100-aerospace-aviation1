import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  DEFAULT_IMAC_FINISH,
  IMAC_FINISH_KEY,
  IMAC_FINISHES,
  imacFinishByKey,
  isImacFinish,
} from "./imacFinishes";

// One desk, one memory, and it is the desk's own. The Fellow already has a finish
// on the handheld and the account carries a single one, so the machine remembers
// its colour locally rather than overwriting the device's — and a visitor gets a
// machine they have dressed, not a default.
const EVENT = "top100:imac-finish";

export function readLocalImacFinish() {
  try {
    const saved = localStorage.getItem(IMAC_FINISH_KEY);
    return isImacFinish(saved) ? saved : DEFAULT_IMAC_FINISH;
  } catch {
    return DEFAULT_IMAC_FINISH;
  }
}

function writeLocalImacFinish(key) {
  try {
    localStorage.setItem(IMAC_FINISH_KEY, key);
  } catch {
    // Storage unavailable — the colour holds for this session only.
  }
}

// Written onto the document so the machine is one set of tones wherever it is
// painted from: the shell, the loading chassis, and the page turn all read these.
export function applyImacFinish(key) {
  const finish = imacFinishByKey(key);
  const root = document.documentElement.style;
  Object.entries(finish.vars).forEach(([token, value]) => root.setProperty(token, value));
}

export default function useImacFinish() {
  const [finishKey, setFinishKey] = useState(readLocalImacFinish);

  useLayoutEffect(() => {
    applyImacFinish(finishKey);
  }, [finishKey]);

  // Every mounted piece of the machine stays in step with the one that changed.
  useEffect(() => {
    const sync = () => setFinishKey(readLocalImacFinish());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const chooseFinish = useCallback((key) => {
    if (!isImacFinish(key)) return;
    writeLocalImacFinish(key);
    applyImacFinish(key);
    setFinishKey(key);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return {
    finishKey,
    finish: imacFinishByKey(finishKey),
    finishes: IMAC_FINISHES,
    chooseFinish,
  };
}