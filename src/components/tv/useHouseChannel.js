import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// The programme on the house's own channel. One read of a channel's latest uploads,
// held for a while so changing channel and coming back does not read YouTube again.
export default function useHouseChannel(channel) {
  const handle = channel?.handle;
  const channelId = channel?.channelId;
  const subject = channelId || handle;

  const query = useQuery({
    queryKey: ['tvHouseChannel', subject],
    queryFn: async () => {
      const response = await base44.functions.invoke('getChannelUploads', { handle, channelId, max: 12 });
      return response.data;
    },
    enabled: !!subject,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  return {
    channel: query.data?.channel || null,
    videos: query.data?.videos || [],
    isLoading: query.isLoading,
    error: query.error,
    reload: query.refetch,
  };
}