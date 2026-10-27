import { useEffect, useRef } from "react";
import { drawPortrait } from "./aeroArt";
import { AERO } from "./aeroConfig";
import { CAST, YOU } from "./aeroScripts";

// The conversation, staged.
//
// Letterbox bars top and bottom so the field reads as a scene rather than a
// screen, a portrait of whoever is speaking, their name on a plate, and the line
// arriving a character at a time. Choices sit above the plate and are walked with
// the ring or the pad; A takes the one standing under the cursor.
function Portrait({ castKey }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    drawPortrait(ctx, castKey);
  }, [castKey]);

  return (
    <canvas
      ref={ref}
      width={64}
      height={64}
      className="shrink-0 rounded-[6px]"
      style={{ width: 58, height: 58, imageRendering: "pixelated", background: "rgba(242,232,213,0.08)" }}
      aria-hidden="true"
    />
  );
}

export default function AeroDialogue({ ui, inventory, onAct }) {
  const dialogue = ui.dialogue;
  if (!dialogue) return null;

  const beat = dialogue.beats[dialogue.index] || {};
  const speakerKey = beat.who || null;
  const speaker = speakerKey ? CAST[speakerKey] : null;
  const text = (beat.line || "").slice(0, Math.floor(dialogue.typed));
  const complete = dialogue.typed >= (beat.line || "").length;
  const choices = beat.choices || null;
  const name = speaker ? speaker.name : "Hollow Field";

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex flex-col justify-between">
      {/* Letterbox */}
      <div className="af-bars h-[7%] w-full bg-black/85" />
      <div className="af-bars h-[7%] w-full bg-black/85" />

      <div className="pointer-events-auto absolute inset-x-2 bottom-[8%] md:inset-x-8">
        {choices ? (
          <ul className="mb-2 space-y-1">
            {choices.map((option, index) => {
              const active = index === dialogue.cursor;
              const short = option.needs
                ? Object.entries(option.needs).some(([key, need]) => (inventory?.[key] || 0) < need)
                : false;
              return (
                <li key={`${option.label}-${index}`}>
                  <button
                    type="button"
                    onClick={() => onAct(index)}
                    className="flex w-full items-center gap-2 rounded-[6px] px-2 py-[6px] text-left font-body text-[11.5px] leading-tight"
                    style={{
                      background: active ? "rgba(232,178,74,0.22)" : "rgba(14,28,38,0.86)",
                      border: `1px solid ${active ? AERO.amber : AERO.line}`,
                      color: AERO.cream,
                      opacity: complete ? 1 : 0.5,
                    }}
                  >
                    <span className="w-[9px] shrink-0 text-[9px]" style={{ color: AERO.amber }}>
                      {active ? "▸" : ""}
                    </span>
                    <span className={short ? "line-through opacity-60" : ""}>{option.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        <div
          className="flex gap-3 rounded-[10px] p-2.5"
          style={{
            background: "rgba(14,28,38,0.94)",
            border: `1px solid ${AERO.line}`,
            boxShadow: "0 12px 30px -14px rgba(8,18,26,0.9)",
          }}
        >
          {speakerKey ? <Portrait castKey={speakerKey} /> : null}

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p
                className="af-readout text-[8px] font-bold uppercase tracking-[0.22em]"
                style={{ color: AERO.amber }}
              >
                {name}
              </p>
              {speaker?.role ? (
                <p className="shrink-0 text-[7.5px] uppercase tracking-[0.14em]" style={{ color: AERO.muted }}>
                  {speaker.role}
                </p>
              ) : null}
            </div>
            <p className="mt-1.5 font-body text-[12px] leading-[1.5] text-editorial-cream">
              {text}
              {!complete ? <span className="af-caret">▌</span> : null}
            </p>
            {complete && !choices ? (
              <button
                type="button"
                onClick={() => onAct()}
                className="af-readout mt-1.5 flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.18em]"
                style={{ color: AERO.amber }}
              >
                A <span className="af-caret">▸</span> on
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}