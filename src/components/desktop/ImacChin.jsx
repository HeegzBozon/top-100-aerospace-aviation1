import { Power } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ImacColourRack from "./ImacColourRack";
import ImacMusicControl from "./ImacMusicControl";

// The machine's chin: the slot-loading tray, the printed lockup, the colour the resin
// is moulded in, and the power key. Every control on it is real — the key takes the
// desk to the platform's front door, and a colour re-casts the whole machine, because
// the resin is the housing.
export default function ImacChin({
  finish,
  pack,
  packs,
  options,
  finishKey,
  onChoose,
  onChoosePack,
}) {
  const navigate = useNavigate();

  return (
    <div className="imac-chin imac-band gap-6 px-7">
      {/* The left speaker of the pair is a control: the machine's own record. */}
      <ImacMusicControl />
      <span className="imac-screw h-2.5 w-2.5 flex-none rounded-full" aria-hidden="true" />
      <span className="imac-tray flex-none" aria-hidden="true" />

      <div className="flex items-center gap-3">
        <span
          className="h-[16px] w-px flex-none"
          style={{
            background: "linear-gradient(180deg, transparent, var(--imac-rule), transparent)",
          }}
          aria-hidden="true"
        />
        <p
          className="text-[8px] font-bold uppercase tracking-[0.34em]"
          style={{ color: "var(--imac-ink)" }}
        >
          TOP 100 Aerospace &amp; Aviation
        </p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span
          className="text-[7px] font-bold uppercase tracking-[0.28em]"
          style={{ color: "var(--imac-ink-soft)" }}
        >
          {finish.label}
        </span>
        <ImacColourRack
          pack={pack}
          packs={packs}
          options={options}
          finishKey={finishKey}
          onChoose={onChoose}
          onChoosePack={onChoosePack}
        />
      </div>

      <span
        className="h-7 w-px flex-none"
        style={{ background: "var(--imac-ink-soft)", opacity: 0.4 }}
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={() => navigate("/")}
        className="imac-power flex flex-none items-center justify-center"
        aria-label="Front door"
        title="Front door"
      >
        <Power className="h-[15px] w-[15px]" />
      </button>
      <span className="imac-led flex-none" aria-hidden="true" />
      <span className="imac-screw h-2.5 w-2.5 flex-none rounded-full" aria-hidden="true" />
      <span className="imac-speaker" aria-hidden="true" />
    </div>
  );
}