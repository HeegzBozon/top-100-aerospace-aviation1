import { Bell, Home } from "lucide-react";
import ViewAsCell from "@/components/shell/ViewAsCell";

// The menubar: the strip across the head of the picture, cloned from the desk the
// machine imitates. It leads the way a desk machine's bar does — home, then File, then
// Edit — and behind them stands the surface you are on with its lamp lit, the section
// you are reading in quiet type, and the one key a hand reaches for at the right.
//
// The way home is a key of its own, printed as the one glyph every machine prints it
// with, and everything a Fellow authors about themselves sits in Edit — so the bar
// carries no account glyph: your own record is one press into the menu that means
// editing, and nothing is lost for the space.
//
// It is one strip on both machines: on the glass it is the head band of the picture,
// on the desk it stands across the top of the tube. The surface cell is the journey
// drawer — the wheel's MENU opens the same thing from the hardware — and File and Edit
// open the two lists a desk machine keeps under those names.
export const MENU_CELL = 50;

// A key rather than a word: the way home at one end of the strip, notifications at
// the other. Both are the same width, so the words between them are measured from a
// fixed line.
export const KEY_CELL = 33;

// Each word carries, small and beside it, the key the control centre does the same thing
// with: X lists the sections the File cell holds, Y opens the Edit drawer. On a desk there
// are no such keys, so the hint is handed in and is simply absent there.
function MenuCell({ label, hint, open, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-open={open ? "true" : "false"}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-label={hint ? `${label} menu — the ${hint} key` : `${label} menu`}
      className="mb-cell flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2 text-[8px] font-bold uppercase tracking-[0.20em]"
      style={{ color: open ? "var(--mb-ink-strong)" : "var(--mb-ink)", width: MENU_CELL }}
    >
      {label}
      {hint ? (
        <span
          aria-hidden="true"
          className="rounded-[3px] px-[3px] py-[1px] text-[6.5px] leading-none"
          style={{
            border: `1px solid rgb(var(--hh-metal-rgb) / ${open ? 0.72 : 0.4})`,
            color: open ? "var(--mb-ink-strong)" : "var(--mb-ink-soft)",
          }}
        >
          {hint}
        </span>
      ) : null}
    </button>
  );
}

function BarKey({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="mb-cell flex shrink-0 items-center justify-center"
      style={{ color: "var(--mb-ink)", width: KEY_CELL }}
    >
      {children}
    </button>
  );
}

export default function MenuBar({
  surface,
  module,
  menuOpen = false,
  fileOpen = false,
  editOpen = false,
  onHome,
  onMenu,
  onFile,
  onEdit,
  onNotifications,
  /* The operator's lens: drawn for an admin only, and never while the operator is
     standing in a visitor's place. */
  showViewAs = false,
  viewingAsVisitor = false,
  onToggleViewAs,
  /* The face keys that do the same thing, where the machine has them. */
  fileHint = "",
  editHint = "",
  className = "",
  style,
}) {
  return (
    <div
      className={`mb-bar select-none ${className}`}
      style={style}
      role="menubar"
      aria-label="Menu bar"
    >
      {/* The way home, printed the way a machine prints it: one glyph, at the head
          of the strip, where a hand looks for it first. */}
      <BarKey label="Home" onClick={onHome}>
        <Home className="h-[15px] w-[15px]" strokeWidth={1.8} />
      </BarKey>

      <MenuCell label="File" hint={fileHint} open={fileOpen} onClick={onFile} />
      <MenuCell label="Edit" hint={editHint} open={editOpen} onClick={onEdit} />

      {/* Where you stand — and the journey drawer. The lamp is lit for the surface you
          are on, and the cell reads as pressed while the drawer stands. */}
      <button
        type="button"
        onClick={onMenu}
        data-open={menuOpen ? "true" : "false"}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={`${surface} — the menu`}
        className="mb-cell flex min-w-0 flex-1 items-center gap-2 px-3 text-left text-[8px] font-bold uppercase tracking-[0.20em]"
      >
        <span className="mb-lamp h-[4px] w-[4px] shrink-0 rounded-full" aria-hidden="true" />
        <span className="truncate" style={{ color: "var(--mb-ink-strong)" }}>
          {surface}
        </span>
        {module ? (
          <span
            className="min-w-0 shrink truncate text-[6.5px] tracking-[0.18em]"
            style={{ color: "var(--mb-ink-soft)" }}
          >
            {module}
          </span>
        ) : null}
      </button>

      {showViewAs ? (
        <ViewAsCell viewingAsVisitor={viewingAsVisitor} onToggle={onToggleViewAs} />
      ) : null}

      <BarKey label="Notifications" onClick={onNotifications}>
        <Bell className="h-[15px] w-[15px]" strokeWidth={1.7} />
      </BarKey>
    </div>
  );
}