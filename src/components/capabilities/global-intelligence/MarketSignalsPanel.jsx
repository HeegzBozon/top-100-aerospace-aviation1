import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useDefenseMarketQuotes } from '@/lib/intelligence/hooks';
import { TICKER_NAMES, brandColors } from '@/lib/intelligence/constants';

export function MarketSignalsPanel() {
  const { data, isLoading, isError } = useDefenseMarketQuotes();
  const quotes = data?.quotes || [];

  if (isLoading) return <PanelLoader label="market data" />;
  if (isError) return <PanelError message="Unable to load market data" />;
  if (!quotes.length) {
    return (
      <div className="text-center py-16 text-sm text-slate-400">
        {import.meta.env.VITE_FINNHUB_API_KEY
          ? 'No market data available'
          : 'Set VITE_FINNHUB_API_KEY in .env.local to enable market data'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
        <h3 className="font-semibold text-sm" style={{ color: brandColors.navyDeep }}>Defense & Aerospace Market Signals</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {quotes.map((q, i) => {
          const isUp = q.change >= 0;
          return (
            <motion.div key={q.symbol} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card border-slate-200/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold" style={{ color: brandColors.navyDeep }}>{q.symbol}</p>
                      <p className="text-xs text-slate-500">{TICKER_NAMES[q.symbol] || q.symbol}</p>
                    </div>
                    {isUp ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>
                      ${q.price?.toFixed(2) || '—'}
                    </span>
                    <span className={`text-sm font-semibold ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                      {isUp ? '+' : ''}{q.change?.toFixed(2) || 0}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>H: ${q.high?.toFixed(2) || '—'}</span>
                    <span>L: ${q.low?.toFixed(2) || '—'}</span>
                    <span>O: ${q.open?.toFixed(2) || '—'}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
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
