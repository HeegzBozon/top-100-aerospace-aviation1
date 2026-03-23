import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, AlertCircle, Loader2, AlertTriangle, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAviationNews } from '@/lib/intelligence/hooks';
import { THREAT_COLORS, THREAT_LABELS } from '@/lib/intelligence/constants';
import { LaunchPartyWidget } from './LaunchPartyWidget';

const safeUrl = (url) => (url && /^https?:\/\//i.test(url) ? url : undefined);

export function AviationNewsFeed() {
  const { data, isLoading, isError, refetch, isFetching } = useAviationNews();
  const items = data?.items || [];

  if (isLoading) return <PanelLoader label="aviation news" />;
  if (isError) return <PanelError message="Unable to load aviation news" />;
  if (!items.length) return <PanelEmpty label="No aviation news available" />;

  return (
    <div className="space-y-3">
      {/* Header row with count + refresh */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{items.length} items</span>
        <Button
          variant="ghost" size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-7 text-xs text-slate-500 hover:text-slate-700 px-2"
        >
          {isFetching
            ? <Loader2 className="w-3 h-3 animate-spin mr-1" />
            : <RotateCcw className="w-3 h-3 mr-1" />
          }
          Refresh
        </Button>
      </div>

      {items.map((item, i) => {
        const threatLevel = item.threat_level;
        const threatColor = THREAT_COLORS[threatLevel];
        return (
          <motion.div key={item.id ?? i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.5) }}>
            <Card className={`hover:shadow-md transition-all duration-200 ${
              threatLevel >= 4 ? 'border-red-200/60 bg-red-50/20'
              : threatLevel === 3 ? 'border-orange-200/60 bg-orange-50/20'
              : 'glass-card border-slate-200/50'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${threatLevel >= 3 ? 'bg-orange-50' : 'bg-sky-50'}`}>
                    {threatLevel >= 3
                      ? <AlertTriangle className="w-4 h-4 text-orange-500" />
                      : <Newspaper className="w-4 h-4 text-sky-600" />
                    }
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
                      {threatColor && (
                        <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full border ${threatColor}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                          {THREAT_LABELS[threatLevel]}
                        </span>
                      )}
                      {item.matched_entities?.slice(0, 3).map(e => (
                        <Badge key={e} variant="secondary" className="text-xs px-1.5 py-0 capitalize">{e}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
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