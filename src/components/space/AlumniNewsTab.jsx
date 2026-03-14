import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, Loader2, AlertCircle, RefreshCw, Clock, ScanSearch, Heart, Bookmark } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { getAggregatedSpaceNews } from '@/functions/getAggregatedSpaceNews';
import { scanHonoreesForNews } from '@/functions/scanHonoreesForNews';
import SpaceNewsCard from '@/components/space/SpaceNewsCard';
import { format, parseISO } from 'date-fns';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Converts a HonoreeMention record → SpaceNewsCard-compatible shape
function mentionToArticle(mention) {
  return {
    id: mention.id,
    title: mention.article_title,
    summary: mention.article_summary,
    url: mention.article_url,
    image_url: mention.image_url,
    news_site: mention.news_site,
    published_at: mention.published_at,
    _nominee_name: mention.nominee_name,
  };
}

const PAGE_SIZE = 9;

export default function AlumniNewsTab({ user }) {
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('recent');  // recent, popular, honoree
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [storedMentions, setStoredMentions] = useState([]);
  const [liveResults, setLiveResults] = useState([]);
  const [liveTotal, setLiveTotal] = useState(0);
  const [liveOffset, setLiveOffset] = useState(0);
  const [lastScanned, setLastScanned] = useState(null);
  const [isLoadingStored, setIsLoadingStored] = useState(true);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const isAdmin = user?.role === 'admin';

  const debouncedSearch = useDebounce(searchInput, 400);
  const isSearching = debouncedSearch.trim().length > 0;

  // Load stored mentions + favorites
  const loadStoredMentions = useCallback(async () => {
    setIsLoadingStored(true);
    setError(null);
    try {
      const [mentions, favs] = await Promise.all([
        base44.entities.HonoreeMention.list('-published_at', 200),
        user ? base44.entities.Favorite.filter({ user_email: user.email, entity_type: 'HonoreeMention' }, '', 500).catch(() => []) : Promise.resolve([])
      ]);
      setStoredMentions(mentions);
      setFavorites(new Set(favs.map(f => f.entity_id)));
      if (mentions.length > 0) {
        const latest = mentions.reduce((a, b) =>
          new Date(a.scanned_at) > new Date(b.scanned_at) ? a : b
        );
        setLastScanned(latest.scanned_at);
      }
    } catch (err) {
      setError('Failed to load alumni mentions.');
    } finally {
      setIsLoadingStored(false);
    }
  }, [user]);

  useEffect(() => {
    loadStoredMentions();
  }, [loadStoredMentions]);

  // Live SNAPI search when user types
  const fetchLive = useCallback(async (query, newOffset, append = false) => {
    append ? setIsLoadingMore(true) : setIsLoadingLive(true);
    setError(null);
    try {
      const res = await getAggregatedSpaceNews({
        search: query,
        limit: PAGE_SIZE,
        offset: newOffset,
      });
      const { results = [], count = 0 } = res.data;
      setLiveResults(prev => append ? [...prev, ...results] : results);
      setLiveTotal(count);
      setLiveOffset(newOffset);
    } catch {
      setError('Failed to search news.');
    } finally {
      append ? setIsLoadingMore(false) : setIsLoadingLive(false);
    }
  }, []);

  useEffect(() => {
    if (isSearching) {
      setLiveResults([]);
      setLiveOffset(0);
      fetchLive(debouncedSearch, 0, false);
    }
  }, [debouncedSearch, isSearching, fetchLive]);

  const handleLoadMore = () => {
    fetchLive(debouncedSearch, liveOffset + PAGE_SIZE, true);
  };

  const handleScan = useCallback(async () => {
    setIsScanning(true);
    setScanResult(null);
    try {
      const res = await scanHonoreesForNews({});
      const data = res.data;
      setScanResult(data);
      // Reload stored mentions to reflect new ones
      await loadStoredMentions();
    } catch {
      setScanResult({ error: 'Scan failed. Check function logs.' });
    } finally {
      setIsScanning(false);
    }
  }, [loadStoredMentions]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (mentionId) => {
    if (!user) return;
    const isFaved = favorites.has(mentionId);
    try {
      if (isFaved) {
        const fav = await base44.entities.Favorite.filter({
          user_email: user.email,
          entity_id: mentionId,
          entity_type: 'HonoreeMention'
        }, '', 1);
        if (fav.length > 0) await base44.entities.Favorite.delete(fav[0].id);
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(mentionId);
          return next;
        });
      } else {
        await base44.entities.Favorite.create({
          user_email: user.email,
          entity_id: mentionId,
          entity_type: 'HonoreeMention'
        });
        setFavorites(prev => new Set(prev).add(mentionId));
      }
    } catch {}
  }, [user, favorites]);

  // Deduplicate by article_id (keep first occurrence per article)
  const deduped = storedMentions.reduce((acc, m) => {
    const key = m.article_id ?? m.article_url;
    if (!acc.seen.has(key)) {
      acc.seen.add(key);
      acc.list.push(m);
    }
    return acc;
  }, { seen: new Set(), list: [] }).list;

  // Filter & sort
  let filtered = deduped.filter(m => {
    const q = debouncedSearch.toLowerCase();
    const matchSearch = !debouncedSearch || m.nominee_name?.toLowerCase().includes(q) || m.article_title?.toLowerCase().includes(q);
    const matchFav = !showFavoritesOnly || favorites.has(m.id);
    return matchSearch && matchFav;
  });

  if (sortBy === 'honoree') {
    filtered = [...filtered].sort((a, b) => (a.nominee_name || '').localeCompare(b.nominee_name || ''));
  } else if (sortBy === 'popular') {
    filtered = [...filtered].sort((a, b) => (b.published_at || '').localeCompare(a.published_at || ''));
  }
  // 'recent' is default (already sorted by -published_at from API)

  const displayItems = isSearching ? liveResults : filtered.map(mentionToArticle);
  const isLoading = isSearching ? isLoadingLive : isLoadingStored;
  const hasMore = isSearching && liveResults.length < liveTotal;

  return (
    <div className="space-y-4">
      {/* Subheader & Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4 text-indigo-500" aria-hidden="true" />
            <span>
              {isLoadingStored
                ? 'Loading mentions…'
                : `${storedMentions.length} mention${storedMentions.length !== 1 ? 's' : ''} tracked`}
            </span>
            {lastScanned && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" aria-hidden="true" />
                Last scanned {format(parseISO(lastScanned), 'MMM d, h:mm a')}
              </span>
            )}
          </div>

          {/* Admin scan button */}
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleScan}
              disabled={isScanning}
              className="gap-1.5 min-h-[44px] text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              aria-label="Re-scan all honorees for new mentions"
            >
              {isScanning ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning…</>
              ) : (
                <><ScanSearch className="w-3.5 h-3.5" /> Scan All 100</>
              )}
            </Button>
          )}
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 sm:flex-none sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search by honoree name or keyword…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="pl-9 h-10"
              aria-label="Search alumni in the news"
            />
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm text-gray-700 hover:border-gray-400"
            aria-label="Sort alumni news"
          >
            <option value="recent">Recent</option>
            <option value="popular">Most Recent First</option>
            <option value="honoree">Honoree A-Z</option>
          </select>

          {/* Favorites filter */}
          {user && (
            <Button
              variant={showFavoritesOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="gap-1.5 min-h-[44px]"
              aria-label={showFavoritesOnly ? 'Show all news' : 'Show only favorite news'}
            >
              <Heart className="w-4 h-4" fill={showFavoritesOnly ? 'currentColor' : 'none'} />
              {showFavoritesOnly ? 'Favorites' : 'All'}
            </Button>
          )}
        </div>
      </div>

      {/* Scan result toast-style banner */}
      {scanResult && !isScanning && (
        <div className={`text-xs rounded-lg px-3 py-2 flex items-center gap-2 ${scanResult.error ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`} role="status">
          {scanResult.error ? (
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          ) : (
            <ScanSearch className="w-3.5 h-3.5 flex-shrink-0" />
          )}
          {scanResult.error
            ? scanResult.error
            : `Scan complete — ${scanResult.new_mentions} new mention${scanResult.new_mentions !== 1 ? 's' : ''} found, ${scanResult.skipped} skipped (${scanResult.scanned} honorees)`}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-48" role="status" aria-live="polite">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="sr-only">Loading alumni news...</span>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="flex flex-col items-center gap-3 py-12 text-center" role="alert">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-gray-500">{error}</p>
          <Button variant="outline" size="sm" onClick={loadStoredMentions} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && displayItems.length === 0 && (
        <div className="text-center py-12 space-y-2">
          <Users className="w-10 h-10 text-gray-200 mx-auto" aria-hidden="true" />
          <p className="text-sm text-gray-400">
            {isSearching
              ? 'No articles found for that search.'
              : 'No alumni mentions detected yet. The scanner runs automatically throughout the day.'}
          </p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !error && displayItems.length > 0 && (
        <>
          {isSearching && (
            <p className="text-xs text-gray-400">
              Live SNAPI search — {liveTotal} result{liveTotal !== 1 ? 's' : ''} for &ldquo;{debouncedSearch}&rdquo;
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayItems.map(item => (
              <div key={item.id} className="relative group">
                {item._nominee_name && (
                  <span className="absolute top-2 left-2 z-10 bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {item._nominee_name}
                  </span>
                )}
                <SpaceNewsCard article={item} />
                {user && (
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                    aria-label={favorites.has(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      className="w-4 h-4 transition-colors"
                      fill={favorites.has(item.id) ? '#ef4444' : 'none'}
                      color={favorites.has(item.id) ? '#ef4444' : '#999'}
                    />
                  </button>
                )}
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="min-w-[140px] min-h-[44px] gap-2"
              >
                {isLoadingMore ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                ) : (
                  `Load More (${liveTotal - liveResults.length} remaining)`
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}