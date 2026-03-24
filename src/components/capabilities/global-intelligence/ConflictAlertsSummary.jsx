import { useConflictEvents } from '@/lib/intelligence/hooks';

export function ConflictAlertsSummary() {
  const { data, isLoading } = useConflictEvents();
  const events = data?.events ?? [];
  const fatalities = events.reduce((s, e) => s + (e.fatalities || 0), 0);
  const countries = new Set(events.map(e => e.country)).size;

  if (isLoading) return <SummaryLoader />;
  if (!events.length) return <SummaryEmpty label="No conflict data" />;

  return (
    <div className="h-full flex flex-col gap-1 p-1">
      <SummaryStat value={events.length} label="EVENTS" color="text-red-400" />
      <SummaryStat value={fatalities} label="FATALITIES" color="text-red-300" />
      <SummaryStat value={countries} label="COUNTRIES" color="text-slate-300" />
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

function SummaryEmpty({ label }) {
  return <div className="h-full flex items-center justify-center"><span className="text-[10px] text-slate-600 font-mono">{label.toUpperCase()}</span></div>;
}
