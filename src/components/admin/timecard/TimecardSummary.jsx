import DeskTile from '@/components/admin/desk/DeskTile';
import { money, totalsOf } from '@/components/admin/timecard/timecardConfig';

const localISO = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// How the week has been kept: the days in the last seven that carry a page, and the
// entries on them. A desk with nothing outstanding is stamped clear, because a chore
// finished should say so out loud.
const weekOf = (entries) => {
  const days = [];
  for (let i = 0; i < 7; i += 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(localISO(date));
  }
  const written = days.filter((day) => entries.some((entry) => entry.entry_date === day));
  return { written: written.length, week: entries.filter((entry) => days.includes(entry.entry_date)).length };
};

export default function TimecardSummary({ entries }) {
  const totals = totalsOf(entries);
  const { written, week } = weekOf(entries);
  const clear = entries.length > 0 && totals.awaiting === 0;

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <DeskTile
          label="Hours logged"
          value={totals.hours.toFixed(2)}
          note="Every time entry on the desk"
          meter={Math.min(totals.hours / 40, 1)}
        />
        <DeskTile label="Time value" value={money(totals.timeCents)} note="Hours × rate" tone="#8f5c2c" />
        <DeskTile label="Expenses" value={money(totals.expenseCents)} note="Receipts filed" tone="#8f5c2c" />
        <DeskTile
          label="Awaiting approval"
          value={totals.awaiting}
          note={totals.awaiting === 1 ? '1 entry submitted' : `${totals.awaiting} entries submitted`}
        />
      </div>

      <div className="desk-plate flex flex-wrap items-center justify-between gap-3 px-3.5 py-3">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: '#c9a87c' }}>
            The week's pages
          </p>
          <p className="mt-1.5 text-xs" style={{ color: '#a8bed2' }}>
            <span className="tabular-nums">{written}</span> of the last seven days written ·{' '}
            <span className="tabular-nums">{week}</span> {week === 1 ? 'entry' : 'entries'} filed
          </p>
          <div className="desk-meter mt-2 w-44">
            <span style={{ width: `${(written / 7) * 100}%` }} />
          </div>
        </div>
        {clear ? (
          <span className="desk-stamp" style={{ color: '#7ec89a' }}>
            Ledger clear
          </span>
        ) : (
          <span className="text-[10px]" style={{ color: '#5d7a94' }}>
            {totals.awaiting > 0 ? 'A signature is still owed.' : 'Nothing filed yet.'}
          </span>
        )}
      </div>
    </div>
  );
}