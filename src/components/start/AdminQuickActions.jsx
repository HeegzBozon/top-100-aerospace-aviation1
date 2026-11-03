import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Clock, Eye, FileText, Gauge, RefreshCw, Settings, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

// The operator's key on the title screen. A Fellow never sees it: it is drawn only for an
// admin, and it opens the few surfaces the operator reaches for first — the two live
// monitors, the ledger, and the console everything else lives in.
const ACTIONS = [
  { label: 'Mission Control', note: 'Seasons, people, editorial', to: '/Admin?tab=dashboard', icon: ShieldCheck },
  { label: 'Live monitor', note: 'Ballots as they are cast', to: '/Admin?tab=selection-monitor', icon: Gauge, live: true },
  { label: "God's Eye", note: 'Every collection counted', to: '/Admin?tab=gods-eye', icon: Eye },
  { label: 'Invoicing', note: 'Notes into bills', to: '/Admin?tab=invoicing', icon: FileText },
  { label: 'Timecard & expenses', note: 'Hours and receipts', to: '/Admin?tab=timecard', icon: Clock },
  { label: 'Platform settings', note: 'The console itself', to: '/Admin?tab=settings', icon: Settings },
];

export default function AdminQuickActions({ variant = 'plate', onNavigate = null }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const holder = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (holder.current && !holder.current.contains(event.target)) setOpen(false);
    };
    const esc = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  if (user?.role !== 'admin') return null;

  const go = (to) => {
    setOpen(false);
    navigate(to);
    // A splash screen standing over the app hands the frame back as the key is taken.
    if (onNavigate) onNavigate(to);
  };

  return (
    <div className="relative" ref={holder}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Admin quick actions"
        aria-expanded={open}
        className="flex items-center justify-center rounded-full transition-colors"
        style={
          variant === 'desk'
            ? {
                width: 38,
                height: 38,
                background: 'rgba(12,22,36,0.62)',
                border: '1px solid rgba(201,168,124,0.55)',
                color: '#e6d9c4',
                backdropFilter: 'blur(6px)',
              }
            : {
                width: 34,
                height: 34,
                background: 'rgba(8,16,28,0.55)',
                border: '1px solid rgba(201,168,124,0.5)',
                color: '#e6d9c4',
              }
        }
      >
        <Settings className={variant === 'desk' ? 'h-4 w-4' : 'h-[17px] w-[17px]'} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-xl"
          style={{
            background: 'linear-gradient(180deg, #1b2530 0%, #121a23 100%)',
            border: '1px solid rgba(201,168,124,0.45)',
            boxShadow: '0 22px 48px -18px rgba(3,8,15,0.9)',
          }}
        >
          <p
            className="border-b px-3 py-2 text-[9.5px] font-semibold uppercase tracking-[0.2em]"
            style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#c9a87c' }}
          >
            Admin
          </p>
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.to}
                type="button"
                onClick={() => go(action.to)}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
              >
                <Icon className="h-4 w-4 flex-shrink-0" style={{ color: action.live ? '#7ec89a' : '#9fb4c7' }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold" style={{ color: '#d4e0ec' }}>
                    {action.label}
                  </span>
                  <span className="block truncate text-[10px]" style={{ color: '#5d7a94' }}>{action.note}</span>
                </span>
                {action.live ? (
                  <RefreshCw className="h-3 w-3 flex-shrink-0 animate-spin" style={{ color: '#7ec89a', animationDuration: '3s' }} />
                ) : (
                  <ArrowUpRight className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#44586b' }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}