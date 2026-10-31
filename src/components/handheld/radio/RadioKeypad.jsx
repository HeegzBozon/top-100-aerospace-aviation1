import RadioKey from "./RadioKey";
import { useDigitLegends } from "@/components/handheld/handheldKeys";

// The keypad: three columns, four rows, the numbers printed the way a transceiver
// prints them — the figure large, the letters under it where a thumb expects them.
//
// The bottom row is the machine's own keys: the scan at the left, the zero in the middle,
// and at the right the corner key every telephone has always had there — #, which enters
// what is typed or opens what the cursor is standing on. It is the one lit cap in the pad,
// copper, printed with the hash a thumb finds without looking and the word ENTER under it,
// because entering is the move every other key is arranged around. A surface that claims
// it reprints the word — LIFT, SET, ADD — and the hash never moves. Sharing lives on the
// cluster above (see RadioChin), beside the two lists.
//
// The pad is an instrument, not a fixed keypad: a surface that claims the digits hands over
// a legend, and every key reprints itself to say what it does in that surface's own grammar
// — `GO 3` while the cursor is walking a ballot, `TO 3` while a name is being carried.
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
  { digit: "0", sub: "+" },
  { action: "enter" },
];

export default function RadioKeypad({ onDigit, onScan, onEnter }) {
  const legend = useDigitLegends();

  return (
    <div className="grid h-full grid-cols-3 grid-rows-4 gap-[3px]">
      {KEYS.map((key) => {
        if (key.action === "scan") {
          return (
            <RadioKey
              key="scan"
              label={key.label}
              sub={legend?.scan?.sub || key.sub}
              onPress={onScan}
              ariaLabel={legend?.scan?.aria || "Scan — search the machine, or read a code"}
            />
          );
        }
        if (key.action === "enter") {
          return (
            <RadioKey
              key="enter"
              label="#"
              sub={legend?.enter?.sub || "ENTER"}
              skin="copper"
              onPress={onEnter}
              ariaLabel={legend?.enter?.aria || "# — enter, or open what is selected"}
            />
          );
        }
        const printed = legend?.digits?.[key.digit];
        return (
          <RadioKey
            key={key.digit}
            label={key.digit}
            sub={printed?.sub || key.sub}
            onPress={() => onDigit(key.digit)}
            ariaLabel={printed?.aria || `Key ${key.digit}`}
          />
        );
      })}
    </div>
  );
}