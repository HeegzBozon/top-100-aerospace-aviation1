import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Medal, Award, CheckCircle, Building, MapPin, Search, Info, Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import { RankedVote } from '@/entities/RankedVote';
import { awardStardust } from '@/functions/awardStardust';
import { useToast } from '@/components/ui/use-toast';
import { progressQuest } from '@/functions/progressQuest';

const RANK_ICONS = [
  { icon: Trophy, color: 'text-yellow-500', label: '1st Choice' },
  { icon: Medal, color: 'text-gray-400', label: '2nd Choice' },
  { icon: Award, color: 'text-amber-600', label: '3rd Choice' }
];

const MAX_CHOICES_LIMIT = 100; // Max choices allowed in the ballot

export default function RankedChoiceVoting({ nominees, season, currentUser, onVoteComplete }) {
  const [rankedNominees, setRankedNominees] = useState([]);
  const [availableNominees, setAvailableNominees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, company, country
  const [filterCountry, setFilterCountry] = useState('all');
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Logic for loading vote state is now integrated here, using props
    const safeNominees = Array.isArray(nominees) ? nominees : [];
    if (safeNominees.length > 0 && season && currentUser) {
      const fetchUserVote = async () => {
        try {
          // Fetch user's previous vote for the current season using the passed currentUser and season
          const existingVotes = await RankedVote.filter({ voter_email: currentUser.email, season_id: season.id }, '-created_date', 1);
          const userVote = existingVotes[0]; // Assuming only one vote per user per season

          if (userVote) {
            setHasVoted(true);
            // Reconstruct their ballot from the fetched nominee IDs
            const ballot = userVote.ballot
              .map(nomineeId => safeNominees.find(n => n.id === nomineeId))
              .filter(Boolean); // Filter out any nominees not found (e.g., if nominee was deleted)
            setRankedNominees(ballot); // Use renamed state
            
            // Determine available nominees by excluding those already in the ballot
            setAvailableNominees(safeNominees.filter(n => !ballot.some(rc => rc.id === n.id)));
          } else {
            // If no vote, all nominees are available
            setAvailableNominees(safeNominees);
          }
        } catch (error) {
          console.error('Failed to load voting data:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load voting data. Please try again."
          });
        } finally {
          setLoading(false);
        }
      };
      fetchUserVote();
    } else if (!currentUser || !season) {
      // If currentUser or season is not yet provided, keep loading state
      setLoading(true);
      setAvailableNominees([]); // Clear previous state if props are not ready
      setRankedNominees([]); // Clear previous state if props are not ready
      setHasVoted(false);
    }
  }, [nominees, season, currentUser]); // Dependencies now include the new props

  // Get unique countries for filter
  const countries = useMemo(() => {
    const countrySet = new Set(availableNominees.map(n => n.country).filter(Boolean));
    return ['all', ...Array.from(countrySet).sort()];
  }, [availableNominees]);

  // Filter and sort available nominees
  const filteredAvailableNominees = useMemo(() => {
    let filtered = availableNominees.filter(nominee => {
      const matchesSearch = 
        nominee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nominee.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nominee.country?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCountry = filterCountry === 'all' || nominee.country === filterCountry;
      
      return matchesSearch && matchesCountry;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === 'company') {
        return (a.company || '').localeCompare(b.company || '');
      } else if (sortBy === 'country') {
        return (a.country || '').localeCompare(b.country || '');
      }
      return 0;
    });

    return filtered;
  }, [availableNominees, searchQuery, sortBy, filterCountry]);

  // Click handlers
  const handleAddToBallot = (nominee) => {
    if (rankedNominees.length >= MAX_CHOICES_LIMIT) {
      toast({
        title: "Maximum Choices Reached",
        description: `You can only rank up to ${MAX_CHOICES_LIMIT} nominees.`
      });
      return;
    }
    setRankedNominees(prev => [...prev, nominee]);
    setAvailableNominees(prev => prev.filter(n => n.id !== nominee.id));
  };

  const handleRemoveFromBallot = (nominee) => {
    setRankedNominees(prev => prev.filter(n => n.id !== nominee.id));
    setAvailableNominees(prev => [...prev, nominee]);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newRanked = [...rankedNominees];
    [newRanked[index - 1], newRanked[index]] = [newRanked[index], newRanked[index - 1]];
    setRankedNominees(newRanked);
  };

  const handleMoveDown = (index) => {
    if (index === rankedNominees.length - 1) return;
    const newRanked = [...rankedNominees];
    [newRanked[index], newRanked[index + 1]] = [newRanked[index + 1], newRanked[index]];
    setRankedNominees(newRanked);
  };

  const handleSubmitBallot = async () => {
    // Use props: currentUser and season, and state: rankedNominees
    if (!currentUser || !season || rankedNominees.length < 1) {
      if (rankedNominees.length < 1) {
        toast({
          title: "Minimum 1 Choice Required",
          description: "Please rank at least 1 nominee to submit your ballot."
        });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const ballot = rankedNominees.map(nominee => nominee.id);
      
      await RankedVote.create({
        voter_email: currentUser.email, // Using prop
        ballot,
        season_id: season.id // Using prop
      });

      // Award Stardust for voting
      await awardStardust({
        user_email: currentUser.email, // Using prop
        action_type: 'ranked_vote',
      });

      // Progress quests
      await progressQuest({
        action: 'ranked_vote',
        increment: 1,
      });

      // **REMOVED** the heavy `updateUserScores` call to prevent rate limiting.
      // This call is now handled by a separate, less frequent process or a serverless function trigger.

      setHasVoted(true);
      
      toast({
        title: "Ballot Submitted!",
        description: `Your ranked choice ballot has been recorded. +10 Stardust earned!`,
      });

      // Removed setTimeout as per outline
      if (onVoteComplete) onVoteComplete();

    } catch (error) {
      console.error('Error submitting ballot:', error);
      toast({
        variant: "destructive",
        title: "Ballot Failed",
        description: "Could not submit your ballot. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[var(--muted)]">Loading nominees...</p>
        </div>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-green-500 mb-4">
            Ranked Ballot Submitted! 🗳️
          </h2>
          
          <div className="bg-[var(--card)] rounded-lg p-4 mb-4 border border-[var(--border)] max-w-md">
            <p className="text-sm text-[var(--muted)] mb-2">Your ranked choices:</p>
            {rankedNominees.slice(0, 3).map((nominee, index) => {
              const RankIcon = RANK_ICONS[index]?.icon || Award;
              const iconColor = RANK_ICONS[index]?.color || 'text-gray-400';
              return (
                <div key={nominee.id} className="flex items-center gap-2 py-1">
                  <RankIcon className={`w-4 h-4 ${iconColor}`} />
                  <span className="text-sm font-medium text-[var(--text)]">
                    {nominee.name}
                  </span>
                </div>
              );
            })}
            {rankedNominees.length > 3 && (
              <p className="text-xs text-[var(--muted)] mt-2">
                +{rankedNominees.length - 3} more choices
              </p>
            )}
          </div>
          
          <p className="text-[var(--muted)] leading-relaxed">
            Your preferences shape the rankings.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-[var(--text)]">
              Reputation
            </h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)]/10">
                  <Info className="h-4 w-4" />
                  <span className="text-sm font-medium">Learn More</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Reputation (Ranked Choice Voting)</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm text-[var(--text)]">
                  <p>
                    Ranked Choice captures <strong>reputation</strong>, not just preference.
                  </p>
                  <p>
                    Voters evaluate a group of nominees and organize them into a personal order of merit.
                  </p>
                  <p className="font-semibold">This reveals:</p>
                  <ul className="space-y-2 ml-4">
                    <li><strong>Depth of respect</strong> — not just who wins, but who stays near the top</li>
                    <li><strong>Stability of recognition</strong> — consistent placement across many ballots</li>
                    <li><strong>Long-view credibility</strong> — who is valued broadly across the community</li>
                  </ul>
                  <p>
                    Reputation reflects <strong>considered judgment</strong> — a structured assessment of impact, leadership, innovation, contribution, and trajectory.
                  </p>
                  <p>
                    It shows how nominees stand in the long arc of their work, not just a momentary comparison.
                  </p>
                  <div className="pt-4 mt-4 border-t border-[var(--border)]">
                    <p className="text-xs text-[var(--muted)] italic">
                      Together, Perception and Reputation create a balanced, data-driven view of nominee standing — 
                      blending the community's instincts with its evaluated respect.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
            Click nominees to add them to your ballot. Your #1 choice gets the most weight, 
            followed by #2, #3, and so on.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Ranked Ballot */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--text)]">Your Ballot</h2>
              <Badge variant="outline">
                {rankedNominees.length}/{MAX_CHOICES_LIMIT}
              </Badge>
            </div>
            
            <div className="min-h-[400px] border-2 border-dashed rounded-lg p-4 border-gray-300">
              {rankedNominees.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-[var(--muted)]">
                      Click nominees to add them to your ballot
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {rankedNominees.map((nominee, index) => {
                    const RankIcon = RANK_ICONS[index]?.icon || Award;
                    const iconColor = RANK_ICONS[index]?.color || 'text-gray-400';
                    
                    return (
                      <Card key={nominee.id} className="hover:shadow-md transition-all">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === rankedNominees.length - 1}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <RankIcon className={`w-5 h-5 ${iconColor}`} />
                              <span className="text-sm font-medium text-[var(--muted)]">#{index + 1}</span>
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="font-semibold text-[var(--text)]">{nominee.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                                <Building className="w-3 h-3" />
                                <span>{nominee.company}</span>
                                {nominee.country && (
                                  <>
                                    <span>•</span>
                                    <MapPin className="w-3 h-3" />
                                    <span>{nominee.country}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveFromBallot(nominee)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-5 h-5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {rankedNominees.length >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <Button
                  onClick={handleSubmitBallot}
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white font-bold"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                      Submitting Ballot...
                    </div>
                  ) : (
                    <>
                      <Trophy className="w-5 h-5 mr-2" />
                      Submit Ranked Ballot ({rankedNominees.length} {rankedNominees.length === 1 ? 'choice' : 'choices'})
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>

          {/* Available Nominees */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--text)]">Available Nominees</h2>
              <Badge variant="secondary">
                {filteredAvailableNominees.length} shown
              </Badge>
            </div>
            
            {/* Search Bar */}
            <div className="mb-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
              <Input
                type="text"
                placeholder="Search by name, company, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort and Filter Controls */}
            <div className="mb-4 flex gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="company">Sort by Company</SelectItem>
                  <SelectItem value="country">Sort by Country</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCountry} onValueChange={setFilterCountry}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Filter country..." />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>
                      {country === 'all' ? 'All Countries' : country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-2 p-4 border-2 border-dashed rounded-lg border-gray-300">
              {filteredAvailableNominees.length === 0 ? (
                <div className="text-center py-8 text-[var(--muted)]">
                  {searchQuery ? 'No nominees match your search' : 'No nominees available'}
                </div>
              ) : (
                filteredAvailableNominees.map((nominee) => (
                  <Card
                    key={nominee.id}
                    className="cursor-pointer hover:shadow-md hover:border-[var(--accent)] transition-all"
                    onClick={() => handleAddToBallot(nominee)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[var(--accent)] hover:bg-[var(--accent)]/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToBallot(nominee);
                          }}
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-[var(--text)]">{nominee.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                            <Building className="w-3 h-3" />
                            <span>{nominee.company}</span>
                            {nominee.country && (
                              <>
                                <span>•</span>
                                <MapPin className="w-3 h-3" />
                                <span>{nominee.country}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
  );
}