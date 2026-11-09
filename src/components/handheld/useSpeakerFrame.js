import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// Whether the case speaker's record is framed.
//
// The frame is a fitting, not a decoration: the plate the record sits in can be left
// bare on the moulding or closed in a machined square, and the choice belongs to
// whoever is holding the device. Two memories, as the finish has: the account carries
// it, and this device remembers the last answer put on it — so a visitor still gets a
// case they dressed.
const FRAME_KEY = "top100-speaker-frame";
const EVENT = "hh-speaker-frame";

export function readLocalFrame() {
  try {
    return localStorage.getItem(FRAME_KEY) === "on";
  } catch {
    return false;
  }
}

function writeLocalFrame(on) {
  try {
    localStorage.setItem(FRAME_KEY, on ? "on" : "off");
  } catch {
    // Storage unavailable — the fitting holds for this session only.
  }
}

export default function useSpeakerFrame() {
  const [framed, setFramed] = useState(readLocalFrame);

  // Every mounted piece of hardware stays in step with the one that changed.
  useEffect(() => {
    const sync = () => setFramed(readLocalFrame());
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
        const page = await base44.entities.FellowProfileSettings.filter(
          { fellow_email: me.email },
          { limit: 1 },
        );
        const saved = page?.items?.[0]?.speaker_frame;
        if (typeof saved !== "boolean" || saved === readLocalFrame()) return;
        writeLocalFrame(saved);
        setFramed(saved);
      } catch {
        // Not signed in, or settings unreachable — the device keeps its own memory.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleFrame = useCallback(async () => {
    const next = !readLocalFrame();
    writeLocalFrame(next);
    setFramed(next);
    window.dispatchEvent(new Event(EVENT));
    try {
      const me = await base44.auth.me();
      if (!me?.email) return;
      const page = await base44.entities.FellowProfileSettings.filter(
        { fellow_email: me.email },
        { limit: 1 },
      );
      const existing = page?.items?.[0];
      if (existing?.id) {
        await base44.entities.FellowProfileSettings.update(existing.id, { speaker_frame: next });
      } else {
        await base44.entities.FellowProfileSettings.create({
          fellow_email: me.email,
          speaker_frame: next,
        });
      }
    } catch {
      // Not signed in — the fitting simply stays on this device.
    }
  }, []);

  return { framed, toggleFrame };
}