import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, AlertCircle, Loader2, Newspaper } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useDefenseMarketQuotes, useAviationNews } from '@/lib/intelligence/hooks';
import { TICKER_NAMES, brandColors } from '@/lib/intelligence/constants';

// ── NYSE market status ─────────────────────────────────────────────────────
// DST in US: second Sunday of March → first Sunday of November (UTC-4)
// Standard: UTC-5. NYSE: 09:30–16:00 ET, pre-market 04:00–09:30, after-hours 16:00–20:00.
function getNYSEStatus() {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 6=Sat

  // Approximate DST: March (month 2) through October (month 9) inclusive → UTC-4, else UTC-5
  const month = now.getUTCMonth();
  const offsetH = (month >= 2 && month <= 10) ? 4 : 5;
  const etH = now.getUTCHours() - offsetH + (now.getUTCMinutes() / 60);

  if (day === 0 || day === 6) return { label: 'Closed', color: 'bg-slate-100 text-slate-500' };

  if (etH >= 9.5 && etH < 16) return { label: 'Market Open', color: 'bg-green-100 text-green-700' };
  if (etH >= 4 && etH < 9.5)  return { label: 'Pre-Market', color: 'bg-yellow-100 text-yellow-700' };
  if (etH >= 16 && etH < 20)  return { label: 'After-Hours', color: 'bg-yellow-100 text-yellow-700' };
  return { label: 'Closed', color: 'bg-slate-100 text-slate-500' };
}

// Count news articles mentioning a company name
function useNewsCountByTicker(tickerNames) {
  const { data } = useAviationNews();
  const items = data?.items || [];
  const counts = {};
  for (const [symbol, name] of Object.entries(tickerNames)) {
    counts[symbol] = items.filter(item =>
      (item.matched_entities || []).includes(name)
    ).length;
  }
  return counts;
}

export function MarketSignalsPanel() {
  const { data, isLoading, isError } = useDefenseMarketQuotes();
  const quotes = data?.quotes || [];
  const newsCount = useNewsCountByTicker(TICKER_NAMES);
  const marketStatus = getNYSEStatus();

  if (isLoading) return <PanelLoader label="market data" />;
  if (isError) return <PanelError message="Unable to load market data" />;

  if (!quotes.length) {
    return (
      <div className="py-12 flex flex-col items-center gap-4 text-center">
        <BarChart3 className="w-10 h-10 text-slate-300" />
        <p className="text-sm font-semibold text-slate-500">Market data unavailable</p>
        {!import.meta.env.VITE_FINNHUB_API_KEY && (
          <div className="max-w-sm text-left space-y-2">
            <p className="text-xs text-slate-400">
              Add your free Finnhub API key to enable live defense & aerospace market quotes.
            </p>
            <pre className="text-xs bg-slate-100 rounded-lg px-4 py-3 text-slate-600 font-mono whitespace-pre">
              {'# .env.local\nVITE_FINNHUB_API_KEY=your_key_here'}
            </pre>
            <p className="text-xs text-slate-400">
              Get a free key at{' '}
              <a
                href="https://finnhub.io/register"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-slate-600"
              >
                finnhub.io/register
              </a>
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with market status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
          <h3 className="font-semibold text-sm" style={{ color: brandColors.navyDeep }}>
            Defense & Aerospace Market Signals
          </h3>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${marketStatus.color}`}>
          {marketStatus.label}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {quotes.map((q, i) => {
          const isUp = q.change >= 0;
          const absChange = q.absoluteChange ?? 0;
          const pctChange = q.change ?? 0;
          const articles = newsCount[q.symbol] || 0;

          return (
            <motion.div
              key={q.symbol}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card border-slate-200/50">
                <CardContent className="p-4">
                  {/* Ticker row */}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold" style={{ color: brandColors.navyDeep }}>
                        {q.symbol}
                      </p>
                      <p className="text-xs text-slate-500">{TICKER_NAMES[q.symbol] || q.symbol}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {articles > 0 && (
                        <span className="flex items-center gap-0.5 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                          <Newspaper className="w-2.5 h-2.5" />
                          {articles}
                        </span>
                      )}
                      {isUp
                        ? <TrendingUp className="w-5 h-5 text-green-500" />
                        : <TrendingDown className="w-5 h-5 text-red-500" />
                      }
                    </div>
                  </div>

                  {/* Price + change */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>
                      ${q.price?.toFixed(2) || '—'}
                    </span>
                    <span className={`text-sm font-semibold ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                      {isUp ? '+' : ''}{absChange.toFixed(2)} ({isUp ? '+' : ''}{pctChange.toFixed(2)}%)
                    </span>
                  </div>

                  {/* OHLC row */}
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
