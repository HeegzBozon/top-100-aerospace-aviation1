import { useCallback, useEffect, useRef, useState } from 'react';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';

// The roll, walked by whatever the machine has under the hand.
//
// One cursor serves the ring and the desk's keys, so a Fellow reading the directory on
// the handheld and the same Fellow reading it on the desk stand in the same place: a
// turn of the ring is an arrow key, the confirm key is Enter, and the way back is B or
// Escape. The picker is registered as a modal — a sheet laid over a surface outranks
// the keys of the surface behind it, or the ring would go on walking the ballot while
// the directory stood in front of it.
//
// A turn past the first or the last name is declined (null), which is the machine's
// cursor law: a list stops at its ends and the ring bumps rather than wrapping round.
const PAGE = 5;

export default function useExplorerCursor({ rows, enabled, onOpen, onClose, bodyRef }) {
  const [cursor, setCursor] = useState(0);

  // Whatever the surface is doing now, the picker reads it from here — the api object
  // itself is built once, so registering and unregistering it stays honest.
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;
  const openRef = useRef(onOpen);
  openRef.current = onOpen;
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const moveTo = useCallback((next) => {
    const list = rowsRef.current;
    if (next < 0 || next >= list.length) return null;
    setCursor(next);
    return list[next]?.name || '';
  }, []);

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      modal: true,
      labels: () => rowsRef.current.map((row) => row.name || ''),
      index: () => cursorRef.current,
      step: (direction) => moveTo(cursorRef.current + direction),
      page: (direction) => moveTo(cursorRef.current + direction * PAGE),
      goTo: (index) => moveTo(index),
      enter: () => {
        const row = rowsRef.current[cursorRef.current];
        if (!row) return false;
        openRef.current?.(row);
        return true;
      },
      back: () => {
        closeRef.current?.();
        return true;
      },
    };
  }

  useEffect(() => {
    if (!enabled) return undefined;
    return registerPicker(api.current);
  }, [enabled]);

  // The line under the cursor is kept in the window by the window's own scroll, so the
  // reading follows the thumb rather than the cursor wandering off the sheet.
  useEffect(() => {
    if (!enabled) return;
    const node = bodyRef.current?.querySelector(`[data-row="${cursor}"]`);
    node?.scrollIntoView({ block: 'nearest' });
    touchPicker();
  }, [cursor, enabled, bodyRef]);

  useEffect(() => {
    if (!enabled) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current?.();
        return;
      }
      // A field is typed into; the arrows belong to the text while it has the focus.
      const target = event.target;
      const typing = target instanceof HTMLElement && !!target.closest('input, textarea, select');
      if (typing) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveTo(cursorRef.current + 1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveTo(cursorRef.current - 1);
      } else if (event.key === 'Enter') {
        const row = rowsRef.current[cursorRef.current];
        if (!row) return;
        event.preventDefault();
        openRef.current?.(row);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, moveTo]);

  // A new reading starts at its head. Held stable, so a surface can put it in an
  // effect's dependencies without the effect re-firing on every render.
  const reset = useCallback(() => setCursor(0), []);

  return { cursor, setCursor, reset };
}