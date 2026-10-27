import { useEffect, useRef, useState } from 'react';

// Which module of the course the reader is standing in. The picture scrolls
// inside the console's own window on a phone and the window itself on a desk,
// so the hook finds whichever one is actually moving.
export default function useActiveStep(count) {
  const refs = useRef([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const first = refs.current[0];
    if (!first) return undefined;

    const scroller = first.closest('.hh-stage');
    const target = scroller || window;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const edge = (scroller ? scroller.getBoundingClientRect().top : 0) + 140;
      let next = 0;
      refs.current.forEach((node, i) => {
        if (node && node.getBoundingClientRect().top <= edge) next = i;
      });
      setActive(next);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    target.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      target.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [count]);

  const goTo = (index) => {
    const node = refs.current[index];
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return { refs, active, goTo };
}