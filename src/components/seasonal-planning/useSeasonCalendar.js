import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Events, conferences and dated roadmap items that fall inside one season.
export default function useSeasonCalendar(season) {
  return useQuery({
    queryKey: ['season-calendar', season.start],
    queryFn: async () => {
      const range = { $gte: season.start, $lte: `${season.end}T23:59:59` };
      const [events, rooms, items] = await Promise.all([
        base44.entities.Event.filter({ event_date: range }, 'event_date', 100).catch(() => []),
        base44.entities.ConferenceRoom.filter({ start_date: { $gte: season.start, $lte: season.end } }, 'start_date', 100).catch(() => []),
        base44.entities.RoadmapItem.filter({ target_date: { $gte: season.start, $lte: season.end } }, 'target_date', 100).catch(() => []),
      ]);
      return [
        ...events.map((e) => ({ id: e.id, kind: 'event', date: e.event_date.slice(0, 10), title: e.title })),
        ...rooms.map((r) => ({ id: r.id, kind: 'conference', date: r.start_date, end: r.end_date, title: r.conference_name })),
        ...items.map((i) => ({ id: i.id, kind: 'milestone', date: i.target_date.slice(0, 10), title: i.title })),
      ].sort((a, b) => a.date.localeCompare(b.date));
    },
  });
}