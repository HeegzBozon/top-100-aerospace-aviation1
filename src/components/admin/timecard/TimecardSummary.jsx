import { TC, money, totalsOf } from '@/components/admin/timecard/timecardConfig';

function Tile({ label, value, note, accent = TC.gold }) {
  return (
    <div className="rounded-xl p-3.5" style={{ background: TC.surface, border: `1px solid ${TC.line}` }}>
      <p className="text-[10px] uppercase tracking-wider leading-none mb-1.5" style={{ color: '#6b8199' }}>{label}</p>
      <p className="text-lg font-bold leading-none tabular-nums" style={{ color: accent }}>{value}</p>
      {note && <p className="text-[10px] mt-1.5 leading-tight" style={{ color: TC.soft }}>{note}</p>}
    </div>
  );
}

// The four figures the desk opens on: hours logged, what those hours are worth, what has
// been spent, and how many entries are still waiting on a signature.
export default function TimecardSummary({ entries }) {
  const totals = totalsOf(entries);
  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      <Tile label="Hours logged" value={totals.hours.toFixed(2)} note="All time entries on the desk" />
      <Tile label="Time value" value={money(totals.timeCents)} note="Hours x rate" />
      <Tile label="Expenses" value={money(totals.expenseCents)} note="Receipts filed" accent={TC.ink} />
      <Tile
        label="Awaiting approval"
        value={totals.awaiting}
        note={totals.awaiting === 1 ? '1 entry submitted' : `${totals.awaiting} entries submitted`}
        accent="#8fd3e8"
      />
    </div>
  );
}