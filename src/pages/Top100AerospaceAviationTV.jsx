import { useState } from 'react';
import { Tv, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STREAMS_DB } from '@/lib/channels-db';
import ComprehensiveNewsStreams from '@/components/capabilities/global-intelligence/ComprehensiveNewsStreams';

export default function Top100AerospaceAviationTV() {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const regions = ['all', ...new Set(STREAMS_DB.map(c => c.region))].sort();

  const filteredChannels = selectedRegion === 'all'
    ? STREAMS_DB
    : STREAMS_DB.filter(c => c.region === selectedRegion);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Tv className="w-8 h-8 text-[#c9a87c]" />
            <h1 className="text-4xl font-bold">Top 100 Aerospace & Aviation TV</h1>
          </div>
          <p className="text-slate-400 text-lg">Global news channels tracking space, aviation, and aerospace developments</p>
          <p className="text-slate-500 text-sm mt-2">{STREAMS_DB.length} international channels</p>
        </div>

        {/* Live Player */}
        <div className="mb-8 rounded-lg border border-white/10 overflow-hidden bg-black/40">
          <ComprehensiveNewsStreams />
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm hover:border-slate-600 transition-colors"
            >
              {regions.map(region => (
                <option key={region} value={region}>
                  {region === 'all' ? 'All Regions' : region}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="gap-1"
            >
              <Grid className="w-4 h-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-1"
            >
              <List className="w-4 h-4" />
              List
            </Button>
          </div>
        </div>

        {/* Channels Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredChannels.map(channel => (
              <div
                key={channel.id}
                className="rounded-lg border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 hover:border-[#c9a87c]/50 transition-all hover:shadow-lg hover:shadow-[#c9a87c]/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{channel.icon}</span>
                  {channel.geoBlocked && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                      GEO
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-sm text-white mb-1">{channel.name}</h3>
                <p className="text-[11px] text-slate-400 mb-3">{channel.region} • {channel.language}</p>
                <div className="flex gap-1">
                  {channel.hls && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300">
                      HLS
                    </span>
                  )}
                  {channel.youtube && (
                    <a
                      href={`https://www.youtube.com/@${channel.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 hover:bg-red-500/40 transition-colors"
                    >
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChannels.map(channel => (
              <div
                key={channel.id}
                className="rounded-lg border border-white/10 bg-slate-800/30 p-4 hover:bg-slate-800/50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">{channel.icon}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white text-sm">{channel.name}</h3>
                    <p className="text-xs text-slate-400">{channel.region} • {channel.language}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  {channel.hls && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300">
                      HLS
                    </span>
                  )}
                  {channel.youtube && (
                    <a
                      href={`https://www.youtube.com/@${channel.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 hover:bg-red-500/40 transition-colors"
                    >
                      YouTube
                    </a>
                  )}
                  {channel.geoBlocked && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                      GEO
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}