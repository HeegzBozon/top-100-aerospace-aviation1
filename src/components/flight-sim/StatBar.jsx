const STAT_LABELS = {
  altitude: 'ALTITUDE',
  velocity: 'VELOCITY',
  payload: 'PAYLOAD',
  range: 'RANGE',
  resilience: 'RESILIENCE',
  maneuver: 'MANEUVER',
};

export default function StatBar({ stats, showValues = false }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
      {Object.entries(stats).map(([stat, val]) => (
        <div key={stat}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/40 text-[10px] uppercase tracking-widest">{STAT_LABELS[stat] || stat}</span>
            {showValues && <span className="text-[#c9a87c] text-xs font-bold">{val}</span>}
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-[#c9a87c] transition-all duration-700"
              style={{ width: `${(val / 20) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}