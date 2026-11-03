// THE CABINET'S OWN KEYS
//
// The arcade games listen on the window for keys, so the console's chin is asked for
// the same thing a keyboard says. Nothing here reaches into a game: a press is a real
// key event, which is exactly what a thumb on a phone can hand a machine that was
// written for a desk.
const press = (type, key) => {
  window.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true }));
};

function Key({ keyName, label, glyph, onHold }) {
  const down = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    onHold(true, keyName);
  };
  const up = (e) => {
    e.preventDefault();
    onHold(false, keyName);
  };
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={down}
      onPointerUp={up}
      onPointerCancel={up}
      onPointerLeave={up}
      onContextMenu={(e) => e.preventDefault()}
      className="arcade-key flex h-14 flex-1 touch-none select-none items-center justify-center text-lg font-semibold"
    >
      {glyph}
    </button>
  );
}

export default function TouchKeys({ keys }) {
  const hold = (on, keyName) => press(on ? 'keydown' : 'keyup', keyName);

  return (
    <div className="flex items-stretch gap-2">
      {keys.map((k) => (
        <Key key={k.keyName} keyName={k.keyName} label={k.label} glyph={k.glyph} onHold={hold} />
      ))}
    </div>
  );
}