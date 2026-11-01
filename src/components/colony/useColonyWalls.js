import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { COLONY_ROOMS } from '@/components/colony/colonyZones';

// A room's barriers: the admin-saved layout when there is one, else the built-in walls.
export default function useColonyWalls(room) {
  const [record, setRecord] = useState(null);
  useEffect(() => {
    setRecord(null);
    base44.entities.ColonyMapLayout.filter({ room }).then(r => setRecord(r[0] || null)).catch(() => {});
  }, [room]);

  const save = useCallback(async (walls) => {
    const next = record
      ? await base44.entities.ColonyMapLayout.update(record.id, { walls })
      : await base44.entities.ColonyMapLayout.create({ room, walls });
    setRecord(next);
  }, [record, room]);

  const reset = useCallback(async () => {
    if (record) await base44.entities.ColonyMapLayout.delete(record.id);
    setRecord(null);
  }, [record]);

  return { walls: record?.walls || COLONY_ROOMS[room]?.walls || [], custom: !!record, save, reset };
}