import { useQuery } from '@tanstack/react-query';
import { Award, CheckCircle2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// WHO IS BEHIND THE SIGNAL — the verified contributors bound to the programme a channel is
// covering. A channel with no programme bound to it sits quiet rather than pretending.
export default function FlightographySidecar({ stream }) {
  const { data: contextData = null, isLoading } = useQuery({
    queryKey: ['streamContext', stream?.id],
    queryFn: async () => {
      if (!stream?.id) return null;
      const response = await base44.functions.invoke('getStreamContext', {
        stream_id: stream.id,
      });
      return response.data;
    },
    enabled: !!stream?.id,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  const contributors = contextData?.verified_contributors || [];
  const program = contextData?.program;

  return (
    <section className="desk-plate flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="border-b border-editorial-copper/30 px-3.5 py-2.5">
        <p className="pd-label">Flightography</p>
        <p className="mt-0.5 truncate text-[10.5px] text-editorial-cream/45">
          {program ? `Contributors to ${program.name}` : 'No programme bound to this channel'}
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3">
        {isLoading && (
          <div className="flex items-center gap-2 py-6">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-editorial-gold" />
            <span className="text-[11px] text-editorial-cream/50">Reading the record</span>
          </div>
        )}

        {!isLoading && contributors.length === 0 && (
          <p className="py-6 text-[11px] leading-relaxed text-editorial-cream/40">
            Nothing is bound to this channel yet. When a programme is attached, the Fellows
            who built it are listed here as the signal runs.
          </p>
        )}

        {!isLoading &&
          contributors.map((contributor) => (
            <a
              key={contributor.person_id}
              href={contributor.profile_url || `/profiles/${contributor.person_id}`}
              className="mb-2 block rounded-sm border border-editorial-cream/10 px-2.5 py-2 transition-colors hover:border-editorial-copper/50"
            >
              <div className="flex items-center gap-2">
                {contributor.avatar_url && (
                  <img
                    src={contributor.avatar_url}
                    alt=""
                    className="h-6 w-6 rounded-full object-cover"
                  />
                )}
                <p className="min-w-0 flex-1 truncate text-[12px] text-editorial-cream">
                  {contributor.name}
                </p>
                {contributor.status === 'Peer Verified' && (
                  <CheckCircle2 className="h-3 w-3 flex-none text-editorial-gold" />
                )}
              </div>
              {contributor.role && (
                <p className="mt-1 truncate text-[10px] text-editorial-cream/55">
                  {contributor.role}
                </p>
              )}
              {contributor.status && (
                <span className="mt-1.5 inline-flex items-center gap-1 border border-editorial-gold/35 px-1.5 py-0.5">
                  <Award className="h-2.5 w-2.5 text-editorial-gold" />
                  <span className="text-[8px] uppercase tracking-[0.14em] text-editorial-gold">
                    {contributor.status}
                  </span>
                </span>
              )}
            </a>
          ))}
      </div>
    </section>
  );
}