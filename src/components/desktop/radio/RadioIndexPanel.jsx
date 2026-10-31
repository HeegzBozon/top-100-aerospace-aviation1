import { Link } from "react-router-dom";
import { Compass, X } from "lucide-react";
import { INDEX_GROUPS } from "@/components/shell/appRegistry";

// The memory list, dropped from the faceplate: every surface the machine holds, grouped
// the way the registry groups it. A group that belongs to a Fellow's own record goes
// whole for a visitor, exactly as it does on the glass.
export default function RadioIndexPanel({ signedIn, isAdmin, onClose }) {
  const visible = (item) => {
    if (item.membersOnly && !signedIn) return false;
    if (item.adminOnly && !isAdmin) return false;
    return true;
  };

  return (
    <div role="menu" aria-label="Memory" className="rd-panel rd-panel--index">
      <div className="rd-panel-head">
        <div>
          <p className="rd-panel-kicker">MEM · Channel memory</p>
          <p className="rd-panel-title">Everything the machine holds</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close the memory list" className="rd-panel-x">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="rd-panel-grid">
        {INDEX_GROUPS.map((group) => {
          if (group.membersOnly && !signedIn) return null;
          const items = group.items.filter(visible);
          if (!items.length) return null;
          return (
            <div key={group.key}>
              <p className="rd-panel-group">{group.label}</p>
              <div className="mt-1.5">
                {items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    role="menuitem"
                    onClick={onClose}
                    className="rd-panel-item"
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.7} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rd-panel-foot">
        <a
          href="https://wefunder.com/top.100.aerospace.aviation"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="rd-panel-item"
        >
          <Compass className="h-3.5 w-3.5 shrink-0" strokeWidth={1.7} />
          Community Round
          <span className="rd-panel-hint">wefunder.com ↗</span>
        </a>
      </div>
    </div>
  );
}