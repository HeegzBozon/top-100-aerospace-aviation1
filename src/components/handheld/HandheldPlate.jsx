import CustomizeKey from "./CustomizeKey";

// The maker's plate: the band cut into the foot of the case, inside the moulding rather
// than across its edge.
//
// Three columns, and the middle one is the one that must not move: the key that changes
// what the device is wearing stands at the left, where a thumb reaches it without looking;
// the face the machine is wearing (wheel or keypad) is pinned dead centre, because it is
// the switch the whole console is read through; and who is holding it sits at the right,
// with a lamp beside the word. Equal outer columns keep the centre key on the centre line
// whatever either side measures.
export default function HandheldPlate({ finish, isSignedIn, onCustomize, modeKey = null }) {
  return (
    <div className="hh-footer relative mt-2 grid h-[24px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-2.5">
      <div className="flex min-w-0 justify-start">
        <CustomizeKey finish={finish} onPress={onCustomize} />
      </div>

      <div className="flex justify-center">{modeKey}</div>

      <span
        className="hh-engrave flex min-w-0 items-center justify-end gap-1.5 text-[6.5px] font-bold uppercase tracking-[0.24em]"
        style={{ color: "var(--hh-ink-soft)" }}
      >
        <span className="hh-footer-led" data-on={isSignedIn} aria-hidden="true" />
        {isSignedIn ? "Fellow" : "Visitor"}
      </span>
    </div>
  );
}