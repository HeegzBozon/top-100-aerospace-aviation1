import { X, ExternalLink, Plane, Satellite, Rocket, Zap, Newspaper } from 'lucide-react';

const TYPE_META = {
  flight: { icon: Plane, color: '#B87333', label: 'Aircraft' },
  satellite: { icon: Satellite, color: '#C9A87C', label: 'Satellite' },
  launch: { icon: Rocket, color: '#C9A87C', label: 'Launch' },
  earthquake: { icon: Zap, color: '#ef4444', label: 'Earthquake' },
  news: { icon: Newspaper, color: '#FAF8F5', label: 'News' },
};

function FlightDetails({ d }) {
  return (
    <>
      <h3 className="font-heading text-lg text-cream mb-1">{d.flight || d.icao || 'Unknown Aircraft'}</h3>
      <dl className="space-y-1 text-xs">
        <Row label="Type" value={d.t || '—'} />
        <Row label="Operator" value={d.own_op || '—'} />
        <Row label="Altitude" value={d.alt != null ? `${d.alt.toLocaleString()} ft` : 'Ground'} />
        <Row label="Ground Speed" value={`${Math.round(d.gs || 0)} kts`} />
        <Row label="Heading" value={`${Math.round(d.track || 0)}°`} />
        <Row label="Squawk" value={d.squawk || '—'} />
        <Row label="Military" value={d.mil ? 'Yes' : 'No'} />
        {d.emergency && d.emergency !== 'none' && <Row label="Emergency" value={d.emergency} />}
        <Row label="Position" value={`${d.lat.toFixed(3)}, ${d.lon.toFixed(3)}`} />
      </dl>
    </>
  );
}

function SatelliteDetails({ d }) {
  return (
    <>
      <h3 className="font-heading text-lg text-cream mb-1">{d.name}</h3>
      <dl className="space-y-1 text-xs">
        <Row label="Catalog ID" value={d.id} />
        <Row label="Group" value={d.group} />
        <Row label="Altitude" value={`${Math.round(d.alt)} km`} />
        <Row label="Inclination" value={`${d.inclination.toFixed(1)}°`} />
        <Row label="Mean Motion" value={`${d.mean_motion.toFixed(2)} rev/day`} />
        <Row label="Epoch" value={new Date(d.epoch).toLocaleString()} />
        <Row label="Sub-satellite Point" value={`${d.lat.toFixed(2)}, ${d.lon.toFixed(2)}`} />
      </dl>
    </>
  );
}

function LaunchDetails({ d }) {
  const net = d.net ? new Date(d.net) : null;
  return (
    <>
      <h3 className="font-heading text-lg text-cream mb-1">{d.mission?.name || d.name}</h3>
      {d.image && <img src={d.image} alt="" className="w-full h-32 object-cover rounded-md mb-2" />}
      <dl className="space-y-1 text-xs">
        <Row label="Rocket" value={d.rocket?.name || '—'} />
        <Row label="Provider" value={d.lsp?.name || '—'} />
        <Row label="Status" value={d.status?.name || '—'} />
        <Row label="NET" value={net ? net.toLocaleString() : '—'} />
        <Row label="Pad" value={d.pad?.name || '—'} />
        <Row label="Location" value={d.pad?.location?.name || '—'} />
        {d.mission?.type && <Row label="Mission Type" value={d.mission.type} />}
      </dl>
      {d.vidURLs?.length > 0 && (
        <a href={d.vidURLs[0].url} target="_blank" rel="noreferrer"
          className="mt-2 flex items-center gap-1.5 text-xs text-[#C9A87C] hover:text-[#B87333]">
          <ExternalLink className="w-3 h-3" /> Watch Live
        </a>
      )}
    </>
  );
}

function EarthquakeDetails({ d }) {
  return (
    <>
      <h3 className="font-heading text-lg text-cream mb-1">M{d.mag.toFixed(1)} — {d.place}</h3>
      <dl className="space-y-1 text-xs">
        <Row label="Magnitude" value={d.mag.toFixed(1)} />
        <Row label="Depth" value={`${d.depth.toFixed(1)} km`} />
        <Row label="Time" value={new Date(d.time).toLocaleString()} />
        <Row label="Position" value={`${d.lat.toFixed(3)}, ${d.lon.toFixed(3)}`} />
        {d.tsunami && <div className="text-red-400 text-xs font-semibold mt-1">⚠ Tsunami warning issued</div>}
      </dl>
      <a href={d.url} target="_blank" rel="noreferrer"
        className="mt-2 flex items-center gap-1.5 text-xs text-[#C9A87C] hover:text-[#B87333]">
        <ExternalLink className="w-3 h-3" /> USGS Event Page
      </a>
    </>
  );
}

function NewsDetails({ d }) {
  return (
    <>
      <h3 className="font-heading text-base text-cream mb-1 leading-snug">{d.title}</h3>
      <dl className="space-y-1 text-xs">
        <Row label="Source" value={d.domain} />
        <Row label="Country" value={d.sourcecountry} />
        <Row label="Seen" value={d.seendate} />
      </dl>
      <a href={d.url} target="_blank" rel="noreferrer"
        className="mt-2 flex items-center gap-1.5 text-xs text-[#C9A87C] hover:text-[#B87333]">
        <ExternalLink className="w-3 h-3" /> Read Article
      </a>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-cream text-right truncate">{value}</dd>
    </div>
  );
}

export default function GlobeDetailPanel({ selected, onClose }) {
  if (!selected) return null;
  const { type, data: d } = selected;
  const meta = TYPE_META[type];
  if (!meta) return null;
  const Icon = meta.icon;

  const renderDetails = {
    flight: FlightDetails, satellite: SatelliteDetails,
    launch: LaunchDetails, earthquake: EarthquakeDetails, news: NewsDetails,
  };
  const Details = renderDetails[type];

  return (
    <div className="bg-[#0a0f1e]/95 backdrop-blur border border-[#1E3A5A]/40 rounded-lg p-4 w-72 absolute right-3 top-3 z-20">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1E3A5A]/30">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: meta.color }} />
          <span className="text-[10px] font-mono tracking-[0.15em] uppercase" style={{ color: meta.color }}>
            {meta.label}
          </span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-cream">
          <X className="w-4 h-4" />
        </button>
      </div>
      <Details d={d} />
    </div>
  );
}