import { useCallback, useEffect, useRef, useState } from "react";
import { registerPicker, touchPicker } from "@/components/handheld/handheldPicker";

// The Pre-Flight surface, walked by the console instead of by thumb.
//
// Every choice on the panel is a key: the connection answers, the way to the orientation,
// the key that carries the Fellow on to the Manifest, and the key that opens the
// Crosscheck. The ring walks that list in the order it is printed and stops at its ends —
// a turn past the last key is the glass's to take, so the page reads on. The centre button
// presses the key under the cursor, and on the radio the same key is reached by its number,
// typed in the FN bank, while # presses it.
//
// The panel's fields are not in the list: a name and an address are typed, so the picker
// never stands on them and the keys go to the field they belong to.
export default function usePreflightWheel({ options, enabled = true }) {
  const [cursor, setCursor] = useState(0);

  const optionsRef = useRef(options);
  optionsRef.current = options;
  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;

  const land = useCallback((target) => {
    const list = optionsRef.current;
    if (!list.length || target < 0 || target >= list.length) return null;
    setCursor(target);
    return list[target].label;
  }, []);

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => optionsRef.current.map((option) => option.label),
      index: () => cursorRef.current,
      step: (direction) => land(cursorRef.current + direction),
      page: (direction) => land(cursorRef.current + direction),
      goTo: (i) => land(i),
      // The number printed against a key, typed on the pad.
      goToCode: (code) => land(Number(code) - 1),
      enter: () => {
        const option = optionsRef.current[cursorRef.current];
        if (!option) return false;
        option.run();
        return true;
      },
    };
  }

  useEffect(() => (enabled ? registerPicker(api.current) : undefined), [enabled]);

  useEffect(() => {
    touchPicker();
  }, [cursor, options.length]);

  return cursor;
}