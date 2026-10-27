import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import PublicationIndex from './PublicationIndex';
import PublicationSectionHead from './PublicationSectionHead';

const GLASS = '(max-width: 767px)';
const stage = () => document.querySelector('[data-handheld-screen]') || document.querySelector('.hh-stage');

const useGlass = () => {
  const [glass, setGlass] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(GLASS).matches,
  );
  useEffect(() => {
    const query = window.matchMedia(GLASS);
    const onChange = (event) => setGlass(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return glass;
};

// The publication as a console. A publication is read in sections, so on the glass it
// opens on its own contents — the masthead, the edition's line, and the sections as keys —
// and the ring does the walking: rotation moves the cursor and stops at the ends of the
// list (docs/handheld-cursor-rules.md), A opens the section the cursor is standing on, and
// back returns to the contents. Once a section is open the ring scrolls it instead, so a
// turn reads on down the page; back and forward on the ring turn to the neighbouring
// section, which is how the edition is paged through.
//
// On a desk nothing changes: the same sections in one column, top to bottom.
export default function PublicationConsole({ slides = [], discovered = 0, total = 0, signedIn, onSignIn }) {
  const glass = useGlass();
  const [openKey, setOpenKey] = useState(null);
  const [cursor, setCursor] = useState(0);

  const openRef = useRef(openKey);
  openRef.current = openKey;
  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;
  const slidesRef = useRef(slides);
  slidesRef.current = slides;

  // The contents, numbered by position and read in the order the edition runs them.
  const items = useMemo(
    () =>
      slides.map((slide, i) => ({
        key: slide.key,
        index: String(i + 1).padStart(2, '0'),
        name: slide.label.replace(/^\d+\s*/, ''),
      })),
    [slides],
  );

  const open = useMemo(() => slides.find((slide) => slide.key === openKey) || null, [slides, openKey]);
  const openIndex = open ? items.find((item) => item.key === open.key)?.index : null;

  const land = useCallback((target) => {
    const list = slidesRef.current;
    if (!list.length || target < 0 || target >= list.length) return null;
    setCursor(target);
    return list[target].label;
  }, []);

  // A section opens at its own beginning, and the contents come back where you left them.
  useEffect(() => {
    stage()?.scrollTo({ top: 0 });
  }, [openKey]);

  // The console's handle on the publication: the contents are the picker, and an open
  // section is read by the ring rather than walked by it.
  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => slidesRef.current.map((slide) => slide.label),
      index: () => cursorRef.current,
      step: (direction) => (openRef.current ? null : land(cursorRef.current + direction)),
      page: (direction) => {
        const target = cursorRef.current + direction;
        const label = land(target);
        if (label && openRef.current) setOpenKey(slidesRef.current[target].key);
        return label;
      },
      goTo: (i) => {
        const label = land(i);
        if (label && openRef.current) setOpenKey(slidesRef.current[i].key);
        return label;
      },
      enter: () => {
        // An open section owns the confirm key: there is nothing under the cursor to open.
        if (openRef.current) return true;
        const slide = slidesRef.current[cursorRef.current];
        if (!slide) return false;
        setOpenKey(slide.key);
        return true;
      },
      back: () => {
        if (!openRef.current) return false;
        setOpenKey(null);
        return true;
      },
    };
  }

  useEffect(() => registerPicker(api.current), []);

  useEffect(() => {
    touchPicker();
  }, [cursor, openKey, slides.length]);

  // A deep link into a section opens it — the anchor the tables of contents use, or a
  // query naming a section outright.
  useEffect(() => {
    if (!glass || !slides.length) return;
    const search = new URLSearchParams(window.location.search);
    const wanted = decodeURIComponent(window.location.hash.replace('#', '')) || search.get('section');
    if (!wanted) return;
    const target = slidesRef.current.findIndex((slide) => slide.id === wanted || slide.key === wanted);
    if (target < 0) return;
    setCursor(target);
    setOpenKey(slidesRef.current[target].key);
  }, [glass, slides.length]);

  // A link to another section — the contents list, a cross-reference — opens that section
  // rather than hunting for a scroll target that lives in a section we are not standing in.
  const onAnchorClick = useCallback((event) => {
    const link = event.target?.closest?.('a[href^="#"]');
    if (!link) return;
    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    const target = slidesRef.current.findIndex((slide) => slide.id === id || slide.key === id);
    if (target < 0) return;
    event.preventDefault();
    setCursor(target);
    setOpenKey(slidesRef.current[target].key);
  }, []);

  // On a desk the edition is one column, exactly as the sections were written.
  if (!glass) {
    return <>{slides.map((slide) => slide.content)}</>;
  }

  if (!open) {
    return (
      <PublicationIndex
        items={items}
        cursorKey={items[cursor]?.key || null}
        onOpen={setOpenKey}
        discovered={discovered}
        total={total}
        signedIn={signedIn}
        onSignIn={onSignIn}
      />
    );
  }

  return (
    <div onClickCapture={onAnchorClick}>
      <div className="px-4 pt-4">
        <PublicationSectionHead index={openIndex} name={items.find((i) => i.key === open.key)?.name} onBack={() => setOpenKey(null)} />
      </div>
      {open.content}
    </div>
  );
}