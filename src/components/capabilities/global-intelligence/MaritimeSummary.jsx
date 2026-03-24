import { useMaritimeIntel } from '@/lib/intelligence/hooks';

export function MaritimeSummary() {
  const { data, isLoading } = useMaritimeIntel();
  const incidents = data?.incidents ?? [];
  const piracy = incidents.filter(i => i.type === 'piracy').length;
  const conflict = incidents.filter(i => i.type === 'conflict').length;

  if (isLoading) return <SummaryLoader />;
  if (!incidents.length) return <SummaryEmpty label="No maritime data" />;

  return (
    <div className="h-full flex flex-col gap-1 p-1">
      <SummaryStat value={incidents.length} label="INCIDENTS" color="text-cyan-400" />
      <SummaryStat value={piracy} label="PIRACY" color="text-red-400" />
      <SummaryStat value={conflict} label="CONFLICT" color="text-orange-400" />
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
