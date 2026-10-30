import { Share } from "lucide-react";
import RadioKey from "./RadioKey";

// The keypad: three columns, four rows, the numbers printed the way a transceiver
// prints them — the figure large, the letters under it where a thumb expects them.
//
// The bottom row is the machine's own keys: the scan at the left, the zero in the middle,
// and at the right the corner key that shares what is on the glass. That corner key is the
// one lit cap in the pad — copper, with its word printed on it — because sharing is the one
// thing this machine offers that is not navigation, and it must be findable by a thumb that
// is not looking. Entering what was typed lives on the cluster's OK key above (see
// RadioChin), so nothing the pad used to do has been given up to make room for it.
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
  { action: "share" },
];

export default function RadioKeypad({ onDigit, onScan, onShare, shareOpen = false }) {
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
        if (key.action === "share") {
          return (
            <RadioKey
              key="share"
              glyph={Share}
              sub="SHARE"
              skin="copper"
              pressed={shareOpen}
              onPress={onShare}
              ariaLabel={shareOpen ? "Close the share drawer" : "Share this page"}
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