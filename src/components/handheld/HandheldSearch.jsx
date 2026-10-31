import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { blip, buzz } from "./handheldSound";
import HandheldScanner from "./HandheldScanner";

// The machine's search, drawn inside the glass the way the cartridge menu is: the same
// well of phosphor, the same sheet of light over it, the same legend along the foot.
// One field and two readings under it — the people the directory holds, and the
// surfaces this machine opens — so the print at the foot of the wheel has something
// real to answer with wherever a Fellow is standing when they press it.
//
// The field is the reason the drawer carries `hh-keyed-drawer`: while a field is being
// written into, the readout band is inside the picture the keys have taken, so this
// panel takes the keys' own line at its foot rather than holding the band's clearance.
const asRegex = (text) => `(?i)${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`;

export default function HandheldSearch({ onClose, groups = [] }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  // The same key does both: the lens reads a code, the field answers a name. One press
  // of the keypad's scan key opens this drawer, and the machine's eye is in it.
  const [scanning, setScanning] = useState(false);

  const term = query.trim();

  // The machine's own surfaces need no lookup: they are already in hand, and matching
  // them here keeps one press of the wheel useful on a screen with no directory on it.
  const surfaces = useMemo(() => {
    if (!term) return [];
    const lower = term.toLowerCase();
    return groups
      .flatMap((group) => group.items || [])
      .filter((item) => item.to && item.label.toLowerCase().includes(lower))
      .slice(0, 5);
  }, [groups, term]);

  useEffect(() => {
    if (!term) {
      setPeople([]);
      setFailed(false);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setFailed(false);

    const timer = setTimeout(async () => {
      try {
        const match = { $regex: asRegex(term) };
        const page = await base44.entities.Nominee.filter(
          { $or: [{ name: match }, { company: match }, { title: match }] },
          { sort: "name", limit: 12 },
        );
        if (!cancelled) setPeople(page?.items || []);
      } catch {
        if (!cancelled) {
          setPeople([]);
          setFailed(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 280);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term]);

  const go = (to) => {
    blip("select");
    buzz();
    onClose();
    navigate(to);
  };

  const idle = !term;
  const nothing = !idle && !loading && !failed && !people.length && !surfaces.length;

  const rowStyle = { borderBottom: "1px solid rgb(var(--hh-metal-rgb) / 0.16)" };

  return (
    <div
      className="hh-keyed-drawer fixed z-[45] flex flex-col md:hidden"
      style={{
        top: "calc(var(--hh-top, 96px) + env(safe-area-inset-top) + 5px)",
        bottom: "calc(var(--hh-bottom, 176px) + var(--hh-foot, 0px) + env(safe-area-inset-bottom) + 5px)",
        left: "var(--hh-glass-inset, 7px)",
        right: "var(--hh-glass-inset, 7px)",
        borderRadius: 15,
        overflow: "hidden",
        background:
          "linear-gradient(180deg, var(--hh-well-1) 0%, var(--hh-well-2) 60%, var(--hh-well-3) 100%)",
        boxShadow: "inset 0 0 0 2px var(--hh-bezel)",
      }}
      role="dialog"
      aria-label="Search"
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: "1px solid rgb(var(--hh-metal-rgb) / 0.28)" }}
      >
        <span
          className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.28em]"
          style={{ color: "var(--hh-lcd)" }}
        >
          <Search className="h-[11px] w-[11px]" strokeWidth={2.4} /> Search
        </span>
        <span
          className="text-[8px] font-bold uppercase tracking-[0.28em]"
          style={{ color: loading ? "var(--hh-lcd-bright)" : "var(--hh-lcd-soft)" }}
        >
          {scanning
            ? "Reading a code"
            : loading
              ? "Listening…"
              : idle
                ? "Directory"
                : `${surfaces.length + people.length} found`}
        </span>
      </div>

      {scanning ? (
        <HandheldScanner onOpen={go} onClose={() => setScanning(false)} />
      ) : (
        <>
      {/* The field, with the eye beside it: the same key that types a name reads a code. */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: "1px solid rgb(var(--hh-metal-rgb) / 0.16)" }}
      >
        <span className="hh-blink text-[9px]" style={{ color: "var(--hh-lcd-bright)" }}>
          ▸
        </span>
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="A name, a company, a surface"
          aria-label="Search the directory and the machine"
          className="w-full bg-transparent text-[13px] font-semibold outline-none placeholder:font-normal placeholder:tracking-[0.02em]"
          style={{ color: "var(--hh-lcd-bright)", caretColor: "var(--hh-lcd-bright)" }}
        />
        <button
          type="button"
          onClick={() => {
            blip("open");
            buzz();
            setScanning(true);
          }}
          aria-label="Scan a code"
          title="Scan a code"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px]"
          style={{
            background: "rgb(var(--hh-ink-rgb) / 0.06)",
            boxShadow: "inset 0 0 0 1px rgb(var(--hh-ink-rgb) / 0.16)",
            color: "var(--hh-lcd)",
          }}
        >
          <QrCode className="h-[13px] w-[13px]" strokeWidth={2.2} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {idle ? (
          <div className="px-5 py-8 text-center">
            <Search className="mx-auto mb-3 h-5 w-5" style={{ color: "var(--hh-lcd-soft)", opacity: 0.6 }} />
            <p className="text-[11px] font-semibold" style={{ color: "var(--hh-lcd)" }}>
              The directory is open
            </p>
            <p className="mt-1 text-[9px] leading-relaxed" style={{ color: "var(--hh-lcd-soft)" }}>
              A Fellow's name, where they work, or the name of a surface on this machine.
            </p>
          </div>
        ) : failed ? (
          <div className="px-5 py-8 text-center">
            <p className="text-[11px] font-semibold" style={{ color: "var(--hh-lcd-bright)" }}>
              Search is not answering
            </p>
            <p className="mt-1 text-[9px]" style={{ color: "var(--hh-lcd-soft)" }}>
              The line is down. Press Exit and open it again.
            </p>
          </div>
        ) : loading && !surfaces.length && !people.length ? (
          <p
            className="px-3 py-6 text-center text-[8px] font-bold uppercase tracking-[0.28em]"
            style={{ color: "var(--hh-lcd-soft)" }}
          >
            Searching…
          </p>
        ) : nothing ? (
          <div className="px-5 py-8 text-center">
            <p className="text-[11px] font-semibold" style={{ color: "var(--hh-lcd)" }}>
              Nothing matches “{term}”
            </p>
            <p className="mt-1 text-[9px]" style={{ color: "var(--hh-lcd-soft)" }}>
              Try a surname, a company, or a surface.
            </p>
          </div>
        ) : (
          <>
            {surfaces.length ? (
              <>
                <p
                  className="px-3 pt-3 pb-1 text-[7px] font-bold uppercase tracking-[0.28em]"
                  style={{ color: "var(--hh-lcd-soft)" }}
                >
                  The machine
                </p>
                {surfaces.map((item) => (
                  <button
                    key={`${item.label}-${item.to}`}
                    type="button"
                    onClick={() => go(item.to)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left"
                    style={rowStyle}
                  >
                    {item.icon ? (
                      <item.icon className="h-[13px] w-[13px] shrink-0" style={{ color: "var(--hh-lcd-soft)" }} />
                    ) : null}
                    <span className="flex-1 truncate text-[11.5px] font-semibold" style={{ color: "var(--hh-lcd)" }}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </>
            ) : null}

            {people.length ? (
              <>
                <p
                  className="px-3 pt-3 pb-1 text-[7px] font-bold uppercase tracking-[0.28em]"
                  style={{ color: "var(--hh-lcd-soft)" }}
                >
                  The directory
                </p>
                {people.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => go(`/profiles/${person.id}`)}
                    className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left"
                    style={rowStyle}
                  >
                    <span className="w-full truncate text-[11.5px] font-semibold" style={{ color: "var(--hh-lcd-bright)" }}>
                      {person.name}
                    </span>
                    {person.title || person.company ? (
                      <span className="w-full truncate text-[9.5px]" style={{ color: "var(--hh-lcd-soft)" }}>
                        {[person.title, person.company].filter(Boolean).join(" · ")}
                      </span>
                    ) : null}
                  </button>
                ))}
              </>
            ) : null}
          </>
        )}
      </div>
        </>
      )}

      {/* Footer — the legend along the foot, and the way out */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderTop: "1px solid rgb(var(--hh-metal-rgb) / 0.24)", background: "rgba(7,16,9,0.35)" }}
      >
        <span
          className="text-[7px] font-bold uppercase tracking-[0.22em]"
          style={{ color: "var(--hh-lcd-soft)" }}
        >
          ● Open · B Back
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="text-[7px] font-bold uppercase tracking-[0.22em]"
          style={{ color: "var(--hh-lcd-bright)" }}
        >
          Exit
        </button>
      </div>
    </div>
  );
}