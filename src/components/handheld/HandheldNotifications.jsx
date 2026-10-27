import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { blip, buzz } from "./handheldSound";

// What has come in for this Fellow, drawn inside the glass like the cartridge
// menu: the same well of phosphor, the same sheet of light over it. Tapping a
// transmission opens what it points at and marks it read.
export default function HandheldNotifications({ open, onClose }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const me = await base44.auth.me();
        const page = await base44.entities.Notification.filter(
          { user_email: me.email },
          { sort: "-created_date", limit: 50 },
        );
        if (!cancelled) setItems(page?.items || []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  const unread = items.filter((item) => !item.read).length;

  const openItem = (item) => {
    blip("select");
    buzz();
    if (!item.read) {
      setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, read: true } : row)));
      base44.entities.Notification.update(item.id, { read: true }).catch(() => {});
    }
    if (item.action_url) {
      onClose();
      navigate(item.action_url);
    }
  };

  return (
    <div
      className="fixed z-[45] flex flex-col md:hidden"
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
      aria-label="Notifications"
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
          <span className="hh-blink">◉</span> Transmissions
        </span>
        <span
          className="text-[8px] font-bold uppercase tracking-[0.28em]"
          style={{ color: unread ? "var(--hh-lcd-bright)" : "var(--hh-lcd-soft)" }}
        >
          {unread ? `${unread} new` : "All clear"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading ? (
          <p
            className="px-3 py-6 text-center text-[8px] font-bold uppercase tracking-[0.28em]"
            style={{ color: "var(--hh-lcd-soft)" }}
          >
            Listening…
          </p>
        ) : items.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Bell className="mx-auto mb-3 h-6 w-6" style={{ color: "var(--hh-lcd-soft)", opacity: 0.6 }} />
            <p className="text-[11px] font-semibold" style={{ color: "var(--hh-lcd)" }}>
              Nothing has come in
            </p>
            <p className="mt-1 text-[9px]" style={{ color: "var(--hh-lcd-soft)" }}>
              The airspace is quiet.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openItem(item)}
              className="flex w-full flex-col items-start gap-1 px-3 py-2.5 text-left"
              style={{
                borderBottom: "1px solid rgb(var(--hh-metal-rgb) / 0.16)",
                background: item.read ? "transparent" : "rgb(var(--hh-lcd-rgb, 169 196 108) / 0.10)",
              }}
            >
              <span className="flex w-full items-center gap-2">
                <span
                  className={`h-[5px] w-[5px] shrink-0 rounded-full ${item.read ? "" : "hh-blink"}`}
                  style={{ background: item.read ? "var(--hh-lcd-soft)" : "var(--hh-lcd-bright)" }}
                />
                <span
                  className="flex-1 truncate text-[11.5px] font-semibold leading-tight"
                  style={{ color: item.read ? "var(--hh-lcd)" : "var(--hh-lcd-bright)" }}
                >
                  {item.title}
                </span>
              </span>

              <span
                className="line-clamp-2 text-[10px] leading-snug"
                style={{ color: "var(--hh-lcd-soft)" }}
              >
                {item.message}
              </span>

              <span
                className="flex w-full items-center justify-between text-[7px] font-bold uppercase tracking-[0.24em]"
                style={{ color: "var(--hh-lcd-soft)" }}
              >
                {moment(item.created_date).fromNow()}
                {!item.read ? <span style={{ color: "var(--hh-lcd-bright)" }}>New</span> : null}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Footer — the way out */}
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
          aria-label="Close notifications"
          className="text-[7px] font-bold uppercase tracking-[0.22em]"
          style={{ color: "var(--hh-lcd-bright)" }}
        >
          Exit
        </button>
      </div>
    </div>
  );
}