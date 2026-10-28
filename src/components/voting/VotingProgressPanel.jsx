import React from 'react';
import { Check } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';

// The contribution ladder, drawn from the record rather than from the session: every
// set a Fellow has weighed is counted here, so closing the tab no longer loses the
// work. Progress is feedback only — nothing on this panel is read by discovery,
// ranking, or scoring.
export default function VotingProgressPanel({ progress, compact = false }) {
  if (!progress) return null;

  const pct = Math.round((progress.progress || 0) * 100);
  const earned = new Set(progress.milestones || []);
  const ladder = progress.ladder || [];

  const figures = [
    { label: 'Sets', value: progress.sets_completed || 0 },
    { label: 'Ballots', value: progress.ballots_saved || 0 },
    { label: 'Comparisons', value: progress.comparisons_recorded || 0 },
  ];

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'rgba(255,255,255,0.62)', border: `1px solid ${brand.navy}14` }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[8.5px] font-bold uppercase tracking-[0.3em]" style={{ color: brand.gold }}>
          Contribution
        </p>
        <p
          className="text-[9px] font-bold uppercase tracking-[0.16em]"
          style={{ color: `${brand.navy}45` }}
        >
          {progress.xp || 0} XP
        </p>
      </div>

      <p className="mt-1.5 font-heading text-[19px] leading-tight" style={{ color: brand.navy }}>
        {progress.name}
      </p>
      <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: `${brand.navy}55` }}>
        Level {progress.level}
        {progress.next_name ? ` · next: ${progress.next_name}` : ' · top of the ladder'}
      </p>

      <div
        className="mt-3 h-[5px] w-full overflow-hidden rounded-full"
        style={{ background: `${brand.navy}12` }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${brand.navy}, ${brand.gold})` }}
        />
      </div>
      <p className="mt-1.5 text-[10px]" style={{ color: `${brand.navy}60` }}>
        {progress.next_at ? `${progress.to_next} XP to ${progress.next_name}` : 'Every rung climbed.'}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {figures.map((f) => (
          <div key={f.label} className="rounded-lg px-2 py-1.5" style={{ background: `${brand.navy}08` }}>
            <p className="font-heading text-[15px] leading-none" style={{ color: brand.navy }}>
              {f.value}
            </p>
            <p
              className="mt-1 text-[8px] font-bold uppercase tracking-[0.14em]"
              style={{ color: `${brand.navy}50` }}
            >
              {f.label}
            </p>
          </div>
        ))}
      </div>

      {!compact && ladder.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ladder.map((m) => {
            const got = earned.has(m.key);
            return (
              <span
                key={m.key}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px]"
                style={{
                  background: got ? `${brand.gold}22` : 'transparent',
                  border: `1px solid ${got ? `${brand.gold}99` : `${brand.navy}18`}`,
                  color: got ? brand.navy : `${brand.navy}45`,
                }}
              >
                {got && <Check className="h-2.5 w-2.5" />}
                {m.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}