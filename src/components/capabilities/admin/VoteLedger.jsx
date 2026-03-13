import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { getVoteLedgerData } from '@/functions/getVoteLedgerData';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Database, RefreshCw, ChevronLeft, ChevronRight, Vote, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

export default function VoteLedger() {
  const [activeTab, setActiveTab] = useState('pairwise');
  const [rcvSubTab, setRcvSubTab] = useState('votes');
  const [ledgerData, setLedgerData] = useState([]);
  const [rcvData, setRcvData] = useState([]);
  const [rcvResults, setRcvResults] = useState(null);
  const [expandedNominee, setExpandedNominee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalPairwiseVotes, setTotalPairwiseVotes] = useState(0);

  const loadLedgerData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await getVoteLedgerData({ page, limit: 25 });
      
      if (data.success) {
        setLedgerData(data.data);
        setHasMore(data.hasMore);
        setTotalPairwiseVotes(data.totalCount || 0);
      } else {
        throw new Error(data.error || 'Failed to load ledger data');
      }
    } catch (error) {
      console.error('Error loading vote ledger:', error);
      toast.error("Could not load vote ledger data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRcvData = useCallback(async () => {
    setLoading(true);
    try {
      const votes = await base44.entities.RankedVote.list('-created_date', 50);
      setRcvData(votes || []);
    } catch (error) {
      console.error('Error loading RCV ledger:', error);
      toast.error("Could not load ranked choice vote data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRcvResults = useCallback(async () => {
    setLoading(true);
    try {
      const nominees = await base44.entities.Nominee.list('', 1000);
      const votes = await base44.entities.RankedVote.list('-created_date', 1000);
      
      // Calculate Borda scores from ballots
      const scoreMap = {};
      const totalNominees = nominees.length;
      
      // Initialize scores
      nominees.forEach(n => {
        scoreMap[n.id] = {
          id: n.id,
          name: n.name,
          bordaScore: 0,
          totalVotes: 0,
          firstChoiceVotes: 0,
          positionBreakdown: {} // Track votes by position
        };
      });
      
      // Calculate scores from each ballot
      votes.forEach(vote => {
        if (!vote.ballot || !Array.isArray(vote.ballot)) return;
        
        vote.ballot.forEach((nomineeId, position) => {
          if (scoreMap[nomineeId]) {
            // Fixed 100-point scale: 1st = 100, 2nd = 99, 3rd = 98, etc.
            const points = 100 - position;
            scoreMap[nomineeId].bordaScore += points;
            scoreMap[nomineeId].totalVotes += 1;
            
            // Track position breakdown
            const positionLabel = position + 1;
            scoreMap[nomineeId].positionBreakdown[positionLabel] = 
              (scoreMap[nomineeId].positionBreakdown[positionLabel] || 0) + 1;
            
            if (position === 0) {
              scoreMap[nomineeId].firstChoiceVotes += 1;
            }
          }
        });
      });
      
      // Convert to array and sort by Borda score
      const results = Object.values(scoreMap)
        .filter(n => n.totalVotes > 0)
        .sort((a, b) => b.bordaScore - a.bordaScore)
        .map((n, idx) => ({
          rank: idx + 1,
          name: n.name,
          bordaScore: n.bordaScore,
          totalVotes: n.totalVotes,
          firstChoiceVotes: n.firstChoiceVotes,
          positionBreakdown: n.positionBreakdown
        }));
      
      setRcvResults({
        nominees: results,
        totalBallots: votes.length
      });
    } catch (error) {
      console.error('Error loading RCV results:', error);
      toast.error("Could not load ranked choice results.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'pairwise') {
      loadLedgerData(currentPage);
    } else if (activeTab === 'rcv') {
      if (rcvSubTab === 'votes') {
        loadRcvData();
      } else {
        loadRcvResults();
      }
    }
  }, [currentPage, activeTab, rcvSubTab, loadLedgerData, loadRcvData, loadRcvResults]);

  const handleRefresh = () => {
    if (activeTab === 'pairwise') {
      loadLedgerData(currentPage);
    } else if (activeTab === 'rcv') {
      if (rcvSubTab === 'votes') {
        loadRcvData();
      } else {
        loadRcvResults();
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getEloChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const getEloChangeBadge = (change) => {
    if (change > 0) return 'bg-green-100 text-green-800';
    if (change < 0) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)]">Vote Ledger</h2>
            <p className="text-[var(--muted)]">Real-time audit log of all voting activity</p>
          </div>
        </div>
        <Button onClick={handleRefresh} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pairwise">Pairwise / Perception</TabsTrigger>
          <TabsTrigger value="rcv">Ranked Choice / Reputation</TabsTrigger>
        </TabsList>

        <TabsContent value="pairwise">
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>Recent Vote Activity</span>
              <Badge variant="secondary" className="text-sm">
                {totalPairwiseVotes.toLocaleString()} total votes
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm text-[var(--muted)] px-3">
                Page {currentPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!hasMore}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ledgerData.length === 0 ? (
            <div className="text-center py-8 text-[var(--muted)]">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No vote data found for this page.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ledgerData.map((entry) => (
                <div
                  key={entry.id}
                  className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)]/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(entry.timestamp), 'MMM d, h:mm a')}
                        </Badge>
                        <span className="text-sm text-[var(--muted)]">
                          Voted by: <strong>{entry.voterName}</strong>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Winner */}
                        <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-green-700 font-semibold">👑 Winner</span>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{entry.winnerName}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-gray-600">{entry.winnerCurrentElo} ELO</span>
                              <Badge className={getEloChangeBadge(entry.winnerEloChange)}>
                                {entry.winnerEloChange > 0 ? '+' : ''}{entry.winnerEloChange}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Loser */}
                        <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-red-700 font-semibold">❌ Runner-up</span>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{entry.loserName}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-gray-600">{entry.loserCurrentElo} ELO</span>
                              <Badge className={getEloChangeBadge(entry.loserEloChange)}>
                                {entry.loserEloChange > 0 ? '+' : ''}{entry.loserEloChange}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="rcv">
          <Tabs value={rcvSubTab} onValueChange={setRcvSubTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="votes">Vote Audit</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="votes">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Vote className="w-5 h-5" />
                    Ranked Choice Vote Audit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {rcvData.length === 0 ? (
                    <div className="text-center py-8 text-[var(--muted)]">
                      <Vote className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No ranked choice vote data found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rcvData.map((vote, idx) => (
                        <div
                          key={vote.id || idx}
                          className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)]/50"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs">
                                {format(new Date(vote.created_date), 'MMM d, h:mm a')}
                              </Badge>
                              <span className="text-sm text-[var(--muted)]">
                                Voter: <strong>{vote.voter_email}</strong>
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 rounded-lg p-3">
                            <h4 className="text-xs font-semibold text-slate-600 mb-2">Ranked Ballot</h4>
                            <ol className="space-y-1">
                              {vote.ballot && vote.ballot.map((nomineeId, position) => (
                                <li key={position} className="flex items-center gap-2 text-sm">
                                  <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0">
                                    {position + 1}
                                  </Badge>
                                  <span className="text-slate-700">Nominee ID: {nomineeId}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Vote className="w-5 h-5" />
                    Ranked Choice Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!rcvResults ? (
                    <div className="text-center py-8 text-[var(--muted)]">
                      <Vote className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No results calculated yet.</p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-900">
                          <strong>Total Ballots Cast:</strong> {rcvResults.totalBallots}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        {rcvResults.nominees.map((nominee) => {
                          const isExpanded = expandedNominee === nominee.rank;
                          return (
                            <div
                              key={nominee.rank}
                              className="border border-[var(--border)] rounded-lg bg-[var(--card)]/50 overflow-hidden"
                            >
                              <button
                                onClick={() => setExpandedNominee(isExpanded ? null : nominee.rank)}
                                className="w-full p-4 hover:bg-[var(--card)] transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <Badge 
                                      variant="secondary" 
                                      className="text-lg font-bold w-10 h-10 flex items-center justify-center"
                                    >
                                      {nominee.rank}
                                    </Badge>
                                    <div className="text-left">
                                      <h4 className="font-semibold text-[var(--text)]">{nominee.name}</h4>
                                      <p className="text-xs text-[var(--muted)]">
                                        {nominee.totalVotes} total votes • {nominee.firstChoiceVotes} first-choice
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Badge className="bg-purple-100 text-purple-800 text-lg font-bold px-4 py-2">
                                      {nominee.bordaScore.toFixed(1)} pts
                                    </Badge>
                                    {isExpanded ? (
                                      <ChevronUp className="w-5 h-5 text-[var(--muted)]" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-[var(--muted)]" />
                                    )}
                                  </div>
                                </div>
                              </button>
                              
                              {isExpanded && (
                                <div className="px-4 pb-4 pt-2 border-t border-[var(--border)]">
                                  <h5 className="text-xs font-semibold text-[var(--muted)] mb-3">Vote Position Breakdown</h5>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {Object.entries(nominee.positionBreakdown)
                                      .sort(([a], [b]) => Number(a) - Number(b))
                                      .map(([position, count]) => (
                                        <div 
                                          key={position}
                                          className="bg-slate-50 rounded-lg p-3 text-center"
                                        >
                                          <div className="text-xs text-slate-600 mb-1">
                                            {position === '1' ? '🥇' : position === '2' ? '🥈' : position === '3' ? '🥉' : '📍'} 
                                            {' '}Position {position}
                                          </div>
                                          <div className="text-lg font-bold text-slate-900">{count}</div>
                                          <div className="text-xs text-slate-500">
                                            {((count / nominee.totalVotes) * 100).toFixed(0)}%
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}