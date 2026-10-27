// The wait, read out inside the tube. The machine is already standing when this
// shows, so a surface arriving late fills in underneath a computer that never
// changed — the desk and the shell are painted before anything the app says.
export default function ImacWait({ label = "Powering up" }) {
  return (
    <div
      className="imac-wait flex min-h-full flex-col items-center justify-center gap-3"
      role="status"
      aria-label={label}
    >
      <span
        className="text-[8px] font-bold uppercase tracking-[0.44em]"
        style={{ color: "var(--imac-steel-2)" }}
      >
        TOP 100 OS
      </span>

      <p
        className="hh-blink text-[11px] font-bold uppercase tracking-[0.32em]"
        style={{ color: "var(--imac-steel-1)" }}
      >
        {label}
      </p>

      <div
        className="mt-1 h-[3px] w-[132px] overflow-hidden rounded-full"
        style={{ background: "rgba(152,162,173,0.24)" }}
      >
        <div
          className="hh-led h-full w-full rounded-full"
          style={{ background: "var(--imac-steel-1)" }}
        />
      </div>
    </div>
  );
}