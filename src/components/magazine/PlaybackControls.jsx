import React, { useState } from 'react';
import { Play, Pause, Gauge } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import { PLAYBACK_SPEEDS } from '@/components/magazine/useCinematicPlayback';

// Play / pause button — drops into any nav bar.
export function PlayPauseButton({ isPlaying, onToggle, disabled, theme = 'dark' }) {
  const color = theme === 'dark' ? P.cream : P.navy;
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-white/10 disabled:opacity-25"
      style={{ color }}
      aria-label={isPlaying ? 'Pause playback' : 'Play publication'}
    >
      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
    </button>
  );
}

// Compact speed selector — appears above the nav bar.
export function SpeedSelector({ speed, onChange, theme = 'dark' }) {
  const [open, setOpen] = useState(false);
  const labelColor = theme === 'dark' ? P.cream : P.navy;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex h-9 items-center gap-1 px-2.5 rounded-full transition-all hover:bg-white/10 text-xs font-medium tabular-nums"
        style={{ color: labelColor }}
        aria-label="Playback speed"
      >
        <Gauge className="h-3.5 w-3.5" />
        {speed}×
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 rounded-xl p-1 min-w-[76px] shadow-2xl"
            style={{
              background: 'rgba(7,15,31,0.95)',
              border: '1px solid rgba(201,168,124,0.25)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {PLAYBACK_SPEEDS.map(s => (
              <button
                key={s}
                onClick={() => { onChange(s); setOpen(false); }}
                className="w-full text-center px-3 py-1.5 rounded-lg text-xs font-medium tabular-nums transition-all hover:bg-white/10"
                style={{
                  background: speed === s ? P.gold : 'transparent',
                  color: speed === s ? P.navyVoid : P.cream,
                }}
              >
                {s}×
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Thin progress bar fixed at the bottom of the screen.
// Fills 0→1 over the current page's dwell time. Pointer-events disabled so
// it never interferes with page interaction or screen recording.
export function PlaybackProgress({ progress, active }) {
  if (!active) return null;
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 h-[3px] pointer-events-none"
      style={{ background: 'rgba(201,168,124,0.08)' }}
    >
      <div
        className="h-full"
        style={{
          width: `${Math.min(progress * 100, 100)}%`,
          background: `linear-gradient(90deg, ${P.gold}, ${P.copper})`,
          boxShadow: '0 0 10px rgba(201,168,124,0.6)',
        }}
      />
    </div>
  );
}