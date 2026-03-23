import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { getStandingsData } from '@/functions/getStandingsData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trophy, Medal, Crown, Search, Download, RefreshCw, Loader2,
  TrendingUp, Award, BarChart3, Users, Sparkles
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

export default function ResultsDashboard() {
  const [loading, setLoading] = useState(true);
  const [standings, setStandings] = useState([]);
  const [rcvResults, setRcvResults] = useState([]);
  const [combinedResults, setCombinedResults] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('combined');
  
  // Weighting for combined score
  const [auraWeight, setAuraWeight] = useState(50);
  const [rcvWeight, setRcvWeight] = useState(50);

  useEffect(() => {
    loadSeasons();
  }, []);

  useEffect(() => {
    if (selectedSeasonId) {
      loadResults();
    }
  }, [selectedSeasonId]);

  const loadSeasons = async () => {
    try {
      const allSeasons = await base44.entities.Season.list('-created_date', 50);
      setSeasons(allSeasons);
      
      const season3 = allSeasons.find(s => s.name?.includes('Season 3'));
      const activeSeason = allSeasons.find(s => s.status === 'voting_open' || s.status === 'active');
      setSelectedSeasonId(season3?.id || activeSeason?.id || allSeasons[0]?.id);
    } catch (error) {
      console.error('Failed to load seasons:', error);
    }
  };

  const loadResults = async () => {
    setLoading(true);
    try {
      // Load standings (Aura scores)
      const { data: standingsData } = await getStandingsData({
        season: selectedSeasonId,
        sort: 'aura',
        dir: 'desc',
        page: 1,
        limit: 1000
      });

      const standingsRows = standingsData?.standings?.rows || [];
      setStandings(standingsRows);

      // Load RCV results - calculate Borda scores from RankedVote ballots directly
      const rankedVotes = await base44.entities.RankedVote.filter({ season_id: selectedSeasonId });
      
      // Calculate Borda scores from ballots (same logic as VoteLedger)
      const scoreMap = {};
      standingsRows.forEach(n => {
        scoreMap[n.nomineeId] = {
          nomineeId: n.nomineeId,
          bordaScore: 0,
          totalVotes: 0,
          firstChoiceVotes: 0
        };
      });
      
      rankedVotes.forEach(vote => {
        if (!vote.ballot || !Array.isArray(vote.ballot)) return;
        vote.ballot.forEach((nomineeId, position) => {
          if (scoreMap[nomineeId]) {
            // Fixed 100-point scale: 1st = 100, 2nd = 99, etc.
            const points = 100 - position;
            scoreMap[nomineeId].bordaScore += points;
            scoreMap[nomineeId].totalVotes += 1;
            if (position === 0) {
              scoreMap[nomineeId].firstChoiceVotes += 1;
            }
          }
        });
      });
      
      // Convert to array sorted by Borda score
      const rcvNominees = Object.values(scoreMap)
        .filter(n => n.totalVotes > 0)
        .sort((a, b) => b.bordaScore - a.bordaScore)
        .map((n, idx) => ({
          ...n,
          rcvRank: idx + 1
        }));
      
      setRcvResults(rcvNominees);

      // Combine results
      combineResults(standingsRows, rcvNominees);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  const combineResults = (standingsData, rcvData) => {
    // Create a map of RCV scores by nominee ID
    const rcvMap = new Map();
    rcvData.forEach((nominee) => {
      rcvMap.set(nominee.nomineeId, {
        bordaScore: nominee.bordaScore || 0,
        rcvRank: nominee.rcvRank,
        totalRcvVotes: nominee.totalVotes || 0,
        firstChoiceVotes: nominee.firstChoiceVotes || 0
      });
    });

    // Find max values for normalization
    const maxAura = Math.max(...standingsData.map(n => n.aura || 0), 1);
    const maxBorda = Math.max(...rcvData.map(n => n.bordaScore || 0), 1);

    // Combine standings with RCV data
    const combined = standingsData.map((nominee, index) => {
      const rcvInfo = rcvMap.get(nominee.nomineeId) || { bordaScore: 0, rcvRank: null, totalRcvVotes: 0 };
      
      // Normalize scores to 0-100 scale
      const normalizedAura = ((nominee.aura || 0) / maxAura) * 100;
      const normalizedRcv = (rcvInfo.bordaScore / maxBorda) * 100;
      
      // Calculate combined score
      const combinedScore = (normalizedAura * (auraWeight / 100)) + (normalizedRcv * (rcvWeight / 100));

      return {
        ...nominee,
        auraRank: index + 1,
        normalizedAura,
        bordaScore: rcvInfo.bordaScore,
        normalizedRcv,
        rcvRank: rcvInfo.rcvRank,
        totalRcvVotes: rcvInfo.totalRcvVotes,
        combinedScore,
      };
    });

    // Sort by combined score and assign final ranks
    combined.sort((a, b) => b.combinedScore - a.combinedScore);
    combined.forEach((nominee, index) => {
      nominee.finalRank = index + 1;
    });

    setCombinedResults(combined);
  };

  // Recalculate when weights change
  useEffect(() => {
    if (standings.length > 0 && rcvResults.length > 0) {
      combineResults(standings, rcvResults);
    }
  }, [auraWeight, rcvWeight]);

  const filteredResults = useMemo(() => {
    let results = [...combinedResults];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(n => 
        n.nomineeName?.toLowerCase().includes(term) ||
        n.title?.toLowerCase().includes(term) ||
        n.company?.toLowerCase().includes(term)
      );
    }

    // Sort
    switch (sortBy) {
      case 'aura':
        results.sort((a, b) => (b.aura || 0) - (a.aura || 0));
        break;
      case 'rcv':
        results.sort((a, b) => (b.bordaScore || 0) - (a.bordaScore || 0));
        break;
      case 'combined':
      default:
        results.sort((a, b) => b.combinedScore - a.combinedScore);
    }

    return results;
  }, [combinedResults, searchTerm, sortBy]);

  const exportResults = () => {
    const headers = ['Final Rank', 'Name', 'Title', 'Company', 'Country', 'Aura Score', 'Aura Rank', 'Borda Score', 'RCV Rank', 'Combined Score'];
    const rows = filteredResults.map(n => [
      n.finalRank,
      n.nomineeName,
      n.title || '',
      n.company || '',
      n.country || '',
      n.aura || 0,
      n.auraRank,
      n.bordaScore || 0,
      n.rcvRank || 'N/A',
      n.combinedScore.toFixed(2)
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `top100-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brandColors.goldPrestige }} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
            <Trophy className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
            Final Results & Rankings
          </h2>
          <p className="text-sm text-gray-500 mt-1">Combined Aura scores with Ranked Choice Voting results</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedSeasonId} onValueChange={setSelectedSeasonId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadResults}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportResults} style={{ backgroundColor: brandColors.navyDeep }}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8" style={{ color: brandColors.skyBlue }} />
              <div>
                <div className="text-2xl font-bold">{combinedResults.length}</div>
                <div className="text-xs text-gray-500">Total Nominees</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
              <div>
                <div className="text-2xl font-bold">{Math.round(combinedResults.reduce((sum, n) => sum + (n.aura || 0), 0) / combinedResults.length || 0)}</div>
                <div className="text-xs text-gray-500">Avg Aura Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8" style={{ color: brandColors.navyDeep }} />
              <div>
                <div className="text-2xl font-bold">{rcvResults.length}</div>
                <div className="text-xs text-gray-500">With RCV Votes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{combinedResults.filter(n => n.combinedScore > 50).length}</div>
                <div className="text-xs text-gray-500">Above 50 Combined</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weight Configuration */}
      <Card className="border-2" style={{ borderColor: brandColors.goldPrestige }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Score Weighting Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Aura Score Weight: {auraWeight}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={auraWeight}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setAuraWeight(val);
                  setRcvWeight(100 - val);
                }}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Pairwise voting + engagement metrics</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">RCV (Borda) Weight: {rcvWeight}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={rcvWeight}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setRcvWeight(val);
                  setAuraWeight(100 - val);
                }}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Ranked choice ballot scores</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search nominees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="combined">Combined Score</SelectItem>
            <SelectItem value="aura">Aura Score</SelectItem>
            <SelectItem value="rcv">RCV Borda Score</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nominee</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Aura</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Aura Rank</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Borda</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">RCV Rank</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Combined</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredResults.slice(0, 100).map((nominee) => (
                  <tr 
                    key={nominee.nomineeId} 
                    className={`hover:bg-gray-50 ${nominee.finalRank <= 3 ? 'bg-yellow-50/50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getRankBadge(nominee.finalRank)}
                        <span className="font-bold text-lg" style={{ color: brandColors.navyDeep }}>
                          #{nominee.finalRank}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {nominee.avatarUrl ? (
                          <img src={nominee.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {nominee.nomineeName?.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold">{nominee.nomineeName}</div>
                          <div className="text-xs text-gray-500">{nominee.title} {nominee.company && `@ ${nominee.company}`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold" style={{ color: brandColors.goldPrestige }}>
                        {nominee.aura || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline">#{nominee.auraRank}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold" style={{ color: brandColors.skyBlue }}>
                        {nominee.bordaScore || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {nominee.rcvRank ? (
                        <Badge variant="outline">#{nominee.rcvRank}</Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div 
                        className="font-bold text-lg"
                        style={{ color: brandColors.navyDeep }}
                      >
                        {nominee.combinedScore.toFixed(1)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredResults.length > 100 && (
        <p className="text-center text-sm text-gray-500">
          Showing top 100 of {filteredResults.length} nominees
        </p>
      )}
    </div>
  );
}