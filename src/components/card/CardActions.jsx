import { Loader2 } from 'lucide-react';

// The card's keys, drawn from what the reader has already settled. The page decides
// which state each key stands in, so nothing here reads auth or the network: it only
// presses what it was handed.

const BTN =
  'inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-full px-3.5 text-[9.5px] font-bold uppercase tracking-[0.16em] transition-[transform,box-shadow] active:scale-[0.98] disabled:opacity-55';

const TONES = {
  solid: {
    background: '#B87333',
    color: '#FAF8F5',
    boxShadow: '0 12px 24px -14px rgba(3,8,15,0.9)',
  },
  line: {
    background: '#FFFFFF',
    color: '#1E3A5A',
    border: '1px solid rgba(30,58,90,0.32)',
  },
  done: {
    background: 'rgba(30,58,90,0.06)',
    color: '#1E3A5A',
    border: '1px solid rgba(30,58,90,0.18)',
  },
};

export default function CardActions({ actions = [], busy = false }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(({ key, label, Icon, tone = 'line', disabled, onClick }) => (
        <button
          key={key}
          type="button"
          onClick={onClick}
          disabled={busy || disabled}
          aria-live="polite"
          className={BTN}
          style={TONES[tone] || TONES.line}
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : Icon ? <Icon className="h-3.5 w-3.5" /> : null}
          {label}
        </button>
      ))}
    </div>
  );
}