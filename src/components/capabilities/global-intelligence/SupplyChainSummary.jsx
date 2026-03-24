import { useSupplyChainIntel } from '@/lib/intelligence/hooks';

export function SupplyChainSummary() {
  const { disruptions, bdiData, chokepoints, isLoadingDisruptions } = useSupplyChainIntel();
  const highRisk = chokepoints.filter(c => c.risk === 'high').length;
  const latestBdi = bdiData?.[bdiData.length - 1]?.value ?? null;
  const prevBdi = bdiData?.[bdiData.length - 2]?.value ?? null;
  const bdiTrend = latestBdi != null && prevBdi != null
    ? latestBdi >= prevBdi ? '↑' : '↓'
    : null;

  if (isLoadingDisruptions) return <SummaryLoader />;

  return (
    <div className="h-full flex flex-col gap-1 p-1">
      <SummaryStat value={disruptions.length} label="DISRUPTIONS" color="text-yellow-400" />
      <SummaryStat value={highRisk} label="HIGH-RISK" color="text-red-400" />
      {latestBdi != null && (
        <SummaryStat
          value={`${Math.round(latestBdi)}${bdiTrend || ''}`}
          label="BDI"
          color={bdiTrend === '↑' ? 'text-green-400' : 'text-red-400'}
        />
      )}
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
