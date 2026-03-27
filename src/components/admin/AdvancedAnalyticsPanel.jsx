import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRecharts } from '@/lib/recharts-lazy';
import { 
  TrendingUp, TrendingDown, Users, Vote, Target, 
  Activity, Clock, Award, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart as PieChartIcon, Loader2,
  UserCheck, UserPlus, MousePointerClick
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
  coral: '#ee885c',
  teal: '#5da5a2',
};

const CHART_COLORS = ['#1e3a5a', '#c9a87c', '#4a90b8', '#ee885c', '#5da5a2', '#8b5cf6', '#10b981', '#f59e0b'];

export default function AdvancedAnalyticsPanel({ seasonId, onNavigate }) {
  const rc = useRecharts();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  // Navigation handlers for metric cards
  const handleNavigate = (section) => {
    if (onNavigate) {
      onNavigate(section);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [seasonId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [users, nominees, pairwiseVotes, rankedVotes, endorsements, testimonials, feedbacks] = await Promise.all([
        base44.entities.User.list('-created_date', 5000),
        base44.entities.Nominee.filter(seasonId ? { season_id: seasonId } : {}),
        base44.entities.PairwiseVote.filter(seasonId ? { season_id: seasonId } : {}, '-created_date', 5000),
        base44.entities.RankedVote.filter(seasonId ? { season_id: seasonId } : {}, '-created_date', 1000),
        base44.entities.Endorsement.filter(seasonId ? { season_id: seasonId } : {}, '-created_date', 2000),
        base44.entities.Testimonial.list('-created_date', 500),
        base44.entities.Feedback.list('-created_date', 500),
      ]);

      // Process user growth data (last 30 days)
      const today = startOfDay(new Date());
      const userGrowthData = [];
      for (let i = 29; i >= 0; i--) {
        const date = subDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const usersOnDate = users.filter(u => {
          const created = startOfDay(new Date(u.created_date));
          return format(created, 'yyyy-MM-dd') === dateStr;
        }).length;
        const cumulativeUsers = users.filter(u => new Date(u.created_date) <= date).length;
        userGrowthData.push({
          date: dateStr,
          label: format(date, 'MMM d'),
          newUsers: usersOnDate,
          totalUsers: cumulativeUsers
        });
      }

      // Engagement funnel
      const totalUsers = users.length;
      const usersWithVotes = new Set([...pairwiseVotes.map(v => v.voter_email), ...rankedVotes.map(v => v.voter_email)]).size;
      const usersWithEndorsements = new Set(endorsements.map(e => e.endorser_email)).size;
      const claimedProfiles = nominees.filter(n => n.claimed_by_user_email).length;
      const usersWithTestimonials = new Set(testimonials.map(t => t.user_email)).size;

      const funnelData = [
        { stage: 'Registered', count: totalUsers, rate: 100 },
        { stage: 'Voted', count: usersWithVotes, rate: Math.round((usersWithVotes / totalUsers) * 100) },
        { stage: 'Endorsed', count: usersWithEndorsements, rate: Math.round((usersWithEndorsements / totalUsers) * 100) },
        { stage: 'Claimed Profile', count: claimedProfiles, rate: Math.round((claimedProfiles / totalUsers) * 100) },
        { stage: 'Testimonial', count: usersWithTestimonials, rate: Math.round((usersWithTestimonials / totalUsers) * 100) },
      ];

      // Voting trends (last 14 days)
      const votingTrends = [];
      for (let i = 13; i >= 0; i--) {
        const date = subDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const pairwiseOnDate = pairwiseVotes.filter(v => format(startOfDay(new Date(v.created_date)), 'yyyy-MM-dd') === dateStr).length;
        const rankedOnDate = rankedVotes.filter(v => format(startOfDay(new Date(v.created_date)), 'yyyy-MM-dd') === dateStr).length;
        votingTrends.push({
          date: dateStr,
          label: format(date, 'MMM d'),
          pairwise: pairwiseOnDate,
          ranked: rankedOnDate,
          total: pairwiseOnDate + rankedOnDate
        });
      }

      // User retention cohorts (weekly)
      const cohorts = [];
      for (let week = 3; week >= 0; week--) {
        const cohortStart = subDays(today, (week + 1) * 7);
        const cohortEnd = subDays(today, week * 7);
        const cohortUsers = users.filter(u => {
          const created = new Date(u.created_date);
          return created >= cohortStart && created < cohortEnd;
        });
        
        const activeInWeek1 = cohortUsers.filter(u => {
          return pairwiseVotes.some(v => v.voter_email === u.email && new Date(v.created_date) >= cohortStart);
        }).length;

        cohorts.push({
          week: `Week -${week + 1}`,
          label: format(cohortStart, 'MMM d'),
          users: cohortUsers.length,
          active: activeInWeek1,
          retention: cohortUsers.length > 0 ? Math.round((activeInWeek1 / cohortUsers.length) * 100) : 0
        });
      }

      // Nominee status distribution
      const statusCounts = nominees.reduce((acc, n) => {
        const status = n.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
        value: count
      }));

      // Top performers (by vote count)
      const nomineeVoteCounts = {};
      pairwiseVotes.forEach(v => {
        nomineeVoteCounts[v.winner_nominee_id] = (nomineeVoteCounts[v.winner_nominee_id] || 0) + 1;
      });
      
      const topPerformers = Object.entries(nomineeVoteCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([id, wins]) => {
          const nominee = nominees.find(n => n.id === id);
          return {
            name: nominee?.name || 'Unknown',
            wins,
            elo: nominee?.elo_rating || 1200
          };
        });

      // System health metrics
      const last24h = subDays(new Date(), 1);
      const recentVotes = pairwiseVotes.filter(v => new Date(v.created_date) >= last24h).length;
      const recentUsers = users.filter(u => new Date(u.created_date) >= last24h).length;
      const pendingFeedback = feedbacks.filter(f => f.status === 'new' || f.status === 'pending').length;
      const pendingTestimonials = testimonials.filter(t => t.status === 'pending').length;

      // Hourly activity heatmap (last 7 days)
      const hourlyHeatmap = Array(24).fill(0);
      pairwiseVotes.forEach(v => {
        const date = new Date(v.created_date);
        if (date >= subDays(today, 7)) {
          hourlyHeatmap[date.getHours()] += 1;
        }
      });
      const hourlyData = hourlyHeatmap.map((count, hour) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        votes: count,
        intensity: Math.min(100, (count / Math.max(...hourlyHeatmap)) * 100)
      }));

      // Weekly comparison
      const thisWeekVotes = pairwiseVotes.filter(v => new Date(v.created_date) >= subDays(today, 7)).length;
      const lastWeekVotes = pairwiseVotes.filter(v => {
        const d = new Date(v.created_date);
        return d >= subDays(today, 14) && d < subDays(today, 7);
      }).length;
      const weekOverWeekGrowth = lastWeekVotes > 0 ? Math.round(((thisWeekVotes - lastWeekVotes) / lastWeekVotes) * 100) : 0;

      setAnalytics({
        userGrowthData,
        funnelData,
        votingTrends,
        cohorts,
        statusData,
        topPerformers,
        hourlyData,
        summary: {
          totalUsers,
          totalNominees: nominees.length,
          totalVotes: pairwiseVotes.length + rankedVotes.length,
          totalEndorsements: endorsements.length,
          recentVotes,
          recentUsers,
          pendingFeedback,
          pendingTestimonials,
          thisWeekVotes,
          lastWeekVotes,
          weekOverWeekGrowth,
          avgVotesPerUser: usersWithVotes > 0 ? Math.round(pairwiseVotes.length / usersWithVotes) : 0,
          conversionRate: Math.round((usersWithVotes / totalUsers) * 100)
        }
      });

    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !rc) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  const { BarChart, Bar, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, ComposedChart } = rc;

  if (!analytics) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Unable to load analytics data</p>
      </div>
    );
  }

  const { summary, userGrowthData, funnelData, votingTrends, cohorts, statusData, topPerformers, hourlyData } = analytics;

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Users"
          value={summary.totalUsers.toLocaleString()}
          icon={Users}
          trend={summary.recentUsers}
          trendLabel="last 24h"
          color={brandColors.navyDeep}
          onClick={() => handleNavigate('merge-users')}
        />
        <MetricCard
          title="Total Votes"
          value={summary.totalVotes.toLocaleString()}
          icon={Vote}
          trend={summary.recentVotes}
          trendLabel="last 24h"
          color={brandColors.goldPrestige}
          onClick={() => handleNavigate('scoring')}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${summary.conversionRate}%`}
          icon={Target}
          subtitle="Users who voted"
          color={brandColors.skyBlue}
          onClick={() => handleNavigate('analytics')}
        />
        <MetricCard
          title="Avg Votes/User"
          value={summary.avgVotesPerUser}
          icon={Activity}
          subtitle="Active voters"
          color={brandColors.coral}
          onClick={() => handleNavigate('scoring')}
        />
        <MetricCard
          title="Week Growth"
          value={`${summary.weekOverWeekGrowth > 0 ? '+' : ''}${summary.weekOverWeekGrowth}%`}
          icon={summary.weekOverWeekGrowth >= 0 ? TrendingUp : TrendingDown}
          subtitle={`${summary.thisWeekVotes} vs ${summary.lastWeekVotes}`}
          color={summary.weekOverWeekGrowth >= 0 ? '#10b981' : '#ef4444'}
          onClick={() => handleNavigate('scoring')}
        />
        <MetricCard
          title="Pending Items"
          value={summary.pendingFeedback + summary.pendingTestimonials}
          icon={Clock}
          subtitle={`${summary.pendingFeedback} feedback, ${summary.pendingTestimonials} testimonials`}
          color={brandColors.teal}
          onClick={() => handleNavigate('testimonials')}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
              User Growth (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={userGrowthData}>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={4} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="newUsers" fill={brandColors.goldPrestige} name="New Users" />
                  <Line yAxisId="right" type="monotone" dataKey="totalUsers" stroke={brandColors.navyDeep} strokeWidth={2} name="Cumulative" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Voting Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Vote className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
              Voting Trends (14 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={votingTrends}>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="pairwise" stackId="1" fill={brandColors.navyDeep} stroke={brandColors.navyDeep} name="Pairwise" />
                  <Area type="monotone" dataKey="ranked" stackId="1" fill={brandColors.skyBlue} stroke={brandColors.skyBlue} name="Ranked" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Funnel & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Funnel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MousePointerClick className="w-5 h-5" style={{ color: brandColors.coral }} />
              Engagement Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((stage, idx) => (
                <div key={stage.stage} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    <span className="text-sm text-[var(--muted)]">{stage.count.toLocaleString()} ({stage.rate}%)</span>
                  </div>
                  <div className="relative h-8 bg-gray-100 rounded overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 rounded transition-all"
                      style={{ 
                        width: `${stage.rate}%`, 
                        backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                        opacity: 0.8
                      }}
                    />
                  </div>
                  {idx < funnelData.length - 1 && (
                    <div className="text-xs text-[var(--muted)] mt-1 text-right">
                      {funnelData[idx + 1].rate > 0 && (
                        <span>
                          Drop-off: {Math.round(((stage.rate - funnelData[idx + 1].rate) / stage.rate) * 100)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nominee Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" style={{ color: brandColors.teal }} />
              Nominee Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusData.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-1">
              {statusData.map((s, idx) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                    <span>{s.name}</span>
                  </div>
                  <span className="font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Retention & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Cohort Retention */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCheck className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
              Weekly Cohort Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cohorts} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 10 }} width={60} />
                  <Tooltip formatter={(val) => `${val}%`} />
                  <Bar dataKey="retention" fill={brandColors.skyBlue} name="Retention %" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {cohorts.map(c => (
                <div key={c.week} className="text-xs">
                  <div className="font-medium">{c.users}</div>
                  <div className="text-[var(--muted)]">users</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
              Top 10 Vote Winners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {topPerformers.map((performer, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: idx < 3 ? brandColors.goldPrestige : brandColors.navyDeep }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm truncate max-w-[150px]">{performer.name}</div>
                      <div className="text-xs text-[var(--muted)]">ELO: {performer.elo}</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-bold">
                    {performer.wins} wins
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" style={{ color: brandColors.coral }} />
            Hourly Activity Pattern (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={2} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="votes" fill={brandColors.coral} name="Votes" radius={[2, 2, 0, 0]}>
                  {hourlyData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={`rgba(238, 136, 92, ${0.3 + (entry.intensity / 100) * 0.7})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-[var(--muted)]">
            <span>Peak Hours: {hourlyData.sort((a, b) => b.votes - a.votes).slice(0, 3).map(h => h.hour).join(', ')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, trendLabel, subtitle, color, onClick }) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Card className={`relative overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all' : ''}`}>
      <Wrapper onClick={onClick} className="w-full text-left">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[var(--muted)] mb-1">{title}</p>
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              {trend !== undefined && (
                <div className="flex items-center gap-1 mt-1">
                  {trend > 0 ? (
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-red-500" />
                  )}
                  <span className="text-xs text-[var(--muted)]">+{trend} {trendLabel}</span>
                </div>
              )}
              {subtitle && (
                <p className="text-xs text-[var(--muted)] mt-1">{subtitle}</p>
              )}
            </div>
            <Icon className="w-5 h-5 opacity-50" style={{ color }} />
          </div>
        </CardContent>
      </Wrapper>
    </Card>
  );
}