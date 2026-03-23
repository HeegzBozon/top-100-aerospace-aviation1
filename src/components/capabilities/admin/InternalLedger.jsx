import { useState, useEffect, useCallback } from 'react';
import { getVoteLedgerData } from '@/functions/getVoteLedgerData';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, History, Vote, TrendingUp, TrendingDown, Target, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function InternalLedger() {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateFilter, setDateFilter] = useState('all');
  const [minEloChange, setMinEloChange] = useState('');

  const fetchLedger = useCallback(async (pageNum) => {
    setLoading(true);
    try {
      const { data, error } = await getVoteLedgerData({ page: pageNum, limit: 50 });
      if (error || !data.success) {
        throw new Error(error || data.error || 'Failed to fetch ledger data');
      }
      
      if (pageNum === 1) {
        setEntries(data.data);
      } else {
        setEntries(prev => [...prev, ...data.data]);
      }
      setHasMore(data.hasMore);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not load ledger: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...entries];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.voterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.winnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.loserName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (dateFilter) {
        case '24h':
          cutoff.setHours(now.getHours() - 24);
          break;
        case '7d':
          cutoff.setDate(now.getDate() - 7);
          break;
        case '30d':
          cutoff.setDate(now.getDate() - 30);
          break;
      }
      
      filtered = filtered.filter(entry => new Date(entry.timestamp) >= cutoff);
    }

    // Min ELO change filter
    if (minEloChange) {
      const minChange = parseFloat(minEloChange);
      filtered = filtered.filter(entry => 
        Math.abs(entry.winnerEloChange) >= minChange || 
        Math.abs(entry.loserEloChange) >= minChange
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'timestamp':
          aVal = new Date(a.timestamp);
          bVal = new Date(b.timestamp);
          break;
        case 'eloImpact':
          aVal = Math.abs(a.winnerEloChange);
          bVal = Math.abs(b.winnerEloChange);
          break;
        case 'voter':
          aVal = a.voterName.toLowerCase();
          bVal = b.voterName.toLowerCase();
          break;
        case 'winner':
          aVal = a.winnerName.toLowerCase();
          bVal = b.winnerName.toLowerCase();
          break;
        default:
          aVal = a[sortBy];
          bVal = b[sortBy];
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredEntries(filtered);
  }, [entries, searchTerm, sortBy, sortOrder, dateFilter, minEloChange]);

  useEffect(() => {
    fetchLedger(1);
  }, [fetchLedger]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLedger(nextPage);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('timestamp');
    setSortOrder('desc');
    setDateFilter('all');
    setMinEloChange('');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[var(--text)]">Pairwise Vote Ledger</h2>
        <p className="text-sm text-[var(--muted)]">A chronological log of all head-to-head voting events with ELO impact.</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4 p-4 bg-[var(--card)]/30 rounded-lg border border-[var(--border)]">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--muted)]" />
              <Input
                placeholder="Search voters or nominees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Sort By */}
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">Date</SelectItem>
                <SelectItem value="eloImpact">ELO Impact</SelectItem>
                <SelectItem value="voter">Voter Name</SelectItem>
                <SelectItem value="winner">Winner Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="min-w-[120px]">
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Order</label>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="w-full"
            >
              {sortOrder === 'desc' ? (
                <>
                  <SortDesc className="w-4 h-4 mr-2" />
                  Desc
                </>
              ) : (
                <>
                  <SortAsc className="w-4 h-4 mr-2" />
                  Asc
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          {/* Date Filter */}
          <div className="min-w-[140px]">
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Time Period</label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Min ELO Change */}
          <div className="min-w-[140px]">
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Min ELO Change</label>
            <Input
              type="number"
              placeholder="e.g. 5"
              value={minEloChange}
              onChange={(e) => setMinEloChange(e.target.value)}
            />
          </div>

          {/* Clear Filters */}
          <Button variant="outline" onClick={clearFilters}>
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>

        {/* Results Count */}
        <div className="text-sm text-[var(--muted)]">
          Showing {filteredEntries.length} of {entries.length} total entries
        </div>
      </div>

      {filteredEntries.length > 0 ? (
        <div className="flow-root">
          <ul className="-mb-8">
            {filteredEntries.map((entry, entryIdx) => (
              <li key={entry.id}>
                <div className="relative pb-8">
                  {entryIdx !== filteredEntries.length - 1 ? (
                    <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-[var(--border)]" aria-hidden="true" />
                  ) : null}
                  <div className="relative flex items-start space-x-4">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--card)] ring-8 ring-[var(--card)]/80">
                        <Vote className="h-5 w-5 text-[var(--accent)]" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 py-1.5">
                      <div className="text-sm text-[var(--muted)]">
                        <span className="font-semibold text-[var(--text)]">{entry.voterName}</span> cast a vote
                        <span className="ml-2 text-xs">{formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}</span>
                      </div>
                      <div className="mt-2 space-y-2 rounded-lg border border-[var(--border)] bg-black/5 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-green-600">
                             <TrendingUp className="h-4 w-4" />
                             <span className="font-medium">{entry.winnerName}</span>
                             <span className="text-xs font-semibold uppercase bg-green-100 text-green-800 px-2 py-0.5 rounded-md">Winner</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-green-600">
                            <Target className="h-3 w-3" />
                            <span className="font-mono font-bold">+{entry.winnerEloChange}</span>
                            <span className="text-gray-500">({entry.winnerCurrentElo})</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-red-600">
                             <TrendingDown className="h-4 w-4" />
                             <span>{entry.loserName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-red-600">
                            <Target className="h-3 w-3" />
                            <span className="font-mono font-bold">{entry.loserEloChange}</span>
                            <span className="text-gray-500">({entry.loserCurrentElo})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !loading && (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text)]">No Matching Entries Found</h3>
            <p className="text-sm text-[var(--muted)]">
              {entries.length === 0 
                ? "As pairwise votes are cast, they will appear here." 
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </div>
        )
      )}
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 text-[var(--muted)] animate-spin" />
        </div>
      )}

      {hasMore && !loading && entries.length > 0 && (
        <div className="mt-6 text-center">
          <Button onClick={handleLoadMore} variant="outline">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}