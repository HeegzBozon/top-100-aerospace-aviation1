// The face buttons, in the console diamond: Y above, X left, B right, A below.
// Y holds the cartridges — everything the device can load. X holds the sections
// of the surface you are on: the deck's slides, or the page's own modules.
// A confirms, B backs out.
const BOX = 76;
const SIZE = 28;
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
  "absolute flex items-center justify-center rounded-full text-[11px] font-bold transition-transform active:scale-90";

export default function FaceButtons({ onConfirm, onBack, onPrev, onNext }) {
  return (
    <div className="relative shrink-0" style={{ width: BOX, height: BOX }}>
      <button
        type="button"
        onClick={onNext}
        aria-label="Y — cartridges, everywhere on the device"
        className={base}
        style={{ ...face("#F7CE55", "#CF9B00", "#3A2A00"), top: 0, left: OFFSET }}
      >
        Y
      </button>

      <button
        type="button"
        onClick={onPrev}
        aria-label="X — sections on this surface"
        className={base}
        style={{ ...face("#5AA9E8", "#0067B8", "#F4FAFF"), top: OFFSET, left: 0 }}
      >
        X
      </button>

      <button
        type="button"
        onClick={onBack}
        aria-label="B — back"
        className={base}
        style={{ ...face("#EE5F4A", "#B2200F", "#FFF4F2"), top: OFFSET, right: 0 }}
      >
        B
      </button>

      <button
        type="button"
        onClick={onConfirm}
        aria-label="A — confirm"
        className={base}
        style={{ ...face("#5CC44E", "#107C10", "#F1FBEF"), bottom: 0, left: OFFSET }}
      >
        A
      </button>
    </div>
  );
}