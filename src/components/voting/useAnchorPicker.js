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
export default function useAnchorPicker({ count, labelAt, active, setKey, onChoose, onInfo }) {
  const [cursor, setCursor] = useState(0);

  const countRef = useRef(count);
  countRef.current = count;
  const activeRef = useRef(active);
  activeRef.current = active;
  const labelRef = useRef(labelAt);
  labelRef.current = labelAt;
  const chooseRef = useRef(onChoose);
  chooseRef.current = onChoose;
  const infoRef = useRef(onInfo);
  infoRef.current = onInfo;
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

  // The mark itself. The ring's centre button and the desk's Enter both come through
  // here, so either hand puts the same press on the ballot.
  const choose = useCallback(() => {
    if (!activeRef.current) return false;
    const target = here();
    if (target >= countRef.current) return false;
    chooseRef.current(target);
    return true;
  }, [here]);

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => Array.from({ length: countRef.current }, (_, i) => labelRef.current(i)),
      index: here,
      step: (direction) => land(here() + direction),
      page: (direction) => land(here() + direction),
      goTo: (i) => land(i),
      enter: choose,
      back: () => false,
    };
  }

  // The claim is held only while a set is actually standing, and it is made the moment
  // one stands. The ballot menu this ballot renders inside claims the console when it
  // mounts; a picker registered later is the one on top, so the chamber has to take the
  // console back each time a set is drawn — otherwise the ring and the confirm key stay
  // with the menu and never reach the four cards.
  useEffect(() => {
    if (!active) return undefined;
    return registerPicker(api.current);
  }, [active]);

  // A desk keyboard walks the same cards the ring does: the arrows move the cursor and
  // the ends hold, Enter votes for the card under it, and I opens that card's file. A
  // field being typed into keeps its keys, and so does a control a reader has tabbed
  // to — the ballot only takes the presses nobody else owns.
  useEffect(() => {
    if (!active) return undefined;

    const typing = (el) =>
      Boolean(el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)));
    const owned = (el) => Boolean(el && el.closest && el.closest('button, a[href]'));

    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey || typing(event.target)) return;
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          if (land(here() - 1)) event.preventDefault();
          return;
        case 'ArrowRight':
        case 'ArrowDown':
          if (land(here() + 1)) event.preventDefault();
          return;
        case 'Enter':
        case ' ':
          if (!owned(event.target) && choose()) event.preventDefault();
          return;
        case 'i':
        case 'I':
          if (!owned(event.target) && infoRef.current) {
            infoRef.current(here());
            event.preventDefault();
          }
          return;
        default:
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, land, here, choose]);

  // A fresh set starts on its first card.
  useEffect(() => {
    cursorRef.current = 0;
    setCursor(0);
    touchPicker();
  }, [setKey]);

  return cursor;
}