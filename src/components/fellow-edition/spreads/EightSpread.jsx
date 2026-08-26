import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// The Eight as a featured editorial spread. Position 1 reads as position 1.
// Vacant slots always render as visible outlined placeholders with the
// position number — vacancy is the call to action.
export default function EightSpread({ fellowEmail, accent }) {
  const [entries, setEntries] = useState(null);

  useEffect(() => {
    base44.entities.UserTop100List.filter({ user_email: fellowEmail }, '-created_date', 1)
      .then((lists) => setEntries(lists[0]?.rankings?.slice(0, 8) || []))
      .catch(() => setEntries([]));
  }, [fellowEmail]);

  if (!entries) {
    return (
      <div className="h-full w-full flex items-center justify-center" style={{ background: B.cream }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(30,58,90,0.15)', borderTopColor: accent }} />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col p-10" style={{ background: B.cream }}>
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: B.navy }}>The Eight</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>Personal Canon</span>
      </div>

      <div className="flex-1 space-y-2 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => {
          const e = entries[i];
          return (
            <div
              key={i}
              className="flex items-center gap-3 py-2"
              style={{ borderBottom: '1px solid rgba(30,58,90,0.08)' }}
            >
              <span
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  background: e ? accent : 'transparent',
                  color: e ? B.navy : 'rgba(30,58,90,0.3)',
                  border: e ? 'none' : `1px solid rgba(30,58,90,0.2)`,
                }}
              >
                {i + 1}
              </span>
              {e ? (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate" style={{ color: B.navy }}>{e.nominee_name}</p>
                  <p className="text-xs truncate" style={{ color: 'rgba(30,58,90,0.55)' }}>
                    {e.nominee_title}{e.nominee_company ? ` · ${e.nominee_company}` : ''}
                  </p>
                </div>
              ) : (
                <p className="text-xs italic" style={{ color: 'rgba(30,58,90,0.35)' }}>Position vacant</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}