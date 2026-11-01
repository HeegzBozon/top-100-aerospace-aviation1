import { useEffect, useRef } from 'react';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';

// A controlled card deck for the wheel, arrow keys and a gamepad: turn = next/previous card,
// centre / A / Enter = the card's action, back / B / Escape = leave. Every input is a user
// interaction, reported so autoplay can stand down.
export default function useAtlasDeck({ count, index, setIndex, labels, onEnter, onBack, onUser }) {
  const live = useRef({});
  live.current = { count, index, setIndex, labels, onEnter, onBack, onUser };

  useEffect(() => {
    const land = (i) => {
      const L = live.current;
      if (i < 0 || i >= L.count) return null;
      L.onUser(); L.setIndex(i);
      return L.labels[i];
    };
    const step = (d) => land(live.current.index + d);
    const enter = () => { live.current.onUser(); return live.current.onEnter(); };
    const back = () => { live.current.onBack(); return true; };
    const off = registerPicker({
      labels: () => live.current.labels, index: () => live.current.index,
      step, goTo: land, page: () => null, enter, back,
    });
    const onKey = (e) => {
      if (e.target?.closest?.('input, textarea, select, [contenteditable]')) return;
      const k = e.key;
      if (['ArrowDown', 'ArrowRight', 's', 'd'].includes(k)) step(1);
      else if (['ArrowUp', 'ArrowLeft', 'w', 'a'].includes(k)) step(-1);
      else if (k === 'Enter' || k === ' ') enter();
      else if (k === 'Escape') back();
      else return;
      e.preventDefault(); e.stopImmediatePropagation();
    };
    window.addEventListener('keydown', onKey, true);
    let raf; const prev = {};
    const loop = () => {
      const pad = [...(navigator.getGamepads?.() || [])].find(Boolean);
      if (pad) {
        const b = (i) => !!pad.buttons[i]?.pressed;
        const x = pad.axes[0] || 0, y = pad.axes[1] || 0;
        const now = { n: b(13) || b(15) || y > 0.5 || x > 0.5, p: b(12) || b(14) || y < -0.5 || x < -0.5, a: b(0), b: b(1) };
        if (now.n && !prev.n) step(1);
        if (now.p && !prev.p) step(-1);
        if (now.a && !prev.a) enter();
        if (now.b && !prev.b) back();
        Object.assign(prev, now);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { off(); cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey, true); };
  }, []);

  useEffect(() => { touchPicker(); }, [index, count]);
}