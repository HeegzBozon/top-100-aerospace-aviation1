import { ChevronLeft, ChevronRight } from 'lucide-react';
import { shiftSeason, seasonFor } from './seasons';

// The season being planned, its quarters, and the keys to step a season either way.
export default function SeasonHeader({ season, setSeason }) {
  const current = seasonFor().name === season.name;
  const fmt = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return (
    <div className="mb-3 flex items-center gap-2 rounded border border-editorial-navy/10 bg-white p-2">
      <button onClick={() => setSeason(shiftSeason(season, -1))} aria-label="Previous season" className="rounded p-1 text-editorial-copper hover:bg-editorial-sand"><ChevronLeft className="h-4 w-4" /></button>
      <div className="flex-1 text-center">
        <p className="font-heading text-lg leading-tight text-editorial-navy">{season.name}{current && <span className="ml-2 align-middle font-body text-[10px] uppercase tracking-[0.16em] text-editorial-label">Now</span>}</p>
        <p className="font-body text-[11px] text-editorial-navy/60">{fmt(season.start)} – {fmt(season.end)} · {season.quarters.join(' / ')}</p>
      </div>
      <button onClick={() => setSeason(shiftSeason(season, 1))} aria-label="Next season" className="rounded p-1 text-editorial-copper hover:bg-editorial-sand"><ChevronRight className="h-4 w-4" /></button>
    </div>
  );
}