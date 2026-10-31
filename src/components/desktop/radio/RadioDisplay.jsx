import { useEffect, useState } from "react";

const pad = (value) => String(value).padStart(2, "0");
const BARS = 11;

// THE DISPLAY. A backlit readout on the machine's own phosphor, and everything on it is
// the machine's real state: the lamp row says whether the record is signed in (TX),
// whether the dial has been turned off the surface you are standing on (TUNE), and
// whether the memory list is down (MEM). MODE gives the big figures three meanings — the
// channel the dial is on, the record's volume, the hour — so the readout is an instrument
// rather than a label. The S-meter is the band's own scale: lit to the channel's place in
// it, engraved 1 · 3 · 5 · 7 · 9 · +30 as the transceivers print it.
export default function RadioDisplay({ mode, index, total, target, tuning, volume, signedIn, memOpen }) {
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    if (mode !== "CLK") return undefined;
    const tick = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(tick);
  }, [mode]);

  const time = `${pad(clock.getHours())}:${pad(clock.getMinutes())}`;
  const digits =
    mode === "VOL" ? pad(volume) : mode === "CLK" ? time : index >= 0 ? pad(index + 1) : "--";
  const legend = mode === "VOL" ? "VOL" : mode === "CLK" ? "CLK" : `CH / ${total}`;
  const lit = index >= 0 ? Math.max(1, Math.round(((index + 1) / Math.max(total, 1)) * BARS)) : 0;

  return (
    <div className="rd-lcd" data-tuning={tuning}>
      <div className="rd-lcd-head">
        <span className="rd-lamp" data-on="true">RX</span>
        <span className="rd-lamp" data-on={signedIn}>TX</span>
        <span className="rd-lamp" data-on={tuning}>TUNE</span>
        <span className="rd-lamp" data-on={memOpen}>MEM</span>
        <span className="rd-brand">TOP 100 · AEROSPACE &amp; AVIATION</span>
      </div>

      <div className="rd-lcd-body">
        <div className="rd-read">
          <span className="rd-legend">{legend}</span>
          <span className="rd-digits">{digits}</span>
        </div>

        <div className="rd-meta">
          <p className="rd-band">{target?.band || "OFF BAND"}</p>
          <p className="rd-label" title={target?.label}>
            {target?.label || "Not on the band"}
          </p>
        </div>

        <div
          className="rd-meter"
          title={
            index >= 0 ? `Band position — channel ${index + 1} of ${total}` : "Off the band"
          }
        >
          <div className="rd-bars" aria-hidden="true">
            {Array.from({ length: BARS }, (_, bar) => (
              <span key={bar} className="rd-bar" data-lit={bar < lit} />
            ))}
          </div>
          <div className="rd-scale" aria-hidden="true">
            <span>1</span>
            <span>3</span>
            <span>5</span>
            <span>7</span>
            <span>9</span>
            <span>+30</span>
          </div>
        </div>
      </div>
    </div>
  );
}