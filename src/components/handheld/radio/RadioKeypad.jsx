import RadioKey from "./RadioKey";

// The keypad: three columns, four rows, the numbers printed the way a transceiver
// prints them — the figure large, the letters under it where a thumb expects them.
// The bottom row is the machine's own three keys: the scan, the zero, and the key that
// enters what was typed or opens the drawer when nothing was.
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
  { action: "enter", label: "#", sub: "MENU" },
];

export default function RadioKeypad({ onDigit, onEnter, onScan, enterHint = "MENU" }) {
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
              label={key.label}
              sub={enterHint}
              onPress={onEnter}
              ariaLabel={enterHint === "TUNE" ? "Enter — tune to the number typed" : "Enter — open the menu"}
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