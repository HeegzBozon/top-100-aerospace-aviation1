import { useState, useEffect } from 'react';
import { useMilitaryFlights, useConflictEvents, useNaturalDisasters, useCyberThreats, useAviationNews, useDefenseMarketQuotes } from '@/lib/intelligence/hooks';

function LiveClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="tabular-nums text-[11px] shrink-0" style={{ color: '#1e3a5a' }}>
      {time.toUTCString().slice(17, 25)} <span className="opacity-50">UTC</span>
    </span>
  );
}

function Stat({ icon, value, label, color }) {
  return (
    <span className="flex items-center gap-1 shrink-0" style={{ color }}>
      <span className="text-xs">{icon}</span>
      <strong className="tabular-nums text-[11px]">{value}</strong>
      <span className="text-[10px] opacity-50 hidden md:inline">{label}</span>
    </span>
  );
}

function MarketQuote({ symbol, price, change }) {
  const isUp = (change || 0) >= 0;
  return (
    <span className="flex items-center gap-1 shrink-0">
      <span className="text-[10px] font-semibold" style={{ color: '#1e3a5a' }}>{symbol}</span>
      <span className="text-[10px] tabular-nums" style={{ color: '#1e3a5a' }}>{price?.toFixed(2) ?? '—'}</span>
      <span className={`text-[10px] tabular-nums ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
        {isUp ? '▲' : '▼'}{Math.abs(change || 0).toFixed(1)}%
      </span>
    </span>
  );
}

export default function EditorialTickerBar() {
  const { data: flightData } = useMilitaryFlights();
  const { data: conflictData } = useConflictEvents();
  const { data: disasterData } = useNaturalDisasters();
  const { data: cyberData } = useCyberThreats();
  const { data: newsData } = useAviationNews();
  const { data: marketData } = useDefenseMarketQuotes();

  const flightCount = flightData?.flights?.length ?? '—';
  const conflictCount = conflictData?.events?.length ?? '—';
  const kevCount = cyberData?.kevCount ?? '—';
  const headlines = newsData?.items?.slice(0, 8).map(i => i.title) ?? [];
  const quotes = marketData?.quotes?.slice(0, 4) ?? [];

  return (
    <div
      className="h-8 flex items-center px-4 gap-3 text-[11px] font-mono shrink-0 overflow-hidden border-b"
      style={{
        background: 'linear-gradient(90deg, #faf8f5 0%, #f5efe8 50%, #faf8f5 100%)',
        borderColor: 'rgba(30,58,90,0.12)',
      }}
    >
      {/* Brand label */}
      <span className="font-bold tracking-widest shrink-0 text-[11px]" style={{ color: '#c9a87c' }}>
        GLOBAL OPS
      </span>

      {/* Live indicator */}
      <span className="flex items-center gap-1 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-semibold" style={{ color: '#1e3a5a' }}>LIVE</span>
      </span>

      <div className="w-px h-3.5 shrink-0" style={{ background: 'rgba(30,58,90,0.15)' }} />

      {/* Stats */}
      <Stat icon="✈" value={flightCount} label="MIL" color="#4a90b8" />
      <Stat icon="⚔" value={conflictCount} label="EVENTS" color="#c9574a" />
      <Stat icon="🛡" value={kevCount} label="KEV" color="#d4a574" />

      <div className="w-px h-3.5 shrink-0" style={{ background: 'rgba(30,58,90,0.15)' }} />

      {/* Market quotes */}
      {quotes.map(q => (
        <MarketQuote key={q.symbol} symbol={q.symbol} price={q.price} change={q.change} />
      ))}

      {/* Scrolling headlines */}
      <div className="flex-1 min-w-0 overflow-hidden whitespace-nowrap">
        <span className="inline-block animate-marquee text-[10px]" style={{ color: 'rgba(30,58,90,0.5)' }}>
          {headlines.join('  ·  ')}
        </span>
      </div>

      <div className="w-px h-3.5 shrink-0" style={{ background: 'rgba(30,58,90,0.15)' }} />
      <LiveClock />
    </div>
  );
}