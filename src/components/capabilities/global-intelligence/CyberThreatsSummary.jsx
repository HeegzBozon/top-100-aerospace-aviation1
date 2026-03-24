import { useCyberThreats } from '@/lib/intelligence/hooks';

export function CyberThreatsSummary() {
  const { data, isLoading } = useCyberThreats();
  const kev = data?.kev ?? [];
  const alerts = data?.alerts ?? [];
  const ransomware = data?.ransomwareCount ?? 0;

  if (isLoading) return <SummaryLoader />;

  return (
    <div className="h-full flex flex-col gap-1 p-1">
      <SummaryStat value={kev.length} label="EXPLOITS" color="text-red-400" />
      <SummaryStat value={ransomware} label="RANSOMWARE" color="text-orange-400" />
      <SummaryStat value={alerts.length} label="ADVISORIES" color="text-slate-300" />
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
