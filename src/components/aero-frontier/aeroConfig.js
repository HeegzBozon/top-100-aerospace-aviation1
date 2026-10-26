// Aero-Frontier — Act I: The Inheritance.
//
// The field has its own palette and its own instruments on purpose. The game is
// the one room in the building where the institution's chrome is not the point,
// so it reads as warm working equipment instead of a masthead.
//
// Everything the world is built from that is *not* content — the palette, the
// tile size, the shape of a save, the hour economy — lives here. Content lives in
// aeroMap (the ground), aeroItems (salvage and the bench), aeroQuests (the work),
// aeroScripts (the people) and aeroArt (how all of it is drawn).

export const AERO = {
  night: "#0e1c26",
  denim: "#2b3d52",
  slate: "#3a4b5c",
  pine: "#3d5140",
  grass: "#6f7f4a",
  rust: "#a8551f",
  amber: "#e8b24a",
  cream: "#f2e8d5",
  grease: "#4a3b2c",
  line: "rgba(242,232,213,0.18)",
  muted: "rgba(242,232,213,0.60)",
  paper: "#f6efe1",
};

// One tile, and the window the field is seen through. The window is a whole
// number of tiles in both directions, so nothing lands on a half pixel.
export const TILE = 16;
export const VIEW_W = 16;
export const VIEW_H = 12;

// A day holds eight hours of light. Salvage, the bench and the airframe each
// spend them; walking spends nothing, so the field can be walked all day.
export const HOURS_PER_DAY = 8;

// The four acts. Act I is built; the rest are staged, and the surface says so
// plainly rather than pretending to be a world that is not there yet.
export const ACTS = [
  {
    act: "I",
    key: "inheritance",
    label: "The Inheritance",
    state: "live",
    blurb:
      "An airfield nobody wanted, a monoplane under a tarp, and a season of weekends spent getting both back into the air.",
    chapters: ["Arrival", "The airframe", "The first flight"],
  },
  {
    act: "II",
    key: "charter",
    label: "Regional Charter",
    state: "planned",
    blurb:
      "Certify the strip, take the short routes, and choose what kind of operator you become: pilot, engineer, dispatcher, or owner.",
    chapters: ["Certification and checkrides", "Scheduled runs and cargo", "The specialisation tracks"],
  },
  {
    act: "III",
    key: "orbit",
    label: "The Orbit",
    state: "planned",
    blurb:
      "Crews pool their hours to fly cooperative work above the weather, on shared launch and station contracts.",
    chapters: ["Crew formation", "Shared contracts", "The long haul"],
  },
  {
    act: "IV",
    key: "standing",
    label: "The Standing",
    state: "planned",
    blurb:
      "The hangar doors open: clubs, fly-ins and events, where the record kept in the game meets the record kept here.",
    chapters: ["Clubs and fly-ins", "Events and missions", "Platform identity"],
  },
];

// What a save holds. Every field mirrors the AeroFrontierSave entity; the log is
// the field's own diary, capped so a long season cannot grow it without end.
export const START_DOC = {
  act: 1,
  day: 1,
  hours: HOURS_PER_DAY,
  inventory: {},
  crafted: [],
  installed: [],
  quests: {},
  met: [],
  visited: [],
  seen: [],
  nodes: {},
  log: [],
  flights: 0,
  best_circuit: 0,
  at: { x: 5, y: 23 },
};

export const LOG_CAP = 40;

export const entry = (day, text) => ({ at: new Date().toISOString(), day, text });

export const capLog = (log) => (log || []).slice(0, LOG_CAP);

export const OPENING_LINE =
  "The solicitor's letter said an airfield. It did not say what condition it would be in.";

export const DAY_LINE = (day) =>
  day === 2
    ? "Day 2. The light comes back the same way it left, and the tools are where you left them."
    : `Day ${day}. Six hours of light, the creek up an inch, and the tarp exactly where it was.`;