import { useState, useEffect, useRef } from 'react';
import { X, Navigation, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { getGlobalIntelData } from '@/functions/getGlobalIntelData';

const STATUS_COLORS = {
  military: { bg: '#f97316', text: '#fff', label: 'MILITARY' },
  anomaly:  { bg: '#ef4444', text: '#fff', label: 'ANOMALY'  },
  default:  { bg: '#3b82f6', text: '#fff', label: 'EN ROUTE' },
};

function StatBox({ label, value, unit }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-[10px] tracking-widest text-slate-500 uppercase mb-0.5">{label}</div>
      <div className="text-lg font-bold text-white leading-none">
        {value != null ? value : '—'}
        {unit && <span className="text-xs text-slate-400 ml-0.5">{unit}</span>}
      </div>
    </div>
  );
}

function SourceBadge({ sources = [], anomaly }) {
  const both = sources.includes('wingbits') && sources.includes('opensky');
  const color = anomaly ? '#ef4444' : both ? '#22c55e' : '#64748b';
  const label = anomaly ? 'ANOMALY DETECTED' : both ? 'DUAL-SOURCE VERIFIED' : sources[0]?.toUpperCase() ?? 'UNKNOWN';
  const Icon = anomaly ? AlertTriangle : both ? CheckCircle2 : null;
  return (
    <div className="flex items-center gap-1 text-[9px] font-mono" style={{ color }}>
      {Icon && <Icon style={{ width: 9, height: 9 }} />}
      {label}
    </div>
  );
}

export default function FlightDetailCard({ flight, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const activeIcaoRef = useRef(null);

  useEffect(() => {
    if (!flight?.icao24) return;
    const icao = flight.icao24;
    activeIcaoRef.current = icao;
    setDetail(null);
    setLoading(true);
    getGlobalIntelData({ action: 'detail', icao24: icao })
      .then(res => {
        // Guard against stale responses from rapid flight switching
        if (activeIcaoRef.current !== icao) return;
        setDetail(res?.data);
      })
      .catch(() => {})
      .finally(() => {
        if (activeIcaoRef.current === icao) setLoading(false);
      });
  }, [flight?.icao24]);

  if (!flight) return null;

  const d = detail?.detail || {};
  const statusKey = flight.isMilitary ? 'military' : flight.anomaly ? 'anomaly' : 'default';
  const status = STATUS_COLORS[statusKey];

  const hdg = flight.heading != null ? Math.round(flight.heading) : null;
  const alt = flight.altitude != null ? flight.altitude.toLocaleString() : null;
  const spd = flight.speed    != null ? Math.round(flight.speed)    : null;

  return (
    <div
      className="absolute top-2 right-2 w-72 rounded-xl overflow-hidden shadow-2xl z-50 flex flex-col"
      style={{ background: '#0f1117', border: '1px solid #1e293b' }}
    >
      {/* Photo banner */}
      <AircraftPhoto registration={d.registration} isMilitary={flight.isMilitary} />

      {/* Header */}
      <div className="px-4 pt-3 pb-2" style={{ borderBottom: '1px solid #1e293b' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-black text-lg tracking-wide">
              {flight.callsign || flight.icao24?.toUpperCase()}
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: status.bg, color: status.text }}
            >
              {status.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-1 mt-1 text-slate-500 text-xs">
            <Loader2 style={{ width: 10, height: 10 }} className="animate-spin" />
            Fetching aircraft data...
          </div>
        ) : (
          <>
            {(d.model || d.type) && (
              <div className="text-slate-300 text-xs font-medium mt-0.5">
                {d.model || d.type}
              </div>
            )}
            {(d.operator || d.owner || flight.country) && (
              <div className="text-slate-500 text-[11px]">
                {d.operator || d.owner || flight.country}
              </div>
            )}
          </>
        )}

        <div className="mt-1.5">
          <SourceBadge sources={flight.sources || []} anomaly={flight.anomaly} />
        </div>
      </div>

      {/* Telemetry stats */}
      <div
        className="grid grid-cols-3 gap-2 px-4 py-3"
        style={{ borderBottom: '1px solid #1e293b' }}
      >
        <StatBox label="Altitude" value={alt} unit="ft" />
        <StatBox label="Speed" value={spd} unit="kts" />
        <StatBox
          label="Heading"
          value={hdg != null ? `${hdg}°` : null}
        />
      </div>

      {/* Aircraft details */}
      <div className="px-4 py-3 space-y-1.5 text-[11px]">
        <DetailRow label="ICAO24" value={flight.icao24?.toUpperCase()} />
        {d.registration && <DetailRow label="Reg" value={d.registration} />}
        {d.manufacturer  && <DetailRow label="Manufacturer" value={d.manufacturer} />}
        {d.engines       && <DetailRow label="Engines" value={d.engines} />}
        {d.built         && <DetailRow label="Built" value={d.built} />}
        {flight.squawk   && <DetailRow label="Squawk" value={flight.squawk} />}
        {flight.country  && <DetailRow label="Country" value={flight.country} />}
        {flight.anomaly && flight.anomalyDetails && (
          <div className="mt-2 p-2 rounded-lg text-[10px]" style={{ background: '#450a0a', border: '1px solid #7f1d1d' }}>
            <div className="text-red-400 font-bold mb-1">⚠ DATA ANOMALY</div>
            <div className="text-red-300 space-y-0.5">
              {flight.anomalyDetails.latDelta > 0.1 && <div>Pos Δ: {flight.anomalyDetails.latDelta.toFixed(2)}° lat</div>}
              {flight.anomalyDetails.altDelta > 500  && <div>Alt Δ: {flight.anomalyDetails.altDelta.toLocaleString()} ft</div>}
              {flight.anomalyDetails.spdDelta > 50   && <div>Spd Δ: {flight.anomalyDetails.spdDelta} kts</div>}
            </div>
          </div>
        )}
      </div>

      {/* Heading compass */}
      {hdg != null && (
        <div className="flex items-center justify-center py-2 gap-2" style={{ borderTop: '1px solid #1e293b' }}>
          <Navigation
            style={{
              width: 16, height: 16,
              color: flight.isMilitary ? '#f97316' : '#60a5fa',
              transform: `rotate(${hdg}deg)`,
            }}
          />
          <span className="text-[10px] font-mono text-slate-500">
            {hdg}° · {headingToCardinal(hdg)}
          </span>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-600 uppercase tracking-wider text-[9px]">{label}</span>
      <span className="text-slate-300 font-mono">{value}</span>
    </div>
  );
}

function AircraftPhoto({ registration, isMilitary }) {
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    if (!registration) return;
    // Route through backend to avoid CORS issues with planespotters.net
    getGlobalIntelData({ action: 'photo', registration })
      .then(res => {
        const thumb = res?.data?.thumbnail;
        if (thumb) setPhotoUrl(thumb);
      })
      .catch(() => {});
  }, [registration]);

  if (!photoUrl) {
    return (
      <div
        className="w-full h-28 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}
      >
        <span style={{ fontSize: 40 }}>{isMilitary ? '🔴' : '✈️'}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-28 overflow-hidden">
      <img src={photoUrl} alt="Aircraft" className="w-full h-full object-cover" />
      <div className="absolute bottom-1 right-2 text-[8px] text-white/40">© planespotters.net</div>
    </div>
  );
}

function headingToCardinal(deg) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}