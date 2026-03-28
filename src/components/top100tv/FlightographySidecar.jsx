import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Award, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * FlightographySidecar - Displays verified contributors to the selected program/stream
 * Queries the Aerospace Talent Graph for Person -> contributed to -> Program relationships
 */
export default function FlightographySidecar({ stream }) {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!stream?.graph_bindings?.linked_programs?.length) {
      setContributors([]);
      return;
    }

    const fetchContributors = async () => {
      setLoading(true);
      setError(null);
      try {
        const programIds = stream.graph_bindings.linked_programs.map(p => p.program_id);
        
        // Query Aerospace Talent Graph for contributors to these programs
        const results = await Promise.all(
          programIds.map(programId =>
            base44.asServiceRole.functions.invoke('queryTalentGraphContributors', {
              programId,
              limit: 5,
            }).catch(() => ({ contributors: [] }))
          )
        );

        // Flatten and deduplicate
        const allContributors = [];
        const seen = new Set();
        results.forEach(result => {
          result.contributors?.forEach(contributor => {
            if (!seen.has(contributor.id)) {
              allContributors.push(contributor);
              seen.add(contributor.id);
            }
          });
        });

        setContributors(allContributors.slice(0, 8));
      } catch (err) {
        console.error('[FlightographySidecar] Error fetching contributors:', err);
        setError('Could not load contributors');
      } finally {
        setLoading(false);
      }
    };

    fetchContributors();
  }, [stream]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-black/40 to-black/60 border-t border-white/10 pt-4">
      {/* Header */}
      <div className="px-4 pb-3 border-b border-white/10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-1">
          Flightography
        </h3>
        {stream?.graph_bindings?.linked_programs?.[0] && (
          <p className="text-[10px] text-slate-400">
            Contributors to {stream.graph_bindings.linked_programs[0].name}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading && (
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

        {!loading && !error && contributors.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-6">
            No contributors found for this program.
          </p>
        )}

        {!loading && contributors.map(contributor => (
          <div
            key={contributor.id}
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
              {contributor.verified_status === 'fully_verified' && (
                <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
              )}
            </div>

            {/* Role + Dates */}
            {contributor.role && (
              <p className="text-[10px] text-slate-300 mb-1">
                {contributor.role}
              </p>
            )}

            {contributor.contribution_dates && (
              <p className="text-[9px] text-slate-500">
                {contributor.contribution_dates}
              </p>
            )}

            {/* Peer Verified Badge */}
            {contributor.peer_verified && (
              <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-green-500/20 border border-green-500/30">
                <Award className="w-2.5 h-2.5 text-green-400" />
                <span className="text-[8px] font-semibold text-green-300">
                  Peer Verified
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      {stream?.graph_bindings?.linked_programs?.[0] && (
        <div className="px-4 py-3 border-t border-white/10">
          <a
            href={`/articles/${stream.graph_bindings.linked_programs[0].program_id}`}
            className="w-full block text-center px-3 py-1.5 rounded text-[10px] font-semibold bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 transition-colors"
          >
            View Full Program
          </a>
        </div>
      )}
    </div>
  );
}