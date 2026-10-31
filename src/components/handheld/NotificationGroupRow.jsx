import { useState } from "react";
import moment from "moment";
import { ChevronDown } from "lucide-react";

// One kind of transmission, stacked: the latest line on top, the rest folded under it.
export default function NotificationGroupRow({ group, renderItem }) {
  const [open, setOpen] = useState(false);
  const [latest] = group.items;
  const unread = group.items.filter((i) => !i.read).length;
  if (group.items.length === 1) return renderItem(latest);

  return (
    <div style={{ borderBottom: "1px solid rgb(var(--hh-metal-rgb) / 0.16)" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full flex-col items-start gap-1 px-3 py-2.5 text-left"
        style={{ background: unread ? "rgb(var(--hh-lcd-rgb) / 0.10)" : "transparent" }}
      >
        <span className="flex w-full items-center gap-2">
          <span className="flex-1 truncate text-[11.5px] font-semibold leading-tight" style={{ color: "var(--hh-lcd-bright)" }}>
            {group.title}
          </span>
          <span className="rounded-full px-1.5 text-[8px] font-bold" style={{ background: "rgb(var(--hh-metal-rgb) / 0.35)", color: "var(--hh-lcd-bright)" }}>
            {group.items.length}
          </span>
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "var(--hh-lcd-soft)" }} />
        </span>
        <span className="line-clamp-1 text-[10px] leading-snug" style={{ color: "var(--hh-lcd-soft)" }}>
          {latest.message}
        </span>
        <span className="flex w-full justify-between text-[7px] font-bold uppercase tracking-[0.24em]" style={{ color: "var(--hh-lcd-soft)" }}>
          Latest {moment(latest.created_date).fromNow()}
          {unread ? <span style={{ color: "var(--hh-lcd-bright)" }}>{unread} new</span> : null}
        </span>
      </button>
      {open ? <div className="pl-3" style={{ background: "rgba(0,0,0,0.18)" }}>{group.items.map(renderItem)}</div> : null}
    </div>
  );
}