import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const WM_BASE = 'https://worldmonitor-voip40t21-top-100-aerospace-and-aviation.vercel.app';
const brandColors = { navyDeep: '#1e3a5a', skyBlue: '#4a90b8' };
const AEROSPACE_ENTITIES = ['Boeing', 'Airbus', 'NASA', 'SpaceX', 'FAA', 'ICAO'];

export function AviationNewsFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams({ window_hours: '48', max_items: '20' });
    AEROSPACE_ENTITIES.forEach(e => params.append('entities', e));
    fetch(`${WM_BASE}/api/aviation/v1/list-aviation-news?${params}`)
      .then(r => r.json())
      .then(data => setItems(data.items || []))
      .catch(() => setError('Unable to load aviation news'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PanelLoader label="aviation news" />;
  if (error) return <PanelError message={error} />;
  if (!items.length) return <PanelEmpty label="No aviation news in the last 48 hours" />;

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <motion.div key={item.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
          <Card className="glass-card border-slate-200/50 hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg flex-shrink-0" style={{ background: `${brandColors.skyBlue}15` }}>
                  <Newspaper className="w-4 h-4" style={{ color: brandColors.skyBlue }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold hover:underline line-clamp-2 flex-1" style={{ color: brandColors.navyDeep }}>
                      {item.title}
                    </a>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  </div>
                  {item.snippet && <p className="text-xs text-slate-500 line-clamp-2 mb-2">{item.snippet}</p>}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-400">{item.source_name}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{item.published_at ? new Date(item.published_at).toLocaleDateString() : ''}</span>
                    {item.matched_entities?.map(e => (
                      <Badge key={e} variant="secondary" className="text-xs px-1.5 py-0">{e}</Badge>
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
