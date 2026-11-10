import { brand, ink } from '@/components/nominate/NominateConfig';
import { LADDER_MARKS } from '@/components/voting/ladderMarks';

// The ladder as a chart: every office, its three divisions, and the evaluations each one
// answers to — the whole climb in one glance, so a Fellow can read where their own record
// sits against the rungs above it. Recognition only; nothing here is a weight.
const OFFICES = LADDER_MARKS.reduce((rows, mark) => {
  const row = rows[rows.length - 1];
  if (row && row.tier === mark.tier) row.divisions.push(mark);
  else rows.push({ tier: mark.tier, divisions: [mark] });
  return rows;
}, []);

export default function LadderChart({ completed = 0, currentName = null }) {
  return (
    <div
      id="analyst-ladder-chart"
      className="mt-2 rounded-lg p-2.5"
      style={{ background: `${brand.navy}06`, border: `1px solid ${brand.navy}14` }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[8px] font-bold uppercase tracking-[0.24em]" style={{ color: ink.label }}>
          Ranking chart
        </p>
        <p className="text-[8px] uppercase tracking-[0.12em]" style={{ color: ink.soft }}>
          Evaluations
        </p>
      </div>

      <div className="mt-1.5 space-y-1.5">
        {OFFICES.map((office) => (
          <div key={office.tier} className="flex items-center gap-1.5">
            <p
              className="w-[54px] shrink-0 text-[8px] font-bold uppercase tracking-[0.1em]"
              style={{ color: ink.soft }}
            >
              {office.tier}
            </p>
            <div className="flex flex-1 gap-1">
              {office.divisions.map((mark) => {
                const reached = completed >= mark.sets;
                const current = mark.name === currentName;
                return (
                  <div
                    key={mark.name}
                    className="flex-1 rounded px-1 py-1 text-center"
                    style={{
                      background: current ? `${brand.gold}33` : reached ? `${brand.navy}0f` : 'transparent',
                      border: `1px solid ${current ? brand.gold : `${brand.navy}1f`}`,
                    }}
                  >
                    <p
                      className="text-[9px] font-bold leading-none"
                      style={{ color: reached ? brand.navy : ink.soft }}
                    >
                      {mark.division}
                    </p>
                    <p className="mt-0.5 text-[8px] leading-none tabular-nums" style={{ color: ink.soft }}>
                      {mark.sets}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-2 text-[8px] leading-snug" style={{ color: ink.soft }}>
        A division is conferred on the evaluations weighed. Recognition only — never read by
        discovery, ranking or scoring.
      </p>
    </div>
  );
}