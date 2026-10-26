// How the app opens. Two small decisions live here, because both the opening
// title card and the console's own power-on need them, and exactly one of the
// two should play in a given page load.

const OPENING_KEY = "top100-opening-seen";
const VISIT_KEY = "top100-visited";

let claimed = false;
let plays = false;

// Whoever asks first in a page load decides, and the title card is rendered at
// the root, so it is always first. True = the opening plays, and the console's
// power-on stands down behind it.
export function openingPlaysNow() {
  if (claimed) return plays;
  claimed = true;
  try {
    plays = sessionStorage.getItem(OPENING_KEY) !== "1";
    if (plays) sessionStorage.setItem(OPENING_KEY, "1");
  } catch {
    plays = true;
  }
  return plays;
}

// Someone who has stood here before, on this device.
export function isReturningVisitor() {
  try {
    return localStorage.getItem(VISIT_KEY) === "1";
  } catch {
    return false;
  }
}

export function markVisit() {
  try {
    localStorage.setItem(VISIT_KEY, "1");
  } catch {
    // Storage unavailable: every visit simply greets as a first one.
  }
}

// The hour decides the sky and the words — four watches, the way a control room
// would keep them.
const PHASES = [
  {
    key: "first-light",
    from: 5,
    to: 11,
    kicker: "First light",
    sky: "linear-gradient(176deg, #0A1522 0%, #16304B 38%, #6B4B45 74%, #C9A87C 100%)",
    glow: "radial-gradient(90% 70% at 16% 98%, rgba(201,168,124,0.40) 0%, transparent 62%)",
    stars: false,
    welcome: "Start at the top of the industry. Nominations, profiles and the whole record are open to you.",
    welcomeBack: "The day's surface is ready. Everything you left open is exactly where you left it.",
  },
  {
    key: "mid-watch",
    from: 11,
    to: 17,
    kicker: "Mid-watch",
    sky: "linear-gradient(176deg, #0B1A2C 0%, #1E3A5A 46%, #2E5478 100%)",
    glow: "radial-gradient(80% 60% at 50% 106%, rgba(184,115,51,0.32) 0%, transparent 66%)",
    stars: false,
    welcome: "The whole measured record is open to you — profiles, editions and the field.",
    welcomeBack: "You are where you left off. The record kept its place for you.",
  },
  {
    key: "evening-edition",
    from: 17,
    to: 21,
    kicker: "Evening edition",
    sky: "linear-gradient(176deg, #0A1220 0%, #22304A 40%, #7A4A38 76%, #B87333 100%)",
    glow: "radial-gradient(85% 65% at 80% 102%, rgba(184,115,51,0.42) 0%, transparent 64%)",
    stars: true,
    welcome: "Come inside. The lights are on across the industry and the edition is open.",
    welcomeBack: "Good to have you back at the console. The evening edition is open.",
  },
  {
    key: "night-watch",
    from: 21,
    to: 5,
    kicker: "Night watch",
    sky: "linear-gradient(176deg, #050B14 0%, #0B1A2C 52%, #16304B 100%)",
    glow: "radial-gradient(70% 55% at 50% 102%, rgba(201,168,124,0.20) 0%, transparent 68%)",
    stars: true,
    welcome: "The record keeps the watch. Come inside and take the tour.",
    welcomeBack: "The record kept the watch until you came back.",
  },
];

export function hourPhase(date = new Date()) {
  const hour = date.getHours();
  return (
    PHASES.find((phase) =>
      phase.from < phase.to
        ? hour >= phase.from && hour < phase.to
        : hour >= phase.from || hour < phase.to,
    ) || PHASES[0]
  );
}