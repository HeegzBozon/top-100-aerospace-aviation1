// The small pieces every panel on the journey is built from, so a panel only ever says
// what it is for. All of it is drawn in the house's ink: cream stock, navy type, copper
// rules, and a serif heading wherever a name is printed.
import { B } from './journeyConfig';

export const Panel = ({ children, className = '' }) => (
  <div
    className={`rounded-sm px-4 py-4 ${className}`}
    style={{ background: '#fff', border: `1px solid ${B.border}` }}
  >
    {children}
  </div>
);

export const SectionLabel = ({ children, count }) => (
  <div className="flex items-baseline justify-between gap-2">
    <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: B.copper }}>
      {children}
    </p>
    {count !== undefined && (
      <span className="text-[10px]" style={{ color: B.muted }}>{count}</span>
    )}
  </div>
);

export const Chip = ({ active, onClick, children, tone = B.navy }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={!!active}
    className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors"
    style={active
      ? { background: tone, color: '#fff', border: `1px solid ${tone}` }
      : { background: 'transparent', color: B.muted, border: `1px solid ${B.border}` }}
  >
    {children}
  </button>
);

export const Field = ({ label, hint, error, children }) => (
  <label className="block">
    <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: B.muted }}>
      {label}
    </span>
    {children}
    {error ? (
      <span className="mt-1 block text-[10.5px]" style={{ color: '#a33' }}>{error}</span>
    ) : hint ? (
      <span className="mt-1 block text-[10.5px]" style={{ color: B.muted }}>{hint}</span>
    ) : null}
  </label>
);

export const inputStyle = {
  width: '100%',
  marginTop: 4,
  borderRadius: 2,
  border: `1px solid ${B.border}`,
  background: '#fff',
  padding: '8px 10px',
  fontSize: 13,
  lineHeight: 1.45,
  color: B.navy,
  outline: 'none',
};

export const Key = ({ children, onClick, disabled, tone = B.copper }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-opacity disabled:opacity-40"
    style={{ background: tone, color: '#fff' }}
  >
    {children}
  </button>
);

export const GhostKey = ({ children, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-opacity disabled:opacity-40"
    style={{ background: 'transparent', color: B.navy, border: `1px solid ${B.border}` }}
  >
    {children}
  </button>
);

export const Empty = ({ icon: Icon, title, children }) => (
  <div className="rounded-sm px-4 py-6 text-center" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
    {Icon && <Icon className="mx-auto h-4 w-4" style={{ color: B.copper }} />}
    <p className="mt-2 font-heading text-[17px]" style={{ color: B.navy }}>{title}</p>
    <p className="mx-auto mt-1 max-w-sm text-[11.5px] leading-relaxed" style={{ color: B.muted }}>
      {children}
    </p>
  </div>
);