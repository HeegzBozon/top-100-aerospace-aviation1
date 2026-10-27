import ImacKeyboard from "./ImacKeyboard";
import ImacMouse from "./ImacMouse";

// The desk in front of the machine. Both peripherals are cast from the shell's own
// resin, so they are recast by any finish — including the handheld's, when the machine
// is following the console. They are held out of the reader's way: decoration for a
// screen reader, and no pointer at all.
export default function ImacPeripherals() {
  return (
    <div className="imac-peripherals" aria-hidden="true">
      <ImacKeyboard />
      <ImacMouse />
    </div>
  );
}