import { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle2, Clock, Loader2, ExternalLink } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { checkStreamHealth } from '@/functions/checkStreamHealth';

export default function StreamHealthDashboard() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await checkStreamHealth({});
      setHealth(response.data || response);
      setLastChecked(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading && !health) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#0a0f1e] rounded-xl border border-white/5">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#c9a87c] mx-auto animate-spin" />
          <p className="text-sm text-white/40">Checking stream health...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Health check failed: {error}
        </div>
      </div>
    );
  }

  const healthPercentage = health ? Math.round((health.healthyChannels / health.totalChannels) * 100) : 0;
  const healthyChannels = (health?.channels || []).filter(c => c.healthy);
  const unhealthyChannels = (health?.channels || []).filter(c => !c.healthy);

  return (
    <div className="space-y-4 p-4 bg-[#0a0f1e] rounded-xl border border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#c9a87c]" />
          <h3 className="text-sm font-bold text-white">Stream Health Monitor</h3>
        </div>
        <button
          onClick={() => fetchHealth()}
          disabled={loading}
          className="text-xs text-white/40 hover:text-white disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : 'Refresh'}
        </button>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-3 gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left cursor-pointer">
              <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Total Channels</p>
              <p className="text-lg font-bold text-white">{health?.totalChannels || 0}</p>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0 bg-[#0a0f1e] border-white/10 max-h-96 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 sticky top-0 bg-[#0a0f1e]">
              <p className="text-sm font-bold text-white">All Channels ({health?.totalChannels || 0})</p>
            </div>
            <div className="overflow-y-auto">
              {(health?.channels || []).map(channel => (
                <div key={channel.id} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${channel.healthy ? 'bg-green-400' : 'bg-red-400'}`} />
                        <p className="text-sm font-semibold text-white truncate">{channel.name}</p>
                      </div>
                      <p className="text-xs text-white/50 mt-1">{channel.region} • {channel.language}</p>
                      {channel.youtube && (
                        <a
                          href={`https://www.youtube.com/@${channel.youtube}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#c9a87c] hover:text-[#d4b896] flex items-center gap-1 mt-1"
                        >
                          YouTube <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <span className={`text-xs font-semibold flex-shrink-0 ${channel.healthy ? 'text-green-400' : 'text-red-400'}`}>
                      {channel.healthy ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <button className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left cursor-pointer">
              <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Healthy</p>
              <p className="text-lg font-bold text-green-400">{health?.healthyChannels || 0}</p>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0 bg-[#0a0f1e] border-white/10 max-h-96 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 sticky top-0 bg-[#0a0f1e]">
              <p className="text-sm font-bold text-white">Active Channels ({health?.healthyChannels || 0})</p>
            </div>
            <div className="overflow-y-auto">
              {healthyChannels.map(channel => (
                <div key={channel.id} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0 bg-green-400" />
                        <p className="text-sm font-semibold text-white truncate">{channel.name}</p>
                      </div>
                      <p className="text-xs text-white/50 mt-1">{channel.region} • {channel.language}</p>
                      {channel.youtube && (
                        <a
                          href={`https://www.youtube.com/@${channel.youtube}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#c9a87c] hover:text-[#d4b896] flex items-center gap-1 mt-1"
                        >
                          YouTube <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <span className="text-xs font-semibold flex-shrink-0 text-green-400">Online</span>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Uptime</p>
          <p className="text-lg font-bold text-[#c9a87c]">{healthPercentage}%</p>
        </div>
      </div>

      {/* Last Checked */}
      {lastChecked && (
        <div className="flex items-center gap-2 text-[10px] text-white/30">
          <Clock className="w-3 h-3" />
          Last checked: {lastChecked.toLocaleTimeString()}
        </div>
      )}

      {/* Unhealthy Channels Alert */}
      {unhealthyChannels.length > 0 && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-xs font-semibold text-red-400">
              {unhealthyChannels.length} Stream{unhealthyChannels.length !== 1 ? 's' : ''} Offline
            </p>
          </div>
          <div className="space-y-1">
            {unhealthyChannels.slice(0, 5).map(channel => (
              <p key={channel.id} className="text-[10px] text-red-300/70">
                • {channel.name} ({channel.region})
              </p>
            ))}
            {unhealthyChannels.length > 5 && (
              <p className="text-[10px] text-red-300/50">
                +{unhealthyChannels.length - 5} more offline
              </p>
            )}
          </div>
        </div>
      )}

      {/* Healthy Channels Summary */}
      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <p className="text-xs font-semibold text-green-400">
            {healthyChannels.length} Stream{healthyChannels.length !== 1 ? 's' : ''} Active
          </p>
        </div>
        <p className="text-[10px] text-green-300/70">
          All monitored streams are operational
        </p>
      </div>

      {/* Channel List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Detailed Status</p>
        {(health?.channels || []).slice(0, 10).map(channel => (
          <div
            key={channel.id}
            className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  channel.healthy ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
              <span className="text-white truncate">{channel.name}</span>
            </div>
            <span className="text-white/40 ml-2">
              {channel.healthy ? 'Online' : 'Offline'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}