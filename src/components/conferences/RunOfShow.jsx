import { useState } from 'react';
import { Loader2, Radio } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from './conferenceConfig';

const STAGES = [
  { key: 'open', label: 'Not started' },
  { key: 'live', label: 'In session' },
  { key: 'closed', label: 'Closed' },
];

const stageOf = (room) => {
  if (['closed', 'archived'].includes(room?.status)) return 'closed';
  if (room?.status === 'live') return 'live';
  return 'open';
};

// The host's run of show. Two decisions, made in the room and nowhere else: whether the
// conference is open, in session or closed, and which of its focus areas is on now. The
// server checks that the caller is this conference's host before either is written.
export default function RunOfShow({ room, accent, onChanged }) {
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  const areas = room?.focus_areas || [];
  const stage = stageOf(room);
  const liveKey = room?.live_focus_key || '';

  const write = async (patch, tag) => {
    if (!room?.id) return;
    setBusy(tag);
    setError('');
    try {
      const response = await base44.functions.invoke('conferenceService', {
        action: 'setStage',
        room_id: room.id,
        ...patch,
      });
      const data = response?.data ?? response;
      if (data?.error) throw new Error(data.error);
      onChanged?.();
    } catch (writeError) {
      setError(writeError?.message || 'The stage could not be set.');
    } finally {
      setBusy(null);
    }
  };

  // A draft is hidden from the circuit, so it has no stage to run yet: publishing it stays a
  // deliberate act in the editor rather than the first button a host presses here.
  if (room?.status === 'draft') {
    return (
      <div className="rounded-sm p-3.5" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: B.copper }}>
          Run of show
        </p>
        <p className="mt-1.5 text-[11.5px] leading-relaxed" style={{ color: B.muted }}>
          This conference is still a draft. Open it from the editor when the record is ready, and
          the run of show appears here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-sm p-3.5" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: B.copper }}>
        Run of show · yours to run
      </p>

      <div className="mt-2 flex gap-1">
        {STAGES.map((item) => {
          const active = stage === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => write({ status: item.key }, `stage-${item.key}`)}
              disabled={!!busy}
              aria-pressed={active}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.12em] disabled:opacity-50"
              style={{
                background: active ? accent : '#fff',
                color: active ? '#fff' : B.navy,
                border: `1px solid ${active ? accent : B.border}`,
              }}
            >
              {busy === `stage-${item.key}` && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
              {item.label}
            </button>
          );
        })}
      </div>

      {areas.length > 0 && (
        <>
          <p className="mt-3 text-[9.5px] font-bold uppercase tracking-[0.16em]" style={{ color: B.muted }}>
            In the room now
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => write({ live_focus_key: '' }, 'room-none')}
              disabled={!!busy}
              aria-pressed={!liveKey}
              className="rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.12em] disabled:opacity-50"
              style={{
                background: !liveKey ? B.navy : '#fff',
                color: !liveKey ? '#fff' : B.navy,
                border: `1px solid ${!liveKey ? B.navy : B.border}`,
              }}
            >
              None
            </button>
            {areas.map((area) => {
              const active = liveKey === area.key;
              return (
                <button
                  key={area.key}
                  type="button"
                  onClick={() => write({ live_focus_key: area.key }, `room-${area.key}`)}
                  disabled={!!busy}
                  aria-pressed={active}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.12em] disabled:opacity-50"
                  style={{
                    background: active ? accent : '#fff',
                    color: active ? '#fff' : B.navy,
                    border: `1px solid ${active ? accent : B.border}`,
                  }}
                >
                  {busy === `room-${area.key}` && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                  {area.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 flex items-center gap-1 text-[10px] italic" style={{ color: B.muted }}>
            <Radio className="h-2.5 w-2.5" /> Everyone in the room sees this while it is in session.
          </p>
        </>
      )}

      {error && <p className="mt-2 text-[11.5px] leading-relaxed" style={{ color: '#8c2f2f' }}>{error}</p>}
    </div>
  );
}