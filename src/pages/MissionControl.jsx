import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Target, Users, UserPlus, Globe, Award, TrendingUp,
  Clock, Calendar, Rocket, ArrowRight, Loader2,
  CheckCircle2, Flame, BarChart3, MapPin, Star, Zap, Send
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { differenceInDays, format, parseISO } from 'date-fns';

const brand = {
  navy: '#1e3a5a',
  gold: '#c9a87c',
  sky: '#4a90b8',
  cream: '#faf8f5',
};

const NOMINATION_TARGET = 500;

function CountdownUnit({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-white tabular-nums">{String(value).padStart(2, '0')}</div>
      <div className="text-[10px] md:text-xs text-white/50 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

function useCountdown(targetDate) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!targetDate) return null;
  const diff = new Date(targetDate).getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, past: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
    past: false,
  };
}

export default function MissionControl() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: seasons = [] } = useQuery({
    queryKey: ['mc-seasons'],
    queryFn: () => base44.entities.Season.list('-created_date', 10),
  });

  const season4 = useMemo(() =>
    seasons.find(s => s.name?.includes('Season 4') && (s.status === 'nominations_open' || s.status === 'voting_open')) || seasons[0],
    [seasons]
  );

  const { data: nominees = [], isLoading } = useQuery({
    queryKey: ['mc-nominees', season4?.id],
    queryFn: () => base44.entities.Nominee.list('-created_date', 5000),
    enabled: !!season4,
  });

  const countdown = useCountdown(season4?.nomination_end);

  const stats = useMemo(() => {
    if (!nominees.length) return null;
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const total = nominees.length;
    const thisWeek = nominees.filter(n => new Date(n.created_date) >= sevenDaysAgo).length;
    const withPhotos = nominees.filter(n => n.avatar_url || n.photo_url).length;
    const claimed = nominees.filter(n => n.claimed_by_user_email).length;
    const nominators = new Set(nominees.map(n => n.nominated_by).filter(Boolean));
    const countries = new Set(nominees.map(n => n.country).filter(Boolean));

    // Weekly trend
    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const ws = new Date(now); ws.setDate(ws.getDate() - (i + 1) * 7);
      const we = new Date(now); we.setDate(we.getDate() - i * 7);
      weeklyData.push({
        week: `Week ${4 - i}`,
        count: nominees.filter(n => { const d = new Date(n.created_date); return d >= ws && d < we; }).length,
      });
    }

    return {
      total, thisWeek, withPhotos, claimed,
      uniqueNominators: nominators.size,
      countries: countries.size,
      progressPct: Math.min(Math.round((total / NOMINATION_TARGET) * 100), 100),
      weeklyData,
    };
  }, [nominees]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brand.cream }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: brand.gold }} />
      </div>
    );
  }

  const nomEnd = season4?.nomination_end;
  const votingStart = season4?.voting_start;

  return (
    <div className="min-h-screen pb-8" style={{ background: brand.cream }}>
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-b-3xl" style={{ background: `linear-gradient(135deg, ${brand.navy} 0%, #0f1f33 100%)` }}>
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: brand.gold }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-5" style={{ background: brand.sky }} />

        <div className="relative z-10 px-4 md:px-8 py-8 md:py-12 max-w-6xl mx-auto">
          {/* Season badge */}
          <div className="flex items-center gap-3 mb-4">
            <Badge className="text-xs font-bold px-3 py-1" style={{ background: brand.gold, color: 'white' }}>
              <Rocket className="w-3 h-3 mr-1" /> SEASON 4
            </Badge>
            <Badge variant="outline" className="text-xs border-white/30 text-white/70">
              {season4?.status?.replace(/_/g, ' ').toUpperCase() || 'ACTIVE'}
            </Badge>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Mission Control
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-xl">
            {season4?.name || 'TOP 100 Season 4'} — Driving nominations across 30+ countries to recognize aerospace excellence.
          </p>

          {/* Countdown */}
          {countdown && !countdown.past && (
            <div className="mt-6 inline-flex items-center gap-4 md:gap-6 px-6 py-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div className="text-white/50 text-xs uppercase tracking-widest mr-2">
                <Clock className="w-4 h-4 mb-1 mx-auto" />
                Nominations Close
              </div>
              <CountdownUnit value={countdown.days} label="Days" />
              <span className="text-white/30 text-2xl font-light">:</span>
              <CountdownUnit value={countdown.hours} label="Hours" />
              <span className="text-white/30 text-2xl font-light">:</span>
              <CountdownUnit value={countdown.mins} label="Min" />
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to={createPageUrl('Nominations')}>
              <Button className="text-white font-semibold" style={{ background: brand.gold }}>
                <Send className="w-4 h-4 mr-2" /> Submit Nomination
              </Button>
            </Link>
            <Link to={createPageUrl('Top100Women2025')}>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Award className="w-4 h-4 mr-2" /> View 2025 Index
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-6 space-y-6">
        {/* Nomination Progress */}
        {stats && (
          <Card className="border-2 shadow-lg" style={{ borderColor: `${brand.gold}40` }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" style={{ color: brand.gold }} />
                  <span className="font-bold" style={{ color: brand.navy }}>Nomination Target</span>
                </div>
                <span className="text-2xl font-bold" style={{ color: brand.gold }}>{stats.progressPct}%</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden" style={{ background: `${brand.gold}20` }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${stats.progressPct}%`, background: `linear-gradient(90deg, ${brand.gold}, #e8d4b8)` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{stats.total} nominations received</span>
                <span>{NOMINATION_TARGET} goal</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { icon: Users, label: 'Total Nominees', value: stats.total, color: brand.navy },
              { icon: UserPlus, label: 'This Week', value: stats.thisWeek, color: brand.gold },
              { icon: Star, label: 'Nominators', value: stats.uniqueNominators, color: brand.sky },
              { icon: Globe, label: 'Countries', value: stats.countries, color: '#10b981' },
              { icon: CheckCircle2, label: 'With Photos', value: stats.withPhotos, color: '#8b5cf6' },
              { icon: Award, label: 'Claimed', value: stats.claimed, color: '#f59e0b' },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Card key={kpi.label} className="text-center">
                  <CardContent className="pt-4 pb-3">
                    <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: kpi.color }} />
                    <div className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
                    <div className="text-[11px] text-gray-500 mt-1">{kpi.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Weekly Chart */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2" style={{ color: brand.navy }}>
                <TrendingUp className="w-5 h-5" style={{ color: brand.gold }} />
                Weekly Nomination Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.weeklyData}>
                    <XAxis dataKey="week" className="text-xs" />
                    <YAxis className="text-xs" allowDecimals={false} />
                    <Tooltip formatter={(v) => [v, 'Nominations']} />
                    <Bar dataKey="count" fill={brand.gold} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2" style={{ color: brand.navy }}>
              <Calendar className="w-5 h-5" style={{ color: brand.gold }} />
              Season 4 Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  label: 'Nominations Open',
                  date: season4?.nomination_start,
                  status: 'active',
                  icon: Send,
                },
                {
                  label: 'Nominations Close',
                  date: season4?.nomination_end,
                  status: nomEnd && new Date() > new Date(nomEnd) ? 'completed' : 'upcoming',
                  icon: Target,
                },
                {
                  label: 'Voting Opens',
                  date: season4?.voting_start,
                  status: votingStart && new Date() > new Date(votingStart) ? 'active' : 'upcoming',
                  icon: Star,
                },
                {
                  label: 'Voting Closes',
                  date: season4?.voting_end,
                  status: 'upcoming',
                  icon: Award,
                },
              ].map((milestone, idx) => {
                const Icon = milestone.icon;
                const isActive = milestone.status === 'active';
                const isCompleted = milestone.status === 'completed';
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: isActive ? brand.gold : isCompleted ? '#10b981' : `${brand.navy}10`,
                        color: isActive || isCompleted ? 'white' : brand.navy,
                      }}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm" style={{ color: brand.navy }}>{milestone.label}</div>
                      <div className="text-xs text-gray-500">
                        {milestone.date ? format(parseISO(milestone.date), 'MMM d, yyyy') : 'TBD'}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: isActive ? brand.gold : isCompleted ? '#10b981' : '#d1d5db',
                        color: isActive ? brand.gold : isCompleted ? '#10b981' : '#9ca3af',
                      }}
                    >
                      {isActive ? 'Active' : isCompleted ? 'Done' : 'Upcoming'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}