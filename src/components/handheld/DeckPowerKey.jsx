import { createPortal } from "react-dom";
import { ChevronsDown, ChevronsUp } from "lucide-react";

// The console's key, floating on the picture when the console is not.
//
// Putting the machine down is a press in the bar's View menu; picking it up again cannot
// be, because the bar goes with the case — on the glass it is cut into the chin, on the
// desk it stands at the head of the tube. So this round copper key appears at the moment
// the case does not, and is then the only control on the picture: one press, and the deck
// and its bar come back exactly as they were.
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