import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const DIRECTIONS = [
  { key: "up", Icon: ChevronUp, className: "left-1/2 -translate-x-1/2 top-0" },
  { key: "down", Icon: ChevronDown, className: "left-1/2 -translate-x-1/2 bottom-0" },
  { key: "left", Icon: ChevronLeft, className: "top-1/2 -translate-y-1/2 left-0" },
  { key: "right", Icon: ChevronRight, className: "top-1/2 -translate-y-1/2 right-0" },
];

// The directional pad: cycle the rail, open the navigator, return to the top of
// the screen. Touch-first, with a pressed-in state that reads as hardware.
export default function HandheldDpad({ onUp, onDown, onLeft, onRight, labels = {} }) {
  const handlers = { up: onUp, down: onDown, left: onLeft, right: onRight };

  return (
    <div
      className="relative h-[70px] w-[70px] shrink-0 rounded-[22px]"
      style={{
        background: "linear-gradient(180deg, #F7F3EB 0%, #E2DACB 60%, #CFC5B2 100%)",
        boxShadow:
          "inset 0 2px 3px rgba(255,255,255,0.95), inset 0 -3px 7px rgba(30,58,90,0.28), 0 5px 12px rgba(0,0,0,0.42)",
      }}
    >
      {DIRECTIONS.map(({ key, Icon, className }) => (
        <button
          key={key}
          type="button"
          onClick={handlers[key]}
          aria-label={labels[key] || key}
          className={`absolute flex h-[23px] w-[23px] items-center justify-center rounded-md text-[#1E3A5A] transition-transform active:scale-90 active:bg-[#1E3A5A]/10 ${className}`}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={3} />
        </button>
      ))}

      <div
        className="absolute left-1/2 top-1/2 h-[17px] w-[17px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "linear-gradient(180deg, #DCD3C2, #C6BCA8)",
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8), inset 0 -1px 3px rgba(30,58,90,0.3)",
        }}
      />
    </div>
  );
}