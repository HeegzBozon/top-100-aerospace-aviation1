import { Pin } from "lucide-react";

// Pinned above every transmission: the TOP 100 Women 2025 edition.
export default function PinnedEdition({ onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col items-start gap-1 px-3 py-2.5 text-left"
      style={{ borderBottom: "1px solid rgb(var(--hh-metal-rgb) / 0.4)", background: "rgb(var(--hh-metal-rgb) / 0.14)" }}
    >
      <span className="flex items-center gap-1.5 text-[7px] font-bold uppercase tracking-[0.24em]" style={{ color: "var(--hh-metal-1)" }}>
        <Pin className="h-2.5 w-2.5" /> Pinned
      </span>
      <span className="text-[11.5px] font-semibold leading-tight" style={{ color: "var(--hh-lcd-bright)" }}>
        TOP 100 Women in Aerospace & Aviation 2025
      </span>
      <span className="text-[10px] leading-snug" style={{ color: "var(--hh-lcd-soft)" }}>
        The edition is out. Read the honorees.
      </span>
    </button>
  );
}