import { X } from 'lucide-react';
import { TC } from '@/components/admin/timecard/timecardConfig';
import { elapsedLabel, clockLabel } from '@/components/admin/timecard/clockPunch';

// The shift the clock is holding. While a punch is running the desk shows it as a live
// instrument rather than as a state hidden behind a key: the lamp, the hour it started,
// the elapsed measure in an ivory face — and, plainly, the way to scrap it. A clock
// started by mistake must be as easy to take back as it was to start.
export default function ShiftStrip({ punch, now, onCancel }) {
  return (
    <div
      className="desk-plate flex flex-wrap items-center gap-3 px-3.5 py-2.5"
      style={{ boxShadow: 'inset 0 0 0 1px rgba(184,115,51,0.34), 0 14px 30px -24px rgba(3,8,15,0.95)' }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="desk-lamp" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: TC.gold }}>
            Shift in progress
          </p>
          <p className="mt-1 truncate text-[11px]" style={{ color: TC.soft }}>
            On the clock since {clockLabel(punch?.started_at)}
            {punch?.timezone ? ` · ${punch.timezone}` : ''}
          </p>
        </div>
      </div>

      <div className="desk-face px-3 py-1.5 text-right">
        <p className="text-[8.5px] font-bold uppercase leading-none tracking-[0.2em]" style={{ color: '#8f5c2c' }}>
          Elapsed
        </p>
        <p className="mt-1 font-heading text-xl leading-none tabular-nums" style={{ color: '#1e3a5a' }}>
          {elapsedLabel(punch?.started_at, now)}
        </p>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="desk-key desk-key-quiet"
        title="Scrap this clock-in without filing any hours"
      >
        <X className="h-3 w-3" /> Cancel clock-in
      </button>
    </div>
  );
}