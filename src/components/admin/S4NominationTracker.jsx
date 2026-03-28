import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Users, UserPlus, Target, TrendingUp, Calendar, Clock,
  Award, Globe, Loader2, RefreshCw, AlertTriangle, CheckCircle2,
  Flame, ArrowRight, BarChart3, MapPin
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { differenceInDays, format, parseISO } from 'date-fns';

const brand = {
  navy: '#1e3a5a',
  gold: '#c9a87c',
  sky: '#4a90b8',
  cream: '#faf8f5',
};

const NOMINATION_TARGET = 500;

export default function S4NominationTracker({ seasonId }) {
  const [season, setSeason] = useState(null);
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [seasons, allNominees] = await Promise.all([
        base44.entities.Season.list('-created_date', 20),
        base44.entities.Nominee.list('-created_date', 5000),
      ]);
      const s4 = seasonId
        ? seasons.find(s => s.id === seasonId)
        : seasons.find(s => s.name?.includes('Season 4') && s.status === 'nominations_open') || seasons[0];
      setSeason(s4);

      // Get nominees for this season (or all if no season_id filter)
      const seasonNominees = s4
        ? allNominees.filter(n => n.season_id === s4.id || !n.season_id)
        : allNominees;
      setNominees(seasonNominees);
    } catch (err) {
      console.error('Error loading nomination data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [seasonId]);

  const stats = useMemo(() => {
    if (!nominees.length) return null;
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const total = nominees.length;
    const active = nominees.filter(n => n.status === 'active').length;
    const pending = nominees.filter(n => n.status === 'pending').length;
    const thisWeek = nominees.filter(n => new Date(n.created_date) >= sevenDaysAgo).length;
    const thisMonth = nominees.filter(n => new Date(n.created_date) >= thirtyDaysAgo).length;
    const withPhotos = nominees.filter(n => n.avatar_url || n.photo_url).length;
    const claimed = nominees.filter(n => n.claimed_by_user_email).length;
    const withBios = nominees.filter(n => n.bio && n.bio.length > 50).length;

    // Country breakdown
    const countries = {};
    nominees.forEach(n => {
      const c = n.country || 'Unknown';
      countries[c] = (countries[c] || 0) + 1;
    });
    const topCountries = Object.entries(countries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name: name.length > 12 ? name.slice(0, 12) + '…' : name, count }));

    // Industry breakdown
    const industries = {};
    nominees.forEach(n => {
      const ind = n.industry || n.discipline || 'Other';
      industries[ind] = (industries[ind] || 0) + 1;
    });
    const topIndustries = Object.entries(industries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name: name.length > 18 ? name.slice(0, 18) + '…' : name, value }));

    // Weekly trend (last 4 weeks)
    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      const count = nominees.filter(n => {
        const d = new Date(n.created_date);
        return d >= weekStart && d < weekEnd;
      }).length;
      weeklyData.push({ week: `W${4 - i}`, nominations: count });
    }

    // Unique nominators
    const nominators = new Set(nominees.map(n => n.nominated_by).filter(Boolean));

    return {
      total, active, pending, thisWeek, thisMonth,
      withPhotos, claimed, withBios,
      topCountries, topIndustries, weeklyData,
      uniqueNominators: nominators.size,
      progressPct: Math.min(Math.round((total / NOMINATION_TARGET) * 100), 100),
      dailyRate: thisMonth > 0 ? (thisMonth / 30).toFixed(1) : '0',
      daysToTarget: total < NOMINATION_TARGET && thisMonth > 0
        ? Math.ceil((NOMINATION_TARGET - total) / (thisMonth / 30))
        : null,
    };
  }, [nominees]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brand.gold }} />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-16 text-gray-500">No nomination data available.</div>;
  }

  const nomEnd = season?.nomination_end ? parseISO(season.nomination_end) : null;
  const daysLeft = nomEnd ? differenceInDays(nomEnd, new Date()) : null;

  const PIE_COLORS = [brand.navy, brand.gold, brand.sky, '#10b981', '#8b5cf6', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Headline KPI Banner */}
      <div className="rounded-2xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${brand.navy} 0%, #2a4f7a 100%)` }}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6" style={{ color: brand.gold }} />
              Season 4 Nomination Tracker
            </h2>
            <p className="text-white/60 text-sm mt-1">
              {season?.name || 'Season 4'} · Status: {season?.status?.replace(/_/g, ' ') || 'Unknown'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {daysLeft !== null && daysLeft > 0 && (
              <Badge className="text-sm px-3 py-1" style={{ background: daysLeft < 30 ? '#ef4444' : brand.gold, color: 'white' }}>
                <Clock className="w-3.5 h-3.5 mr-1" />
                {daysLeft} days left
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={load} className="text-white hover:bg-white/10">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/80">{stats.total} of {NOMINATION_TARGET} target nominations</span>
            <span className="font-bold" style={{ color: brand.gold }}>{stats.progressPct}%</span>
          </div>
          <div className="h-4 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.progressPct}%`, background: `linear-gradient(90deg, ${brand.gold}, #e8d4b8)` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/50">
            <span>{stats.dailyRate} nominations/day avg</span>
            {stats.daysToTarget && <span>~{stats.daysToTarget} days to target at current pace</span>}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-t-4" style={{ borderTopColor: brand.navy }}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Users className="w-4 h-4" /> Total Nominees
            </div>
            <div className="text-3xl font-bold" style={{ color: brand.navy }}>{stats.total}</div>
            <div className="text-xs text-gray-400 mt-1">{stats.active} active · {stats.pending} pending</div>
          </CardContent>
        </Card>

        <Card className="border-t-4" style={{ borderTopColor: brand.gold }}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <UserPlus className="w-4 h-4" /> This Week
            </div>
            <div className="text-3xl font-bold" style={{ color: brand.gold }}>{stats.thisWeek}</div>
            <div className="text-xs text-gray-400 mt-1">{stats.thisMonth} this month</div>
          </CardContent>
        </Card>

        <Card className="border-t-4" style={{ borderTopColor: brand.sky }}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Award className="w-4 h-4" /> Unique Nominators
            </div>
            <div className="text-3xl font-bold" style={{ color: brand.sky }}>{stats.uniqueNominators}</div>
            <div className="text-xs text-gray-400 mt-1">{(stats.total / Math.max(stats.uniqueNominators, 1)).toFixed(1)} noms/person avg</div>
          </CardContent>
        </Card>

        <Card className="border-t-4" style={{ borderTopColor: '#10b981' }}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Globe className="w-4 h-4" /> Countries
            </div>
            <div className="text-3xl font-bold text-emerald-600">{stats.topCountries.length}</div>
            <div className="text-xs text-gray-400 mt-1">Global representation</div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Health */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2" style={{ color: brand.navy }}>
            <CheckCircle2 className="w-5 h-5" style={{ color: brand.gold }} />
            Profile Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'With Photos', count: stats.withPhotos, total: stats.total, color: brand.gold },
              { label: 'Claimed', count: stats.claimed, total: stats.total, color: brand.sky },
              { label: 'With Bios', count: stats.withBios, total: stats.total, color: '#10b981' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-semibold">{item.count}/{item.total} ({Math.round((item.count / Math.max(item.total, 1)) * 100)}%)</span>
                </div>
                <Progress value={(item.count / Math.max(item.total, 1)) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2" style={{ color: brand.navy }}>
              <TrendingUp className="w-5 h-5" style={{ color: brand.gold }} />
              Weekly Nomination Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weeklyData}>
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" allowDecimals={false} />
                  <Tooltip formatter={(v) => [v, 'Nominations']} />
                  <Bar dataKey="nominations" fill={brand.gold} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2" style={{ color: brand.navy }}>
              <MapPin className="w-5 h-5" style={{ color: brand.gold }} />
              Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topCountries} layout="vertical">
                  <XAxis type="number" className="text-xs" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" className="text-xs" width={90} />
                  <Tooltip formatter={(v) => [v, 'Nominees']} />
                  <Bar dataKey="count" fill={brand.sky} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Industry / Discipline Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2" style={{ color: brand.navy }}>
            <BarChart3 className="w-5 h-5" style={{ color: brand.gold }} />
            Industry Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.topIndustries} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {stats.topIndustries.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card className="border-l-4" style={{ borderLeftColor: stats.progressPct >= 80 ? '#10b981' : stats.progressPct >= 50 ? brand.gold : '#ef4444' }}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2" style={{ color: brand.navy }}>
            <AlertTriangle className="w-5 h-5" style={{ color: brand.gold }} />
            Action Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.progressPct < 50 && (
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <Flame className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <div className="font-semibold text-red-900">Nominations Below 50% Target</div>
                <div className="text-sm text-red-700">Need {NOMINATION_TARGET - stats.total} more nominations. Ramp up outreach and campaigns.</div>
              </div>
            </div>
          )}
          {stats.withPhotos < stats.total * 0.5 && (
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <Target className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <div className="font-semibold text-orange-900">Low Photo Coverage</div>
                <div className="text-sm text-orange-700">{stats.total - stats.withPhotos} nominees missing photos. Send reminder campaigns.</div>
              </div>
            </div>
          )}
          {stats.progressPct >= 80 && (
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-semibold text-green-900">On Track</div>
                <div className="text-sm text-green-700">Nominations are progressing well toward the {NOMINATION_TARGET} target.</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}