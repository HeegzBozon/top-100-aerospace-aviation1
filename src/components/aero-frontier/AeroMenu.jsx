import { useEffect, useRef } from "react";
import { drawItemIcon } from "./aeroArt";
import { AERO } from "./aeroConfig";
import { canBuild, FITS, ITEMS, ITEM_KEYS, needsList, RECIPES, TOTAL_FITS } from "./aeroItems";
import { filedQuests, activeQuests, questProgress } from "./aeroQuests";
import { CAST } from "./aeroScripts";

// The bag, the bench, the work and the diary.
//
// Four tabs, one frame: what you are carrying, what it can become, what the field
// is asking of you, and everything that has happened so far. The ring walks the
// list, the left and right keys turn the tabs, A takes what is standing under the
// cursor — and on a desk all of it is clickable too.
const TABS = [
  { key: "bag", label: "Bag" },
  { key: "bench", label: "Bench" },
  { key: "quests", label: "Quests" },
  { key: "journal", label: "Log" },
];

function Glyph({ itemKey, size = 26 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 12, 12);
    drawItemIcon(ctx, itemKey, 1, 1, 1);
  }, [itemKey]);

  return (
    <canvas
      ref={ref}
      width={12}
      height={12}
      style={{ width: size, height: size, imageRendering: "pixelated" }}
      aria-hidden="true"
    />
  );
}

const row = (active) => ({
  background: active ? "rgba(232,178,74,0.16)" : "transparent",
  border: `1px solid ${active ? AERO.amber : "transparent"}`,
});

function Bag({ doc, cursor, onPick }) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {ITEM_KEYS.map((key, index) => {
        const count = doc.inventory?.[key] || 0;
        const active = index === cursor;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onPick(index)}
            className="flex flex-col items-center gap-1 rounded-[6px] px-1 py-1.5"
            style={{ ...row(active), opacity: count ? 1 : 0.35 }}
          >
            <Glyph itemKey={key} />
            <span className="text-center text-[8.5px] leading-tight text-editorial-cream">
              {ITEMS[key].label}
            </span>
            <span className="af-readout text-[9px]" style={{ color: count ? AERO.amber : AERO.muted }}>
              ×{count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Bench({ doc, cursor, onPick, atBench }) {
  return (
    <ul className="space-y-1.5">
      {RECIPES.map((recipe, index) => {
        const ready = canBuild(recipe, doc.inventory || {});
        const active = index === cursor;
        return (
          <li key={recipe.key}>
            <button
              type="button"
              onClick={() => onPick(index, recipe.key)}
              className="w-full rounded-[6px] px-2 py-1.5 text-left"
              style={row(active)}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[11px] text-editorial-cream">{recipe.label}</p>
                <p className="af-readout shrink-0 text-[8px]" style={{ color: ready ? "#8fbf6a" : AERO.muted }}>
                  {ready ? "Ready" : "Short"} · {recipe.hours}h
                </p>
              </div>
              <ul className="mt-1 flex flex-wrap gap-x-2 gap-y-[2px]">
                {needsList(recipe, doc.inventory || {}).map(({ key, need, have, met }) => (
                  <li key={key} className="af-readout text-[8.5px]" style={{ color: met ? "#8fbf6a" : AERO.muted }}>
                    {ITEMS[key].label.split(" ")[0]} {Math.min(have, need)}/{need}
                  </li>
                ))}
              </ul>
              {active ? (
                <p className="mt-1 text-[9px] leading-snug" style={{ color: AERO.muted }}>
                  {recipe.blurb}
                </p>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Quests({ doc, cursor }) {
  const active = activeQuests(doc);
  const filed = filedQuests(doc);
  const rows = [];

  active.forEach((quest, index) => {
    const progress = questProgress(doc, quest);
    const activeRow = index === cursor;
    rows.push(
      <li key={quest.key} className="rounded-[6px] px-2 py-1.5" style={row(activeRow)}>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[11px] text-editorial-cream">{quest.title}</p>
          <p className="af-readout shrink-0 text-[8px]" style={{ color: progress.done ? "#8fbf6a" : AERO.amber }}>
            {progress.done ? "Report back" : `${Math.floor(progress.have)}/${progress.need}`}
          </p>
        </div>
        <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em]" style={{ color: AERO.muted }}>
          {quest.chapter} · {CAST[quest.giver]?.name || "The field"}
        </p>
        <p className="mt-1 text-[9.5px] leading-snug" style={{ color: AERO.muted }}>
          {quest.brief}
        </p>
        <ul className="mt-1 space-y-[2px]">
          {progress.lines.map(([label, have, need]) => (
            <li key={label} className="af-readout text-[8.5px]" style={{ color: have >= need ? "#8fbf6a" : AERO.cream }}>
              • {ITEMS[label]?.label || label} {Math.floor(have)}/{need}
            </li>
          ))}
        </ul>
      </li>,
    );
  });

  filed.forEach((quest) => {
    rows.push(
      <li key={quest.key} className="px-2 py-1">
        <p className="af-readout text-[9px]" style={{ color: AERO.muted }}>
          ✓ {quest.title}
        </p>
        <p className="text-[9px] leading-snug" style={{ color: AERO.muted, opacity: 0.75 }}>
          {quest.line}
        </p>
      </li>,
    );
  });

  if (!rows.length) {
    return (
      <p className="px-2 py-6 text-center text-[10.5px]" style={{ color: AERO.muted }}>
        Nothing on the board yet. Talk to somebody.
      </p>
    );
  }

  return <ul className="space-y-1">{rows}</ul>;
}

function Journal({ doc }) {
  const lines = (doc.log || []).slice(0, 12);
  if (!lines.length) {
    return (
      <p className="px-2 py-6 text-center text-[10.5px]" style={{ color: AERO.muted }}>
        The page is open and blank. It writes itself as the field is worked.
      </p>
    );
  }
  return (
    <ul className="space-y-1.5">
      {lines.map((line, index) => (
        <li key={`${line.at}-${index}`} className="rounded-[6px] px-2 py-1.5" style={{ background: "rgba(242,232,213,0.04)" }}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="af-readout text-[8px] font-bold uppercase tracking-[0.16em]" style={{ color: AERO.amber }}>
              Day {line.day}
            </span>
            <span className="af-readout text-[7.5px]" style={{ color: AERO.muted }}>
              {new Date(line.at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] leading-snug text-editorial-cream">{line.text}</p>
        </li>
      ))}
    </ul>
  );
}

export default function AeroMenu({ doc, ui, onClose, onTab, onPick, onCursor, atBench }) {
  const menu = ui.menu;
  if (!menu) return null;
  const fitted = (doc.installed || []).length;

  return (
    <div className="absolute inset-0 z-[45] flex flex-col" style={{ background: "rgba(8,16,24,0.95)" }}>
      <div className="flex items-center justify-between gap-2 px-2.5 py-2" style={{ borderBottom: `1px solid ${AERO.line}` }}>
        <p className="af-readout text-[8px] font-bold uppercase tracking-[0.24em]" style={{ color: AERO.amber }}>
          Field kit
        </p>
        <div className="flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTab(tab.key)}
              className="af-readout rounded-[5px] px-2 py-[3px] text-[8px] font-bold uppercase tracking-[0.14em]"
              style={{
                background: menu.tab === tab.key ? AERO.amber : "transparent",
                color: menu.tab === tab.key ? AERO.night : AERO.muted,
                border: `1px solid ${menu.tab === tab.key ? AERO.amber : AERO.line}`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {menu.tab === "bag" ? <Bag doc={doc} cursor={menu.cursor} onPick={onPick} /> : null}
        {menu.tab === "bench" ? (
          <>
            <Bench doc={doc} cursor={menu.cursor} onPick={onPick} atBench={atBench} />
            <p className="mt-2 px-1 text-[9px] leading-snug" style={{ color: AERO.muted }}>
              Airframe: {fitted} of {TOTAL_FITS} parts fitted. {atBench ? "" : "Walk to the bench to build."}
            </p>
          </>
        ) : null}
        {menu.tab === "quests" ? <Quests doc={doc} cursor={menu.cursor} /> : null}
        {menu.tab === "journal" ? <Journal doc={doc} /> : null}
      </div>

      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5" style={{ borderTop: `1px solid ${AERO.line}` }}>
        <p className="text-[9px] leading-snug" style={{ color: menu.note ? AERO.amber : AERO.muted }}>
          {menu.note || (menu.tab === "bench" ? "A builds · ◀ ▶ changes tab" : "◀ ▶ changes tab · B closes")}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="af-readout shrink-0 rounded-[5px] px-2 py-[3px] text-[8px] font-bold uppercase tracking-[0.14em]"
          style={{ border: `1px solid ${AERO.line}`, color: AERO.muted }}
        >
          B close
        </button>
      </div>
    </div>
  );
}