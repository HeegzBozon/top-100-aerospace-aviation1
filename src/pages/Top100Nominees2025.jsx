import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { User } from '@/entities/User';
import { Season } from '@/entities/Season';
import { Nominee } from '@/entities/Nominee';
import { RankedVote } from '@/entities/RankedVote';
import { NomineeTag } from '@/entities/NomineeTag';
import { getStandingsData } from '@/functions/getStandingsData';
import { saveRankedVote } from '@/functions/saveRankedVote';
import { getUserRankedVote } from '@/functions/getUserRankedVote';
import { Loader2, Crown, List, Grid, Search, Star, Sparkles, GripVertical, X, Tag as TagIcon, Shuffle, Users } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StandingsCore } from '@/components/epics/03-mission-rooms/games';
import { NomineeQuickView } from '@/components/epics/01-index-engine/discovery';
import { EngagementCTA } from '@/components/epics/03-mission-rooms/games';
import { RcvBallotManager } from '@/components/epics/03-mission-rooms/games';
import { VotingModal } from '@/components/epics/06-nomination-engine/voting';
import { NominationModal } from '@/components/epics/06-nomination-engine/nominations';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function Top100Nominees2025() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeSeason, setActiveSeason] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [standings, setStandings] = useState({ rows: [], total: 0 });
  const [viewMode, setViewMode] = useState('grid');
  const [sortValue, setSortValue] = useState('nomineeName_asc');
  const [regionFilter, setRegionFilter] = useState('all');
  const [shuffled, setShuffled] = useState(true);
  const [quickViewNominee, setQuickViewNominee] = useState(null);
  
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [processingFav, setProcessingFav] = useState(null);
  
  const [votingModalOpen, setVotingModalOpen] = useState(false);
  const [nominationModalOpen, setNominationModalOpen] = useState(false);
  
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTagCloud, setShowTagCloud] = useState(true);
  const [visibleTagCount, setVisibleTagCount] = useState(20);
  
  // Season 4 tabs
  const [activeListTab, setActiveListTab] = useState('women');
  const [season4Women, setSeason4Women] = useState(null);
  const [season4Men, setSeason4Men] = useState(null);
  const [season4Nominees, setSeason4Nominees] = useState([]);
  
  const searchInputRef = useRef(null);
  const { toast } = useToast();

  // Watch for URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const searchFromUrl = urlParams.get('search');
      if (searchFromUrl !== searchTerm) {
        setSearchTerm(searchFromUrl || '');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    const interval = setInterval(handleUrlChange, 100);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      clearInterval(interval);
    };
  }, [searchTerm]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check for URL params
        const urlParams = new URLSearchParams(window.location.search);
        const tagFromUrl = urlParams.get('tag');
        const searchFromUrl = urlParams.get('search');
        const listFromUrl = urlParams.get('list');
        
        if (listFromUrl && ['women', 'men'].includes(listFromUrl)) {
          setActiveListTab(listFromUrl);
        }
        
        const user = await User.me().catch(() => null);
        setCurrentUser(user);

        const seasons = await Season.list('-start_date');
        
        // Find Season 4 lists (nominations_open status)
        const womenSeason = seasons.find(s => s.name?.includes('Women') && s.status === 'nominations_open');
        const menSeason = seasons.find(s => s.name?.includes('Men') && s.status === 'nominations_open');
        
        setSeason4Women(womenSeason);
        setSeason4Men(menSeason);
        
        // Default to women's list, or use active season as fallback
        const targetSeason = womenSeason || seasons.find(s => s.status === 'active') || seasons[0];
        setActiveSeason(targetSeason);

        // Load Season 4 nominees directly (pending + active for Season 4)
        const womenSeasonId = womenSeason?.id;
        const menSeasonId = menSeason?.id;
        
        console.log('Season IDs - Women:', womenSeasonId, 'Men:', menSeasonId);
        
        if (womenSeasonId || menSeasonId) {
          const allNominees = await Nominee.list('-created_date', 500);
          console.log('All nominees count:', allNominees.length);
          
          const s4Nominees = allNominees.filter(n => {
            const matchesSeason = n.season_id === womenSeasonId || n.season_id === menSeasonId;
            const matchesStatus = n.status === 'approved';
            return matchesSeason && matchesStatus;
          });
          
          console.log('Season 4 nominees found:', s4Nominees.length);
          setSeason4Nominees(s4Nominees);
          
          // Convert to standings format
          const rows = s4Nominees.map((n, idx) => ({
            nomineeId: n.id,
            nomineeName: n.name,
            title: n.title || n.professional_role,
            company: n.company || n.organization,
            country: n.country,
            avatarUrl: n.avatar_url || n.photo_url,
            description: n.description,
            aura: n.aura_score || 0,
            rank: idx + 1,
            seasonId: n.season_id,
            status: n.status,
          }));
          
          setStandings({ rows, total: rows.length });
        } else if (targetSeason) {
          const { data } = await getStandingsData({
            season: targetSeason.id,
            sort: 'aura',
            dir: 'desc',
            page: 1,
            limit: 1000
          });
          
          if (data && data.standings) {
            setStandings(data.standings);
          }
        }
        
        if (user && targetSeason) {
          const { data } = await getUserRankedVote({ season_id: targetSeason.id });
          if (data.success) {
            setFavorites(data.ballot || []);
          }
        }
        
        // Load all approved tags
        const tags = await NomineeTag.filter({ status: 'approved' }, '-upvotes');
        
        // Deduplicate tags by tag_name (keep the one with most upvotes)
        const tagsByName = new Map();
        tags.forEach(tag => {
          const existing = tagsByName.get(tag.tag_name);
          if (!existing || (tag.upvotes || 0) > (existing.upvotes || 0)) {
            tagsByName.set(tag.tag_name, tag);
          }
        });
        const uniqueTags = Array.from(tagsByName.values());
        
        setAllTags(uniqueTags);
        
        // Apply filters from URL if present
        if (tagFromUrl) {
          setSelectedTags([tagFromUrl]);
          setShowTagCloud(true);
        }
        if (searchFromUrl) {
          setSearchTerm(searchFromUrl);
        }
      } catch (error) {
        console.error('Failed to load standings data:', error);
        toast({
          variant: "destructive",
          title: "Loading Error",
          description: "Could not load standings data.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const saveBallot = async (ballot) => {
    if (!currentUser || !activeSeason) {
      toast({ variant: "destructive", title: "Login Required", description: "Please log in to manage favorites." });
      return false;
    }

    try {
      const { data } = await saveRankedVote({
        season_id: activeSeason.id,
        ballot: ballot,
      });
      
      if (data && data.success) {
        return true;
      } else {
        throw new Error(data?.message || data?.error || 'Unknown error during ballot save.');
      }
    } catch (error) {
      console.error('Failed to update ballot:', error);
      let errorMessage = 'Could not update your ballot. Please try again.';
      
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({ variant: "destructive", title: "Update Failed", description: errorMessage });
      return false;
    }
  };

  const handleFavoriteToggle = async (nomineeId) => {
    if (!currentUser || !activeSeason) {
      toast({ variant: "destructive", title: "Login Required", description: "Please log in to manage favorites." });
      return;
    }

    setProcessingFav(nomineeId);
    const isFavorited = favorites.includes(nomineeId);
    const originalFavorites = [...favorites];
    const newFavorites = isFavorited ? favorites.filter(id => id !== nomineeId) : [...favorites, nomineeId];
    
    setFavorites(newFavorites);

    const success = await saveBallot(newFavorites);

    if (success) {
      toast({
        title: isFavorited ? "Removed from Your TOP 100" : "Added to Your TOP 100!",
        description: isFavorited ? `Removed from your ranked ballot.` : `Added to your ballot at position #${newFavorites.length}`,
      });
    } else {
      setFavorites(originalFavorites);
    }
    setProcessingFav(null);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination || !currentUser || !activeSeason) return;

    const items = Array.from(favorites);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const originalFavorites = [...favorites];
    setFavorites(items);

    const success = await saveBallot(items);
    
    if (success) {
        toast({
            title: "Ballot Updated",
            description: "Your TOP 100 ranking has been updated.",
        });
    } else {
        setFavorites(originalFavorites);
    }
  };

  const filteredNominees = useMemo(() => {
    // Filter by active list tab (Season 4 Women vs Men)
    // Only apply season filter if we have Season 4 data
    const hasSeasonTabs = season4Women || season4Men;
    const targetSeasonId = hasSeasonTabs ? (activeListTab === 'women' ? season4Women?.id : season4Men?.id) : null;
    
    let filtered = standings.rows.filter(nominee => {
      // Season filter for Season 4 tabs - only filter if we're showing Season 4
      const matchesSeason = !hasSeasonTabs || !targetSeasonId || nominee.seasonId === targetSeasonId;
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        nominee.nomineeName.toLowerCase().includes(searchLower) ||
        (nominee.title && nominee.title.toLowerCase().includes(searchLower)) ||
        (nominee.company && nominee.company.toLowerCase().includes(searchLower)) ||
        allTags.some(tag => 
          tag.nominee_id === nominee.nomineeId && 
          tag.tag_name.toLowerCase().includes(searchLower)
        );
      
      const matchesRegion = regionFilter === 'all' || nominee.country === regionFilter;
      
      const inFavorites = !showFavorites || favorites.includes(nominee.nomineeId);
      
      // Tag filtering
      const matchesTags = selectedTags.length === 0 || selectedTags.every(selectedTag => {
        return allTags.some(tag => 
          tag.tag_name === selectedTag && 
          tag.nominee_id === nominee.nomineeId
        );
      });

      return matchesSeason && matchesSearch && matchesRegion && inFavorites && matchesTags;
    });

    if (showFavorites) {
      const favoriteNomineesMap = new Map(
        filtered.map(nominee => [nominee.nomineeId, nominee])
      );
      filtered = favorites
        .map(nomineeId => favoriteNomineesMap.get(nomineeId))
        .filter(Boolean);

      filtered.forEach((nominee, index) => {
        nominee.ballotRank = index + 1;
      });
    } else if (shuffled) {
      // Shuffle array using Fisher-Yates algorithm
      for (let i = filtered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
      }
    } else {
      const [sortKey, sortDirection] = sortValue.split('_');
      filtered.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        
        const processedA = aVal === undefined || aVal === null ? (typeof aVal === 'number' ? 0 : '') : aVal;
        const processedB = bVal === undefined || bVal === null ? (typeof bVal === 'number' ? 0 : '') : bVal;

        if (typeof processedA === 'number' && typeof processedB === 'number') {
          return sortDirection === 'desc' ? processedB - processedA : processedA - processedB;
        }
        
        const aStr = String(processedA).toLowerCase();
        const bStr = String(processedB).toLowerCase();
        return sortDirection === 'desc' ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
      });
    }

    return filtered;
  }, [standings.rows, searchTerm, regionFilter, sortValue, showFavorites, favorites, selectedTags, allTags, shuffled, activeListTab, season4Women, season4Men]);

  const regions = useMemo(() => {
    const uniqueRegions = new Set();
    standings.rows.forEach(nominee => {
      if (nominee.country) uniqueRegions.add(nominee.country);
    });
    return Array.from(uniqueRegions).sort();
  }, [standings.rows]);

  const handleRowClick = (nominee) => {
    setQuickViewNominee(nominee);
  };
  
  const showRankings = currentUser?.role === 'admin';
  
  const toggleTag = (tagName) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };
  
  const clearAllTags = () => {
    setSelectedTags([]);
  };
  
  // Filter and mix tags evenly across categories - progressively narrow based on selected tags
  const relevantTags = useMemo(() => {
    // Get nominee IDs that match currently selected tags
    const eligibleNominees = selectedTags.length === 0 
      ? new Set(standings.rows.map(n => n.nomineeId))
      : new Set(
          standings.rows
            .filter(nominee => {
              return selectedTags.every(selectedTag => {
                return allTags.some(tag => 
                  tag.tag_name === selectedTag && 
                  tag.nominee_id === nominee.nomineeId
                );
              });
            })
            .map(n => n.nomineeId)
        );
    
    // Only show tags that exist on the eligible nominees
    const filtered = allTags.filter(tag => 
      eligibleNominees.has(tag.nominee_id) &&
      (!searchTerm.trim() || tag.tag_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    // Deduplicate by tag_name
    const uniqueTags = [];
    const seen = new Set();
    filtered.forEach(tag => {
      if (!seen.has(tag.tag_name)) {
        seen.add(tag.tag_name);
        uniqueTags.push(tag);
      }
    });
    
    // Group by category
    const byCategory = {};
    uniqueTags.forEach(tag => {
      if (!byCategory[tag.category]) byCategory[tag.category] = [];
      byCategory[tag.category].push(tag);
    });
    
    // Mix evenly across categories
    const mixed = [];
    const categories = Object.keys(byCategory);
    let hasMore = true;
    let index = 0;
    
    while (hasMore) {
      hasMore = false;
      categories.forEach(cat => {
        if (byCategory[cat][index]) {
          mixed.push(byCategory[cat][index]);
          hasMore = true;
        }
      });
      index++;
    }
    
    return mixed;
  }, [allTags, searchTerm, selectedTags, standings.rows]);


  
  const categoryColors = {
    skill: '#4a90b8',      // Sky blue
    industry: '#c9a87c',   // Gold prestige
    achievement: '#d4a574', // Rose accent
    attribute: '#1e3a5a',   // Navy deep
    technology: '#5da5a2',  // Teal
    geography: '#6b7280',   // Gray
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <EngagementCTA 
          currentUser={currentUser}
          onVoteClick={() => setVotingModalOpen(true)}
          onNominateClick={() => setNominationModalOpen(true)}
        />

        {/* Season 4 List Tabs */}
        {(season4Women || season4Men) && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-[var(--accent)]" />
              Season 4 Nominees (2026)
            </h2>
            <Tabs value={activeListTab} onValueChange={setActiveListTab}>
              <TabsList className="bg-[var(--card)] border border-[var(--border)]">
                {season4Women && (
                  <TabsTrigger value="women" className="gap-2">
                    👩 Top 100 Women
                    <span className="text-xs bg-[var(--accent)]/20 px-2 py-0.5 rounded-full">
                      {standings.rows.filter(n => n.seasonId === season4Women.id).length}
                    </span>
                  </TabsTrigger>
                )}
                {season4Men && (
                  <TabsTrigger value="men" className="gap-2">
                    👨 Top 100 Men
                    <span className="text-xs bg-[var(--accent)]/20 px-2 py-0.5 rounded-full">
                      {standings.rows.filter(n => n.seasonId === season4Men.id).length}
                    </span>
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>
        )}

        <div className="bg-[var(--card)]/80 backdrop-blur-2xl rounded-2xl border border-[var(--border)] p-4 mb-6">
          {selectedTags.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[var(--muted)] uppercase">Active Filters:</span>
              {selectedTags.map(tag => {
                const tagObj = allTags.find(t => t.tag_name === tag);
                const color = categoryColors[tagObj?.category] || '#666';
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all hover:scale-105"
                    style={{
                      backgroundColor: color,
                      color: '#fff',
                    }}
                  >
                    {tag}
                    <X className="w-3 h-3" />
                  </button>
                );
              })}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortValue} onValueChange={setSortValue}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="nomineeName_asc">Name: A-Z</SelectItem>
                  <SelectItem value="nomineeName_desc">Name: Z-A</SelectItem>
                  {currentUser && (
                    <>
                      <SelectItem value="rank_asc">Ranking: Top First</SelectItem>
                      <SelectItem value="rank_desc">Ranking: Bottom First</SelectItem>
                    </>
                  )}
              </SelectContent>
            </Select>

            <div className="bg-[var(--card)] rounded-full p-1 border border-[var(--border)] flex-shrink-0 justify-self-start md:justify-self-end">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => { setViewMode('list'); setShuffled(false); }}
                className="rounded-full"
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => { setViewMode('grid'); setShuffled(false); }}
                className="rounded-full"
              >
                <Grid className="w-4 h-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={shuffled ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setShuffled(!shuffled)}
                className="rounded-full"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Shuffle
              </Button>
              <Button
                variant={showFavorites ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setShowFavorites(!showFavorites)}
                className="rounded-full"
              >
                <Star className="w-4 h-4 mr-2" />
                Your TOP 100
              </Button>
            </div>
            

          </div>
          
          
        </div>

        {filteredNominees.length > 0 || showFavorites ? (
          viewMode === 'list' ? (
            showFavorites ? (
              <>
                <RcvBallotManager 
                    userTop100List={favorites}
                    allNominees={standings.rows}
                    className="mb-6"
                    onBallotSaved={(savedBallot) => setFavorites(savedBallot)}
                />
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="ballot">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {filteredNominees.length > 0 ? (
                          filteredNominees.map((nominee, index) => (
                            <Draggable key={nominee.nomineeId} draggableId={nominee.nomineeId} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`bg-[var(--card)]/80 backdrop-blur-2xl rounded-2xl border border-[var(--border)] p-4 hover:shadow-xl transition-all group flex items-center gap-4 ${snapshot.isDragging ? 'shadow-2xl scale-[1.01] bg-[var(--card)]' : ''}`}
                                >
                                  <div className="flex flex-col items-center justify-center gap-2 w-12 flex-shrink-0">
                                    <div {...provided.dragHandleProps} className="text-[var(--muted)] hover:text-[var(--text)] cursor-grab active:cursor-grabbing">
                                      <GripVertical className="w-5 h-5" />
                                    </div>
                                    <span className="text-lg font-bold text-[var(--accent)] bg-[var(--accent)]/10 rounded-full w-8 h-8 flex items-center justify-center">#{nominee.ballotRank}</span>
                                  </div>
                                  
                                  <div className="flex-shrink-0">
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                                      <img
                                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/e15baa063_Gemini_Generated_Image_4pcatw4pcatw4pca.png"
                                        alt="Laurel wreath"
                                        className="absolute inset-0 w-full h-full object-contain"
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center p-[12%]">
                                        {nominee.avatarUrl ? (
                                          <div className="w-full aspect-square">
                                            <img
                                              src={nominee.avatarUrl}
                                              alt={nominee.nomineeName}
                                              className="w-full h-full rounded-full object-cover"
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-full aspect-square rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                                            {nominee.nomineeName ? nominee.nomineeName.slice(0, 2).toUpperCase() : 'NN'}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleRowClick(nominee)}>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-[var(--text)] truncate text-base sm:text-lg">{nominee.nomineeName}</h3>
                                        <div className="space-y-1">
                                          {nominee.title && (
                                            <p className="text-sm text-[var(--muted)] truncate">{nominee.title}</p>
                                          )}
                                          {nominee.company && (
                                            <p className="text-sm text-[var(--muted)] truncate">at {nominee.company}</p>
                                          )}
                                          {nominee.country && (
                                            <p className="text-xs text-[var(--muted)]">{nominee.country}</p>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {currentUser?.role === 'admin' && (
                                        <div className="text-right flex-shrink-0 mt-2 sm:mt-0">
                                          <div className="text-lg sm:text-xl font-bold text-[var(--score-aura)]">
                                            {nominee.aura || 0}
                                          </div>
                                          <div className="text-xs text-[var(--muted)]">Aura</div>
                                        </div>
                                      )}
                                      {!currentUser?.role === 'admin' && nominee.description && (
                                        <div className="text-sm text-[var(--muted)] italic mt-2 line-clamp-2">
                                          {nominee.description}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => { e.stopPropagation(); handleFavoriteToggle(nominee.nomineeId); }}
                                    disabled={processingFav === nominee.nomineeId}
                                    className="w-9 h-9 rounded-full text-red-400 hover:bg-red-500/10 hover:text-red-500"
                                  >
                                    <Star className="w-4 h-4 fill-current" />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <div className="text-center py-12 bg-[var(--card)]/80 backdrop-blur-2xl rounded-2xl border border-[var(--border)]">
                            <Crown className="w-16 h-16 text-[var(--muted)] mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Your TOP 100 is Empty</h2>
                            <p className="text-[var(--muted)]">Use the RCV Ballot Manager above to add nominees to your ranked ballot.</p>
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </>
            ) : (
              <StandingsCore 
                nominees={filteredNominees}
                onRowClick={handleRowClick}
                favorites={favorites}
                processingFav={processingFav}
                onFavoriteToggle={handleFavoriteToggle}
              />
            )
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
              {filteredNominees.map((nominee) => (
                <motion.div
                    key={nominee.nomineeId}
                    className="group relative aspect-[3/4] overflow-hidden rounded-2xl cursor-pointer shadow-lg"
                    onClick={() => handleRowClick(nominee)}
                    whileHover={{ y: -8, scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    <div className="absolute inset-0 w-full h-full">
                        <img
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/e15baa063_Gemini_Generated_Image_4pcatw4pcatw4pca.png"
                            alt="Laurel wreath"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center p-[12%]">
                            {nominee.avatarUrl ? (
                                <div className="w-full aspect-square">
                                    <img
                                            src={nominee.avatarUrl}
                                            alt={nominee.nomineeName}
                                            className="w-full h-full rounded-full object-cover shadow-xl transition-transform duration-300 group-hover:scale-110"
                                        />
                                    </div>
                                    ) : (
                                    <div className="w-full aspect-square rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl md:text-4xl shadow-xl">
                                    {nominee.nomineeName ? nominee.nomineeName.slice(0, 2).toUpperCase() : 'NN'}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

                    {showRankings && (
                      <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-black/50 backdrop-blur-md text-white font-bold text-xs md:text-sm px-2 md:px-3 py-1 rounded-full flex items-center gap-1">
                          <Crown className="w-3 h-3 md:w-4 h-4 text-yellow-400" />
                          <span>#{showFavorites ? nominee.ballotRank : nominee.rank}</span>
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); handleFavoriteToggle(nominee.nomineeId); }}
                      disabled={processingFav === nominee.nomineeId}
                      className="absolute top-1 right-1 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50"
                    >
                      <Star className={`w-4 h-4 transition-all ${favorites.includes(nominee.nomineeId) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 group-hover:text-yellow-400'}`} />
                    </Button>

                    <div className="relative flex flex-col justify-end h-full p-3 md:p-4 text-white">
                        <h3 className="font-bold text-sm md:text-lg truncate">{nominee.nomineeName}</h3>
                        <p className="text-xs md:text-sm text-white/80 truncate">{nominee.title || nominee.company}</p>
                        <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20">
                              <p className="text-xs text-white/90 line-clamp-2 leading-relaxed">
                                {nominee.description || nominee.country}
                              </p>
                          </div>
                    </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12 bg-[var(--card)]/80 backdrop-blur-2xl rounded-2xl border border-[var(--border)]">
            <Crown className="w-16 h-16 text-[var(--muted)] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[var(--text)] mb-2">No Results Found</h2>
            <p className="text-[var(--muted)]">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
      
      {quickViewNominee && (
        <NomineeQuickView
          nominee={quickViewNominee}
          onClose={() => setQuickViewNominee(null)}
        />
      )}

      <VotingModal 
        isOpen={votingModalOpen} 
        onClose={() => setVotingModalOpen(false)} 
      />

      <NominationModal 
        isOpen={nominationModalOpen} 
        onClose={() => setNominationModalOpen(false)} 
      />
    </div>
  );
}