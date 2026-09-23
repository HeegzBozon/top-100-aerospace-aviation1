import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Unreviewed NominationIntake counts per track (new + reviewing).
export default function useIntakeBacklog() {
  const { data, isLoading } = useQuery({
    queryKey: ['season-manager-intake-backlog'],
    queryFn: async () => {
      const [fresh, reviewing] = await Promise.all([
        base44.entities.NominationIntake.filter({ status: 'new' }, '-created_date', 5000),
        base44.entities.NominationIntake.filter({ status: 'reviewing' }, '-created_date', 5000),
      ]);
      const counts = {};
      [...fresh, ...reviewing].forEach((n) => { counts[n.nomination_type] = (counts[n.nomination_type] || 0) + 1; });
      return counts;
    },
  });
  return { counts: data || {}, loading: isLoading };
}