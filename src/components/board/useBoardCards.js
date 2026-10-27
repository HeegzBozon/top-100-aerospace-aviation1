import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerPicker, touchPicker } from "@/components/handheld/handheldPicker";
import { BOARD_COLUMNS, cursorKey } from "./boardConfig";

// The Board's cards, as the ring walks them.
//
// The Board is the one surface that is a field of cards rather than a list of
// options, so the console keeps a cursor on the card itself: rotation steps card by
// card down the column you are in, back and forward cross to the neighbour, and the
// centre opens the card the cursor is standing on. At either end of a column the
// turn is handed back, so the glass keeps scrolling and the ring never dead-ends in
// the hand.
//
// Which column the cursor is in is measured from the track, never remembered: a
// column swiped across by thumb and a column crossed by the ring cannot disagree
// about where you are, and the highlight is never left behind in a column that is
// no longer in front of you.

const TRACK = "[data-hh-track]";
const COLUMN = "[data-hh-module]";

const trackEl = () => document.querySelector(TRACK);

const offsetIn = (element, track) =>
  element.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;

// The column in front of you — the same mark the console's own module navigation
// reads, so the rail and the cursor never point at two different columns.
const columnAt = (track, els) => {
  const mark = track.scrollLeft + Math.min(track.clientWidth * 0.32, 200);
  let found = 0;
  els.forEach((el, i) => {
    if (offsetIn(el, track) <= mark) found = i;
  });
  return found;
};

// Depth only: the cursor's card is brought up inside its own column, so moving the
// cursor never disturbs the columns themselves.
const reveal = (key) => {
  const card = document.querySelector(`[data-hh-card="${key}"]`);
  const scroller = card?.closest("[data-hh-scroll]");
  if (!card || !scroller) return;
  const top =
    card.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
  const bottom = top + card.offsetHeight;
  if (top < scroller.scrollTop) scroller.scrollTop = Math.max(0, top - 8);
  else if (bottom > scroller.scrollTop + scroller.clientHeight) {
    scroller.scrollTop = bottom - scroller.clientHeight + 8;
  }
};

// The check-in column's cards are the work the record is asking for today; the four
// directions are their configured cards.
const buildLists = (checkIn) => [
  [
    ...(checkIn?.tasks || []).map((task) => ({
      key: cursorKey.task(task.key),
      label: task.title,
      to: task.to,
    })),
    ...(checkIn?.onboarding || [])
      .filter((step) => !step.done)
      .map((step) => ({ key: cursorKey.step(step.key), label: step.title, to: step.to })),
  ],
  ...BOARD_COLUMNS.slice(1).map((column) =>
    column.cards.map((card) => ({ key: cursorKey.card(card.key), label: card.title, to: card.to })),
  ),
];

export default function useBoardCards({ checkIn, enabled }) {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState(null);

  const lists = useMemo(() => buildLists(checkIn), [checkIn]);
  const listsRef = useRef(lists);
  listsRef.current = lists;
  const keyRef = useRef(selectedKey);
  keyRef.current = selectedKey;

  // Where the cursor was left in each column, so crossing back finds it again.
  const memory = useRef(new Map());
  // The column the cursor currently stands in.
  const shown = useRef(0);

  const place = useCallback(() => {
    const track = trackEl();
    if (!track) return { column: 0, list: listsRef.current[0] || [] };
    const column = columnAt(track, Array.from(track.querySelectorAll(COLUMN)));
    return { column, list: listsRef.current[column] || [] };
  }, []);

  const at = useCallback((column, key) => {
    const list = listsRef.current[column] || [];
    return list.findIndex((card) => card.key === key);
  }, []);

  const land = useCallback((column, card) => {
    shown.current = column;
    if (!card) {
      setSelectedKey(null);
      return null;
    }
    memory.current.set(column, card.key);
    setSelectedKey(card.key);
    reveal(card.key);
    return card.label;
  }, []);

  // Standing where the column in front of you left off, or on its first card.
  const settle = useCallback(
    (column) => {
      const list = listsRef.current[column] || [];
      const remembered = memory.current.get(column);
      return list.find((card) => card.key === remembered) || list[0];
    },
    [],
  );

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => place().list.map((card) => card.label),
      index: () => Math.max(0, at(place().column, keyRef.current)),
      step: (direction) => {
        const { column, list } = place();
        if (!list.length) return null;
        const standing = at(column, keyRef.current);
        const target = (standing < 0 ? -1 : standing) + direction;
        if (target < 0 || target >= list.length) return null;
        return land(column, list[target]);
      },
      page: (direction) => {
        const track = trackEl();
        if (!track) return null;
        const els = Array.from(track.querySelectorAll(COLUMN));
        const target = columnAt(track, els) + direction;
        if (target < 0 || target >= els.length) return null;
        els[target].scrollIntoView({ inline: "start", block: "nearest", behavior: "smooth" });
        // An empty column still answers with its name, so the rail says where the
        // ring landed even when there is nothing there to open.
        return land(target, settle(target)) || BOARD_COLUMNS[target]?.label || null;
      },
      goTo: (i) => {
        const { column, list } = place();
        return land(column, list[i]);
      },
      enter: () => {
        const { column, list } = place();
        if (!list.length) return false;
        const standing = at(column, keyRef.current);
        navigate(list[standing < 0 ? 0 : standing].to);
        return true;
      },
      back: () => false,
    };
  }

  // A new set of cards — the check-in tasks arriving, a column crossing — is a new
  // list for the rail to read.
  const signature = lists.map((list) => list.map((card) => card.key).join(",")).join("|");

  useEffect(() => {
    if (!enabled) return undefined;
    return registerPicker(api.current);
  }, [enabled]);

  useEffect(() => {
    if (enabled) touchPicker();
  }, [enabled, signature, selectedKey]);

  // The cursor stands somewhere from the first frame the board is whole, so the
  // highlight is never missing the first time the wheel is turned.
  useEffect(() => {
    if (!enabled || keyRef.current) return;
    const { column } = place();
    const card = settle(column);
    if (card) land(column, card);
  }, [enabled, signature, place, settle, land]);

  // A column taken by thumb takes the cursor with it.
  useEffect(() => {
    if (!enabled) return undefined;
    const track = trackEl();
    if (!track) return undefined;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const column = columnAt(track, Array.from(track.querySelectorAll(COLUMN)));
        if (column === shown.current) return;
        land(column, settle(column));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled, place, settle, land]);

  return { selectedKey };
}