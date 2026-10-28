import React, { useState } from 'react';
import { Play, Pause, Gauge } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import { PLAYBACK_OPTIONS, speedLabel } from '@/components/magazine/useCinematicPlayback';

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
        {speedLabel(speed)}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 rounded-xl p-1 min-w-[86px] shadow-2xl"
            style={{
              background: 'rgba(7,15,31,0.95)',
              border: '1px solid rgba(201,168,124,0.25)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {PLAYBACK_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => { onChange(value); setOpen(false); }}
                className="w-full text-center px-3 py-1.5 rounded-lg text-xs font-medium tabular-nums transition-all hover:bg-white/10"
                style={{
                  background: speed === value ? P.gold : 'transparent',
                  color: speed === value ? P.navyVoid : P.cream,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// The page's rule, cut across the foot of the picture — inside the tube, under the spread
// being read, never on the glass below the machine.
//
// It measures one thing only: how much of the page standing open is left to read — the beat
// the film still owes it, or, page turned by hand, nothing at all. How much of the whole
// issue has gone by is read in the head band instead (see ReadProgressMeter), so a glance at
// either rule never has to ask which of the two it is looking at.
export function PlaybackProgress({ progress = 0, active = false }) {
  const read = active ? Math.min(Math.max(progress, 0), 1) : 0;

  return (
    <div
      className="relative w-full flex-none overflow-hidden"
      role="progressbar"
      aria-label="Page progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(read * 100)}
      style={{
        height: 6,
        // A perforated track, the way a strip of film is: the rule is printed, not painted.
        background:
          'repeating-linear-gradient(90deg, rgba(250,248,245,0.055) 0 1px, transparent 1px 6px), rgba(4,10,20,0.94)',
        borderTop: '1px solid rgba(201,168,124,0.22)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* The part of this page already held */}
      <div
        className="absolute inset-y-0 left-0"
        style={{
          width: `${read * 100}%`,
          background: `linear-gradient(90deg, ${P.copper} 0%, ${P.gold} 62%, #F2E2C4 100%)`,
          boxShadow: '0 0 14px rgba(201,168,124,0.6)',
        }}
      />
      {/* The lead edge: the moment this page turns */}
      {active && (
        <div
          className="absolute inset-y-0 w-[2px] animate-pulse"
          style={{
            left: `calc(${read * 100}% - 2px)`,
            background: P.cream,
            boxShadow: '0 0 10px rgba(250,248,245,0.85)',
          }}
        />
      )}
    </div>
  );
}