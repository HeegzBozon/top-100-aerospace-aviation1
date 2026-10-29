import { useEffect, useRef } from 'react';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';

// The click wheel, driving the book.
//
// The ring turns the pages — one detent, one spread — the centre plays and pauses
// the record, back closes the contents and otherwise leaves the surface, and the
// contents walk straight to a page. The console names whatever the ring landed on,
// so the hand and the glass always agree.
//
// Everything is read through a ref: the console asks the picker as the surface
// stands now, not as it stood when it was registered, so a turn always moves the
// page the reader is actually looking at.
export default function useProfileWheel({ labels, index, turn, jump, enter, back }) {
  const live = useRef({});
  live.current = { labels, index, turn, jump, enter, back };

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => live.current.labels(),
      index: () => live.current.index(),
      // A turn the book cannot take — the cover, the last spread — is declined, so
      // the console bumps instead of the page silently sitting still.
      step: (direction) => live.current.turn(direction),
      page: (direction) => live.current.turn(direction),
      goTo: (target) => live.current.jump(target),
      enter: () => live.current.enter(),
      back: () => live.current.back(),
    };
  }

  useEffect(() => registerPicker(api.current), []);

  useEffect(() => {
    touchPicker();
  });
}