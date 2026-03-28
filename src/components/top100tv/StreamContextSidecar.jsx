import { ChevronRight, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StreamContextSidecar({ stream, program }) {
  if (!stream) return null;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-800/50 to-slate-900/50 border-l border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h3 className="font-semibold text-white text-sm mb-1">{stream.title}</h3>
        <p className="text-[11px] text-slate-400 capitalize">{stream.category}</p>
        {stream.sponsor_name && (
          <p className="text-[10px] text-amber-400 mt-2">Sponsored by {stream.sponsor_name}</p>
        )}
      </div>

      {/* Description */}
      {stream.description && (
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-xs text-slate-300 leading-relaxed">{stream.description}</p>
        </div>
      )}

      {/* Program Link */}
      {program && (
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-[11px] text-slate-400 mb-2 uppercase tracking-wider">Related Program</p>
          <div className="rounded-lg bg-white/5 border border-white/10 p-3 hover:border-amber-400/50 transition-colors">
            <h4 className="text-sm font-semibold text-white mb-1">{program.name}</h4>
            <p className="text-[10px] text-slate-400 line-clamp-2 mb-2">{program.description}</p>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs gap-1 h-8"
            >
              <LinkIcon className="w-3 h-3" />
              View Program
              <ChevronRight className="w-3 h-3 ml-auto" />
            </Button>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="px-4 py-3 flex-1">
        <div className="space-y-2 text-xs">
          {stream.region && (
            <div>
              <span className="text-slate-500">Region:</span>
              <span className="ml-2 text-white">{stream.region}</span>
            </div>
          )}
          <div>
            <span className="text-slate-500">Type:</span>
            <span className="ml-2 text-white capitalize">{stream.source_type}</span>
          </div>
          <div>
            <span className="text-slate-500">Status:</span>
            <span className="ml-2 inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-green-300">Live</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}