import { Link, useLocation } from "react-router-dom";
import { CalendarCheck } from "lucide-react";
import { SHELF } from "@/components/shell/appRegistry";
import { useDeskDockSlots } from "./deskDockSlots";
import "./deskDock.css";

// THE CHANNEL KEYS. This is the desk's shelf, and it no longer floats on the picture: it
// stands in the recessed bay of the machine's faceplate, between the readout and the
// knobs, so the dock is part of the case rather than a bar laid over the work.
//
// What it carries is unchanged. The front screen marks itself the way a machine marks its
// own application; the five surfaces a hand reaches for stand beside it as keys, each
// printing its name when pointed at; and the seal is the one primary — rose gold, and the
// only key with a word always showing. Memory and the station have moved to the
// faceplate's own keys, which is where a transceiver keeps them.
// The shelf's applications come from the machine's one registry (components/shell/
// appRegistry), which the glass reads as well, so a surface added there is on the shelf,
// under the dial, and on the console without a second list to keep in step.
const pathOf = (to = "") => to.split("?")[0];

export default function DesktopDock() {
  const { pathname } = useLocation();
  // A surface may borrow the bay for its own controls. While it does, the bay carries
  // those instead of the keys — the dock adjusts to the surface it stands under.
  const slots = useDeskDockSlots();
  const hosted = Object.keys(slots).length > 0;

  return (
    <div className="ds-strip">
      <Link to="/" aria-label="TOP 100 — the front screen" className="ds-tile ds-tile--mark">
        <span className="ds-mark">100</span>
        <Tip>Front screen</Tip>
      </Link>

      <span className="ds-seam" aria-hidden="true" />

      {hosted ? (
        <div className="ds-host">
          <div className="ds-host-main">{slots["record-transport"]}</div>
          {slots["record-view"] ? <span className="ds-seam" aria-hidden="true" /> : null}
          {slots["record-view"]}
        </div>
      ) : (
        <>
          {SHELF.map((item) => (
            <Tile
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              active={pathname === pathOf(item.to)}
            />
          ))}

          <span className="ds-seam" aria-hidden="true" />

          <Link to="/rsvp" className="ds-seal">
            <CalendarCheck className="ds-glyph" strokeWidth={2.2} />
            <span>RSVP</span>
          </Link>
        </>
      )}
    </div>
  );
}

function Tip({ children }) {
  return <span className="ds-tip">{children}</span>;
}

function Tile({ to, label, icon: Icon, active }) {
  return (
    <Link
      to={to}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className="ds-tile"
    >
      <Icon className="ds-glyph" strokeWidth={1.7} />
      <Tip>{label}</Tip>
      {/* The lamp under the key: lit for the surface you are on. */}
      <span className="ds-lamp" data-on={active} aria-hidden="true" />
    </Link>
  );
}