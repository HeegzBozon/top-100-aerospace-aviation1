// The colours the desk machine is moulded in. Curated, never free-form: each one
// is a complete set of tones for the translucent shell and the ink printed on it,
// so the machine always reads as one moulded artifact. Nothing here is a colour
// picker — a colour is chosen whole, or not at all.
//
// These are the retro translucent plastics: bright resin over a visible internal
// chassis, with the legend printed straight onto it.

export const IMAC_FINISH_KEY = "top100-imac-finish";

export const DEFAULT_IMAC_FINISH = "teal";

export const IMAC_FINISHES = [
  {
    key: "teal",
    label: "Teal Polymer",
    note: "The original. Translucent teal resin",
    swatch: ["#45BBD4", "#0C5A78"],
    vars: {
      "--imac-plastic-1": "#45BBD4",
      "--imac-plastic-2": "#1E86A6",
      "--imac-plastic-3": "#0C5A78",
      "--imac-plastic-edge": "rgba(255,255,255,0.38)",
      "--imac-ink": "#05242F",
      "--imac-ink-rgb": "5 36 47",
      "--imac-ink-soft": "rgba(5,36,47,0.55)",
    },
  },
  {
    key: "blueberry",
    label: "Blueberry Polymer",
    note: "Deep berry resin, same mould",
    swatch: ["#6B79D2", "#2A3384"],
    vars: {
      "--imac-plastic-1": "#6B79D2",
      "--imac-plastic-2": "#4351B0",
      "--imac-plastic-3": "#2A3384",
      "--imac-plastic-edge": "rgba(255,255,255,0.34)",
      "--imac-ink": "#0A0F3A",
      "--imac-ink-rgb": "10 15 58",
      "--imac-ink-soft": "rgba(10,15,58,0.55)",
    },
  },
  {
    key: "tangerine",
    label: "Tangerine Polymer",
    note: "Hot orange resin, same mould",
    swatch: ["#F59A3C", "#B4520D"],
    vars: {
      "--imac-plastic-1": "#F59A3C",
      "--imac-plastic-2": "#E0741B",
      "--imac-plastic-3": "#B4520D",
      "--imac-plastic-edge": "rgba(255,255,255,0.42)",
      "--imac-ink": "#4A2406",
      "--imac-ink-rgb": "74 36 6",
      "--imac-ink-soft": "rgba(74,36,6,0.58)",
    },
  },
  {
    key: "grape",
    label: "Grape Polymer",
    note: "Violet resin, same mould",
    swatch: ["#9C7CD6", "#4E3483"],
    vars: {
      "--imac-plastic-1": "#9C7CD6",
      "--imac-plastic-2": "#7452B0",
      "--imac-plastic-3": "#4E3483",
      "--imac-plastic-edge": "rgba(255,255,255,0.36)",
      "--imac-ink": "#F3EEFF",
      "--imac-ink-rgb": "243 238 255",
      "--imac-ink-soft": "rgba(243,238,255,0.58)",
    },
  },
  {
    key: "lime",
    label: "Lime Polymer",
    note: "Key-lime resin, same mould",
    swatch: ["#BCDA54", "#6E8C14"],
    vars: {
      "--imac-plastic-1": "#BCDA54",
      "--imac-plastic-2": "#93B826",
      "--imac-plastic-3": "#6E8C14",
      "--imac-plastic-edge": "rgba(255,255,255,0.45)",
      "--imac-ink": "#243007",
      "--imac-ink-rgb": "36 48 7",
      "--imac-ink-soft": "rgba(36,48,7,0.58)",
    },
  },
  {
    key: "strawberry",
    label: "Strawberry Polymer",
    note: "Rose-red resin, same mould",
    swatch: ["#F08FA3", "#AC3A55"],
    vars: {
      "--imac-plastic-1": "#F08FA3",
      "--imac-plastic-2": "#D85C77",
      "--imac-plastic-3": "#AC3A55",
      "--imac-plastic-edge": "rgba(255,255,255,0.42)",
      "--imac-ink": "#4A0F22",
      "--imac-ink-rgb": "74 15 34",
      "--imac-ink-soft": "rgba(74,15,34,0.55)",
    },
  },
];

export const isImacFinish = (key) => IMAC_FINISHES.some((finish) => finish.key === key);

export const imacFinishByKey = (key) =>
  IMAC_FINISHES.find((finish) => finish.key === key) ||
  IMAC_FINISHES.find((finish) => finish.key === DEFAULT_IMAC_FINISH);