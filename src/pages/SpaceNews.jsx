import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Search, Loader2, AlertCircle, RefreshCw, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getAggregatedSpaceNews } from '@/functions/getAggregatedSpaceNews';
import { SpaceNewsCard } from '@/components/epics/02-signal-feed/publication';
import { AlumniNewsTab } from '@/components/epics/02-signal-feed/publication';


const TABS = [
  { value: 'news', label: 'All News' },
  { value: 'alumni', label: 'Alumni in the News' },
];

const PAGE_SIZE = 18;

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SpaceNewsPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('alumni');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u) {
        base44.entities.Favorite.filter({ user_email: u.email, entity_type: 'HonoreeMention' }, '', 500)
          .then(favs => setFavorites(new Set(favs.map(f => f.entity_id))))
          .catch(() => {});
      }
    }).catch(() => {});
  }, []);

  const debouncedSearch = useDebounce(searchInput, 400);
  const abortRef = useRef(null);

  const fetchItems = useCallback(async (search, newOffset, append = false) => {
    const token = {};
    abortRef.current = token;
    append ? setIsLoadingMore(true) : setIsLoading(true);
    setError(null);

    try {
      const res = await getAggregatedSpaceNews({ search, limit: PAGE_SIZE, offset: newOffset });
      if (abortRef.current !== token) return;
      const { results = [], count = 0 } = res.data;
      setItems(prev => append ? [...prev, ...results] : results);
      setTotalCount(count);
      setOffset(newOffset);
    } catch {
      setError('Failed to load news. Please try again.');
    } finally {
      append ? setIsLoadingMore(false) : setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== 'news') return;
    setItems([]);
    setOffset(0);
    fetchItems(debouncedSearch, 0, false);
  }, [debouncedSearch, activeTab, fetchItems]);

  const handleTabChange = (val) => {
    setActiveTab(val);
    setSearchInput('');
  };

  const toggleFavorite = async (articleId) => {
    if (!user) return;
    const isFaved = favorites.has(articleId);
    try {
      if (isFaved) {
        const favs = await base44.entities.Favorite.filter({
          user_email: user.email,
          entity_id: articleId,
          entity_type: 'HonoreeMention'
        }, '', 1);
        if (favs.length > 0) await base44.entities.Favorite.delete(favs[0].id);
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(articleId);
          return next;
        });
      } else {
        await base44.entities.Favorite.create({
          user_email: user.email,
          entity_id: articleId,
          entity_type: 'HonoreeMention'
        });
        setFavorites(prev => new Set(prev).add(articleId));
      }
    } catch {}
  };

  const handleLoadMore = () => {
    fetchItems(debouncedSearch, offset + PAGE_SIZE, true);
  };

  let sortedItems = [...items];
  if (sortBy === 'honoree' && items.length > 0 && items[0]._nominee_name) {
    sortedItems.sort((a, b) => (a._nominee_name || '').localeCompare(b._nominee_name || ''));
  } else if (sortBy === 'popular') {
    sortedItems.sort((a, b) => (b.published_at || '').localeCompare(a.published_at || ''));
  }

  const filtered = sortedItems.filter(item => !showFavoritesOnly || favorites.has(item.id));
  const hasMore = filtered.length < totalCount;

  return (
    <div className="min-h-screen sf-pro" style={{ background: `linear-gradient(135deg, #faf8f5 0%, #f5f1ed 50%, #faf8f5 100%)` }}>
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <motion.div
              initial={{ scale: 0.8, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg"
            >
              <Newspaper className="w-6 h-6 text-white" aria-hidden="true" />
            </motion.div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Aerospace News</h1>
              <p className="text-sm text-slate-600 mt-2 font-medium">Live coverage from multiple sources · Alumni spotlights</p>
            </div>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8"
          >
            <TabsList className="self-start glass-card border-slate-200/50 p-2 rounded-xl">
              {TABS.map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="min-h-[44px] px-4 rounded-lg data-[state=active]:glass-card data-[state=active]:shadow-md transition-all duration-200 font-medium"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <AnimatePresence>
              {activeTab === 'news' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-3 flex-1 sm:flex-none items-center"
                >
                  <div className="relative flex-1 sm:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                    <Input
                      type="search"
                      placeholder="Search news…"
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      className="pl-11 h-11 glass-card border-slate-200/50 text-slate-900 placeholder:text-slate-500 font-medium"
                      aria-label="Search aerospace news"
                    />
                  </div>

                  {/* Sort dropdown */}
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="h-11 px-4 rounded-lg glass-card border-slate-200/50 bg-white/50 text-sm text-slate-700 font-medium hover:bg-white/70 transition-all hidden sm:block cursor-pointer"
                    aria-label="Sort news"
                  >
                    <option value="recent">Recent</option>
                    <option value="popular">Most Recent</option>
                    <option value="honoree">Honoree A-Z</option>
                  </select>

                  {/* Favorites filter */}
                  {user && (
                    <Button
                      variant={showFavoritesOnly ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className={`gap-2 min-h-[44px] hidden sm:flex font-medium transition-all duration-200 ${
                        showFavoritesOnly
                          ? 'glass-card bg-red-50 border-red-200 text-red-700 shadow-md'
                          : 'glass-card border-slate-200/50 text-slate-700 hover:bg-white/70'
                      }`}
                      aria-label={showFavoritesOnly ? 'Show all news' : 'Show only favorite news'}
                    >
                      <Heart className="w-4 h-4" fill={showFavoritesOnly ? 'currentColor' : 'none'} />
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Alumni tab — standalone */}
          <TabsContent value="alumni">
            <AlumniNewsTab user={user} />
          </TabsContent>

          {/* All News tab */}
          <TabsContent value="news">
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-64 gap-3"
                  role="status"
                  aria-live="polite"
                >
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                  <p className="text-sm text-slate-600 font-medium">Loading news…</p>
                </motion.div>
              )}

              {error && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 py-16 text-center glass-card rounded-2xl border-slate-200/50"
                  role="alert"
                >
                  <AlertCircle className="w-10 h-10 text-red-500" />
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-4">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchItems(debouncedSearch, 0, false)}
                      className="gap-2 glass-card border-slate-200/50 font-medium"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Retry
                    </Button>
                  </div>
                </motion.div>
              )}

              {!isLoading && !error && items.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <p className="text-slate-500 font-medium">No results found. Try a different search.</p>
                </motion.div>
              )}

              {!isLoading && !error && items.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <AnimatePresence>
                      {filtered.map((item, idx) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                          className="relative group"
                        >
                          <SpaceNewsCard article={item} />
                          {user && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleFavorite(item.id)}
                              className="absolute top-3 right-3 z-10 p-2 rounded-full glass-card border-slate-200/50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                              aria-label={favorites.has(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              <Heart
                                className="w-5 h-5 transition-colors"
                                fill={favorites.has(item.id) ? '#ef4444' : 'none'}
                                color={favorites.has(item.id) ? '#ef4444' : '#cbd5e1'}
                              />
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {hasMore && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex justify-center mt-10">
                      <Button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="min-w-[180px] min-h-[48px] gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold shadow-lg transition-all"
                      >
                        {isLoadingMore ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Loading…</>
                        ) : (
                          `Load More (${totalCount - filtered.length})`
                        )}
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>

        {/* Attribution */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-xs text-slate-500 text-center mt-12 font-medium">
          News via{' '}
          <a href="https://thespacedevs.com/snapi" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-slate-900 font-semibold transition-colors">SNAPI</a>
          {' '}&amp;{' '}
          <a href="https://news.google.com" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-slate-900 font-semibold transition-colors">Google News</a>
        </motion.p>
      </div>
    </div>
  );
}