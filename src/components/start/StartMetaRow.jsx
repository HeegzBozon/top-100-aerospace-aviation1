import { useEffect, useState } from "react";
import moment from "moment";

// The title screen's top rule: the cycle's stamp, set at the same left inset as the
// mark and the keys below it and closed by a hairline, so the screen opens on one
// masthead line rather than on a heading standing alone above the mark. The stamp is
// a running clock — the seconds advance and are set a shade brighter, so the screen
// reads as live rather than as a photograph of a time.
export default function StartMetaRow() {
  const [now, setNow] = useState(() => moment());

  useEffect(() => {
    const tick = setInterval(() => setNow(moment()), 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <div className="shrink-0">
      <p className="truncate text-[8.5px] font-bold uppercase tracking-[0.14em] text-editorial-cream/45 md:text-[9.5px] md:tracking-[0.2em]">
        <span className="text-editorial-cream/60">MMXXVI</span>
        <span className="mx-1.5 text-editorial-cream/25">·</span>
        {now.format("ddd D MMM · HH:mm")}
        <span className="text-editorial-cream/70">:{now.format("ss")}</span>
      </p>

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