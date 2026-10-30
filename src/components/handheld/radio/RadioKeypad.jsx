import RadioKey from "./RadioKey";

// The keypad: three columns, four rows, the numbers printed the way a transceiver
// prints them — the figure large, the letters under it where a thumb expects them.
//
// The bottom row is the machine's own keys: the scan at the left, the zero in the middle,
// and at the right the corner key that enters what is typed or opens what the cursor is
// standing on. That corner key is the one lit cap in the pad — copper, with its word
// printed on it — because entering is the move every other key is arranged around, and it
// has to be findable by a thumb that is not looking. Sharing lives on the cluster above
// (see RadioChin), beside the two lists.
const KEYS = [
  { digit: "1", sub: ".?" },
  { digit: "2", sub: "ABC" },
  { digit: "3", sub: "DEF" },
  { digit: "4", sub: "GHI" },
  { digit: "5", sub: "JKL" },
  { digit: "6", sub: "MNO" },
  { digit: "7", sub: "PQRS" },
  { digit: "8", sub: "TUV" },
  { digit: "9", sub: "WXYZ" },
  { action: "scan", label: "✳", sub: "SCAN" },
  { digit: "0", sub: "ENT" },
  { action: "enter" },
];

export default function RadioKeypad({ onDigit, onScan, onEnter }) {
  return (
    <div className="grid h-full grid-cols-3 grid-rows-4 gap-[3px]">
      {KEYS.map((key) => {
        if (key.action === "scan") {
          return (
            <RadioKey
              key="scan"
              label={key.label}
              sub={key.sub}
              onPress={onScan}
              ariaLabel="Scan — search the machine"
            />
          );
        }
        if (key.action === "enter") {
          return (
            <RadioKey
              key="enter"
              label="OK"
              sub="ENTER"
              skin="copper"
              onPress={onEnter}
              ariaLabel="OK — enter or open what is selected"
            />
          );
        }
        return (
          <RadioKey
            key={key.digit}
            label={key.digit}
            sub={key.sub}
            onPress={() => onDigit(key.digit)}
            ariaLabel={`Key ${key.digit}`}
          />
        );
      })}
    </div>
  );
}