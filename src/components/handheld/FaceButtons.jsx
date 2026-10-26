import { Share } from "lucide-react";

// The face buttons, in the console diamond: Y above, X left, B right, A below.
// Y sends whatever you are holding out through the device's share drawer.
// X lists the sections of that surface: the deck's slides, or the page's own
// modules. A confirms, B backs out. The mouldings are ours — rose gold, navy,
// sand and copper — never another console's colours, and each cap carries the
// same glass as the wheel.
const BOX = 72;
const SIZE = 26;
const OFFSET = (BOX - SIZE) / 2;

const face = (from, to, ink) => ({
  width: SIZE,
  height: SIZE,
  color: ink,
  background: `linear-gradient(180deg, ${from}, ${to})`,
  boxShadow:
    "inset 0 1px 1px rgba(255,255,255,0.42), inset 0 -2px 5px rgba(7,17,31,0.30), 0 3px 8px rgba(7,17,31,0.32)",
});

const base =
  "absolute flex items-center justify-center overflow-hidden rounded-full text-[11px] font-bold transition-transform active:scale-90";

export default function FaceButtons({ onConfirm, onBack, onSections, onShare }) {
  return (
    <div className="relative shrink-0" style={{ width: BOX, height: BOX }}>
      <button
        type="button"
        onClick={onShare}
        aria-label="Y — share this page"
        className={base}
        style={{ ...face("#E6CDA4", "#B8935F", "#1E3A5A"), top: 0, left: OFFSET }}
      >
        <span aria-hidden="true" className="hh-cap" />
        <Share className="relative h-[14px] w-[14px]" strokeWidth={2.4} />
      </button>

      <button
        type="button"
        onClick={onSections}
        aria-label="X — sections on this surface"
        className={base}
        style={{ ...face("#2E5478", "#16304B", "#FAF8F5"), top: OFFSET, left: 0 }}
      >
        <span aria-hidden="true" className="hh-cap" />
        <span className="relative">X</span>
      </button>

      <button
        type="button"
        onClick={onBack}
        aria-label="B — back"
        className={base}
        style={{ ...face("#DCCBAE", "#B9A582", "#1E3A5A"), top: OFFSET, right: 0 }}
      >
        <span aria-hidden="true" className="hh-cap" />
        <span className="relative">B</span>
      </button>

      <button
        type="button"
        onClick={onConfirm}
        aria-label="A — confirm"
        className={base}
        style={{ ...face("#D79355", "#A5642C", "#FAF8F5"), bottom: 0, left: OFFSET }}
      >
        <span aria-hidden="true" className="hh-cap" />
        <span className="relative">A</span>
      </button>
    </div>
  );
}