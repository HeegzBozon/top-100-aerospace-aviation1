import { useFleetORBAT } from '@/lib/intelligence/hooks';

const THEATER_ABBREV = {
  'EUCOM':   'EU',
  'CENTCOM': 'CT',
  'INDOPACOM': 'IP',
  'NORTHCOM': 'NC',
  'SOUTHCOM': 'SC',
  'AFRICOM': 'AF',
  'Unknown': '?',
};

function abbrevTheater(t) {
  return THEATER_ABBREV[t] || t?.slice(0, 2)?.toUpperCase() || '?';
}

export function FleetORBATPanel() {
  const { orbat, totalFlights, totalOperators } = useFleetORBAT();

  return (
    <div className="h-full flex flex-col">
      {/* Stats row */}
      <div className="flex gap-2 mb-2 shrink-0">
        <StatBadge label="ACTIVE AC" value={totalFlights} />
        <StatBadge label="OPERATORS" value={totalOperators} />
      </div>

      {/* ORBAT table */}
      <div className="flex-1 overflow-auto min-h-0">
        {orbat.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-[11px] text-slate-600 font-mono animate-pulse">AWAITING FLIGHT DATA…</span>
          </div>
        ) : (
          <table className="w-full text-[11px] font-mono border-collapse">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800">
                <th className="text-left py-1 pr-2 font-normal">OPERATOR</th>
                <th className="text-right py-1 pr-2 font-normal w-8">AC</th>
                <th className="text-left py-1 font-normal">THEATER</th>
              </tr>
            </thead>
            <tbody>
              {orbat.map((row) => (
                <tr
                  key={row.operator}
                  className="border-b border-slate-900 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-0.5 pr-2">
                    <div className="flex items-center gap-1">
                      {row.flag && <span className="text-sm leading-none">{row.flag}</span>}
                      <span className="text-white truncate max-w-[9rem]" title={row.operator}>
                        {row.operator}
                      </span>
                    </div>
                  </td>
                  <td className="text-right pr-2 tabular-nums text-blue-300 font-bold">
                    {row.total}
                  </td>
                  <td>
                    <div className="flex gap-0.5 flex-wrap">
                      {row.theaters.filter(t => t !== 'Unknown').map(t => (
                        <span
                          key={t}
                          className="px-1 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400"
                          title={t}
                        >
                          {abbrevTheater(t)}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatBadge({ label, value }) {
  return (
    <div className="bg-slate-900 rounded px-2 py-1 shrink-0">
      <div className="text-[9px] text-slate-500 font-mono">{label}</div>
      <div className="text-lg font-bold text-white tabular-nums leading-none">{value ?? '—'}</div>
    </div>
  );
}
