import { C } from '@/components/crm/crmConfig';
import { PURPOSES, FORMATS, label, when } from './meetingConfig';

const STATUS = { requested: 'Awaiting reply', accepted: 'Confirmed', declined: 'Declined', cancelled: 'Cancelled' };

export default function MeetingRow({ m, incoming, onStatus }) {
  const other = incoming ? (m.requester_name || m.requester_email) : (m.recipient_name || m.recipient_email);
  const btn = 'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]';
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg bg-white p-3" style={{ border: `1px solid ${C.border}` }}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold" style={{ color: C.navy }}>{label(PURPOSES, m.purpose)} with {other}</p>
        <p className="text-[11px]" style={{ color: C.muted }}>{when(m.start_time)} · {m.duration_minutes || 30} min · {label(FORMATS, m.format)} · {STATUS[m.status]}</p>
        {m.agenda && <p className="mt-1 text-xs" style={{ color: C.navy }}>{m.agenda}</p>}
      </div>
      {m.status === 'requested' && (incoming ? (
        <div className="flex gap-1">
          <button className={btn} style={{ background: '#B87333', color: '#fff' }} onClick={() => onStatus(m, 'accepted')}>Accept</button>
          <button className={btn} style={{ border: `1px solid ${C.border}`, color: C.navy }} onClick={() => onStatus(m, 'declined')}>Decline</button>
        </div>
      ) : (
        <button className={btn} style={{ border: `1px solid ${C.border}`, color: C.navy }} onClick={() => onStatus(m, 'cancelled')}>Cancel</button>
      ))}
    </div>
  );
}