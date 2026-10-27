import { useEffect } from "react";

// Whatever is being typed into is carried up into the picture.
//
// A browser scrolls a field into view the moment it is focused — but that is a beat
// before the keys have shortened the picture, and by the time they have, the field
// can be sitting under them. Two passes after they land put it back, in the glass's
// own scroller rather than in the window behind the device.
const FIELD = "input, textarea, select, [contenteditable='true']";

export default function useFieldIntoView(open, height) {
  useEffect(() => {
    if (!open) return undefined;

    let timers = [];
    const watch = (field) => {
      timers.forEach(clearTimeout);
      const carry = () => {
        if (field?.isConnected) field.scrollIntoView({ block: "center", inline: "nearest" });
      };
      // Once when the picture has moved for the keys, once more when it settles.
      timers = [setTimeout(carry, 240), setTimeout(carry, 620)];
    };

    // The field that was already focused when the keys came up, and any field
    // focused while they are still up.
    const focused = document.activeElement;
    if (focused?.matches?.(FIELD)) watch(focused);

    const onFocus = (event) => {
      const field = event.target;
      if (field?.matches?.(FIELD)) watch(field);
    };

    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("focusin", onFocus);
      timers.forEach(clearTimeout);
    };
    // Re-run on a change of height too: a fill bar or a taller key row moves the
    // keys, and the field is carried back up over them.
  }, [open, height]);
}