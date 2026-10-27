import { useFaceKeysClaimed } from "./handheldKeys";

// The keypad, in the console diamond: Y above, X left, B right, A below.
// Four lettered keys, as a keypad's keys are lettered: Y prints its own letter and
// sends whatever you are holding out through the device's share drawer — the ring's
// bottom key makes the same press, so the share sits under either thumb.
// X lists the sections of that surface: the deck's slides, or the page's own
// modules. A confirms, B backs out.
//
// While a surface is holding the four keys — the chamber's candidates — Y is a vote
// like the rest of the keypad, and the share stays on the ring.
//
// These are the BlackBerry half of the device: matte rubberised keys with light
// legends, rolled over their own bevel when pressed, set beside the wheel. The keys
// are cut wide and stood well apart — a thumb is not a stylus, and the gap between
// two keys is what tells a hand which one it is on without looking down at it.
//
// The cluster is three keys across and three keys down: the caps sit on the outer
// rows and columns, the middle row and the middle column are the gaps. Every pair is
// therefore parted by the same measured gap and no two caps ever overlap, however
// large the keys are cut. The material comes from the finish, so the keypad recasts
// with the case.
const KEY_W = 32;
const KEY_H = 28;
const GAP = 5;
const BOX_W = KEY_W * 3 + GAP * 2;
const BOX_H = KEY_H * 3 + GAP * 2;
const OFFSET_X = (BOX_W - KEY_W) / 2;
const OFFSET_Y = (BOX_H - KEY_H) / 2;

const cap =
  "hh-pad-key absolute flex items-center justify-center rounded-[9px] text-[12px] font-bold transition-transform active:translate-y-[1px]";

export default function FaceButtons({ onConfirm, onBack, onSections, onShare }) {
  const legend = { color: "var(--hh-pad-ink)" };
  const keysClaimed = useFaceKeysClaimed();

  return (
    <div className="relative shrink-0" style={{ width: BOX_W, height: BOX_H }}>
      <button
        type="button"
        onClick={onShare}
        aria-label={keysClaimed ? "Y — vote on this set" : "Y — share this page"}
        className={cap}
        style={{ ...legend, width: KEY_W, height: KEY_H, top: 0, left: OFFSET_X }}
      >
        Y
      </button>

      <button
        type="button"
        onClick={onSections}
        aria-label="X — sections on this surface"
        className={cap}
        style={{ ...legend, width: KEY_W, height: KEY_H, top: OFFSET_Y, left: 0 }}
      >
        X
      </button>

      <button
        type="button"
        onClick={onBack}
        aria-label="B — back"
        className={cap}
        style={{ ...legend, width: KEY_W, height: KEY_H, top: OFFSET_Y, right: 0 }}
      >
        B
      </button>

      <button
        type="button"
        onClick={onConfirm}
        aria-label="A — confirm"
        className={cap}
        style={{ ...legend, width: KEY_W, height: KEY_H, bottom: 0, left: OFFSET_X }}
      >
        A
      </button>
    </div>
  );
}

// The cluster's measurements, so the flat keypad a load paints lands on exactly the
// footprint the live keys take over from (see HandheldChin).
export const FACE_KEYS = { BOX_W, BOX_H, KEY_W, KEY_H, OFFSET_X, OFFSET_Y };