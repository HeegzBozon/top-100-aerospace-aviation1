import { ArrowDown, ArrowUp } from "lucide-react";
import { brand } from "@/components/nominate/NominateConfig";

// The ledger of the set being weighed. A set of four is measured from its two ends —
// the card advanced first and the card advanced last — so the two ends are what this
// panel prints, as slots: ordinal 01 for the first stake, ordinal 04 for the last, and
// the name the stake is held for. An open slot stays visible and says what it wants,
// the way The Eight prints its own vacancies; once made, a stake is never hidden and
// never blank, because a vacancy is what is asking the voter to act.
//
// It is drawn as an instrument strip rather than as a caption — the device's own
// readout band, moved into the panel: a recess in the institution's navy, a steel
// hairline, and type cut into it. Filled, a slot is lit and carries its anchor's name;
// open, it is a dashed outline in the same tone.
export default function AnchorLedger({ top, bottom }) {
  return (
    <div
      className="flex items-stretch gap-1.5 rounded-xl p-1"
      style={{
        background: `linear-gradient(180deg, ${brand.navy} 0%, #16304b 100%)`,
        boxShadow: `inset 0 0 0 1px ${brand.gold}40, inset 0 1px 0 rgba(255,255,255,0.10)`,
      }}
    >
      <StakeSlot ordinal="01" label="Advance first" icon={ArrowUp} accent={brand.gold} nominee={top} />
      <StakeSlot ordinal="04" label="Advance last" icon={ArrowDown} accent="#A8BDD2" nominee={bottom} />
    </div>
  );
}

function StakeSlot({ ordinal, label, icon: Icon, accent, nominee }) {
  const filled = !!nominee;

  return (
    <div
      className="min-w-0 flex-1 rounded-[9px] px-2 py-1"
      style={{
        background: filled ? "rgba(250,248,245,0.10)" : "transparent",
        border: filled ? `1px solid ${accent}80` : "1px dashed rgba(250,248,245,0.24)",
      }}
    >
      <span className="flex items-center gap-1.5">
        <Icon className="h-2.5 w-2.5 shrink-0" style={{ color: filled ? accent : "rgba(250,248,245,0.45)" }} />
        <span
          className="truncate text-[7.5px] font-bold uppercase tracking-[0.2em]"
          style={{ color: filled ? accent : "rgba(250,248,245,0.45)" }}
        >
          {label}
        </span>
      </span>

      <span className="mt-1 flex items-baseline gap-1.5">
        <span
          className="font-heading text-[12px] leading-none tabular-nums"
          style={{ color: filled ? "#FAF8F5" : "rgba(250,248,245,0.32)" }}
        >
          {ordinal}
        </span>
        <span
          className={`truncate text-[10.5px] leading-tight ${filled ? "font-semibold" : "italic"}`}
          style={{ color: filled ? "#FAF8F5" : "rgba(250,248,245,0.42)" }}
        >
          {nominee ? nominee.name || "Unnamed nominee" : "Awaiting your stake"}
        </span>
      </span>
    </div>
  );
}