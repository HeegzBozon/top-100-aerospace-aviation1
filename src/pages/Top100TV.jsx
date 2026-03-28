import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Focus, Grid3x3, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StreamPlayer from '@/components/top100tv/StreamPlayer';
import StreamContextSidecar from '@/components/top100tv/StreamContextSidecar';
import StreamGridCard from '@/components/top100tv/StreamGridCard';
import FlightographySidecar from '@/components/top100tv/FlightographySidecar';

const DOMAIN_COLORS = {
  'Space Exploration & Systems': 'from-purple-600 to-purple-800',
  'Commercial Aviation': 'from-blue-600 to-blue-800',
  'Defense & National Security': 'from-red-600 to-red-800',
};

const DOMAIN_ACCENTS = {
  'Space Exploration & Systems': '#a855f7',
  'Commercial Aviation': '#3b82f6',
  'Defense & National Security': '#ef4444',
};

export default function Top100TV() {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedStreamId, setSelectedStreamId] = useState(null);

  // Fetch streams from backend API (cached 5 minutes)
  const { data: streams = [], isLoading: streamsLoading } = useQuery({
    queryKey: ['tvStreams'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getTVStreams', {});
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // Set default selected stream on initial load
  useMemo(() => {
    if (selectedStreamId === null && streams.length > 0) {
      setSelectedStreamId(streams[0].id);
    }
  }, [streams, selectedStreamId]);

  const selectedStream = useMemo(
    () => streams.find(s => s.id === selectedStreamId) || streams[0],
    [selectedStreamId, streams]
  );

  // Group streams by row for grid layout
  const streamsByRow = useMemo(() => {
    const grouped = { 1: [], 2: [], 3: [] };
    streams.forEach(stream => {
      const row = stream.grid_row || 1;
      if (grouped[row]) grouped[row].push(stream);
    });
    return grouped;
  }, [streams]);

  if (streamsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-amber-400 mx-auto" />
          <p className="text-slate-400">Loading TOP 100 TV...</p>
        </div>
      </div>
    );
  }

  if (!streams.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3 max-w-md">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <p className="text-slate-300">No streams available</p>
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
              <p className="text-sm text-slate-400 mt-1">The Aerospace Talent Graph's Operating System</p>
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

          {/* Domain legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {Object.entries(DOMAIN_COLORS).map(([domain, colors]) => (
              <div key={domain} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors}`} />
                <span className="text-slate-300">{domain}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'focus' ? (
        <div className="flex h-[calc(100vh-200px)]">
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
          <div className="w-80 hidden lg:flex flex-col border-l border-white/10 overflow-hidden bg-black/20">
            <FlightographySidecar stream={selectedStream} />
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Quick Access</p>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {streams.map(stream => (
                  <button
                    key={stream.id}
                    onClick={() => setSelectedStreamId(stream.id)}
                    className={`px-2 py-1.5 rounded text-xs font-semibold transition-all ${
                      selectedStream?.id === stream.id
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {stream.icon} {stream.title.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          {/* ROW 1: Space Frontier */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-6 rounded-full bg-gradient-to-b ${DOMAIN_COLORS['Space Exploration & Systems']}`} />
              <h2 className="text-lg font-bold">Row 1: Space Frontier</h2>
              <span className="text-xs text-slate-400">($600B Space Tech Market)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {streamsByRow[1]?.map(stream => (
                <StreamGridCard
                  key={stream.id}
                  stream={stream}
                  isSelected={selectedStream?.id === stream.id}
                  onClick={() => {
                    setSelectedStreamId(stream.id);
                    setViewMode('focus');
                  }}
                  accentColor={DOMAIN_ACCENTS[stream.domain]}
                />
              ))}
            </div>
          </div>

          {/* ROW 2: Commercial Aviation */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-6 rounded-full bg-gradient-to-b ${DOMAIN_COLORS['Commercial Aviation']}`} />
              <h2 className="text-lg font-bold">Row 2: Commercial Aviation Operations</h2>
              <span className="text-xs text-slate-400">(Global Hub Traffic)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {streamsByRow[2]?.map(stream => (
                <StreamGridCard
                  key={stream.id}
                  stream={stream}
                  isSelected={selectedStream?.id === stream.id}
                  onClick={() => {
                    setSelectedStreamId(stream.id);
                    setViewMode('focus');
                  }}
                  accentColor={DOMAIN_ACCENTS[stream.domain]}
                />
              ))}
            </div>
          </div>

          {/* ROW 3: Global Macro */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-6 rounded-full bg-gradient-to-b ${DOMAIN_COLORS['Defense & National Security']}`} />
              <h2 className="text-lg font-bold">Row 3: Global Macro, Defense & Policy</h2>
              <span className="text-xs text-slate-400">($2.2T Defense Spend)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {streamsByRow[3]?.map(stream => (
                <StreamGridCard
                  key={stream.id}
                  stream={stream}
                  isSelected={selectedStream?.id === stream.id}
                  onClick={() => {
                    setSelectedStreamId(stream.id);
                    setViewMode('focus');
                  }}
                  accentColor={DOMAIN_ACCENTS[stream.domain]}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}