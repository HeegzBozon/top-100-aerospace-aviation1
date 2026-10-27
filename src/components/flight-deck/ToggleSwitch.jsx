// One switch on the desk machine: a plate, a bat handle thrown up or down, and a
// lamp that comes on when the surface it opens is the one on the screen.
export default function ToggleSwitch({ label, on, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      title={label}
      className="group flex w-[104px] shrink-0 flex-col items-center gap-1.5 rounded-[9px] px-2 pb-1.5 pt-2.5 transition-colors"
      style={{
        background: on ? "rgba(184,115,51,0.16)" : "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(3,6,13,0.20))",
        border: "1px solid rgb(var(--hh-metal-rgb) / 0.26)",
        boxShadow: on ? "inset 0 0 0 1px rgb(var(--hh-metal-rgb) / 0.35)" : "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <span className="fd-switch relative flex h-8 w-5 items-center justify-center rounded-full">
        <span
          className="fd-lever absolute left-1/2 h-4 w-2.5 -translate-x-1/2 rounded-full"
          style={{ transform: `translateX(-50%) rotate(${on ? -30 : 30}deg)` }}
        />
      </span>

      <span
        className="fd-lamp h-1.5 w-1.5 rounded-full"
        style={{ background: on ? "#E4A24A" : "rgba(239,233,220,0.16)" }}
      />

      <span
        className="text-center text-[7px] font-bold uppercase leading-tight tracking-[0.16em]"
        style={{ color: on ? "var(--hh-ink)" : "var(--hh-ink-soft)" }}
      >
        {label}
      </span>
    </button>
  );
}