// The app's opening wait, full bleed on the institution's navy — no chassis around it.
export default function ConsoleLoading({ label = "Powering up" }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-editorial-navy px-6"
      role="status"
      aria-live="polite"
    >
      <span className="font-body text-[10px] font-bold uppercase tracking-[0.42em] text-editorial-gold">
        TOP 100 OS
      </span>

      <p className="hh-blink font-body text-[12px] font-bold uppercase tracking-[0.30em] text-editorial-cream">
        {label}
      </p>

      <div className="mt-1 h-[3px] w-[124px] overflow-hidden rounded-full bg-editorial-cream/20">
        <div className="hh-led h-full w-full rounded-full bg-editorial-gold" />
      </div>
    </div>
  );
}