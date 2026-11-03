import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import DeskPanelBar from './DeskPanelBar';
import MeetingBookForm from './MeetingBookForm';
import MeetingDiary from './MeetingDiary';
import useTeamMeetings from './useTeamMeetings';

// The team's diary, kept on the same desk as the hours and the bills: one place to book a
// conversation, see who is already away, and settle what was decided. Admin-only.
export default function MeetingBook() {
  const { meetings, roster, absences, state, error, reload, create, patch, remove } = useTeamMeetings();
  const [me, setMe] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => setMe(null));
  }, []);

  const book = async (payload) => {
    await create(payload);
  };

  return (
    <div className="space-y-3">
      <DeskPanelBar label="Meetings" note="Book the team, not the calendar">
        <button
          type="button"
          onClick={reload}
          className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ border: '1px solid rgba(201,168,124,0.34)', color: '#dbe6ef' }}
        >
          <RefreshCw className={`h-3 w-3 ${state === 'loading' ? 'animate-spin' : ''}`} /> Re-read
        </button>
      </DeskPanelBar>

      {state === 'error' && (
        <div className="desk-plate flex items-start gap-2 px-3 py-4">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: '#e8a1a1' }} />
          <div>
            <p className="text-[13px] font-semibold" style={{ color: '#f5efe4' }}>The diary could not be read.</p>
            <p className="mt-0.5 text-[11px]" style={{ color: '#b3c6d6' }}>{error}</p>
          </div>
        </div>
      )}

      {state !== 'error' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
          <MeetingBookForm
            roster={roster}
            absences={absences}
            meetings={meetings}
            onBook={book}
            me={me}
          />

          {state === 'loading' ? (
            <div className="space-y-2">
              <div className="h-14 animate-pulse rounded" style={{ background: '#111d2a' }} />
              <div className="h-14 animate-pulse rounded" style={{ background: '#111d2a' }} />
            </div>
          ) : (
            <MeetingDiary
              meetings={meetings}
              onDone={(meeting) => patch(meeting, { status: 'done' })}
              onCancel={(meeting) => patch(meeting, { status: 'cancelled' })}
              onDelete={remove}
            />
          )}
        </div>
      )}
    </div>
  );
}