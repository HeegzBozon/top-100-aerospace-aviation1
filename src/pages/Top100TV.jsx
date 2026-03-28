import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Focus, Grid3x3, Filter, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StreamPlayer from '@/components/top100tv/StreamPlayer';
import StreamContextSidecar from '@/components/top100tv/StreamContextSidecar';
import StreamGridCard from '@/components/top100tv/StreamGridCard';

export default function Top100TV() {
  const [viewMode, setViewMode] = useState('focus'); // 'focus' or 'grid'
  const [selectedStreamId, setSelectedStreamId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch streams
  const { data: streams = [], isLoading, error } = useQuery({
    queryKey: ['streams'],
    queryFn: () => base44.entities.Stream.filter({ is_active: true }, 'order', 50),
  });

  // Fetch selected stream's linked program (if any)
  const selectedStream = useMemo(
    () => streams.find(s => s.id === selectedStreamId) || streams[0],
    [streams, selectedStreamId]
  );

  const { data: linkedProgram } = useQuery({
    queryKey: ['program', selectedStream?.linked_program_id],
    queryFn: () => selectedStream?.linked_program_id
      ? base44.entities.Program.get(selectedStream.linked_program_id)
      : null,
    enabled: !!selectedStream?.linked_program_id,
  });

  // Filter streams
  const filteredStreams = useMemo(
    () => categoryFilter === 'all'
      ? streams
      : streams.filter(s => s.category === categoryFilter),
    [streams, categoryFilter]
  );

  // Initialize selected stream
  if (!selectedStreamId && streams.length > 0) {
    setSelectedStreamId(streams[0].id);
  }

  const categories = ['all', 'news', 'aviation', 'space', 'defense'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-amber-400 mx-auto" />
          <p className="text-slate-400">Loading Global Command Center…</p>
        </div>
      </div>
    );
  }

  if (error || !streams.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3 max-w-md">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <p className="text-slate-300">{error?.message || 'No streams available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-full mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <span className="text-amber-400">⚡</span> TOP 100 TV
              </h1>
              <p className="text-sm text-slate-400 mt-1">Global Aerospace Command Center</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'focus' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('focus')}
                className="gap-2"
              >
                <Focus className="w-4 h-4" />
                Focus
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="gap-2"
              >
                <Grid3x3 className="w-4 h-4" />
                Grid
              </Button>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-400'
                    : 'bg-white/5 text-slate-300 border border-white/10 hover:border-white/20'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'focus' ? (
        <div className="flex h-[calc(100vh-180px)]">
          {/* Player */}
          <div className="flex-1 flex flex-col p-4">
            {selectedStream && (
              <div className="flex-1 rounded-lg overflow-hidden shadow-2xl border border-white/10">
                <StreamPlayer
                  stream={selectedStream}
                  onError={(err) => console.error('Stream error:', err)}
                />
              </div>
            )}
          </div>

          {/* Sidecar */}
          <div className="w-80 hidden lg:flex flex-col border-l border-white/10 overflow-hidden">
            <StreamContextSidecar stream={selectedStream} program={linkedProgram} />
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStreams.map(stream => (
              <StreamGridCard
                key={stream.id}
                stream={stream}
                isSelected={selectedStream?.id === stream.id}
                onClick={() => {
                  setSelectedStreamId(stream.id);
                  setViewMode('focus');
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}