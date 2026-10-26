import BoardCard from "./BoardCard";
import { BRAND } from "./boardConfig";

// One column of the Board: a numbered direction, what it covers, and the cards
// that lead into it. On a phone the column is a full glass of its own and
// scrolls inside itself — the wheel's way down; the ring's way across.
export default function BoardColumn({ column, stats, live }) {
  const Icon = column.icon;

  return (
    <section
      data-hh-module={column.label}
      data-hh-scroll
      className="flex w-[86%] shrink-0 snap-start flex-col overflow-y-auto scrollbar-hide pb-2 md:w-auto md:shrink md:overflow-visible"
    >
      <header
        className="mb-2.5 shrink-0 border-t-2 pt-2"
        style={{ borderColor: BRAND.copper }}
      >
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: BRAND.copper }} />
          <span
            className="text-[8px] font-bold uppercase tracking-[0.3em]"
            style={{ color: "rgba(30,58,90,0.45)" }}
          >
            {column.index}
          </span>
          <h2
            className="min-w-0 flex-1 truncate text-[12px] font-bold uppercase tracking-[0.16em]"
            style={{ color: BRAND.navy }}
          >
            {column.label}
          </h2>
        </div>
        <p className="mt-1 text-[10px] leading-snug" style={{ color: "rgba(26,26,26,0.6)" }}>
          {column.tagline}
        </p>
        {live ? (
          <p
            className="mt-2 text-[9px] font-bold uppercase tracking-[0.16em]"
            style={{ color: BRAND.copper }}
          >
            {live}
          </p>
        ) : null}
      </header>

      <div className="space-y-2.5">
        {column.cards.map((card) => (
          <BoardCard key={card.key} card={card} stat={stats[card.stat]} />
        ))}
      </div>
    </section>
  );
}