import { useEffect, useState } from "react";
import moment from "moment";

// The title screen's top rule: the hour's name on the left, the cycle's stamp on
// the right, closed by a hairline so the two read as one masthead line instead of
// floating in the air above the mark. The stamp is a running clock — the seconds
// advance and are set a shade brighter, so the screen reads as live rather than
// as a photograph of a time.
export default function StartMetaRow({ kicker }) {
  const [now, setNow] = useState(() => moment());

  useEffect(() => {
    const tick = setInterval(() => setNow(moment()), 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <div className="shrink-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-[8.5px] font-bold uppercase tracking-[0.3em] text-editorial-copper md:text-[9.5px]">
          {kicker}
        </p>

        <p className="shrink-0 whitespace-nowrap text-right text-[7px] font-bold uppercase tracking-[0.12em] text-editorial-cream/40 md:text-[9.5px] md:tracking-[0.2em]">
          <span className="text-editorial-cream/55">MMXXVI</span>
          <span className="mx-1.5 text-editorial-cream/25">·</span>
          {now.format("ddd D MMM · HH:mm")}
          <span className="text-editorial-cream/70">:{now.format("ss")}</span>
        </p>
      </div>

      <div
        className="mt-2 h-px w-full md:mt-3"
        style={{
          background:
            "linear-gradient(90deg, rgb(var(--editorial-gold-rgb) / 0.42) 0%, rgb(var(--editorial-gold-rgb) / 0.08) 58%, transparent 100%)",
        }}
      />
    </div>
  );
}