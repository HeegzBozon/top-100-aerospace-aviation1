import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle, Award, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * FlightographySidecar - Displays verified contributors to the selected program/stream
 * Fetches from getStreamContext endpoint for real-time talent graph data
 */
export default function FlightographySidecar({ stream }) {
  // Fetch stream context from backend (indexed talent graph query)
  const { data: contextData = null, isLoading, error } = useQuery({
    queryKey: ['streamContext', stream?.id],
    queryFn: async () => {
      if (!stream?.id) return null;
      try {
        const response = await base44.functions.invoke('getStreamContext', {
          stream_id: stream.id,
        });
        return response.data;
      } catch (err) {
        console.error('[FlightographySidecar] Context fetch error:', err);
        return null;
      }
    },
    enabled: !!stream?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });

  const contributors = contextData?.verified_contributors || [];
  const program = contextData?.program;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-black/40 to-black/60 border-t border-white/10 pt-4">
      {/* Header */}
      <div className="px-4 pb-3 border-b border-white/10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-1">
          Flightography
        </h3>
        {program && (
          <p className="text-[10px] text-slate-400">
            Contributors to {program.name}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {isLoading && (
          <div className="flex items-center justify-center py-8 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span className="text-xs text-slate-400">Loading...</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-2 rounded bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-[10px] text-red-300">{error}</span>
          </div>
        )}

        {!isLoading && !error && contributors.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-6">
            No contributors found for this program.
          </p>
        )}

        {!isLoading && contributors.map(contributor => (
          <div
            key={contributor.person_id}
            className="rounded-lg bg-white/5 border border-white/10 p-2.5 hover:bg-white/10 transition-colors"
          >
            {/* Avatar + Name */}
            <div className="flex items-center gap-2 mb-1.5">
              {contributor.avatar_url && (
                <img
                  src={contributor.avatar_url}
                  alt={contributor.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {contributor.name}
                </p>
              </div>
              {contributor.status === 'Peer Verified' && (
                <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
              )}
            </div>

            {/* Role + Subsystem */}
            {contributor.role && (
              <p className="text-[10px] text-slate-300 mb-1">
                {contributor.role}
              </p>
            )}

            {contributor.subsystem && (
              <p className="text-[9px] text-slate-500">
                {contributor.subsystem}
              </p>
            )}

            {/* Verified Badge */}
            {contributor.status && (
              <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-green-500/20 border border-green-500/30">
                <Award className="w-2.5 h-2.5 text-green-400" />
                <span className="text-[8px] font-semibold text-green-300">
                  {contributor.status}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      {program && (
        <div className="px-4 py-3 border-t border-white/10">
          <a
            href={`/articles/${program.program_id}`}
            className="w-full block text-center px-3 py-1.5 rounded text-[10px] font-semibold bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 transition-colors"
          >
            View Full Program
          </a>
        </div>
      )}
    </div>
  );
}