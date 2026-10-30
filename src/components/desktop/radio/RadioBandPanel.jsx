import { X } from "lucide-react";
import ImacColourRack from "../ImacColourRack";

// The band key opens the moulding: which pack the desk is dressed from, and the colours
// in it. It is the same rack the chin used to print across its face, now set on the
// plate the way a transceiver keeps its band settings — one key, one drawer.
export default function RadioBandPanel({ finish, pack, packs, options, finishKey, onChoose, onChoosePack, onClose }) {
  return (
    <div role="dialog" aria-label="Band — the machine's moulding" className="rd-panel rd-panel--band">
      <div className="rd-panel-head">
        <div>
          <p className="rd-panel-kicker">BAND · Moulding</p>
          <p className="rd-panel-title">{finish.label}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close the band" className="rd-panel-x">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="rd-band-body">
        <ImacColourRack
          pack={pack}
          packs={packs}
          options={options}
          finishKey={finishKey}
          onChoose={onChoose}
          onChoosePack={onChoosePack}
        />
      </div>

      <p className="rd-band-note">
        The colour the case is moulded in. Every rule, key and lamp on the machine recasts
        with it.
      </p>
    </div>
  );
}