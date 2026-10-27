// The mouse that came with the machine: a puck of the same resin over its white
// structure, one round click surface on top, and a lead running back to the machine.
// A prop, like the keyboard beside it.
export default function ImacMouse() {
  return (
    <div className="imac-mouse">
      <span className="imac-cable" aria-hidden="true" />
      <span className="imac-mouse-click" aria-hidden="true" />
    </div>
  );
}