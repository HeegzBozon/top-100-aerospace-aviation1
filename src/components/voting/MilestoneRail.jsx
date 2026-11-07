import { brand, ink } from '@/components/nominate/NominateConfig';

// The interim marks, read as one rail across the record.
//
// The named levels are few and far apart; the marks between them are what keep the work
// feeling like progress. Each mark the house names is a tick on this rail, the ones already
// passed are struck in navy, the one being worked towards is lit in gold, and the caption
// says only the distance left. Nothing here is a score: the rail is the Fellow's own
// record, never read by discovery, ordering or measurement.
export default function MilestoneRail({ ladder = [], earned = new Set(), completed = 0 }) {
  const marks = ladder.filter((m) => m.sets);
  if (!marks.length) return null;

  const isGot = (m) => earned.has(m.key) || completed >= m.sets;
  const next = marks.find((m) => m.sets > completed) || null;
  const climbed = marks.filter(isGot).length;

  return (
    <div className="mt-3">
      <div className="flex items-end gap-[3px]" aria-hidden>
        {marks.map((m) => {
          const got = isGot(m);
          const now = next && m.sets === next.sets;
          return (
            <span
              key={m.key}
              className="h-[4px] flex-1 rounded-full transition-all duration-500"
              style={{
                background: got ? brand.navy : now ? brand.gold : `${brand.navy}14`,
                boxShadow: now ? `0 0 7px 0 ${brand.gold}` : 'none',
              }}
            />
          );
        })}
      </div>

      <div className="mt-1.5 flex items-baseline justify-between gap-2">
        <p className="text-[9.5px]" style={{ color: ink.soft }}>
          {next
            ? `${next.sets - completed} ${next.sets - completed === 1 ? 'set' : 'sets'} to the ${next.sets}-set mark`
            : 'Every mark on the rail climbed.'}
        </p>
        <p className="shrink-0 text-[9px] font-semibold tabular-nums" style={{ color: ink.soft }}>
          {climbed}/{marks.length}
        </p>
      </div>
    </div>
  );
}