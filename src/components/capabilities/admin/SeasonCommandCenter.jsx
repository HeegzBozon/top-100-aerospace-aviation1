import { useState, useEffect, useCallback, useRef } from 'react';
import { getDashboardStats } from '@/functions/getDashboardStats';
import { base44 } from '@/api/base44Client';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRecharts } from '@/lib/recharts-lazy';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
  Vote,
  BarChart3,
  Minus,
  Loader2,
  Users,
  UserPlus,
  Database,
  Clock,
  AlertCircle,
  Trophy,
  Target,
  CheckCircle2,
  AlertTriangle,
  Award,
  Flame,
  Zap,
  TrendingDown as Down,
  LayoutDashboard,
  ScrollText
} from 'lucide-react';
import { VoteLedger } from '@/components/capabilities/admin';
import { ResultsDashboard } from '@/components/capabilities/admin';
import { AdvancedAnalyticsPanel } from '@/components/capabilities/admin';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

export default function SeasonCommandCenter({ onNavigate }) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [seasonData, setSeasonData] = useState(null);
  const [nomineeStats, setNomineeStats] = useState(null);
  const [votingStats, setVotingStats] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState(null);
  const [editingSeasonId, setEditingSeasonId] = useState(null);
  const [editSeasonData, setEditSeasonData] = useState(null);
  const { toast } = useToast();
  const loadingRef = useRef(false);

  const loadStats = useCallback(async (showToast = false) => {
    // Prevent multiple simultaneous requests
    if (loadingRef.current) {
      console.log('Request already in progress, skipping...');
      return;
    }

    // Check if we're rate limited and haven't waited long enough
    if (rateLimited) {
      console.log('Rate limited, skipping request');
      if (showToast) {
        toast({
          variant: "warning",
          title: "Rate Limited",
          description: "You are rate-limited. Please wait a moment before trying to refresh again.",
        });
      }
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      // Assuming getDashboardStats now returns status as well, and error can be a string for rate limit
      const { data, status, error: apiError } = await getDashboardStats();

      if (apiError || !data) {
        // Check if it's a rate limit error based on the error string content
        if (apiError && typeof apiError === 'string' && apiError.includes('Rate limit')) {
          setRateLimited(true);
          setError('Rate limit exceeded. Please wait before refreshing.');

          // Reset rate limit flag after 60 seconds (or a specific duration)
          setTimeout(() => {
            setRateLimited(false);
            setError(null); // Clear error when rate limit is lifted
            if (!stats) { // If no stats were ever loaded, attempt a reload after rate limit
              loadStats();
            }
          }, 60000); // 60 seconds

          if (showToast) {
            toast({
              variant: "destructive",
              title: "Rate Limited",
              description: "Too many requests. Please wait a minute before refreshing.",
            });
          }
        } else {
          // General error
          throw new Error(apiError || data?.error || `Request failed with status ${status || 'unknown'}`);
        }
      } else if (data.success) {
        setStats(data.data);
        setLastUpdated(new Date());
        setError(null); // Clear any existing errors on success
        setRateLimited(false); // Clear rate limit on successful request
      } else {
        // Handle cases where data.success is false but no specific error string was provided
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (err) { // Renamed error to err to avoid conflict with state variable
      console.error('Error loading dashboard stats:', err);
      const errorMessage = err.message || 'Unknown error occurred';

      setError(errorMessage);
      if (showToast && !errorMessage.includes('Rate limit')) { // Only show toast if not already handled by rate limit specific toast
        toast({
          variant: "destructive",
          title: "Failed to load stats",
          description: "Could not fetch dashboard statistics. Please try again.",
        });
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [toast, rateLimited]);

  const loadSeasonData = useCallback(async () => {
    try {
      // Get all seasons
      const allSeasons = await base44.entities.Season.list('-created_date', 50);
      setSeasons(allSeasons);

      // Set default to Season 3 if not already set
      if (!selectedSeasonId && allSeasons.length > 0) {
        const season3 = allSeasons.find(s => s.name?.includes('Season 3'));
        const defaultSeason = season3 || allSeasons[0];
        setSelectedSeasonId(defaultSeason.id);
      }

      // Get the active season based on selection
      const activeSeason = allSeasons.find(s => s.id === selectedSeasonId);

      if (!activeSeason) return;

      // Get nominees for active season
      const nominees = await base44.entities.Nominee.filter({ season_id: activeSeason.id });

      // Calculate nominee stats
      const totalNominees = nominees.length;
      const activeNominees = nominees.filter(n => n.status === 'active').length;
      const claimedProfiles = nominees.filter(n => n.claimed_by_user_email).length;
      const withPhotos = nominees.filter(n => n.avatar_url || n.photo_url).length;
      const withBios = nominees.filter(n => n.bio && n.bio.length > 50).length;

      // Get voting stats - paginate through all batches to avoid 5k limit
      let allPairwiseVotes = [];
      let pairwiseBatch = 0;
      let hasMorePairwise = true;
      const batchSize = 5000;

      while (hasMorePairwise) {
        const batch = await base44.entities.PairwiseVote.filter(
          { season_id: activeSeason.id },
          '',
          batchSize,
          pairwiseBatch * batchSize
        );
        allPairwiseVotes = [...allPairwiseVotes, ...batch];
        hasMorePairwise = batch.length === batchSize;
        pairwiseBatch++;
      }

      const seasonRankedVotes = await base44.entities.RankedVote.filter({ season_id: activeSeason.id });
      const seasonPairwiseVotes = allPairwiseVotes;

      const uniqueVoters = new Set([
        ...seasonPairwiseVotes.map(v => v.voter_email),
        ...seasonRankedVotes.map(v => v.voter_email)
      ]).size;

      const totalVotes = seasonPairwiseVotes.length + seasonRankedVotes.length;

      // Calculate days remaining
      const now = new Date();
      const votingEnd = new Date(activeSeason.voting_end);
      const votingStart = new Date(activeSeason.voting_start);
      const daysRemaining = Math.ceil((votingEnd - now) / (1000 * 60 * 60 * 24));
      const hasStarted = now >= votingStart;
      const hasEnded = now > votingEnd;

      setSeasonData({
        season: activeSeason,
        daysRemaining,
        hasStarted,
        hasEnded,
        progress: {
          current: now,
          start: votingStart,
          end: votingEnd
        }
      });

      setNomineeStats({
        total: totalNominees,
        active: activeNominees,
        claimed: claimedProfiles,
        withPhotos,
        withBios,
        completeness: Math.round(((claimedProfiles + withPhotos + withBios) / (totalNominees * 3)) * 100)
      });

      setVotingStats({
        totalVotes,
        uniqueVoters,
        pairwise: seasonPairwiseVotes.length,
        ranked: seasonRankedVotes.length,
        participationRate: totalNominees > 0 ? Math.round((uniqueVoters / totalNominees) * 100) : 0
      });

    } catch (err) {
      console.error('Error loading season data:', err);
    }
  }, [selectedSeasonId]);

  const handleEditSeason = () => {
    if (seasonData?.season) {
      setEditSeasonData({
        name: seasonData.season.name,
        voting_start: seasonData.season.voting_start?.split('T')[0],
        voting_end: seasonData.season.voting_end?.split('T')[0],
        nomination_start: seasonData.season.nomination_start?.split('T')[0],
        nomination_end: seasonData.season.nomination_end?.split('T')[0],
      });
      setEditingSeasonId(seasonData.season.id);
    }
  };

  const handleSaveSeason = async () => {
    try {
      await base44.entities.Season.update(editingSeasonId, editSeasonData);
      toast({
        title: "Season Updated",
        description: "Season dates and settings have been saved.",
      });
      setEditingSeasonId(null);
      setEditSeasonData(null);
      loadSeasonData();
    } catch (err) {
      console.error('Error updating season:', err);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update season. Please try again.",
      });
    }
  };

  const handleExtendVoting = async (days) => {
    if (!seasonData?.season) return;
    const currentEnd = new Date(seasonData.season.voting_end);
    currentEnd.setDate(currentEnd.getDate() + days);
    try {
      await base44.entities.Season.update(seasonData.season.id, {
        voting_end: currentEnd.toISOString().split('T')[0]
      });
      toast({
        title: "Voting Extended",
        description: `Voting period extended by ${days} days.`,
      });
      loadSeasonData();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Extension Failed",
        description: "Could not extend voting period.",
      });
    }
  };

  useEffect(() => {
    loadStats();
    loadSeasonData();

    const interval = setInterval(() => {
      if (!loadingRef.current && !rateLimited) {
        loadStats();
        loadSeasonData();
      }
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [loadStats, loadSeasonData, rateLimited]);

  const getTrendIcon = (trend) => {
    const absTrend = Math.abs(trend || 0);
    let icon = null;
    let text = `${absTrend.toFixed(0)}%`;

    if (trend > 0) {
      icon = <TrendingUp className="w-4 h-4 text-green-500" />;
      text = `+${absTrend.toFixed(0)}%`;
    } else if (trend < 0) {
      icon = <TrendingDown className="w-4 h-4 text-red-500" />;
      text = `-${absTrend.toFixed(0)}%`;
    } else {
      icon = <Minus className="w-4 h-4 text-gray-400" />;
      text = '0%';
    }
    return { icon, text };
  };

  const LoadingState = () => (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
    </div>
  );

  const EditSeasonModal = () => {
    if (!editingSeasonId || !editSeasonData) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle>Edit Season Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Season Name</label>
              <input
                type="text"
                value={editSeasonData.name}
                onChange={(e) => setEditSeasonData({ ...editSeasonData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nomination Start</label>
                <input
                  type="date"
                  value={editSeasonData.nomination_start}
                  onChange={(e) => setEditSeasonData({ ...editSeasonData, nomination_start: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Nomination End</label>
                <input
                  type="date"
                  value={editSeasonData.nomination_end}
                  onChange={(e) => setEditSeasonData({ ...editSeasonData, nomination_end: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Voting Start</label>
                <input
                  type="date"
                  value={editSeasonData.voting_start}
                  onChange={(e) => setEditSeasonData({ ...editSeasonData, voting_start: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Voting End</label>
                <input
                  type="date"
                  value={editSeasonData.voting_end}
                  onChange={(e) => setEditSeasonData({ ...editSeasonData, voting_end: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => { setEditingSeasonId(null); setEditSeasonData(null); }}>
                Cancel
              </Button>
              <Button onClick={handleSaveSeason}>
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // New ErrorState component
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-[var(--text)] mb-2">Unable to Load Dashboard</h3>
      <p className="text-[var(--muted)] mb-4 max-w-md">{error || 'An unexpected error occurred.'}</p>
      <Button
        onClick={() => loadStats(true)}
        disabled={loading || rateLimited}
        variant="outline"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        {rateLimited ? 'Please Wait...' : 'Try Again'}
      </Button>
    </div>
  );

  // If there's an error and no stats have been loaded yet, show the error state
  if (error && !stats) {
    return <ErrorState />;
  }

  const DashboardContent = () => {
    // If we're loading and have no stats, show loading state
    if (loading && !stats) {
      return <LoadingState />;
    }

    // If not loading and no stats, indicate no data
    if (!stats || Object.keys(stats).length === 0) {
      return (
        <div className="text-center text-gray-500 py-16">
          <p>No data available yet.</p>
        </div>
      );
    }

    const {
      votesToday,
      votesYesterday,
      votesLast7Days,
      dailyAverage,
      dailyTrend,
      dauToday,
      dauYesterday,
      dauTrend,
      dailyVotes,
      usersToday,
      usersYesterday,
      userTrend,
      totalUsers,
      dailyNewUsers,
      hourlyVotingPattern
    } = stats;

    const trend = getTrendIcon(dailyTrend);
    const dauStatsTrend = getTrendIcon(dauTrend);
    const newUserStatsTrend = getTrendIcon(userTrend);

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[var(--text)]">Season Command Center</h2>
            <p className="text-sm text-[var(--muted)] mt-1">Real-time mission intelligence & close-out readiness</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {seasons.length > 0 && (
              <Select value={selectedSeasonId} onValueChange={setSelectedSeasonId}>
                <SelectTrigger className="w-64" style={{ borderColor: brandColors.goldPrestige }}>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map(season => (
                    <SelectItem key={season.id} value={season.id}>
                      {season.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {lastUpdated && (
              <p className="text-sm text-[var(--muted)]">Updated: {lastUpdated.toLocaleTimeString()}</p>
            )}
            <Button
              variant="outline"
              onClick={() => { loadStats(true); loadSeasonData(); }}
              disabled={loading || rateLimited}
              style={{ borderColor: brandColors.goldPrestige, color: brandColors.navyDeep }}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {rateLimited ? 'Rate Limited' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Rate Limit Warning */}
        {rateLimited && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800">Rate limit active. Please wait before refreshing again.</p>
            </div>
          </div>
        )}

        {/* Season Overview - Critical Mission Status */}
        {seasonData && (
          <Card className="border-2" style={{ borderColor: brandColors.goldPrestige, background: `linear-gradient(135deg, ${brandColors.navyDeep}05, ${brandColors.goldPrestige}10)` }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
                  <Trophy className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
                  {seasonData.season.name} - Mission Status
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleEditSeason}>
                  Edit Season
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  {seasonData.hasEnded ? (
                    <>
                      <div className="text-3xl font-bold text-gray-500">
                        Ended
                      </div>
                      <div className="text-sm text-[var(--muted)]">
                        {Math.abs(seasonData.daysRemaining)} days ago
                      </div>
                      <Badge variant="outline" className="mt-1 border-gray-400">
                        Season Closed
                      </Badge>
                    </>
                  ) : !seasonData.hasStarted ? (
                    <>
                      <div className="text-3xl font-bold" style={{ color: brandColors.skyBlue }}>
                        {Math.abs(seasonData.daysRemaining)}
                      </div>
                      <div className="text-sm text-[var(--muted)]">Days Until Start</div>
                      <Badge variant="outline" className="mt-1" style={{ borderColor: brandColors.skyBlue }}>
                        Upcoming
                      </Badge>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
                        {seasonData.daysRemaining}
                      </div>
                      <div className="text-sm text-[var(--muted)]">Days Until Close</div>
                      {seasonData.daysRemaining <= 7 && (
                        <Badge variant="destructive" className="mt-1">
                          <Flame className="w-3 h-3 mr-1" />
                          URGENT
                        </Badge>
                      )}
                    </>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: brandColors.goldPrestige }}>
                    {nomineeStats?.completeness || 0}%
                  </div>
                  <div className="text-sm text-[var(--muted)]">Profile Readiness</div>
                  {nomineeStats?.completeness < 70 && (
                    <Badge variant="outline" className="mt-1" style={{ borderColor: brandColors.skyBlue }}>
                      <Target className="w-3 h-3 mr-1" />
                      Needs Work
                    </Badge>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: brandColors.skyBlue }}>
                    {votingStats?.participationRate || 0}%
                  </div>
                  <div className="text-sm text-[var(--muted)]">Participation Rate</div>
                  {votingStats?.participationRate > 50 ? (
                    <Badge variant="outline" style={{ borderColor: '#10b981', color: '#10b981' }} className="mt-1">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Strong
                    </Badge>
                  ) : (
                    <Badge variant="outline" style={{ borderColor: '#f59e0b', color: '#f59e0b' }} className="mt-1">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Low
                    </Badge>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
                    {((votingStats?.totalVotes || 0) + 3613).toLocaleString()}
                  </div>
                  <div className="text-sm text-[var(--muted)]">Total Votes Cast</div>
                  <div className="text-xs text-[var(--muted)] mt-1">
                    V1: 3,613 • Current: {votingStats?.totalVotes.toLocaleString() || 0}
                  </div>
                  <Badge variant="outline" className="mt-1" style={{ borderColor: brandColors.goldPrestige }}>
                    <Zap className="w-3 h-3 mr-1" />
                    {votingStats?.uniqueVoters || 0} Voters
                  </Badge>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[var(--muted)]">Season Progress</span>
                  <span className="font-medium" style={{ color: brandColors.navyDeep }}>
                    {Math.round(((new Date() - seasonData.progress.start) / (seasonData.progress.end - seasonData.progress.start)) * 100)}%
                  </span>
                </div>
                <Progress
                  value={((new Date() - seasonData.progress.start) / (seasonData.progress.end - seasonData.progress.start)) * 100}
                  className="h-2"
                  style={{ backgroundColor: `${brandColors.goldPrestige}30` }}
                />
                <div className="flex justify-between text-xs mt-1 text-[var(--muted)]">
                  <span>{new Date(seasonData.progress.start).toLocaleDateString()}</span>
                  <span>{new Date(seasonData.progress.end).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        {seasonData && !seasonData.hasEnded && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
                <Zap className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExtendVoting(7)}>
                  Extend Voting +7 Days
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExtendVoting(14)}>
                  Extend Voting +14 Days
                </Button>
                <Button variant="outline" size="sm" onClick={handleEditSeason}>
                  Edit All Dates
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Critical Action Items */}
        {nomineeStats && votingStats && seasonData && (
          <Card className="border-l-4" style={{ borderLeftColor: seasonData.hasEnded ? '#6b7280' : '#ef4444' }}>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
                <AlertTriangle className="w-5 h-5 text-red-500" />
                {seasonData.hasEnded ? 'Season Summary' : 'Critical Action Items'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {seasonData.hasEnded && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <CheckCircle2 className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">Season Closed</div>
                      <div className="text-sm text-gray-700">This season ended on {new Date(seasonData.season.voting_end).toLocaleDateString()}. Review results and prepare for next season.</div>
                    </div>
                  </div>
                )}
                {!seasonData.hasEnded && seasonData.daysRemaining <= 7 && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <Flame className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-red-900">Season Closing Soon</div>
                      <div className="text-sm text-red-700">Only {seasonData.daysRemaining} days remaining. Ensure all voting and nominations are finalized.</div>
                    </div>
                  </div>
                )}

                {nomineeStats.completeness < 70 && (
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <Target className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-orange-900">Profile Completion Below Target</div>
                      <div className="text-sm text-orange-700">
                        {nomineeStats.total - nomineeStats.withPhotos} nominees missing photos,
                        {nomineeStats.total - nomineeStats.claimed} profiles unclaimed.
                      </div>
                    </div>
                  </div>
                )}

                {votingStats.participationRate < 50 && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Down className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-yellow-900">Low Voter Participation</div>
                      <div className="text-sm text-yellow-700">
                        Only {votingStats.participationRate}% participation. Consider sending reminders or extending voting period.
                      </div>
                    </div>
                  </div>
                )}

                {nomineeStats.completeness >= 70 && votingStats.participationRate >= 50 && seasonData.daysRemaining > 7 && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-green-900">Season On Track</div>
                      <div className="text-sm text-green-700">All key metrics are healthy. Continue monitoring progress.</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nominee Health Dashboard */}
        {nomineeStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-[var(--muted)] flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Total Nominees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
                  {nomineeStats.total}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-[var(--muted)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {nomineeStats.active}
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">
                  {Math.round((nomineeStats.active / nomineeStats.total) * 100)}% of total
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-[var(--muted)] flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Claimed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: brandColors.skyBlue }}>
                  {nomineeStats.claimed}
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">
                  {Math.round((nomineeStats.claimed / nomineeStats.total) * 100)}% completion
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-[var(--muted)] flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  With Photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: brandColors.goldPrestige }}>
                  {nomineeStats.withPhotos}
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">
                  {Math.round((nomineeStats.withPhotos / nomineeStats.total) * 100)}% complete
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-[var(--muted)] flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  With Bios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
                  {nomineeStats.withBios}
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">
                  {Math.round((nomineeStats.withBios / nomineeStats.total) * 100)}% complete
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Voting Breakdown */}
        {votingStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
                  <Vote className="w-5 h-5" />
                  Voting Method Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[var(--muted)]">Pairwise Votes</span>
                      <span className="font-semibold">{votingStats.pairwise.toLocaleString()}</span>
                    </div>
                    <Progress value={(votingStats.pairwise / votingStats.totalVotes) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[var(--muted)]">Ranked Choice Votes</span>
                      <span className="font-semibold">{votingStats.ranked.toLocaleString()}</span>
                    </div>
                    <Progress value={(votingStats.ranked / votingStats.totalVotes) * 100} className="h-2" />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold" style={{ color: brandColors.navyDeep }}>Total Votes</span>
                    <span className="text-2xl font-bold" style={{ color: brandColors.goldPrestige }}>
                      {votingStats.totalVotes.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
                  <Users className="w-5 h-5" />
                  Voter Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2" style={{ color: brandColors.goldPrestige }}>
                      {votingStats.uniqueVoters.toLocaleString()}
                    </div>
                    <div className="text-sm text-[var(--muted)]">Unique Voters</div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[var(--muted)]">Participation Rate</span>
                      <span className="font-semibold">{votingStats.participationRate}%</span>
                    </div>
                    <Progress value={votingStats.participationRate} className="h-3" />
                    <div className="text-xs text-[var(--muted)] mt-1">
                      Target: 50% or higher
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: brandColors.skyBlue }}>
                        {(votingStats.totalVotes / votingStats.uniqueVoters).toFixed(1)}
                      </div>
                      <div className="text-xs text-[var(--muted)]">Avg Votes/Voter</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                        {((votingStats.uniqueVoters / nomineeStats?.total) * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-[var(--muted)]">Voter Coverage</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Votes Today */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Vote className="w-4 h-4" />
                Rewarded Votes Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-900 dark:text-blue-100">{votesToday?.toLocaleString() || 'N/A'}</div>
              <div className="flex items-center text-sm text-blue-800 dark:text-blue-200 gap-1 mt-1">
                {trend.icon}
                <span>{trend.text} vs yesterday ({votesYesterday?.toLocaleString() || 'N/A'})</span>
              </div>
            </CardContent>
          </Card>

          {/* Daily Active Voters */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Voters Today (DAU)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-900 dark:text-green-100">{dauToday?.toLocaleString() || 'N/A'}</div>
              <div className="flex items-center text-sm text-green-800 dark:text-green-200 gap-1 mt-1">
                {dauStatsTrend.icon}
                <span>{dauStatsTrend.text} vs yesterday ({dauYesterday?.toLocaleString() || 'N/A'})</span>
              </div>
            </CardContent>
          </Card>

          {/* New Users Today */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                New Users Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-900 dark:text-purple-100">{usersToday?.toLocaleString() || 'N/A'}</div>
              <div className="flex items-center text-sm text-purple-800 dark:text-purple-200 gap-1 mt-1">
                {newUserStatsTrend.icon}
                <span>{newUserStatsTrend.text} vs yesterday ({usersYesterday?.toLocaleString() || 'N/A'})</span>
              </div>
            </CardContent>
          </Card>

          {/* Votes Last 7 Days */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[var(--muted)] flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Votes (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[var(--text)]">{votesLast7Days?.toLocaleString() || 'N/A'}</div>
            </CardContent>
          </Card>

          {/* 7 Day Average */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[var(--muted)] flex items-center gap-2">
                <Activity className="w-4 h-4" />
                7-Day Daily Vote Average
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[var(--text)]">{dailyAverage?.toLocaleString() || 'N/A'}</div>
            </CardContent>
          </Card>

          {/* Total Users */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[var(--muted)] flex items-center gap-2">
                <Database className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[var(--text)]">{totalUsers?.toLocaleString() || 'N/A'}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 7-Day Vote Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                7-Day Rewarded Vote Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyVotes || []} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" allowDecimals={false} />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      formatter={(value) => [value, 'Rewarded Votes']}
                    />
                    <Line
                      type="monotone"
                      dataKey="votes"
                      stroke="var(--accent)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "var(--accent)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 7-Day New User Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                7-Day New User Signups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyNewUsers || []} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" allowDecimals={false} />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      formatter={(value) => [value, 'New Users']}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="var(--accent-2)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "var(--accent-2)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time-of-Day Voting Pattern */}
        {hourlyVotingPattern && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Voting Activity by Time of Day (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyVotingPattern} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                    <XAxis
                      dataKey="label"
                      className="text-xs"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={1}
                    />
                    <YAxis className="text-xs" allowDecimals={false} />
                    <Tooltip
                      labelFormatter={(label) => `Time: ${label}`}
                      formatter={(value) => [value, 'Votes Cast']}
                    />
                    <Line
                      type="monotone"
                      dataKey="votes"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ r: 3, fill: "#8b5cf6" }}
                      activeDot={{ r: 6, fill: "#8b5cf6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-[var(--muted)]">
                <p>Peak voting hours help identify when users are most engaged. Consider scheduling announcements or campaigns during high-activity periods.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const subTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'results', label: 'Results', icon: Trophy },
    { id: 'ledger', label: 'Vote Ledger', icon: ScrollText },
  ];

  return (
    <div className="min-h-[60vh]">
      {/* Sub-tab Navigation */}
      <div className="border-b border-[var(--border)] px-6 pt-4">
        <div className="flex space-x-4">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeSubTab === tab.id
                    ? 'border-[var(--accent)] text-[var(--accent)]'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <EditSeasonModal />

      {activeSubTab === 'overview' && (
        loading && !stats ? <LoadingState /> : <DashboardContent />
      )}
      {activeSubTab === 'analytics' && (
        <div className="p-6">
          <AdvancedAnalyticsPanel seasonId={selectedSeasonId} onNavigate={onNavigate} />
        </div>
      )}
      {activeSubTab === 'results' && <ResultsDashboard />}
      {activeSubTab === 'ledger' && <VoteLedger />}
    </div>
  );
}