import { Plus, Trash2 } from 'lucide-react';
import { TC } from '@/components/admin/timecard/timecardConfig';
import { CAMPUS_ROOMS, minutesBetween, roomLabel } from '@/components/admin/timecard/scheduleConfig';
import { minutesLabel } from '@/components/admin/timecard/worklogConfig';

const FIELD = 'w-full rounded-lg px-2.5 py-2 text-sm outline-none focus:ring-1';
const fieldStyle = { background: '#0e141b', border: `1px solid ${TC.line}`, color: TC.ink };

// Where the time was actually spent on campus: a session can be split across rooms, so
// each room carries its own minutes. Part of a shift may be off the floor, and the total
// sitting under the reported hours is shown rather than silently reconciled.
export default function RoomsWorkedField({ rooms, hours = 0, onChange }) {
  const rows = Array.isArray(rooms) ? rooms : [];
  const logged = rows.reduce((sum, row) => sum + (Number(row.minutes) || 0), 0);
  const expected = Math.round((Number(hours) || 0) * 60);

  const setRow = (index, key, value) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

  const addRow = () => onChange([...rows, { room_key: CAMPUS_ROOMS[1]?.key || '', minutes: '', note: '' }]);

  const dropRow = (index) => onChange(rows.filter((_, i) => i !== index));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>
          Rooms worked on campus
        </p>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: TC.gold, border: `1px solid ${TC.line}` }}
        >
          <Plus className="h-3 w-3" /> Add room
        </button>
      </div>

      {rows.length === 0 && (
        <p className="rounded-lg px-2.5 py-2 text-[11px]" style={{ color: TC.soft, border: `1px dashed ${TC.line}` }}>
          No room logged — the hours were spent off the floor.
        </p>
      )}

      {rows.map((row, index) => (
        <div key={index} className="flex flex-wrap items-center gap-1.5">
          <select
            value={row.room_key || ''}
            onChange={(event) => setRow(index, 'room_key', event.target.value)}
            className={`${FIELD} min-w-0 flex-1`}
            style={fieldStyle}
          >
            <option value="">Pick a room</option>
            {CAMPUS_ROOMS.map((room) => (
              <option key={room.key} value={room.key}>{room.label}</option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            step="5"
            value={row.minutes ?? ''}
            onChange={(event) => setRow(index, 'minutes', event.target.value)}
            className={`${FIELD} w-20`}
            style={fieldStyle}
            placeholder="min"
            title="Minutes spent in this room"
          />
          <button
            type="button"
            onClick={() => dropRow(index)}
            title="Remove room"
            className="rounded-md p-1.5 hover:bg-white/10"
            style={{ color: TC.soft }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      {rows.length > 0 && (
        <p className="text-[10px]" style={{ color: logged && expected && logged !== expected ? TC.gold : '#4e677d' }}>
          {minutesLabel(logged)} on rooms
          {expected ? ` · ${minutesLabel(expected)} filed${logged !== expected ? ' — the rest was off the floor' : ''}` : ''}
        </p>
      )}
    </div>
  );
}