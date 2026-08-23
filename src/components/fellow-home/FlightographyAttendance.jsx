import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { B } from './fellowHomeConfig';
import { ShieldCheck, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';

// Verified conference attendance — the only attendance signal that ever
// renders on Flightography. Declared RSVPs never appear here; only records
// promoted by a facilitator/admin after the event ends. Reputation, not
// intention. Reads by fellow_email; public via RLS.
export default function FlightographyAttendance({ fellowEmail, accent }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    if (!fellowEmail) { setRows([]); return; }
    let live = true;
    base44.entities.ConferenceAttendance.filter({ fellow_email: fellowEmail }, '-start_date', 50)
      .then((r) => live && setRows(r || []))
      .catch(() => live && setRows([]));
    return () => { live = false; };
  }, [fellowEmail]);

  if (!rows || !rows.length) return null;

  return (
    <div className="rounded-2xl px-5 py-4" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-3.5 h-3.5" style={{ color: accent }} />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>Verified Attendance</p>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: B.navy }}>{a.conference_name}</p>
              {(a.city || a.country) && (
                <p className="text-[10px] flex items-center gap-1" style={{ color: B.muted }}>
                  <MapPin className="w-2.5 h-2.5" /> {[a.city, a.country].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            <span className="text-[10px] shrink-0" style={{ color: B.muted }}>
              {a.start_date && format(parseISO(a.start_date), 'MMM yyyy')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}