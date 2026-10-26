import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { BRAND } from "./boardConfig";

// One card on the Board: what the section is, the number that stands behind it,
// and the way in. The card is the map — the surface it opens holds the work.
export default function BoardCard({ card, stat }) {
  return (
    <Link
      to={card.to}
      className="group block rounded-[10px] p-3 transition-shadow hover:shadow-md"
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(30,58,90,0.12)",
        boxShadow: "0 1px 2px rgba(30,58,90,0.05)",
      }}
    >
      <span
        className="block text-[11px] font-bold uppercase tracking-[0.14em]"
        style={{ color: BRAND.navy }}
      >
        {card.title}
      </span>

      <span className="mt-1 block text-[12px] leading-snug" style={{ color: "rgba(26,26,26,0.72)" }}>
        {card.blurb}
      </span>

      {stat ? (
        <span
          className="mt-2 inline-flex items-center rounded-full px-2 py-[3px] text-[8px] font-bold uppercase tracking-[0.16em]"
          style={{
            background: "rgba(201,168,124,0.18)",
            border: "1px solid rgba(184,115,51,0.28)",
            color: BRAND.copper,
          }}
        >
          {stat}
        </span>
      ) : null}

      <span
        className="mt-2.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.18em]"
        style={{ color: BRAND.copper }}
      >
        {card.action}
        <ArrowRight className="h-[11px] w-[11px] transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}