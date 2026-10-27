import { useEffect, useState } from "react";

// The desk machine's own clock. A machine standing in a room prints the year, the day and
// the minute across the head of its strip, and a Fellow glancing up from a surface should
// not have to open anything to find out when they are. The glass has no room for it — its
// readout band at the foot of the picture already carries the cycle's stamp — so the clock
// is drawn on the desk only, at the far end of the bar where a hand expects it.
//
// It wakes on the minute rather than on the second: the readout has only ever shown
// minutes, so a per-second tick would repaint the whole strip sixty times for nothing.
const DATE = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});
const TIME = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

export default function MenuBarClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  // "Tue, 27 Oct 2026" — the comma a machine prints is noise in a strip this narrow.
  const date = DATE.format(now).replace(/,/g, "");
  const time = TIME.format(now);

  return (
    <div
      role="none"
      className="mb-cell flex shrink-0 items-center gap-2 whitespace-nowrap px-3 tabular-nums"
    >
      <span
        className="text-[8px] font-bold uppercase tracking-[0.16em]"
        style={{ color: "var(--mb-ink)" }}
      >
        {date}
      </span>
      <span
        aria-hidden="true"
        className="h-[9px] w-px"
        style={{ background: "rgb(var(--hh-metal-rgb) / 0.42)" }}
      />
      <time
        dateTime={now.toISOString()}
        className="text-[8px] font-bold uppercase tracking-[0.16em]"
        style={{ color: "var(--mb-ink-strong)" }}
      >
        {time}
      </time>
    </div>
  );
}