// A key on the faceplate: matte polymer, its legend cut into it, and a lamp in the corner
// for the ones that stand in a state. The copper tone is the station key, and it is the
// only key cast in metal.
export default function RadioKey({ label, glyph: Glyph, on = false, onClick, tone = "pad", title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title || label}
      aria-label={title || label}
      aria-pressed={on}
      className="rd-key"
      data-tone={tone}
      data-on={on}
    >
      {Glyph ? <Glyph className="rd-key-glyph" strokeWidth={2.2} aria-hidden="true" /> : null}
      <span className="rd-key-print">{label}</span>
      <span className="rd-key-lamp" data-on={on} aria-hidden="true" />
    </button>
  );
}