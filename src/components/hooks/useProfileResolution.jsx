import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useProfileResolution(targetId, targetEmail) {
  return useQuery({
    queryKey: ['profileResolution', targetId, targetEmail],
    queryFn: async () => {
      if (!targetId && !targetEmail) {
        return {
          user: null,
          nominee: null,
          startup: null,
          provider: null,
          employer: null,
        };
      }

      let nominee = null;

      // Fetch nominee by ID if targetId provided
      if (targetId) {
        try {
          nominee = await base44.entities.Nominee.get(targetId);
        } catch (error) {
          // Nominee not found by ID, fall through to email lookup
        }
      }

      // Fetch nominee by email if no match yet
      if (!nominee && targetEmail) {
        try {
          const nominees = await base44.entities.Nominee.filter({
            nominee_email: targetEmail,
          });
          if (nominees.length > 0) {
            nominee = nominees[0];
          }
        } catch (error) {
          // Continue
        }
      }

      return {
        user: null,
        nominee: nominee || null,
        startup: null,
        provider: null,
        employer: null,
      };
    },
    enabled: !!(targetId || targetEmail),
    retry: 1,
  });
}