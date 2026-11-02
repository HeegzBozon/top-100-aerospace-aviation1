import { Eye, EyeOff, X } from 'lucide-react';

// One metric in the funnel. In edit mode it carries its show/hide (or remove) key.
export default function FunnelTile({ label, m, on, hidden, editing, custom, onClick, onToggle, onRemove }) {
  return (
    <div className={`relative min-w-0 flex-1 ${hidden ? 'opacity-40' : ''}`}>
      <button onClick={editing ? undefined : onClick}
        className={`w-full rounded border px-1.5 py-1 text-center ${on ? 'border-editorial-copper bg-editorial-navy text-editorial-cream' : 'border-editorial-navy/15 bg-white text-editorial-navy'} ${custom ? 'border-dashed' : ''}`}>
        <p className={`truncate text-[8px] font-bold uppercase tracking-[0.12em] ${on ? 'text-editorial-gold' : 'text-editorial-label'}`}>{label}</p>
        <p className="font-heading text-lg leading-tight">{m.open}</p>
        <p className={`truncate font-body text-[9px] ${on ? 'text-editorial-cream/70' : 'text-editorial-navy/60'}`}>{m.received} received · {m.sent} sent</p>
        <p className={`truncate font-body text-[9px] ${on ? 'text-editorial-cream/70' : 'text-editorial-navy/60'}`}>{m.waiting} you · {m.done} done</p>
      </button>
      {editing && (
        <button onClick={custom ? onRemove : onToggle} aria-label={custom ? 'Remove metric' : hidden ? 'Show metric' : 'Hide metric'}
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-editorial-copper text-editorial-cream">
          {custom ? <X className="h-3 w-3" /> : hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        </button>
      )}
    </div>
  );
}