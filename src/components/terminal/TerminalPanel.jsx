/**
 * Reusable terminal-style panel wrapper used across the Bloomberg terminal layout.
 * Defined at module scope to prevent React remounting heavy children (globe, iframes).
 */

export function TerminalPanel({ label, children, headerRight }) {
  return (
    <div className="h-full flex flex-col bg-[#0a0f1e]">
      <div className="px-3 py-1 border-b border-slate-800 flex items-center gap-2 shrink-0">
        <span className="text-[10px] font-mono tracking-[0.2em] text-slate-400 uppercase">
          {label}
        </span>
        <div className="flex-1 h-px bg-slate-800" />
        {headerRight}
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      </div>
      <div className="flex-1 overflow-auto p-2 min-h-0">
        {children}
      </div>
    </div>
  );
}

export function TerminalPanelCompact({ label, children }) {
  return (
    <div className="h-full flex flex-col bg-[#0a0f1e]">
      <div className="px-2 py-0.5 border-b border-slate-800 flex items-center gap-1.5 shrink-0">
        <span className="text-[9px] font-mono tracking-[0.15em] text-slate-500 uppercase">
          {label}
        </span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>
      <div className="flex-1 overflow-hidden p-1 min-h-0">
        {children}
      </div>
    </div>
  );
}