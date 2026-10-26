// Aero-Frontier — Act I: The Inheritance.
//
// The field is the whole economy of the prototype: hours are what a day holds,
// parts are what the ground gives up, and the airframe only moves when both have
// been spent on it. Everything the panels draw from is here, so the work can be
// retuned without touching a surface.
//
// The field has its own palette and its own instruments on purpose. The game is
// the one room in the building where the institution's chrome is not the point,
// so it reads as warm working equipment instead of a masthead.

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

// The painted field, in three plates.
export const AERO_SCENES = {
  field: "https://media.base44.com/images/public/68996845be6727838fdb822e/cb0b0f7aa_generated_image.png",
  airframe: "https://media.base44.com/images/public/68996845be6727838fdb822e/2f7fe9134_generated_image.png",
  sky: "https://media.base44.com/images/public/68996845be6727838fdb822e/20c6e11e1_generated_image.png",
};

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
    chapters: ["Walk the ground", "Bring the airframe back", "The first flight"],
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

// The ground. Every task is a morning of work: it costs hours and pays in salvage.
export const FIELD_TASKS = [
  {
    key: "strip",
    label: "Walk the strip",
    note: "A hundred yards of grass over cracked old asphalt. Mark what the winters moved.",
    hours: 1,
    parts: 3,
    done: "Walked the strip end to end. Two soft spots, north and centre; the rest will hold.",
  },
  {
    key: "hangar",
    label: "Open the hangar",
    note: "The door has not run in nine years. Free the track, then put your shoulder into it.",
    hours: 2,
    parts: 4,
    done: "The door ran, complaining, and the light went in ahead of you.",
  },
  {
    key: "tanks",
    label: "Drain the tanks",
    note: "Nine-year-old avgas smells like varnish. Better out of the airframe than in the air.",
    hours: 2,
    parts: 2,
    after: ["hangar"],
    done: "Tanks drained and flushed. The old fuel went to the brush pile, well downwind.",
  },
  {
    key: "apron",
    label: "Sweep the apron",
    note: "Clear the stones the plough threw up before they find a propeller.",
    hours: 1,
    parts: 2,
    done: "Apron swept. A tin of screws, a spanner, and a windscreen wiper with no aeroplane to belong to.",
  },
  {
    key: "windsock",
    label: "Raise the windsock",
    note: "Faded, but it still turns. The field reads the wind before you do.",
    hours: 1,
    parts: 2,
    after: ["hangar"],
    done: "Windsock up on a new pole. It hangs, then lifts, and the field stops feeling empty.",
  },
];

// The airframe. Parts are paid once to open a system; hours are spent a step at a
// time, so the restoration reads as work rather than as a purchase.
export const SYSTEMS = [
  {
    key: "fabric",
    label: "Fabric and ribs",
    note: "The wings kept their shape and lost their covering.",
    parts: 3,
    steps: ["Strip the old fabric", "Rib-stitch and dope"],
    done: "New fabric on both wings, doped tight. It smells like a workshop again.",
  },
  {
    key: "engine",
    label: "The radial",
    note: "Nine years of dry air in a cylinder is a lot of dry air.",
    parts: 4,
    after: ["fabric"],
    steps: ["Free the cylinders", "Set the magnetos", "Plumb the fuel lines"],
    done: "The radial turned over by hand, then ran. Nothing on this field sounds like that.",
  },
  {
    key: "gear",
    label: "Gear and tyres",
    note: "Grass hides what a tyre finds.",
    parts: 2,
    after: ["fabric"],
    steps: ["Repack the bearings", "New boots on both legs"],
    done: "Bearings packed, new boots fitted. The aeroplane sits level for the first time.",
  },
  {
    key: "fuel",
    label: "Fuel and plumbing",
    note: "Old hose is a fire waiting for an excuse.",
    parts: 1,
    after: ["engine"],
    steps: ["Replace the hose runs"],
    done: "Every run of hose replaced. Fuel now smells of fuel and nothing else.",
  },
  {
    key: "instruments",
    label: "Instruments",
    note: "Six dials, four of them probably honest.",
    parts: 2,
    after: ["engine"],
    steps: ["Bench-test the dials", "Fit the panel and swing the compass"],
    done: "Panel fitted, compass swung on the apron. Four honest dials and two hopeful ones.",
  },
];

// The first flight, in five legs. Each leg is a discipline call rather than a
// flight model: the game is about what the pilot chose, and the log remembers.
export const FLIGHT_PHASES = [
  {
    key: "preflight",
    label: "Walk-around",
    prompt:
      "Grass under the tyres, tanks checked, the windsock turning soft off the ridge. The aeroplane is yours and it is waiting.",
    choices: [
      {
        key: "sump",
        label: "Sump both tanks, then check the controls are free",
        tone: "pass",
        line: "Water in the fuel is the only thing on this field that can end the day early. It is not there.",
      },
      {
        key: "trust",
        label: "Trust the walk-around you did yesterday",
        tone: "rough",
        line: "It waited nine years. It can wait one more morning while you look properly.",
      },
      {
        key: "start",
        label: "Start it and see how it sounds",
        tone: "fail",
        line: "It sounds fine. A radial like this always sounds fine, right up to the moment it does not.",
      },
    ],
  },
  {
    key: "runup",
    label: "Run-up",
    prompt: "Oil warm, holding 1,800 on the tach you rebuilt yourself. The hangar door stands open behind you.",
    choices: [
      {
        key: "mags",
        label: "Both mags, then lean it for the field's altitude",
        tone: "pass",
        line: "Both mags drop even, a hundred apiece. The engine sounds like it has been doing this all along.",
      },
      {
        key: "one_mag",
        label: "Skip the second mag, it was smooth last time",
        tone: "rough",
        line: "The second mag was smooth yesterday. Today is the day that matters.",
      },
      {
        key: "full",
        label: "Full power straight away, it will clear itself",
        tone: "fail",
        line: "It clears itself into a stutter, and you bring the power back with your heart in your throat.",
      },
    ],
  },
  {
    key: "takeoff",
    label: "Takeoff roll",
    prompt: "The strip runs uphill to the north end and the wind is soft off the ridge. Two soft spots, both behind you.",
    choices: [
      {
        key: "into_wind",
        label: "Line up into wind, full power, tail up, rudder to hold it straight",
        tone: "pass",
        line: "The grass blurs, the soft spots go by, and the tyres let go somewhere between the second and third fence post.",
      },
      {
        key: "downwind",
        label: "Take it downwind, the ridge will give you a push",
        tone: "fail",
        line: "The ridge gives you nothing but a longer run, and the fence line arrives first.",
      },
      {
        key: "half",
        label: "Half power and let it fly itself off",
        tone: "rough",
        line: "It flies, eventually, with the north end of the strip already underneath you.",
      },
    ],
  },
  {
    key: "climb",
    label: "Climb-out",
    prompt: "A hundred feet up, the lake opens out on the left and the engine is steady in your hands.",
    choices: [
      {
        key: "best_climb",
        label: "Best climb speed, wings level, watch the oil pressure",
        tone: "pass",
        line: "The foothills come up slowly under the nose and the oil pressure sits exactly where it sat on the ground.",
      },
      {
        key: "low_fast",
        label: "Hold it low and fast to enjoy the morning",
        tone: "rough",
        line: "Glorious, and with no altitude over the ridge line and nowhere to put the aeroplane but down.",
      },
      {
        key: "hard",
        label: "Pull back hard and climb straight over the ridge",
        tone: "fail",
        line: "The nose comes up, the airspeed bleeds away, and the ridge arrives during the wait.",
      },
    ],
  },
  {
    key: "finals",
    label: "Circuit and finals",
    prompt: "Downwind in the late light, the strip below is a pale ribbon in the grass and the windsock stands up.",
    choices: [
      {
        key: "numbers",
        label: "Carb heat, throttle back, aim for the numbers, three greens",
        tone: "pass",
        line: "The fence posts go past under the wheels, the tyres find the grass, and the field is yours.",
      },
      {
        key: "high",
        label: "Come in high and slip it off at the threshold",
        tone: "rough",
        line: "You are high, you are fast, and the aeroplane lands long with plenty of strip still to spend.",
      },
      {
        key: "low_shallow",
        label: "Come in low and shallow, engines hate idle",
        tone: "fail",
        line: "Low and shallow, and the fence line is now a thing you have to do something about.",
      },
    ],
  },
];

export const SCORE_BY_TONE = { pass: 20, rough: 10, fail: 0 };

// What the field says when the wheels stop.
export function circuitVerdict(score) {
  if (score >= 100) return "A circuit the field will not forget. Wheels on the grass, engine idling, nothing left to forgive.";
  if (score >= 80) return "Wheels down, engine idling, and the field exactly as it was, only better.";
  if (score >= 60) return "A first flight with lessons attached. That is what first flights are for.";
  return "Down, whole, and wiser. The strip is patient and so is the aeroplane.";
}

export const START_DOC = {
  act: 1,
  day: 1,
  hours: 8,
  parts: 0,
  tasks: [],
  system_steps: {},
  flights: 0,
  best_circuit: 0,
  log: [],
};

export const OPENING_LINE =
  "The solicitor's letter said an airfield. It did not say what condition it would be in.";

export const DAY_LINE = (day) => `Day ${day}. Six hours of light, and the tools exactly where you left them.`;

export const taskByKey = (key) => FIELD_TASKS.find((task) => task.key === key);
export const systemByKey = (key) => SYSTEMS.find((system) => system.key === key);

export const TOTAL_STEPS = SYSTEMS.reduce((sum, system) => sum + system.steps.length, 0);