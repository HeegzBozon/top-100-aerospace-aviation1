import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rss, ExternalLink, AlertCircle, Loader2, AlertTriangle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNewsFeedDigest } from '@/lib/intelligence/hooks';
import { THREAT_COLORS, THREAT_LABELS } from '@/lib/intelligence/constants';
import { summarizeCategory } from '@/lib/intelligence/summarize';

const CATEGORY_ICONS = {
  geopolitics: '🌍',
  defense:     '🛡️',
  aviation:    '✈️',
  technology:  '🚀',
  markets:     '📈',
};

const safeUrl = (url) => (url && /^https?:\/\//i.test(url) ? url : undefined);
const hasClaudeKey = !!import.meta.env.VITE_ANTHROPIC_API_KEY;

export function NewsFeedDigest() {
  const { data, isLoading, isError } = useNewsFeedDigest();
  const [activeCategory, setActiveCategory] = useState(null);
  const [summaries, setSummaries] = useState({});
  const [loadingSummary, setLoadingSummary] = useState(null);
  const [summaryExpanded, setSummaryExpanded] = useState({});

  const categories = data?.categories || {};

  useEffect(() => {
    const firstKey = Object.keys(categories)[0];
    if (firstKey && !activeCategory) setActiveCategory(firstKey);
  }, [categories, activeCategory]);

  if (isLoading) return <PanelLoader label="news digest" />;
  if (isError) return <PanelError message="Unable to load news digest" />;

  const categoryKeys = Object.keys(categories);
  const activeItems = activeCategory ? (categories[activeCategory]?.items || []) : [];
  const activeSummary = summaries[activeCategory];

  async function handleSummarize() {
    if (!activeCategory || loadingSummary) return;
    setLoadingSummary(activeCategory);
    try {
      const text = await summarizeCategory(activeCategory, activeItems);
      setSummaries(prev => ({ ...prev, [activeCategory]: text }));
      setSummaryExpanded(prev => ({ ...prev, [activeCategory]: true }));
    } catch (err) {
      setSummaries(prev => ({ ...prev, [activeCategory]: `Error: ${err.message}` }));
    } finally {
      setLoadingSummary(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap" role="tablist">
        {categoryKeys.map(cat => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-all duration-150 min-h-[36px] flex items-center gap-1.5 ${
              activeCategory === cat
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>{CATEGORY_ICONS[cat] || '📰'}</span>
            {cat.replace(/_/g, ' ')}
            <span className="ml-0.5 opacity-70">{categories[cat]?.items?.length || 0}</span>
          </button>
        ))}
      </div>

      {/* AI Summary Card */}
      {activeCategory && (
        <div className="rounded-xl border border-slate-200/60 bg-gradient-to-br from-indigo-50/60 to-sky-50/40 p-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                AI Intelligence Brief
              </span>
            </div>
            {activeSummary && (
              <button
                onClick={() => setSummaryExpanded(prev => ({ ...prev, [activeCategory]: !prev[activeCategory] }))}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
              >
                {summaryExpanded[activeCategory] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {loadingSummary === activeCategory ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span className="text-xs text-slate-500">Claude is analyzing {activeItems.length} headlines…</span>
              </motion.div>
            ) : activeSummary && summaryExpanded[activeCategory] ? (
              <motion.p key="summary" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs text-slate-700 leading-relaxed">
                {activeSummary}
              </motion.p>
            ) : activeSummary ? (
              <motion.p key="collapsed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-slate-500 italic">
                Summary available — click ↑ to expand
              </motion.p>
            ) : hasClaudeKey ? (
              <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSummarize}
                  className="h-7 text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
                >
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  Generate brief for {activeCategory}
                </Button>
              </motion.div>
            ) : (
              <motion.p key="no-key" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-slate-400">
                Add <code className="font-mono bg-slate-100 px-1 rounded">VITE_ANTHROPIC_API_KEY</code> to enable AI briefings
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* News items */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {activeItems.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">No items in this category</p>
        ) : (
          activeItems.slice(0, 50).map((item, i) => {
            const threatLevel = item.threat?.level;
            const threatColor = THREAT_COLORS[threatLevel];
            return (
              <motion.div
                key={item.id ?? `${activeCategory}-${i}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.5) }}
              >
                <Card className={`border-slate-200/50 transition-all ${
                  threatLevel >= 4 ? 'border-red-200/60 bg-red-50/20'
                  : threatLevel === 3 ? 'border-orange-200/60 bg-orange-50/20'
                  : 'glass-card'
                }`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2.5">
                      {threatLevel >= 3
                        ? <AlertTriangle className="w-4 h-4 flex-shrink-0 text-orange-400 mt-0.5" />
                        : <Rss className="w-4 h-4 flex-shrink-0 text-sky-500 mt-0.5" />
                      }
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          {safeUrl(item.link) ? (
                            <a href={safeUrl(item.link)} target="_blank" rel="noopener noreferrer"
                              className="text-sm font-medium hover:underline line-clamp-2 flex-1 text-slate-800">
                              {item.title}
                            </a>
                          ) : (
                            <p className="text-sm font-medium line-clamp-2 flex-1 text-slate-800">{item.title}</p>
                          )}
                          {safeUrl(item.link) && (
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-slate-400">{item.source}</span>
                          {item.published_at && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="text-xs text-slate-400">
                                {new Date(item.published_at).toLocaleDateString()}
                              </span>
                            </>
                          )}
                          {threatColor && (
                            <Badge className={`text-xs ${threatColor}`}>
                              {THREAT_LABELS[threatLevel]}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

function PanelLoader({ label }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Loading {label}…</span>
    </div>
  );
}

function PanelError({ message }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-red-400">
      <AlertCircle className="w-5 h-5" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
