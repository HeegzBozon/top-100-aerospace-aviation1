// The colours the desk machine is moulded in, gathered into packs. Curated, never
// free-form: a colour is a complete set of tones for the translucent shell and the
// ink printed on it, so the machine always reads as one moulded artifact — chosen
// whole, or not at all.
//
// Three packs, one mould:
//   Console — the machine is moulded to match the finish on the Fellow's handheld,
//             live. Change the device in the console's options and the desk follows.
//   Retro   — the original translucent plastics: bright resin over a visible chassis.
//   House   — the institution's own navy, rose gold, copper and cream.

import { finishByKey as handheldFinishByKey } from "../handheld/handheldFinishes";

export const IMAC_FINISH_KEY = "top100-imac-machine-colour";

// Following the console is the house default: the machine matches the device unless
// a Fellow asks it for a colour of its own.
export const FOLLOW_KEY = "handheld";

export const DEFAULT_IMAC_FINISH = FOLLOW_KEY;

// The working parts — brushed steel, the lamp, the rule printed across the lockup —
// are shared by every moulding and written out with every colour, so choosing a new
// one never leaves a tone behind from the one before it.
const SHARED_VARS = {
  "--imac-steel-1": "#E6EBF0",
  "--imac-steel-2": "#98A2AD",
  "--imac-steel-3": "#5E6773",
  "--imac-led": "#7BE08A",
  "--imac-rule": "rgba(201,168,124,0.9)",
};

const RETRO_FINISHES = [
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

const BRAND_FINISHES = [
  {
    key: "navy",
    label: "Institutional Navy",
    note: "The house moulding, navy under a rose gold rule",
    swatch: ["#2E4F78", "#12283C"],
    vars: {
      "--imac-plastic-1": "#2E4F78",
      "--imac-plastic-2": "#1E3A5A",
      "--imac-plastic-3": "#12283C",
      "--imac-plastic-edge": "rgba(255,255,255,0.30)",
      "--imac-ink": "#EFE9DC",
      "--imac-ink-rgb": "239 233 220",
      "--imac-ink-soft": "rgba(239,233,220,0.50)",
    },
  },
  {
    key: "rose_gold",
    label: "Rose Gold",
    note: "Masthead metal, printed in navy",
    swatch: ["#E4C9A2", "#9C7A4E"],
    vars: {
      "--imac-plastic-1": "#E4C9A2",
      "--imac-plastic-2": "#C9A87C",
      "--imac-plastic-3": "#9C7A4E",
      "--imac-plastic-edge": "rgba(255,255,255,0.42)",
      "--imac-ink": "#1E3A5A",
      "--imac-ink-rgb": "30 58 90",
      "--imac-ink-soft": "rgba(30,58,90,0.55)",
      "--imac-steel-1": "#E0A96B",
      "--imac-steel-2": "#B87333",
      "--imac-steel-3": "#7E4A1C",
      "--imac-rule": "rgba(184,115,51,0.85)",
    },
  },
  {
    key: "copper",
    label: "Aged Copper",
    note: "Structural metal, printed in navy",
    swatch: ["#D08A4A", "#8A5220"],
    vars: {
      "--imac-plastic-1": "#D08A4A",
      "--imac-plastic-2": "#B87333",
      "--imac-plastic-3": "#8A5220",
      "--imac-plastic-edge": "rgba(255,255,255,0.36)",
      "--imac-ink": "#16293E",
      "--imac-ink-rgb": "22 41 62",
      "--imac-ink-soft": "rgba(22,41,62,0.55)",
      "--imac-steel-1": "#E0A96B",
      "--imac-steel-2": "#B87333",
      "--imac-steel-3": "#6F3D14",
      "--imac-rule": "rgba(22,41,62,0.55)",
    },
  },
  {
    key: "cream",
    label: "Cream & Chrome",
    note: "The house surface, chrome trim",
    swatch: ["#FAF8F5", "#CFC6B6"],
    vars: {
      "--imac-plastic-1": "#FAF8F5",
      "--imac-plastic-2": "#E7E0D4",
      "--imac-plastic-3": "#CFC6B6",
      "--imac-plastic-edge": "rgba(255,255,255,0.55)",
      "--imac-ink": "#1E3A5A",
      "--imac-ink-rgb": "30 58 90",
      "--imac-ink-soft": "rgba(30,58,90,0.52)",
    },
  },
];

export const IMAC_FINISHES = [...RETRO_FINISHES, ...BRAND_FINISHES];

// What the device's finish becomes on a desk: the case is the moulding, the print on
// the case is the print on the machine, and the device's metal becomes the machine's
// working parts — copper screws on the navy device, chrome on the ivory one.
const DEVICE_TO_MACHINE = {
  "--imac-plastic-1": "--hh-shell-1",
  "--imac-plastic-2": "--hh-shell-2",
  "--imac-plastic-3": "--hh-shell-3",
  "--imac-plastic-edge": "--hh-shell-spec",
  "--imac-ink": "--hh-ink",
  "--imac-ink-rgb": "--hh-ink-rgb",
  "--imac-ink-soft": "--hh-ink-soft",
  "--imac-steel-1": "--hh-metal-1",
  "--imac-steel-2": "--hh-metal",
  "--imac-steel-3": "--hh-metal-2",
  "--imac-led": "--hh-led",
};

export function followedFinish(handheldKey) {
  const device = handheldFinishByKey(handheldKey);
  const vars = { ...SHARED_VARS };
  Object.entries(DEVICE_TO_MACHINE).forEach(([token, source]) => {
    if (device.vars[source]) vars[token] = device.vars[source];
  });
  if (device.vars["--hh-metal"]) vars["--imac-rule"] = device.vars["--hh-metal"];

  return {
    key: FOLLOW_KEY,
    label: "Match the console",
    note: `Moulded to match ${device.label}`,
    swatch: [device.swatch[0], device.swatch[2]],
    device,
    vars,
  };
}

// A colour is always resolved whole, so the machine is never half-recast: a missing
// key simply hands the machine back to the console.
export function resolveImacFinish(key, handheldKey) {
  if (key === FOLLOW_KEY) return followedFinish(handheldKey);
  const finish = IMAC_FINISHES.find((candidate) => candidate.key === key);
  if (!finish) return followedFinish(handheldKey);
  return { ...finish, vars: { ...SHARED_VARS, ...finish.vars } };
}

const rackOption = ({ key, label, note, swatch }) => ({ key, label, note, swatch });

export const IMAC_PACKS = [
  { key: "handheld", label: "Console", note: "Moulded to match the handheld", options: [] },
  {
    key: "retro",
    label: "Retro",
    note: "The original translucent plastics",
    options: RETRO_FINISHES.map(rackOption),
  },
  {
    key: "brand",
    label: "House",
    note: "The institution's navy, rose gold, copper and cream",
    options: BRAND_FINISHES.map(rackOption),
  },
];

export const imacPackByKey = (key) => IMAC_PACKS.find((pack) => pack.key === key);

// The pack a chosen colour belongs to. Following the console is a pack of its own.
export const imacPackFor = (finishKey) =>
  IMAC_PACKS.find((pack) => pack.options.some((option) => option.key === finishKey)) ||
  imacPackByKey(FOLLOW_KEY);

// The colours on offer in a pack. The Console pack holds a single swatch, because
// its colour is not a choice made here — it is whatever the device is wearing, so
// picking it hands the machine back to the device.
export function imacOptionsFor(packKey, handheldKey) {
  const pack = imacPackByKey(packKey) || imacPackFor(packKey);
  if (pack.key !== FOLLOW_KEY) return pack.options;
  const followed = followedFinish(handheldKey);
  return [
    { key: FOLLOW_KEY, label: followed.label, note: followed.note, swatch: followed.swatch },
  ];
}

export const isImacFinish = (key) =>
  key === FOLLOW_KEY || IMAC_FINISHES.some((finish) => finish.key === key);

export const imacFinishByKey = (key) =>
  IMAC_FINISHES.find((finish) => finish.key === key) ||
  IMAC_FINISHES.find((finish) => finish.key === "teal");