import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Clock, ListOrdered, Award } from 'lucide-react';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import { brand } from '@/components/nominate/NominateConfig';
import GlassVoteWindow from '@/components/my-top100/GlassVoteWindow';
import { useNavHint } from '@/components/handheld/faceHint';

const getStage = () => document.querySelector('[data-handheld-screen]');

// The ballot, on the glass, read the way the title screen is read: the surfaces the
// vote tab reaches are drawn as keys and walked by the wheel, and A opens the one
// under the cursor. Three of them, in order — the ballot itself (your ranked list,
// which is what counts), the window it counts in, and the chamber. B takes back one
// level at a time: the open card, then the committee menu this panel sits in.
//
// While a card is open the ring declines its turns and the console scrolls the
// glass instead, so a card full of nominees is read by scrolling it, and the card's
// own controls stay the only things inside it that answer a press.
export default function GlassVoteSurface({ user, status, ballotNode, chamberNode, onExit }) {
  const [cursor, setCursor] = useState(0);
  const [openKey, setOpenKey] = useState(null);
  // The keys this menu is walked with, printed for the face on the case.
  const keyHint = useNavHint();

  const cards = [
    {
      key: 'ballot',
      label: 'Your ballot',
      hint: status.ranked >= status.minimum ? `${status.ranked}/100 ranked · counting` : 'Rank one name',
      icon: ListOrdered,
      node: ballotNode,
    },
    {
      key: 'window',
      label: 'The window',
      hint: status.open ? 'Open — closes soon' : status.closed ? 'Closed for this cycle' : 'Not open yet',
      icon: Clock,
      node: <GlassVoteWindow status={status} />,
    },
    {
      key: 'chamber',
      label: 'Anchor voting',
      hint: 'Weigh nominees head to head',
      icon: Award,
      node: chamberNode,
      // The one card that must fit the glass whole: it draws four candidates and wants
      // them all in view, twice two, with nothing to scroll.
      fill: true,
    },
  ];

  const cursorRef = useRef(0);
  cursorRef.current = cursor;
  const openRef = useRef(openKey);
  openRef.current = openKey;
  const cardsRef = useRef(cards);
  cardsRef.current = cards;
  const exitRef = useRef(onExit);
  exitRef.current = onExit;
  const nodeRefs = useRef([]);

  // The cards stop at their ends: a turn past the first or the last is declined, and
  // the console hands it to the glass, which is where reading on from an end belongs.
  const land = useCallback((target) => {
    const list = cardsRef.current;
    if (target < 0 || target >= list.length) return null;
    setCursor(target);
    return list[target].label;
  }, []);

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => cardsRef.current.map((card) => card.label),
      index: () => cursorRef.current,
      step: (direction) => (openRef.current ? null : land(cursorRef.current + direction)),
      page: (direction) => (openRef.current ? null : land(cursorRef.current + direction)),
      goTo: (i) => {
        const label = land(i);
        if (label && openRef.current) setOpenKey(cardsRef.current[i].key);
        return label;
      },
      enter: () => {
        // A card is open, so A belongs to the card and to nothing this menu would do.
        if (openRef.current) return true;
        const card = cardsRef.current[cursorRef.current];
        if (!card) return false;
        setOpenKey(card.key);
        return true;
      },
      back: () => {
        // One level at a time: the card, then the panel, which hands the glass back
        // to the committee menu.
        if (openRef.current) {
          setOpenKey(null);
          return true;
        }
        exitRef.current?.();
        return true;
      },
    };
  }

  useEffect(() => registerPicker(api.current), []);

  useEffect(() => {
    touchPicker();
  }, [cursor, openKey, cards.length]);

  // A card always opens at its own beginning, and the menu comes back with the card
  // you chose on the screen.
  useEffect(() => {
    getStage()?.scrollTo({ top: 0 });
  }, [cursor, openKey]);

  useEffect(() => {
    if (openKey) return;
    nodeRefs.current[cursor]?.scrollIntoView({ block: 'nearest' });
  }, [cursor, openKey]);

  const openCard = cards.find((card) => card.key === openKey) || null;

  // A filling card is measured the room left under this panel's own header, so it takes
  // exactly the rest of the glass and the candidates are never pushed off the bottom.
  // Measured before paint, so the cards are never drawn collapsed for a frame.
  const panelRef = useRef(null);
  const [fillHeight, setFillHeight] = useState(0);

  useLayoutEffect(() => {
    if (!openCard?.fill) {
      setFillHeight(0);
      return;
    }

    const measure = () => {
      const stage = getStage();
      const node = panelRef.current;
      if (!stage || !node) return;
      const stageBox = stage.getBoundingClientRect();
      const nodeBox = node.getBoundingClientRect();
      // Room from the top of this panel to the foot of the glass, read in the glass's
      // own scroll space, so a scroll never changes the answer.
      const room = stageBox.height - (nodeBox.top - stageBox.top) + stage.scrollTop;
      setFillHeight(Math.max(240, Math.min(stageBox.height, Math.round(room))));
    };

    measure();
    const observer = new ResizeObserver(measure);
    const stage = getStage();
    if (stage) observer.observe(stage);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [openKey, openCard?.fill]);

  const statusLine = status.open
    ? `Voting is open${status.endLabel ? ` · closes ${status.endLabel}` : ''} · ${
        status.ranked >= status.minimum
          ? `${status.ranked} ranked, counting as your ballot`
          : `add ${status.minimum === 1 ? 'a name' : `${status.minimum} names`} to open your ballot`
      }`
    : status.closed
      ? `Voting has closed for this cycle · your list of ${status.ranked} stays on your profile`
      : 'The window is not open yet · rank your list now, and it becomes your ballot when it opens';

  if (!openCard) {
    return (
      <div className="px-3 pb-6 pt-3.5">
        <div
          className="flex items-baseline justify-between gap-3 pb-2"
          style={{ borderBottom: `1px solid ${brand.navy}12` }}
        >
          <p className="text-[8.5px] font-bold uppercase tracking-[0.3em]" style={{ color: brand.gold }}>
            The ballot
          </p>
          <p
            className="text-[7.5px] font-bold uppercase tracking-[0.16em]"
            style={{ color: `${brand.navy}50` }}
          >
            {keyHint({ walk: 'Walk' })}
          </p>
        </div>

        <p className="mt-2.5 text-[11.5px] leading-relaxed" style={{ color: `${brand.navy}70` }}>
          {statusLine}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {cards.map((card, i) => {
            const Icon = card.icon;
            const active = i === cursor;
            return (
              <button
                key={card.key}
                type="button"
                ref={(node) => {
                  nodeRefs.current[i] = node;
                }}
                onClick={() => setOpenKey(card.key)}
                aria-current={active ? 'true' : undefined}
                className="relative flex min-h-[92px] flex-col justify-between rounded-[12px] p-2.5 text-left transition-[transform,box-shadow,border-color] duration-200 active:scale-[0.985]"
                style={{
                  background: active ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.62)',
                  border: `1px solid ${active ? 'rgb(201 168 124 / 0.85)' : `${brand.navy}12`}`,
                  boxShadow: active
                    ? '0 10px 22px rgba(7,17,31,0.22), inset 0 0 0 1px rgb(201 168 124 / 0.32)'
                    : '0 1px 2px rgba(7,17,31,0.05)',
                  transform: active ? 'translateY(-1px)' : undefined,
                }}
              >
                <span className="flex items-start justify-between gap-2">
                  <Icon
                    className="h-[15px] w-[15px] shrink-0"
                    style={{ color: active ? brand.gold : `${brand.navy}55` }}
                  />
                  <span
                    className="font-heading text-[9px] leading-none"
                    style={{ color: active ? brand.gold : `${brand.navy}30` }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </span>

                <span className="min-w-0">
                  <span
                    className="block font-heading text-[12.5px] font-semibold leading-tight"
                    style={{ color: brand.navy }}
                  >
                    {card.label}
                  </span>
                  <span className="mt-0.5 block text-[9.5px] leading-snug" style={{ color: `${brand.navy}55` }}>
                    {card.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // An open card goes straight to the glass, with no bar across its head: the way back
  // is the console's own, which reports every press to the picker this surface hands it
  // (the ring's menu and back zones), so a printed strip here would only cost the card a
  // row of its own height.
  return (
    <div className="pb-5">
      <div
        ref={panelRef}
        className={openCard.fill ? 'flex flex-col overflow-y-auto' : undefined}
        style={openCard.fill && fillHeight ? { height: fillHeight } : undefined}
      >
        {openCard.node}
      </div>
    </div>
  );
}