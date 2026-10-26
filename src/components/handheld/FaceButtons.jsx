import { Share } from "lucide-react";

// The keypad, in the console diamond: Y above, X left, B right, A below.
// Y sends whatever you are holding out through the device's share drawer.
// X lists the sections of that surface: the deck's slides, or the page's own
// modules. A confirms, B backs out.
//
// These are the BlackBerry half of the device: matte rubberised keys with light
// legends, rolled over their own bevel when pressed, set in a tight cluster beside
// the wheel. The material comes from the finish, so the keypad recasts with the case.
const BOX = 72;
const KEY_W = 30;
const KEY_H = 24;
const OFFSET_X = (BOX - KEY_W) / 2;
const OFFSET_Y = (BOX - KEY_H) / 2;

const cap =
  "hh-pad-key absolute flex items-center justify-center rounded-[7px] text-[11px] font-bold transition-transform active:translate-y-[1px]";

export default function FaceButtons({ onConfirm, onBack, onSections, onShare }) {
  const legend = { color: "var(--hh-pad-ink)" };

  return (
    <div className="relative shrink-0" style={{ width: BOX, height: BOX }}>
      <button
        type="button"
        onClick={onShare}
        aria-label="Y — share this page"
        className={cap}
        style={{ ...legend, width: KEY_W, height: KEY_H, top: 0, left: OFFSET_X }}
      >
        <Share className="h-[13px] w-[13px]" strokeWidth={2.4} />
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