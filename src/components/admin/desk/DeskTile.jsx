// One figure on the desk, set as an instrument face: a copper label, the number in the
// house serif, a line under it, and a measure where the figure has something to fill.
export default function DeskTile({ label, value, note, meter, tone = '#1e3a5a' }) {
  return (
    <div className="desk-face px-3.5 py-3">
      <p
        className="text-[9px] font-bold uppercase leading-none tracking-[0.2em]"
        style={{ color: '#8f5c2c' }}
      >
        {label}
      </p>
      <p className="mt-2 font-heading text-[22px] leading-none tabular-nums" style={{ color: tone }}>
        {value}
      </p>
      {typeof meter === 'number' && (
        <div className="desk-meter mt-2">
          <span style={{ width: `${Math.max(0, Math.min(1, meter)) * 100}%` }} />
        </div>
      )}
      {note && (
        <p className="mt-1.5 text-[10px] leading-tight" style={{ color: 'rgba(30,58,90,0.62)' }}>
          {note}
        </p>
      )}
    </div>
  );
}