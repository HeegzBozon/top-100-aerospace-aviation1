// The room the desk machine stands in — one scene per pack.
//
// A computer is not a page: it is an object on a desk, in a room, at some hour of the
// day. So each of the three packs opens a room of its own, and the machine's own colour
// is always in the light: the ambient bloom on the wall and the pool on the desk take
// --imac-plastic-1 / -2, which the finish has just written onto the document, so
// changing the moulding re-lights the room in the same movement. Curated whole, like
// the finishes — never mixed across packs.
//
//   Console — Studio: the device's own desk, dark and lamplit, with the field's stars
//             on the wall and the resin's cool light pooled behind the machine.
//   Retro   — Sunroom: a bright afternoon, sun across the wall, light oak underfoot,
//             and the coloured resin blooming warm on everything it can reach.
//   House   — Library: the institution's navy panelling, a rose gold lamp out of frame
//             to the right, walnut below, and a warm pool on the desk.
//
// Every scene defines every key, so a moulding is never half-lit. The detail each
// scene adds to the wall (stars, a sunbeam, a panel rule) lives in imac.css, keyed off
// the class below.

export const IMAC_SCENES = {
  handheld: {
    key: "handheld",
    label: "Studio",
    className: "imac-room--studio",
    vars: {
      "--scene-wall-1": "#16273E",
      "--scene-wall-2": "#0D1728",
      "--scene-wall-3": "#070C16",
      "--scene-wash-layer":
        "radial-gradient(120% 46% at 50% 0%, rgba(201, 168, 124, 0.10) 0%, rgba(201, 168, 124, 0) 62%)",
      "--scene-vignette": "rgba(3, 6, 13, 0.78)",
      "--scene-key": "118% 62% at 50% 4%",
      "--scene-key-color": "rgba(201, 168, 124, 0.10)",
      "--scene-key-stop": "66%",
      "--scene-key-a": "1",
      "--scene-desk-1": "#1B2A3E",
      "--scene-desk-2": "#101B2B",
      "--scene-desk-3": "#080D16",
      "--scene-desk-lip": "rgba(201, 168, 124, 0.22)",
      "--scene-tint": "var(--imac-plastic-1)",
      "--scene-glow-a": "0.20",
      "--scene-pool-a": "0.16",
      "--scene-mote": "rgba(255, 255, 255, 0.05)",
    },
  },

  retro: {
    key: "retro",
    label: "Sunroom",
    className: "imac-room--sunroom",
    vars: {
      "--scene-wall-1": "#F7E9D2",
      "--scene-wall-2": "#E7D2B2",
      "--scene-wall-3": "#C6A87F",
      "--scene-wash-layer":
        "radial-gradient(140% 62% at 12% -6%, rgba(255, 244, 214, 0.85) 0%, rgba(255, 244, 214, 0) 68%)",
      "--scene-vignette": "rgba(74, 44, 14, 0.30)",
      "--scene-key": "86% 70% at 14% 2%",
      "--scene-key-color": "rgba(255, 240, 202, 0.75)",
      "--scene-key-stop": "72%",
      "--scene-key-a": "1",
      "--scene-desk-1": "#D9BA8C",
      "--scene-desk-2": "#B9945F",
      "--scene-desk-3": "#8A6739",
      "--scene-desk-lip": "rgba(255, 252, 240, 0.55)",
      "--scene-tint": "var(--imac-plastic-2)",
      "--scene-glow-a": "0.34",
      "--scene-pool-a": "0.30",
      "--scene-mote": "rgba(96, 62, 22, 0.10)",
    },
  },

  brand: {
    key: "brand",
    label: "Library",
    className: "imac-room--library",
    vars: {
      "--scene-wall-1": "#14263C",
      "--scene-wall-2": "#0B1526",
      "--scene-wall-3": "#05090F",
      "--scene-wash-layer":
        "radial-gradient(64% 52% at 86% 22%, rgba(224, 169, 107, 0.16) 0%, rgba(224, 169, 107, 0) 70%)",
      "--scene-vignette": "rgba(2, 5, 10, 0.82)",
      "--scene-key": "34% 42% at 86% 24%",
      "--scene-key-color": "rgba(224, 169, 107, 0.22)",
      "--scene-key-stop": "70%",
      "--scene-key-a": "1",
      "--scene-desk-1": "#3A2A21",
      "--scene-desk-2": "#271B15",
      "--scene-desk-3": "#150E0A",
      "--scene-desk-lip": "rgba(201, 168, 124, 0.30)",
      "--scene-tint": "var(--imac-plastic-2)",
      "--scene-glow-a": "0.24",
      "--scene-pool-a": "0.22",
      "--scene-mote": "rgba(255, 244, 224, 0.05)",
    },
  },
};

export const DEFAULT_SCENE_KEY = "handheld";

// A scene is resolved from the pack the machine is moulded in — the pack object or
// its key. Anything unrecognised hands the room back to the studio, so the window is
// never left unpainted.
export function sceneFor(pack) {
  const key = typeof pack === "string" ? pack : pack?.key;
  return IMAC_SCENES[key] || IMAC_SCENES[DEFAULT_SCENE_KEY];
}