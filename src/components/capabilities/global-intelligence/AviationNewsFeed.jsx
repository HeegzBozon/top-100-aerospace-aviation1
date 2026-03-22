import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAviationNews } from '@/functions/getAviationNews';

const safeUrl = (url) => (url && /^https?:\/\//i.test(url) ? url : undefined);

export function AviationNewsFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAviationNews({})
      .then(res => {
        if (res.data?.error) throw new Error(res.data.error);
        setItems(res.data?.items || []);
      })
      .catch(err => setError(err.message || 'Unable to load aviation news'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PanelLoader label="aviation news" />;
  if (error) return <PanelError message={error} />;
  if (!items.length) return <PanelEmpty label="No aviation news available" />;

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <motion.div key={item.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
          <Card className="glass-card border-slate-200/50 hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg flex-shrink-0 bg-sky-50">
                  <Newspaper className="w-4 h-4 text-sky-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    {safeUrl(item.url) ? (
                      <a href={safeUrl(item.url)} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-semibold hover:underline line-clamp-2 flex-1 text-slate-800">
                        {item.title}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold line-clamp-2 flex-1 text-slate-800">{item.title}</p>
                    )}
                    {safeUrl(item.url) && <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />}
                  </div>
                  {item.snippet && <p className="text-xs text-slate-500 line-clamp-2 mb-2">{item.snippet}</p>}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-400">{item.source_name}</span>
                    {item.published_at && (
                      <><span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-400">{new Date(item.published_at).toLocaleDateString()}</span></>
                    )}
                    {item.matched_entities?.map(e => (
                      <Badge key={e} variant="secondary" className="text-xs px-1.5 py-0 capitalize">{e}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function PanelLoader({ label }) {
  return <div className="flex items-center justify-center py-16 gap-3 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading {label}…</span></div>;
}
function PanelError({ message }) {
  return <div className="flex items-center justify-center py-16 gap-3 text-red-400"><AlertCircle className="w-5 h-5" /><span className="text-sm">{message}</span></div>;
}
function PanelEmpty({ label }) {
  return <div className="flex items-center justify-center py-16 text-slate-400"><span className="text-sm">{label}</span></div>;
}