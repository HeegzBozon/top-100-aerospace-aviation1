import { sceneFor } from "./imacScenes";

// The room behind the desk machine: the wall, the key light falling across it, the
// ambient bloom of the machine's own resin, a slow drift of dust in the light, the
// desk it stands on, and the light it pools in front of itself. The scene follows the
// pack the moulding is in and is re-lit with the machine's colour — see imacScenes.js.
//
// Painted before the machine and fixed to the window, so the moulding sits in the
// room rather than on the page. Entirely decorative: hidden from assistive tech.
export default function ImacRoom({ pack }) {
  const scene = sceneFor(pack);

  return (
    <div className={`imac-room ${scene.className}`} style={scene.vars} aria-hidden="true">
      <div className="imac-room-wall" />
      <div className="imac-room-key" />
      <div className="imac-room-glow" />
      <div className="imac-room-motes" />
      <div className="imac-room-desk" />
      <div className="imac-room-pool" />
    </div>
  );
}