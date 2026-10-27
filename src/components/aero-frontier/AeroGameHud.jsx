import { useEffect } from "react";
import { AERO, HOURS_PER_DAY } from "./aeroConfig";
import { currentChapter, openQuests, questProgress } from "./aeroQuests";
import { itemLabel } from "./aeroItems";

// The instrument rail: the day, the light left in it, and the one thing the field
// is currently asking for. Everything else — the bag, the bench, the log — is a
// press away, so the strip stays a readout rather than a dashboard.
function Light({ hours }) {
  const left = Math.max(0, Math.min(HOURS_PER_DAY, hours ?? HOURS_PER_DAY));
  return (
    <span className="flex items-center gap-[2px]" aria-label={`${left} hours of light left`}>
      {Array.from({ length: HOURS_PER_DAY }).map((_, i) => (
        <span
          key={i}
          className="block h-[9px] w-[3px] rounded-[1px]"
          style={{ background: i < left ? AERO.amber : "rgba(242,232,213,0.16)" }}
        />
      ))}
    </span>
  );
}

function Toast({ item, onDone }) {
  useEffect(() => {
    const id = setTimeout(() => onDone(item.id), 2600);
    return () => clearTimeout(id);
  }, [item.id, onDone]);

  return (
    <p
      className="af-toast rounded-[6px] px-2 py-[5px] text-[10px] leading-tight text-editorial-cream"
      style={{ background: "rgba(14,28,38,0.9)", border: `1px solid ${AERO.line}` }}
    >
      {item.text}
    </p>
  );
}

export default function AeroGameHud({ doc, synced, ui, onToastDone }) {
  const quests = openQuests(doc);
  const quest = quests[0];
  const progress = quest ? questProgress(doc, quest) : null;

  return (
    <div className="relative z-30 shrink-0" style={{ background: "rgba(14,28,38,0.94)", borderBottom: `1px solid ${AERO.line}` }}>
      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
        <div className="flex items-center gap-2">
          <p className="af-readout text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: AERO.amber }}>
            Day {doc.day}
          </p>
          <Light hours={doc.hours} />
        </div>
        <div className="flex items-center gap-2">
          <p className="af-readout text-[7.5px] uppercase tracking-[0.16em]" style={{ color: AERO.muted }}>
            {currentChapter(doc)}
          </p>
          <span
            className="inline-block h-[5px] w-[5px] rounded-full"
            style={{ background: synced ? "#8fbf6a" : "#b87333" }}
            title={synced ? "Filed to your record" : "Kept on this device"}
          />
        </div>
      </div>

      {quest ? (
        <div className="flex items-baseline gap-2 px-2.5 pb-1.5">
          <p className="af-readout shrink-0 text-[8px] font-bold uppercase tracking-[0.16em]" style={{ color: AERO.cream }}>
            {quest.title}
          </p>
          <p className="af-readout ml-auto shrink-0 text-[8px]" style={{ color: progress?.done ? "#8fbf6a" : AERO.amber }}>
            {quest.goal.type === "collect"
              ? progress.lines.map(([key, have, need]) => `${itemLabel(key).split(" ")[0]} ${Math.floor(have)}/${need}`).join(" · ")
              : progress?.done
                ? "Report back"
                : `${Math.floor(progress?.have || 0)}/${progress?.need || 1}`}
          </p>
        </div>
      ) : null}

      {ui.toasts.length ? (
        <div className="pointer-events-none absolute left-2 top-full mt-1.5 flex flex-col gap-1">
          {ui.toasts.map((item) => (
            <Toast key={item.id} item={item} onDone={onToastDone} />
          ))}
        </div>
      ) : null}
    </div>
  );
}