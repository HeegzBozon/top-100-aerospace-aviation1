// Salvage, and what the bench makes of it.
//
// Nine things can be pulled out of this field, and five things can be built from
// them. Every part of the airframe is a recipe, so the aeroplane comes back the
// way it came apart: one panel, one spar, one loom at a time.

export const ITEMS = {
  alu: { label: "Aluminium sheet", tint: "#b9c3cc", shade: "#6f7a85", blurb: "Bent, oxidised, still sound." },
  rivet: { label: "Rivets", tint: "#d8cb9f", shade: "#8a7b56", blurb: "Out of old panels, straight enough to re-set." },
  tube: { label: "Steel tube", tint: "#98a3ad", shade: "#5b666f", blurb: "Ditch steel, cut to length." },
  wire: { label: "Wire", tint: "#d8a24a", shade: "#8a5a12", blurb: "Reel ends, ends already stripped." },
  tape: { label: "Tape and dope", tint: "#e0d3b4", shade: "#8f7f5c", blurb: "Sticky, yellowing, still doing its job." },
  brass: { label: "Brass fittings", tint: "#c9a87c", shade: "#8a6a3c", blurb: "Elbows and unions off a dead engine." },
  gasket: { label: "Gaskets", tint: "#8a7a66", shade: "#4f4438", blurb: "Cork, cut by hand, never quite even." },
  rubber: { label: "Rubber", tint: "#4c5158", shade: "#282c31", blurb: "Tyre stock. Cracks like a creek bed." },
  bolt: { label: "Bolts", tint: "#a8b0b8", shade: "#5f6870", blurb: "A tin of them, all one thread, luckily." },
};

export const ITEM_KEYS = Object.keys(ITEMS);

export const itemByKey = (key) => ITEMS[key];
export const itemLabel = (key) => ITEMS[key]?.label || key;

// A recipe is an hour at the bench and whatever the tin is short of.
export const RECIPES = [
  {
    key: "panel",
    label: "Wing panel",
    needs: { alu: 4, rivet: 6 },
    hours: 1,
    blurb: "Lace the ribs, lay the sheet, set the rivets in pairs, then dope it tight.",
    fitted: "Wing panel on. The wing has a face again.",
  },
  {
    key: "spar",
    label: "Wing spar",
    needs: { tube: 2, alu: 2 },
    hours: 1,
    blurb: "Tube, sleeve and shear web. It has to be straight, and you check it twice.",
    fitted: "Spar slid into the wing root and bolted. The wing stops being a pile.",
  },
  {
    key: "loom",
    label: "Wiring loom",
    needs: { wire: 3, tape: 2, bolt: 2 },
    hours: 1,
    blurb: "Every run labelled at both ends, because Wren labelled every run at both ends.",
    fitted: "Loom run through the fuselage. The machine has a nervous system.",
  },
  {
    key: "carb",
    label: "Carburettor",
    needs: { brass: 2, gasket: 1, bolt: 2 },
    hours: 1,
    blurb: "Bowl off, jets cleared, every gasket fresh, then a bench test on the can.",
    fitted: "Carburettor rebuilt and fitted. The radial may yet have opinions.",
  },
  {
    key: "tyres",
    label: "Set of tyres",
    needs: { rubber: 3, gasket: 1 },
    hours: 1,
    blurb: "Boots off, tubes checked, bearings packed while everything is apart.",
    fitted: "Tyres on. The machine sits level for the first time in nine years.",
  },
];

export const recipeByKey = (key) => RECIPES.find((recipe) => recipe.key === key);

// How many of each are wanted before anybody would call the airframe done. The
// tarp comes off in proportion: this is what the field is measured against.
export const FITS = { panel: 2, spar: 2, loom: 1, carb: 1, tyres: 1 };

export const TOTAL_FITS = Object.values(FITS).reduce((sum, n) => sum + n, 0);

export const fittedCount = (installed = []) => installed.length;

export const fitTarget = (key) => FITS[key] || 0;

export const fittedFor = (installed = [], key) => installed.filter((part) => part === key).length;

export const needsList = (recipe, inventory = {}) =>
  Object.entries(recipe.needs).map(([key, need]) => ({
    key,
    need,
    have: inventory[key] || 0,
    met: (inventory[key] || 0) >= need,
  }));

export const canBuild = (recipe, inventory = {}) =>
  Object.entries(recipe.needs).every(([key, need]) => (inventory[key] || 0) >= need);

export const spendMap = (recipe) =>
  Object.fromEntries(Object.entries(recipe.needs).map(([key, need]) => [key, -need]));