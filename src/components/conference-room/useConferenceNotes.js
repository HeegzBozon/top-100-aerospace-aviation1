import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Loads comments + attachments for a Conference Room and keeps them in sync
// via realtime subscriptions. Notes are Fellow-owned coordination artifacts;
// never measurement-bearing.
export default function useConferenceNotes(roomId) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!roomId) { setNotes([]); return; }
    setLoading(true);
    try {
      const list = await base44.entities.ConferenceRoomNote.filter(
        { room_id: roomId },
        '-created_date',
        200
      );
      setNotes(list || []);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!roomId) return;
    const unsub = base44.entities.ConferenceRoomNote.subscribe(() => { load(); });
    return unsub;
  }, [roomId]);

  return { notes, loading, reload: load };
}