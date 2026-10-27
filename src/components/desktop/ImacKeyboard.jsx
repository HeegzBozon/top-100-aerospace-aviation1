// The keyboard that came with the machine: a pearl deck seated on a translucent resin
// base that rims past it, with charcoal keys. It is a prop, not an input — nothing on
// this desk types, and nothing about it pretends to.
const LETTER_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
const FUNCTION_KEYS = Array.from({ length: 14 }, (_, index) => index);

export default function ImacKeyboard() {
  return (
    <div className="imac-keyboard">
      <span className="imac-cable" aria-hidden="true" />

      <div className="imac-keyboard-deck">
        <div className="imac-key-row">
          {FUNCTION_KEYS.map((key) => (
            <span key={key} className="imac-key imac-key-fn" />
          ))}
        </div>

        {LETTER_ROWS.map((row) => (
          <div key={row} className="imac-key-row">
            {row.split("").map((letter) => (
              <span key={letter} className="imac-key">
                {letter}
              </span>
            ))}
          </div>
        ))}

        <div className="imac-key-row">
          <span className="imac-key imac-key-space" />
        </div>
      </div>
    </div>
  );
}