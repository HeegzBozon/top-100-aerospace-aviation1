// How the app opens. The title card plays on every page load — a game's opening
// rather than a one-off greeting — and the console's power-on stands down behind
// it, so exactly one opening ever plays in a load.
//
// Two of the card's lines are drawn from pools on every load: the quote, which
// never repeats the last few it showed, and the hint at the foot. The card is
// iconic by repetition and never a rerun of the last one.

const VISIT_KEY = "top100-visited";
const LINES_KEY = "top100-opening-lines";
const HINT_KEY = "top100-opening-hint";

// The title card always plays. The console asks this before powering on, and
// receives the same answer the card does.
export function openingPlaysNow() {
  return true;
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

const readList = (key) => {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const remember = (key, value, cap) => {
  try {
    const next = [value, ...readList(key).filter((item) => item !== value)].slice(0, cap);
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // Storage unavailable: the pools simply repeat sooner.
  }
};

// The hour decides the sky, and the sky carries lines worth reading — the words
// of the people this platform measures, three watches through the day.
const PHASES = [
  {
    key: "first-light",
    from: 5,
    to: 11,
    kicker: "First light",
    sky: "linear-gradient(176deg, #0A1522 0%, #16304B 38%, #6B4B45 74%, #C9A87C 100%)",
    glow: "radial-gradient(90% 70% at 16% 98%, rgba(201,168,124,0.40) 0%, transparent 62%)",
    stars: false,
    lines: [
      {
        key: "first-light-rickenbacker",
        text: "Aviation is proof that given the will, we have the capacity to do the impossible.",
        name: "Eddie Rickenbacker",
        source: "Aviator",
      },
      {
        key: "first-light-earhart",
        text: "Adventure is worthwhile in itself.",
        name: "Amelia Earhart",
        source: "Aviator",
      },
      {
        key: "first-light-coleman",
        text: "I refused to take no for an answer.",
        name: "Bessie Coleman",
        source: "First Black woman with a pilot licence",
      },
    ],
  },
  {
    key: "mid-watch",
    from: 11,
    to: 17,
    kicker: "Mid-watch",
    sky: "linear-gradient(176deg, #0B1A2C 0%, #1E3A5A 46%, #2E5478 100%)",
    glow: "radial-gradient(80% 60% at 50% 106%, rgba(184,115,51,0.32) 0%, transparent 66%)",
    stars: false,
    lines: [
      {
        key: "mid-watch-kennedy",
        text: "We choose to go to the Moon in this decade and do the other things, not because they are easy, but because they are hard.",
        name: "John F. Kennedy",
        source: "Rice University, 1962",
      },
      {
        key: "mid-watch-hadfield",
        text: "There is no problem so bad that you cannot make it worse.",
        name: "Chris Hadfield",
        source: "Commander, ISS",
      },
      {
        key: "mid-watch-vonbraun",
        text: "Research is what I am doing when I do not know what I am doing.",
        name: "Wernher von Braun",
        source: "Rocket engineer",
      },
    ],
  },
  {
    key: "evening-edition",
    from: 17,
    to: 21,
    kicker: "Evening edition",
    sky: "linear-gradient(176deg, #0A1220 0%, #22304A 40%, #7A4A38 76%, #B87333 100%)",
    glow: "radial-gradient(85% 65% at 80% 102%, rgba(184,115,51,0.42) 0%, transparent 64%)",
    stars: true,
    lines: [
      {
        key: "evening-edition-sagan",
        text: "Somewhere, something incredible is waiting to be known.",
        name: "Carl Sagan",
        source: "Astronomer",
      },
      {
        key: "evening-edition-jemison",
        text: "Never be limited by other people's limited imaginations.",
        name: "Mae Jemison",
        source: "Astronaut and physician",
      },
      {
        key: "evening-edition-armstrong",
        text: "Mystery creates wonder, and wonder is the basis of our desire to understand.",
        name: "Neil Armstrong",
        source: "Apollo 11",
      },
    ],
  },
  {
    key: "night-watch",
    from: 21,
    to: 5,
    kicker: "Night watch",
    sky: "linear-gradient(176deg, #050B14 0%, #0B1A2C 52%, #16304B 100%)",
    glow: "radial-gradient(70% 55% at 50% 102%, rgba(201,168,124,0.20) 0%, transparent 68%)",
    stars: true,
    lines: [
      {
        key: "night-watch-tsiolkovsky",
        text: "The Earth is the cradle of humanity, but mankind cannot stay in the cradle forever.",
        name: "Konstantin Tsiolkovsky",
        source: "1911",
      },
      {
        key: "night-watch-kranz",
        text: "Failure is not an option.",
        name: "Gene Kranz",
        source: "Flight Director, NASA",
      },
      {
        key: "night-watch-ride",
        text: "The stars do not look bigger, but they do look brighter.",
        name: "Sally Ride",
        source: "First American woman in space",
      },
    ],
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

// The watch's line for this load. The last few shown are held back, so the card
// never opens on the line it opened on last time.
export function pickLine(phase) {
  const lines = phase?.lines || [];
  if (!lines.length) return null;

  const recent = readList(LINES_KEY);
  const fresh = lines.filter((line) => !recent.includes(line.key));
  const pool = fresh.length ? fresh : lines;
  const line = pool[Math.floor(Math.random() * pool.length)];

  remember(LINES_KEY, line.key, Math.max(lines.length - 1, 1));
  return line;
}

const HINTS = ["Tap to enter", "Press to continue", "Tap to begin", "Any tap enters"];

// The foot of the card, varied the same way: arcade habit, institutional voice.
export function pickHint() {
  const last = readList(HINT_KEY)[0];
  const fresh = HINTS.filter((hint) => hint !== last);
  const hint = fresh[Math.floor(Math.random() * fresh.length)] || HINTS[0];
  remember(HINT_KEY, hint, 1);
  return hint;
}