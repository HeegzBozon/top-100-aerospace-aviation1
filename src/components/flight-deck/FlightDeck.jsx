import { useCallback, useMemo, useRef, useState } from "react";
import { BRAND } from "@/components/board/boardConfig";
import { buildDials, buildTicker, LIVE_PHASES } from "./flightDeckConfig";
import InstrumentDial from "./InstrumentDial";
import ClockDial from "./ClockDial";
import CommandRail from "./CommandRail";
import DisplayBank from "./DisplayBank";
import TickerStrip from "./TickerStrip";
import MastheadPlate from "./MastheadPlate";

// The Flight Deck — the desk machine. The handheld's counterpart: one moulding
// around the whole screen, the instrument bay and the switch banks across the head
// of it, and the surface itself seated in a cream display in the well below.
//
// The instruments read the dashboard's own state, so the deck and the columns can
// never disagree; the rails throw the same destinations the handheld carries; the
// display bank walks the board's own directions. Nothing here writes anything —
// the deck is chrome, and every control on it is a real one.
export default function FlightDeck({ data, stats, phase, placed, children }) {
  const wellRef = useRef(null);
  const [direction, setDirection] = useState(null);

  const dials = useMemo(() => buildDials({ current: data?.current, phase, placed }), [data, phase, placed]);
  const ticker = useMemo(() => buildTicker({ stats, data, phase, placed }), [stats, data, phase, placed]);

  const operator = data?.user?.full_name || data?.user?.email || "Visitor";
  const live = !!data?.current && LIVE_PHASES.includes(data.current.status);

  const takeDirection = useCallback((label) => {
    setDirection(label);
    const column = wellRef.current?.querySelector(`[data-hh-module="${label}"]`);
    column?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="fd-chassis hh-grain relative flex h-screen min-h-0 flex-col overflow-hidden">
      <MastheadPlate operator={operator} live={live} />
      <TickerStrip cells={ticker} />

      <div className="flex flex-wrap items-start gap-x-6 gap-y-3 px-5 pb-4 pt-4">
        <div className="flex items-end gap-3">
          {dials.map(({ key, ...dial }) => (
            <InstrumentDial key={key} {...dial} />
          ))}
          <ClockDial />
        </div>

        <div className="flex min-w-[420px] flex-1 flex-col gap-3.5">
          <div>
            <Legend>Command Rail</Legend>
            <CommandRail />
          </div>
          <div>
            <Legend>Display</Legend>
            <DisplayBank active={direction} onPick={takeDirection} />
          </div>
        </div>
      </div>

      <div className="fd-well mx-5 mb-3 min-h-0 flex-1 overflow-hidden rounded-[13px] p-[6px]">
        <div
          ref={wellRef}
          className="fd-screen h-full min-h-0 overflow-y-auto scrollbar-hide"
          style={{ background: BRAND.cream }}
        >
          {children}
        </div>
      </div>

      {/* The chin: the machine's legend, and the clearance the dock rests in. */}
      <div className="flex items-center gap-3 px-5 pb-[78px]">
        <span className="hh-screw h-2 w-2 rounded-full" />
        <p className="text-[7px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--hh-ink-soft)" }}>
          The measured field · one moulding, two machines
        </p>
        <span className="hh-screw ml-auto h-2 w-2 rounded-full" />
      </div>
    </div>
  );
}

// The engraved name over a bank.
function Legend({ children }) {
  return (
    <p className="mb-1.5 text-[7px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--hh-ink-soft)" }}>
      {children}
    </p>
  );
}