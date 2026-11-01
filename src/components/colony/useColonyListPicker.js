import { useEffect, useRef, useState } from 'react';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';

// A Colony list (directory, who's online) walked by the click wheel or an Xbox pad:
// turn / d-pad / stick moves the cursor, centre / A picks, back / B closes.
export default function useColonyListPicker({ items, onPick, onClose }) {
  const [cursor, setCursor] = useState(0);
  const live = useRef({});
  live.current = { items, onPick, onClose, cursor };

  useEffect(() => {
    const land = (i) => {
      const list = live.current.items;
      if (i < 0 || i >= list.length) return null;
      setCursor(i);
      document.getElementById(`colony-list-${list[i].key}`)?.scrollIntoView({ block: 'nearest' });
      return list[i].label;
    };
    const pick = () => {
      const it = live.current.items[live.current.cursor];
      if (!it || it.disabled) return false;
      live.current.onPick(it);
      return true;
    };
    const off = registerPicker({
      labels: () => live.current.items.map((i) => i.label),
      index: () => live.current.cursor,
      step: (d) => land(live.current.cursor + d),
      goTo: land,
      page: () => null,
      enter: pick,
      back: () => { live.current.onClose(); return true; },
    });

    let raf;
    const prev = {};
    const loop = () => {
      const pad = [...(navigator.getGamepads?.() || [])].find(Boolean);
      if (pad) {
        const b = (i) => !!pad.buttons[i]?.pressed;
        const y = pad.axes[1] || 0;
        const now = { up: b(12) || y < -0.5, down: b(13) || y > 0.5, a: b(0), b: b(1) };
        if (now.up && !prev.up) land(live.current.cursor - 1);
        if (now.down && !prev.down) land(live.current.cursor + 1);
        if (now.a && !prev.a) pick();
        if (now.b && !prev.b) live.current.onClose();
        Object.assign(prev, now);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { off(); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => { touchPicker(); }, [cursor, items.length]);

  return items[cursor]?.key;
}