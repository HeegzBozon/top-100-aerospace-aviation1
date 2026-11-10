import React from 'react';
import { brand, ink } from '@/components/nominate/NominateConfig';
import MilestoneRail from '@/components/voting/MilestoneRail';
import { markAhead, markReached } from '@/components/voting/ladderMarks';

// The contribution ladder, drawn from the record rather than from the session: every
// evaluation a Fellow has weighed is counted here, so closing the tab no longer loses the
// work. Progress is feedback only — nothing on this panel is read by discovery,
// ranking, or scoring.
export default function VotingProgressPanel({ progress, compact = false }) {
  if (!progress) return null;

  // The measure is the division, not the office: a Fellow's work should move the bar every
  // few evaluations rather than wait out a whole office.
  const completed = progress.sets_completed || 0;
  const ahead = markAhead(completed);
  const behind = markReached(completed);
  const stretch = ahead ? ahead.sets - (behind?.sets || 0) : 0;
  const pct = ahead && stretch
    ? Math.round(((completed - (behind?.sets || 0)) / stretch) * 100)
    : 100;
  const left = ahead ? ahead.sets - completed : 0;

  const figures = [
    { label: 'Evaluations', value: completed },
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
          {progress.lane === 'test' ? 'Tester record · internal' : 'Analyst record'}
        </p>
        <p
          className="text-[9px] font-bold uppercase tracking-[0.16em]"
          style={{ color: ink.soft }}
        >
          {progress.xp || 0} XP
        </p>
      </div>

      <p className="mt-1.5 font-heading text-[19px] leading-tight" style={{ color: brand.navy }}>
        {progress.name}
      </p>
      <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: ink.soft }}>
        {completed} {completed === 1 ? 'evaluation' : 'evaluations'}
        {behind ? ` · ${behind.name}` : ''}
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
      <p className="mt-1.5 text-[10px]" style={{ color: ink.soft }}>
        {ahead
          ? `${left} ${left === 1 ? 'evaluation' : 'evaluations'} to ${ahead.name}`
          : 'Every division climbed.'}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {figures.map((f) => (
          <div key={f.label} className="rounded-lg px-2 py-1.5" style={{ background: `${brand.navy}08` }}>
            <p className="font-heading text-[15px] leading-none" style={{ color: brand.navy }}>
              {f.value}
            </p>
            <p
              className="mt-1 text-[8px] font-bold uppercase tracking-[0.14em]"
              style={{ color: ink.soft }}
            >
              {f.label}
            </p>
          </div>
        ))}
      </div>

      {!compact && <MilestoneRail completed={progress.sets_completed || 0} />}
    </div>
  );
}