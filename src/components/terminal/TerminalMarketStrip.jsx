import { useDefenseMarketQuotes } from '@/lib/intelligence/hooks';

export function TerminalMarketStrip() {
  const { data } = useDefenseMarketQuotes();
  const quotes = data?.quotes || [];

  if (!quotes.length) {
    return (
      <div className="flex items-center gap-4 px-3 text-[10px] text-slate-600 font-mono">
        <span>Market data loading…</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
      {quotes.map(q => {
        const isUp = (q.change || 0) >= 0;
        return (
          <div key={q.symbol} className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-mono text-slate-400 font-semibold">{q.symbol}</span>
            <span className="text-[10px] font-mono text-slate-200 tabular-nums">
              {q.price?.toFixed(2) ?? '—'}
            </span>
            <span className={`text-[10px] font-mono tabular-nums ${isUp ? 'text-green-400' : 'text-red-400'}`}>
              {isUp ? '▲' : '▼'} {Math.abs(q.change || 0).toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}