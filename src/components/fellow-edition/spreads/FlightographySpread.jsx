import { B } from '@/components/fellow-home/fellowHomeConfig';

// The credential close. Career history as an editorial timeline,
// impact metrics as a ledger, achievements as the pull-quote.
export default function FlightographySpread({ nominee, accent }) {
  const history = nominee?.career_history || [];
  const metrics = nominee?.impact_metrics || {};
  const metricEntries = Object.entries(metrics).filter(([, v]) => v !== null && v !== undefined && v !== 0);

  return (
    <div className="h-full w-full flex flex-col p-10" style={{ background: B.cream }}>
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: B.navy }}>Flightography</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>The record</span>
      </div>

      <div className="h-px w-16 mb-6" style={{ background: accent }} />

      {nominee?.achievements && (
        <blockquote className="mb-6 pl-4 border-l-2" style={{ borderColor: accent }}>
          <p className="text-sm italic leading-relaxed" style={{ color: 'rgba(30,58,90,0.8)' }}>{nominee.achievements}</p>
        </blockquote>
      )}

      {history.length > 0 && (
        <div className="flex-1 space-y-3 overflow-hidden">
          {history.slice(0, 4).map((role, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center pt-1">
                <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
                {i < history.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: 'rgba(30,58,90,0.15)' }} />}
              </div>
              <div className="flex-1 pb-2">
                <p className="text-sm font-bold" style={{ color: B.navy }}>{role.role_title}</p>
                <p className="text-xs" style={{ color: 'rgba(30,58,90,0.6)' }}>{role.company_name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {metricEntries.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'rgba(30,58,90,0.1)' }}>
          {metricEntries.slice(0, 6).map(([key, val]) => (
            <div key={key} className="text-center">
              <p className="text-lg font-bold" style={{ color: accent }}>{typeof val === 'number' ? val : '—'}</p>
              <p className="text-[9px] uppercase tracking-wide" style={{ color: 'rgba(30,58,90,0.5)' }}>
                {key.replace(/_/g, ' ')}
              </p>
            </div>
          ))}
        </div>
      )}

      {history.length === 0 && metricEntries.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm italic" style={{ color: 'rgba(30,58,90,0.4)' }}>Flightography pending verification.</p>
        </div>
      )}
    </div>
  );
}