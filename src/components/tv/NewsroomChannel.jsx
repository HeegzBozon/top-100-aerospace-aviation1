import { useState } from 'react';
import { Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STREAMS_DB } from '@/lib/channels-db';
import ComprehensiveNewsStreams from '@/components/capabilities/global-intelligence/ComprehensiveNewsStreams';

// The Newsroom: the live wire the house keeps open, and the stations it watches. This is
// the surface the television carried before it had a dial, kept whole as a channel of it.
export default function NewsroomChannel() {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const regions = ['all', ...new Set(STREAMS_DB.map((c) => c.region))].sort();
  const filteredChannels =
    selectedRegion === 'all' ? STREAMS_DB : STREAMS_DB.filter((c) => c.region === selectedRegion);

  return (
    <div className="p-3 md:p-4">
      <div className="mb-3 overflow-hidden rounded-[4px] border" style={{ borderColor: 'rgba(201,168,124,0.28)' }}>
        <ComprehensiveNewsStreams />
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5" style={{ color: '#9fb3c6' }} />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            aria-label="Region"
            className="rounded-[4px] px-2.5 py-1.5 text-[11px]"
            style={{ background: '#0c1826', border: '1px solid rgba(201,168,124,0.28)', color: '#e9e2d6' }}
          >
            {regions.map((region) => (
              <option key={region} value={region}>
                {region === 'all' ? 'All regions' : region}
              </option>
            ))}
          </select>
          <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: '#7d93a8' }}>
            {filteredChannels.length} stations
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-6 gap-1 px-2 text-[10px]"
          >
            <Grid className="h-3 w-3" /> Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-6 gap-1 px-2 text-[10px]"
          >
            <List className="h-3 w-3" /> List
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {filteredChannels.map((channel) => (
            <div
              key={channel.id}
              className="rounded-[4px] p-2.5"
              style={{ border: '1px solid rgba(201,168,124,0.18)', background: 'rgba(250,248,245,0.03)' }}
            >
              <div className="mb-1 flex items-start justify-between">
                <span className="text-lg leading-none">{channel.icon}</span>
                {channel.geoBlocked && (
                  <span className="text-[9px] uppercase tracking-[0.14em]" style={{ color: '#d98a7a' }}>
                    Geo
                  </span>
                )}
              </div>
              <h3 className="text-[11.5px] font-semibold leading-snug" style={{ color: '#f2ece1' }}>
                {channel.name}
              </h3>
              <p className="mt-0.5 text-[10px]" style={{ color: '#8ba0b4' }}>
                {channel.region} · {channel.language}
              </p>
              {channel.youtube && (
                <a
                  href={
                    channel.youtube.startsWith('UC')
                      ? `https://www.youtube.com/channel/${channel.youtube}`
                      : `https://www.youtube.com/@${channel.youtube}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-block text-[9.5px] uppercase tracking-[0.16em]"
                  style={{ color: '#c9a87c' }}
                >
                  YouTube
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredChannels.map((channel) => (
            <div
              key={channel.id}
              className="flex items-center justify-between rounded-[4px] px-2.5 py-2"
              style={{ border: '1px solid rgba(201,168,124,0.16)', background: 'rgba(250,248,245,0.03)' }}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-base leading-none">{channel.icon}</span>
                <div className="min-w-0">
                  <h3 className="truncate text-[11.5px] font-semibold" style={{ color: '#f2ece1' }}>
                    {channel.name}
                  </h3>
                  <p className="text-[10px]" style={{ color: '#8ba0b4' }}>
                    {channel.region} · {channel.language}
                  </p>
                </div>
              </div>
              {channel.youtube && (
                <a
                  href={
                    channel.youtube.startsWith('UC')
                      ? `https://www.youtube.com/channel/${channel.youtube}`
                      : `https://www.youtube.com/@${channel.youtube}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 shrink-0 text-[9.5px] uppercase tracking-[0.16em]"
                  style={{ color: '#c9a87c' }}
                >
                  YouTube
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}