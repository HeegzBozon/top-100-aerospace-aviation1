import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronUp, ChevronDown, Eye, EyeOff, X, Repeat, Square, Hand, Clock } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import {
  CONFIGURABLE_SLIDES,
  AUTOPLAY_MODES,
  DEFAULT_DWELL,
  MIN_DWELL,
  slideLabel,
} from './slideDeckConfig';

const MODE_ICONS = { loop: Repeat, stop_at_end: Square, manual: Hand };

// Owner configuration: reorder configurable slides, toggle regions on/off,
// set autoplay mode (loop | stop_at_end | manual) and dwell seconds per slide.
// Identity (pos 1) and verification (pos 2) are locked — not shown here as
// reorderable. Changes save immediately via onChange.
export default function PresentationSettings({ settings, accent, onChange, onClose }) {
  const savedOrder = Array.isArray(settings?.slide_order) && settings.slide_order.length > 0
    ? settings.slide_order
    : ['identity', 'verification', ...CONFIGURABLE_SLIDES];

  const [order, setOrder] = useState(() => {
    const configurable = savedOrder.filter((k) => CONFIGURABLE_SLIDES.includes(k));
    const deduped = configurable.filter((k, i) => configurable.indexOf(k) === i);
    for (const k of CONFIGURABLE_SLIDES) {
      if (!deduped.includes(k)) deduped.push(k);
    }
    return deduped;
  });

  const [hidden, setHidden] = useState(() => new Set(settings?.slide_hidden || []));
  const [mode, setMode] = useState(settings?.autoplay_mode || 'manual');
  const [dwell, setDwell] = useState(settings?.dwell_seconds || DEFAULT_DWELL);

  const toggleHidden = (key) => {
    const next = new Set(hidden);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setHidden(next);
    onChange({ slide_hidden: [...next] });
  };

  const move = (idx, dir) => {
    const next = [...order];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setOrder(next);
    onChange({ slide_order: ['identity', 'verification', ...next] });
  };

  const selectMode = (m) => {
    setMode(m);
    onChange({ autoplay_mode: m });
  };

  const changeDwell = (val) => {
    const n = Math.max(MIN_DWELL, Number(val) || MIN_DWELL);
    setDwell(n);
    onChange({ dwell_seconds: n });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose?.()}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden" style={{ background: B.cream, borderRadius: '1.5rem' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${B.border}` }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>Presentation</h2>
            <p className="text-xs mt-0.5" style={{ color: B.muted }}>Curate how your profile presents itself.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70" style={{ color: B.muted }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Slide roster */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: B.muted }}>Slides</p>
            <div className="space-y-1.5">
              {order.map((key, idx) => {
                const isHidden = hidden.has(key);
                const isLast = idx === order.length - 1;
                const isFirst = idx === 0;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{ background: isHidden ? `${B.navy}04` : '#fff', border: `1px solid ${isHidden ? 'transparent' : B.border}`, opacity: isHidden ? 0.5 : 1 }}
                  >
                    <span className="text-[10px] font-bold w-5 text-center" style={{ color: accent }}>{String(idx + 3).padStart(2, '0')}</span>
                    <span className="text-sm font-medium flex-1" style={{ color: B.navy }}>{slideLabel(key)}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleHidden(key)} className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-70" style={{ color: B.muted }} aria-label={isHidden ? 'Show slide' : 'Hide slide'}>
                        {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => move(idx, -1)} disabled={isFirst} className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-70 disabled:opacity-25" style={{ color: B.muted }} aria-label="Move up">
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => move(idx, 1)} disabled={isLast} className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-70 disabled:opacity-25" style={{ color: B.muted }} aria-label="Move down">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] mt-2" style={{ color: B.muted }}>Identity and Credential are locked at positions 1 and 2. Hidden slides are excluded from the deck.</p>
          </div>

          {/* Autoplay mode */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: B.muted }}>Autoplay</p>
            <div className="space-y-2">
              {AUTOPLAY_MODES.map((m) => {
                const Icon = MODE_ICONS[m.key] || Hand;
                const selected = mode === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => selectMode(m.key)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border-2"
                    style={{ background: selected ? `${accent}08` : '#fff', borderColor: selected ? accent : B.border }}
                  >
                    <Icon className="w-4 h-4 shrink-0" style={{ color: selected ? accent : B.muted }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: B.navy }}>{m.label}</p>
                      <p className="text-[11px] leading-tight" style={{ color: B.muted }}>{m.description}</p>
                    </div>
                    {selected && <div className="w-2 h-2 rounded-full shrink-0" style={{ background: accent }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dwell time */}
          {mode !== 'manual' && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: B.muted }}>Dwell time</p>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4" style={{ color: B.muted }} />
                <input
                  type="range"
                  min={MIN_DWELL}
                  max={20}
                  value={dwell}
                  onChange={(e) => changeDwell(e.target.value)}
                  className="flex-1 accent-current"
                  style={{ accentColor: accent }}
                />
                <span className="text-sm font-semibold w-16 text-right tabular-nums" style={{ color: B.navy }}>
                  {dwell}s <span style={{ color: B.muted, fontWeight: 400 }}>per slide</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}