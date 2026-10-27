import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  DEFAULT_IMAC_FINISH,
  IMAC_FINISH_KEY,
  IMAC_PACKS,
  imacOptionsFor,
  imacPackFor,
  isImacFinish,
  resolveImacFinish,
} from "./imacFinishes";
import { FINISH_EVENT } from "@/components/handheld/handheldFinishes";
import { readLocalFinish } from "@/components/handheld/useHandheldFinish";

// Two machines, one memory. The desk machine is moulded to match the handheld unless
// a Fellow asks it for a colour of its own, so the console's finish decides the desk
// too — and it does so live: change the device in the console's options menu and the
// machine in front of you re-casts with it. A colour of its own is remembered on this
// desk, the way the device remembers its own, so a visitor gets a machine they have
// dressed, not a default.
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

// Written onto the document so the machine is one set of tones wherever it is painted
// from: the shell, the loading chassis, and the page turn all read these.
export function applyImacFinish(key, handheldKey = readLocalFinish()) {
  const finish = resolveImacFinish(key, handheldKey);
  const root = document.documentElement.style;
  Object.entries(finish.vars).forEach(([token, value]) => root.setProperty(token, value));
}

export default function useImacFinish() {
  const [finishKey, setFinishKey] = useState(readLocalImacFinish);
  const [handheldKey, setHandheldKey] = useState(readLocalFinish);

  const finish = resolveImacFinish(finishKey, handheldKey);
  const pack = imacPackFor(finishKey);

  useLayoutEffect(() => {
    applyImacFinish(finishKey, handheldKey);
  }, [finishKey, handheldKey]);

  // The device is dressed somewhere else — the console's own options menu — and the
  // machine follows it there without being asked.
  useEffect(() => {
    const sync = () => setHandheldKey(readLocalFinish());
    window.addEventListener(FINISH_EVENT, sync);
    return () => window.removeEventListener(FINISH_EVENT, sync);
  }, []);

  // Every mounted piece of the machine stays in step with the one that changed.
  useEffect(() => {
    const sync = () => setFinishKey(readLocalImacFinish());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const chooseFinish = useCallback((key) => {
    if (!isImacFinish(key)) return;
    writeLocalImacFinish(key);
    applyImacFinish(key, readLocalFinish());
    setFinishKey(key);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  // A pack is switched by picking from it: the machine is moulded in its first
  // colour, and the Console pack hands the colour back to the device.
  const choosePack = useCallback(
    (packKey) => {
      const options = imacOptionsFor(packKey, readLocalFinish());
      if (options[0]) chooseFinish(options[0].key);
    },
    [chooseFinish]
  );

  return {
    finishKey,
    finish,
    pack,
    packs: IMAC_PACKS,
    options: imacOptionsFor(pack.key, handheldKey),
    chooseFinish,
    choosePack,
  };
}