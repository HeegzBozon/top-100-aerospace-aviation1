import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { syncSocialStats } from '@/functions/syncSocialStats';
import { base44 } from '@/api/base44Client';
import { 
  Users, RefreshCw, Loader2, Linkedin, Music2, Instagram, Youtube,
  Heart, Video, TrendingUp, Pencil, Check, X
} from 'lucide-react';
import { format } from 'date-fns';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

function formatNumber(num) {
  if (!num || num === 0) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

const platformConfig = {
  linkedin: {
    icon: Linkedin,
    color: '#0A66C2',
    bgColor: '#0A66C210',
    label: 'LinkedIn'
  },
  tiktok: {
    icon: Music2,
    color: '#000000',
    bgColor: '#00000010',
    label: 'TikTok'
  },
  instagram: {
    icon: Instagram,
    color: '#E4405F',
    bgColor: '#E4405F10',
    label: 'Instagram'
  },
  youtube: {
    icon: Youtube,
    color: '#FF0000',
    bgColor: '#FF000010',
    label: 'YouTube'
  },
};

export default function SocialStatsCard({ nominee, user, onUpdate }) {
  const [syncing, setSyncing] = useState(false);
  const [editing, setEditing] = useState(null); // 'linkedin', 'instagram', etc.
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  // Use user's social_stats as source of truth, fallback to nominee's
  const stats = user?.social_stats || nominee?.social_stats || {};

  const handleEditStart = (platform, currentValue) => {
    setEditing(platform);
    setEditValue(currentValue?.toString() || '');
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const numValue = parseInt(editValue, 10) || 0;
      const fieldMap = {
        linkedin: 'linkedin_connections',
        instagram: 'instagram_followers',
        youtube: 'youtube_subscribers',
      };
      
      const field = fieldMap[editing];
      const newStats = {
        ...stats,
        [field]: numValue,
        total_followers: 
          (editing === 'linkedin' ? numValue : (stats.linkedin_connections || 0)) +
          (stats.linkedin_followers || 0) +
          (stats.tiktok_followers || 0) +
          (editing === 'instagram' ? numValue : (stats.instagram_followers || 0)) +
          (editing === 'youtube' ? numValue : (stats.youtube_subscribers || 0)),
        last_synced: new Date().toISOString(),
      };

      await base44.auth.updateMe({ social_stats: newStats });
      onUpdate?.(newStats);
      toast({ title: 'Stats updated!' });
      setEditing(null);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data } = await syncSocialStats({});
      
      if (data?.success) {
        toast({ 
          title: 'Social stats synced!',
          description: data.profiles_updated > 1 
            ? `Updated ${data.profiles_updated} profiles`
            : 'Profile updated'
        });
        onUpdate?.(data.social_stats);
      } else {
        throw new Error(data?.error || 'Sync failed');
      }
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Sync failed', 
        description: error.message 
      });
    } finally {
      setSyncing(false);
    }
  };

  // Check connected status from user entity
  const isLinkedInConnected = user?.linkedin_connected || false;
  const isTikTokConnected = user?.tiktok_connected || false;

  const platforms = [
    {
      key: 'linkedin',
      connected: isLinkedInConnected,
      stats: [
        { label: 'Connections', value: stats.linkedin_connections, icon: Users },
        { label: 'Followers', value: stats.linkedin_followers, icon: Users },
      ]
    },
    {
      key: 'tiktok',
      connected: isTikTokConnected,
      stats: [
        { label: 'Followers', value: stats.tiktok_followers, icon: Users },
        { label: 'Likes', value: stats.tiktok_likes, icon: Heart },
        { label: 'Videos', value: stats.tiktok_videos, icon: Video },
      ]
    },
    {
      key: 'instagram',
      connected: false, // Instagram OAuth not implemented
      stats: [
        { label: 'Followers', value: stats.instagram_followers, icon: Users },
      ]
    },
    {
      key: 'youtube',
      connected: false, // YouTube OAuth not implemented
      stats: [
        { label: 'Subscribers', value: stats.youtube_subscribers, icon: Users },
        { label: 'Views', value: stats.youtube_views, icon: TrendingUp },
      ]
    },
  ];

  const hasAnyStats = platforms.some(p => p.stats.some(s => s.value > 0));

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
            <TrendingUp className="w-4 h-4" />
            Social Media Reach
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSync}
            disabled={syncing}
            className="gap-2"
          >
            {syncing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            Sync
          </Button>
        </div>
        {stats.last_synced && (
          <p className="text-xs text-slate-400">
            Last synced: {format(new Date(stats.last_synced), 'MMM d, yyyy h:mm a')}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Followers Banner */}
        <div 
          className="p-4 rounded-lg text-center"
          style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}10, ${brandColors.goldPrestige}10)` }}
        >
          <p className="text-xs text-slate-500 mb-1">Combined Reach</p>
          <p className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
            {formatNumber(stats.total_followers || 0)}
          </p>
          <p className="text-xs text-slate-400">followers across all platforms</p>
        </div>

        {/* Platform Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          {platforms.map(platform => {
            const config = platformConfig[platform.key];
            const PlatformIcon = config.icon;
            const hasStats = platform.stats.some(s => s.value > 0);
            const isConnected = platform.connected || hasStats;
            
            return (
              <div 
                key={platform.key}
                className="p-3 rounded-lg border"
                style={{ 
                  backgroundColor: isConnected ? config.bgColor : '#f8fafc',
                  borderColor: isConnected ? `${config.color}30` : '#e2e8f0'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <PlatformIcon className="w-4 h-4" style={{ color: config.color }} />
                  <span className="text-xs font-medium" style={{ color: config.color }}>
                    {config.label}
                  </span>
                  {isConnected && !hasStats && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">Connected</span>
                  )}
                </div>
                {editing === platform.key ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="h-7 text-xs w-20"
                      placeholder="0"
                      autoFocus
                    />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6"
                      onClick={handleEditSave}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 text-green-600" />}
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6"
                      onClick={() => setEditing(null)}
                    >
                      <X className="w-3 h-3 text-slate-400" />
                    </Button>
                  </div>
                ) : hasStats ? (
                  <div className="space-y-1">
                    {platform.stats.filter(s => s.value > 0).map(stat => (
                      <div key={stat.label} className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{stat.label}</span>
                        <span className="text-sm font-semibold" style={{ color: brandColors.navyDeep }}>
                          {formatNumber(stat.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : isConnected ? (
                  <p className="text-xs text-slate-400">Click Sync to fetch stats</p>
                ) : (
                  <button 
                    onClick={() => handleEditStart(platform.key, 0)}
                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    <Pencil className="w-3 h-3" /> Enter manually
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {!hasAnyStats && (
          <div className="text-center py-4 text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No social stats yet</p>
            <p className="text-xs">Click Sync to pull data from connected platforms</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}