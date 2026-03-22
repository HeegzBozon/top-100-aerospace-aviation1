import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rss, ExternalLink, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getNewsFeedDigest } from '@/functions/getNewsFeedDigest';

const safeUrl = (url) => (url && /^https?:\/\//i.test(url) ? url : undefined);
const THREAT_COLORS = {
  2: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  3: 'bg-orange-100 text-orange-700 border-orange-200',
  4: 'bg-red-100 text-red-700 border-red-200',
};
const THREAT_LABELS = { 1: 'Low', 2: 'Elevated', 3: 'High', 4: 'Critical' };

export function NewsFeedDigest() {
  const [categories, setCategories] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getNewsFeedDigest({})
      .then(res => {
        if (res.data?.error) throw new Error(res.data.error);
        const cats = res.data?.categories || {};
        setCategories(cats);
        const firstKey = Object.keys(cats)[0];
        if (firstKey) setActiveCategory(firstKey);
      })
      .catch(err => setError(err.message || 'Unable to load news digest'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PanelLoader label="news digest" />;
  if (error) return <PanelError message={error} />;

  const categoryKeys = Object.keys(categories);
  const activeItems = activeCategory ? (categories[activeCategory]?.items || []) : [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap" role="tablist">
        {categoryKeys.map(cat => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-all duration-150 min-h-[36px] ${activeCategory === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
          >
            {cat.replace(/_/g, ' ')} <span className="ml-1.5 opacity-70">{categories[cat]?.items?.length || 0}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {activeItems.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">No items in this category</p>
        ) : (
          activeItems.slice(0, 50).map((item, i) => {
            const threatLevel = item.threat?.level;
            const threatColor = THREAT_COLORS[threatLevel];
            return (
              <motion.div key={item.id ?? `${activeCategory}-${i}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.5) }}>
                <Card className={`border-slate-200/50 transition-all ${threatLevel >= 4 ? 'border-red-200/60 bg-red-50/20' : threatLevel === 3 ? 'border-orange-200/60 bg-orange-50/20' : 'glass-card'}`}>
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
                          {safeUrl(item.link) && <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-slate-400">{item.source}</span>
                          {item.published_at && (
                            <><span className="text-slate-300">·</span>
                            <span className="text-xs text-slate-400">{new Date(item.published_at).toLocaleDateString()}</span></>
                          )}
                          {threatColor && <Badge className={`text-xs ${threatColor}`}>{THREAT_LABELS[threatLevel]}</Badge>}
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
  return <div className="flex items-center justify-center py-16 gap-3 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading {label}…</span></div>;
}
function PanelError({ message }) {
  return <div className="flex items-center justify-center py-16 gap-3 text-red-400"><AlertCircle className="w-5 h-5" /><span className="text-sm">{message}</span></div>;
}