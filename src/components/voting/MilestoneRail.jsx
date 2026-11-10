import { brand, ink } from '@/components/nominate/NominateConfig';
import { LADDER_MARKS, markAhead } from '@/components/voting/ladderMarks';

// The named marks, read as one rail across the record.
//
// The named offices are few and far apart; the marks between them are what keep the work
// feeling like progress. Each mark the house names is a tick on this rail — the ones already
// passed are struck in navy, the office marks stand in gold and taller than the marks
// between them, and the one being worked towards is lit. The caption carries the name of the
// mark ahead, because a Fellow should be able to say what they are working towards.
//
// Nothing here is a score: the rail is the Fellow's own record, never read by discovery,
// ordering or measurement.
export default function MilestoneRail({ completed = 0 }) {
  const done = Math.max(0, Number(completed) || 0);
  const next = markAhead(done);
  const climbed = LADDER_MARKS.filter((mark) => done >= mark.sets).length;

  return (
    <div className="mt-3">
      <div className="flex items-end gap-[3px]" aria-hidden>
        {LADDER_MARKS.map((mark) => {
          const got = done >= mark.sets;
          const now = next && mark.sets === next.sets;
          return (
            <span
              key={mark.sets}
              className={`flex-1 rounded-full transition-all duration-500 ${mark.level ? 'h-[7px]' : 'h-[4px]'}`}
              style={{
                background: got
                  ? mark.level ? brand.gold : brand.navy
                  : now ? brand.gold : `${brand.navy}14`,
                boxShadow: now ? `0 0 7px 0 ${brand.gold}` : 'none',
              }}
            />
          );
        })}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <p className="min-w-0 text-[9.5px] leading-snug" style={{ color: ink.soft }}>
          {next ? (
            <>
              <span className="font-semibold uppercase tracking-[0.1em]" style={{ color: ink.label }}>
                {next.name}
              </span>
              {' — '}
              {next.sets - done} {next.sets - done === 1 ? 'evaluation' : 'evaluations'} to go
            </>
          ) : (
            'Every division on the ladder climbed.'
          )}
        </p>
        <p className="shrink-0 text-[9px] font-semibold tabular-nums" style={{ color: ink.soft }}>
          {climbed}/{LADDER_MARKS.length}
        </p>
      </div>
    </div>
  );
}