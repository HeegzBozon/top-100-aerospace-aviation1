// Executive reach, read twice: the last seven days against the last thirty. Reach is
// unique visitors, not sessions, so the two windows are never added together.
const FACES = [
  { window: '7', field: 'users', label: 'Reach · 7 days', sub: 'unique visitors' },
  { window: '7', field: 'pageviews', label: 'Pageviews · 7 days', sub: 'pages read' },
  { window: '30', field: 'users', label: 'Reach · 30 days', sub: 'unique visitors' },
  { window: '30', field: 'pageviews', label: 'Pageviews · 30 days', sub: 'pages read' },
];

function figure(windows, face) {
  const value = windows?.[face.window]?.[face.field];
  return typeof value === 'number' ? value.toLocaleString('en-US') : '—';
}

export default function AudienceCards({ windows, loading }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      {FACES.map((face) => (
        <div key={face.label} className="desk-face px-3 py-3">
          <p className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-editorial-navy/60">
            {face.label}
          </p>
          {loading ? (
            <div className="mt-2 h-7 w-20 animate-pulse rounded bg-editorial-navy/10" />
          ) : (
            <p className="mt-1 font-heading text-[26px] leading-none text-editorial-navy">
              {figure(windows, face)}
            </p>
          )}
          <p className="mt-1 text-[10px] text-editorial-navy/55">{face.sub}</p>
        </div>
      ))}
    </div>
  );
}