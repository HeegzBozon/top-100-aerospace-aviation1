import { TC } from '@/components/admin/timecard/timecardConfig';
import { KINDS, dayShort, dayNum } from '@/components/admin/timecard/scheduleConfig';

// Two readouts the desk needs before it reads the week itself: who is out, and which
// campus rooms are carrying a shift — the same list that staffs a room for an event.
export default function AwayBand({ away, coverage }) {
  if (away.length === 0 && coverage.length === 0) return null;

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <div className="rounded-xl px-3 py-2.5" style={{ background: TC.surface, border: `1px solid ${TC.line}` }}>
        <p className="text-[9px] uppercase tracking-[0.16em]" style={{ color: TC.soft }}>Away this week</p>
        {away.length === 0 ? (
          <p className="mt-1 text-[11px]" style={{ color: TC.dim }}>Nobody is out this week.</p>
        ) : (
          <ul className="mt-1 space-y-0.5">
            {away.map((row) => (
              <li key={row.id} className="flex items-baseline gap-1.5 text-[11px]">
                <span className="font-semibold" style={{ color: TC.ink }}>{row.person}</span>
                <span style={{ color: KINDS[row.kind]?.tone || TC.soft }}>{KINDS[row.kind]?.label || row.kind}</span>
                <span className="tabular-nums" style={{ color: TC.soft }}>
                  {dayShort(row.iso)} {dayNum(row.iso)}
                </span>
                {row.note && <span className="truncate italic" style={{ color: TC.dim }}>· {row.note}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl px-3 py-2.5" style={{ background: TC.surface, border: `1px solid ${TC.line}` }}>
        <p className="text-[9px] uppercase tracking-[0.16em]" style={{ color: TC.soft }}>Rooms carrying a shift</p>
        {coverage.length === 0 ? (
          <p className="mt-1 text-[11px]" style={{ color: TC.dim }}>No room is staffed this week.</p>
        ) : (
          <div className="mt-1 flex flex-wrap gap-1">
            {coverage.map((room) => (
              <span
                key={room.key}
                className="rounded px-1.5 py-0.5 text-[10px]"
                style={{ color: TC.gold, border: '1px solid rgba(201,168,124,0.35)' }}
              >
                {room.label} <span className="tabular-nums opacity-70">×{room.count}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}