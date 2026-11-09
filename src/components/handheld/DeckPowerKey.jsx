import { createPortal } from "react-dom";
import { ChevronsDown, ChevronsUp } from "lucide-react";

// The console's own key, floating on the picture.
//
// A handheld is a thing you put down. This is the one control that stays on the glass
// when the case does not: a round key in the corner of the picture that lowers the whole
// deck — the chin, the wheel or the radio's keypad, and the speaker with them — and lifts
// it back. It is read like the phone's own assistive key: always there, one press, and it
// never takes a surface's content away to do it.
//
// It is mounted on the document itself rather than inside the deck, because it has to
// stand on the picture whatever frame, drawer or sheet the deck is drawn inside.
export default function DeckPowerKey({ standing, onToggle }) {
  const Icon = standing ? ChevronsDown : ChevronsUp;
  return createPortal(
    <button
      type="button"
      onClick={onToggle}
      data-away={standing ? "false" : "true"}
      aria-pressed={!standing}
      aria-label={standing ? "Put the console away" : "Bring the console back"}
      title={standing ? "Put the console away" : "Bring the console back"}
      className="deck-power-key"
    >
      <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
    </button>,
    document.body,
  );
}