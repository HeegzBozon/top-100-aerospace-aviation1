import { useEffect, useRef } from 'react';
import { registerPicker } from '@/components/handheld/handheldPicker';
import { registerFaceKeys } from '@/components/handheld/handheldKeys';
import { isAimCabinet } from './arcadeConfig';

// THE CABINET ON THE HARDWARE
//
// The machines were written for a desk: they listen on the window for arrow keys and Space.
// The console is asked for exactly that — the ring becomes the joystick, the centre and the
// A key fire, and B steps back out to the hall — so nothing reaches into a game and every
// cabinet in the house plays the same way.
const KEY_FOR = { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: ' ' };
const PRINTS = { up: '▲', left: '◀', right: '▶', down: '◉' };

const press = (type, key) => window.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true }));
const tap = (key = ' ') => {
  press('keydown', key);
  setTimeout(() => press('keyup', key), 90);
};

export default function useArcadeControls(cabinet, onExit) {
  const exit = useRef(onExit);
  exit.current = onExit;
  const aim = isAimCabinet(cabinet);

  useEffect(() => {
    if (!cabinet) return undefined;

    // The four face keys: A fires, B leaves the machine. X and Y are left to the console.
    const offKeys = registerFaceKeys((name) => {
      if (name === 'B') { exit.current?.(); return true; }
      if (name === 'A') { tap(); return true; }
      return false;
    });

    // The ring. A steered cabinet takes the four zones as directions; a cabinet that is
    // aimed at with a finger keeps them silent, because there is nothing to steer.
    const offWheel = registerPicker({
      labels: () => [],
      index: () => 0,
      goTo: () => null,
      step: () => true,
      page: () => null,
      enter: () => { tap(); return true; },
      back: () => { exit.current?.(); return true; },
      ...(aim ? {} : {
        steer: {
          prints: PRINTS,
          hold: (dir, on) => press(on ? 'keydown' : 'keyup', KEY_FOR[dir] || ' '),
        },
      }),
    });

    return () => { offWheel?.(); offKeys?.(); };
  }, [cabinet, aim]);
}