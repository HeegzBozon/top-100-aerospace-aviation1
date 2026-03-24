import { useGpsJamming } from '@/lib/intelligence/hooks';

export function GpsJammingSummary() {
  const { data, isLoading } = useGpsJamming();
  const events = data?.events ?? [];
  const regions = new Set(events.map(e => e.region).filter(Boolean)).size;

  if (isLoading) return <SummaryLoader />;

  return (
    <div className="h-full flex flex-col gap-1 p-1">
      <SummaryStat
        value={events.length}
        label="EVENTS"
        color={events.length > 0 ? 'text-amber-400' : 'text-green-400'}
      />
      <SummaryStat value={regions || (events.length > 0 ? '—' : 0)} label="REGIONS" color="text-slate-300" />
      <div className={`text-[9px] font-mono mt-auto ${events.length > 0 ? 'text-amber-500' : 'text-green-500'}`}>
        {events.length > 0 ? '⚠ INTERFERENCE' : '✓ NOMINAL'}
      </div>
    </div>
  );
}

function SummaryStat({ value, label, color = 'text-white' }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`text-base font-bold tabular-nums leading-none ${color}`}>{value}</span>
      <span className="text-[9px] text-slate-500 font-mono">{label}</span>
    </div>
  );
}

function SummaryLoader() {
  return <div className="h-full flex items-center justify-center"><span className="text-[10px] text-slate-600 font-mono animate-pulse">LOADING</span></div>;
}
