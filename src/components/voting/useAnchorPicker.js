import { useCallback, useEffect, useRef, useState } from "react";
import { registerPicker, touchPicker } from "@/components/handheld/handheldPicker";

// The four candidates, walked by the ring. A turn of the wheel moves the cursor
// across the set — left to right along the top row, then the bottom, which is the
// order the face keys already stand in — and the ends hold: a turn past the first or
// the last card is declined, so the console bumps instead of the set running on.
// The centre button votes for the card the cursor is standing on, so a whole set can
// be voted with the hardware alone.
//
// Between sets, and once a vote is recorded, the key goes back to the console: the
// cursor only answers while a set is actually standing.
export default function useAnchorPicker({ count, labelAt, active, setKey, onChoose }) {
  const [cursor, setCursor] = useState(0);

  const countRef = useRef(count);
  countRef.current = count;
  const activeRef = useRef(active);
  activeRef.current = active;
  const labelRef = useRef(labelAt);
  labelRef.current = labelAt;
  const chooseRef = useRef(onChoose);
  chooseRef.current = onChoose;
  const cursorRef = useRef(0);

  // Land on a card and say which one it is. The ends hold.
  const land = useCallback((target) => {
    if (target < 0 || target >= countRef.current) return null;
    cursorRef.current = target;
    setCursor(target);
    touchPicker();
    return labelRef.current(target);
  }, []);

  const here = useCallback(() => cursorRef.current, []);

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => Array.from({ length: countRef.current }, (_, i) => labelRef.current(i)),
      index: here,
      step: (direction) => land(here() + direction),
      page: (direction) => land(here() + direction),
      goTo: (i) => land(i),
      enter: () => {
        if (!activeRef.current) return false;
        const target = here();
        if (target >= countRef.current) return false;
        chooseRef.current(target);
        return true;
      },
      back: () => false,
    };
  }

  useEffect(() => registerPicker(api.current), []);

  // A fresh set starts on its first card.
  useEffect(() => {
    cursorRef.current = 0;
    setCursor(0);
    touchPicker();
  }, [setKey]);

  return cursor;
}