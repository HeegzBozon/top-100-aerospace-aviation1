// The people of Hollow Field, and what they say.
//
// A script is a list of beats. A beat belongs to somebody, or to nobody (the
// narration), and it carries the effects it causes: salvage handed over, a quest
// begun, a night slept. Choices are beats that wait for the player.
//
// Who says what is decided by the narrative router at the bottom of this file:
// each pilot has a first meeting, something to say while their work is in hand, a
// word when it is finished, and an idle line for after — which is how the game
// stays in character without a single branching tree.

export const YOU = "you";

export const CAST = {
  you: {
    name: "You",
    role: "The inheritor",
    skin: "#d9a878",
    hair: "#3b2a20",
    shirt: "#c9a87c",
    pants: "#2b3d52",
    hat: null,
  },
  marla: {
    name: "Marla Quist",
    role: "Keeper of the field",
    skin: "#c78f68",
    hair: "#7a6a5a",
    shirt: "#4a5a3a",
    pants: "#3a3226",
    hat: { tone: "#8a6a3c", brim: "#6b5030" },
  },
  dex: {
    name: "Dex Ferrier",
    role: "Crop duster",
    skin: "#b57a4e",
    hair: "#2a1f18",
    shirt: "#6a5030",
    pants: "#3b4759",
    hat: { tone: "#3f5a3a", brim: "#2c3f28" },
    beard: "#2a1f18",
    big: true,
  },
  tup: {
    name: "Tuppence Iyawe",
    role: "The bench",
    skin: "#8a5a38",
    hair: "#221a14",
    shirt: "#8a6a3c",
    pants: "#4a4a52",
    hat: { tone: "#c9a87c", brim: "#a8875c" },
    apron: true,
  },
  hollis: {
    name: "Hollis Vane",
    role: "Ferry pilot, retired",
    skin: "#c9a688",
    hair: "#d8d2c4",
    shirt: "#5a6472",
    pants: "#3a3f48",
    hat: { tone: "#7a6a5a", brim: "#5c5044" },
    beard: "#d8d2c4",
    thin: true,
  },
  rue: {
    name: "Rue Ansel",
    role: "Trades in found things",
    skin: "#a8764e",
    hair: "#2e2418",
    shirt: "#a8551f",
    pants: "#3f4a3a",
    hat: null,
    small: true,
  },
  biscuit: {
    name: "Biscuit",
    role: "Dog",
    dog: true,
    skin: "#c9a87c",
    shirt: "#8a6a3c",
  },
};

// ── The arrival ────────────────────────────────────────────────────────────
const intro = {
  key: "intro",
  card: {
    kicker: "Hollow Field",
    title: "Six twelve, the second week of October",
    line: "Nine acres of grass, one hangar, and whatever the solicitor did not think to mention.",
  },
  beats: [
    {
      who: null,
      line: "The gate is open. It has been open for some time: the chain is there, but somebody long ago decided the field could look after itself.",
    },
    {
      who: "marla",
      dir: "down",
      line: "You'll be the inheritor, then. Wren never mentioned family. Wren never mentioned much of anything, and then said it all in one letter.",
    },
    {
      who: "marla",
      line: "I kept the field standing for four years while the lawyers argued about it. So before you ask: no, nobody is going to be glad to see you, and nobody is going to be sorry either.",
    },
    {
      who: YOU,
      line: "...",
      choices: [
        { label: "Why me?", goto: "why" },
        { label: "I didn't know them well.", goto: "knew" },
        { label: "What's under the tarp?", goto: "tarp" },
      ],
    },
    {
      id: "why",
      who: "marla",
      line: "Because a letter said so. Wren flew for thirty years and wrote one page at the end of it, and that page had your name on it and nine acres of somebody else's weather.",
    },
    {
      id: "knew",
      who: "marla",
      line: "Nobody knew Wren well. That was the arrangement. You knew them as much as I did, and I lived here.",
    },
    {
      id: "tarp",
      who: "marla",
      line: "Wren's last machine. High-wing, one radial, built out of a wreck and a stubbornness I never once saw run out.",
    },
    {
      who: "marla",
      line: "It came apart in the hangar nine years ago, and it has stayed apart, because every time it went back together it was not right yet.",
    },
    {
      who: "marla",
      line: "So. Walk the field first. Not because I am testing you. Because you will want to know what you have been given, and it is easier to learn it on your feet.",
    },
    {
      who: "marla",
      line: "The sock, the hangar, and the machine. Then come to the bunkhouse and tell me what you think you have.",
      fx: { met: "marla", quest: "walk", seen: "intro" },
    },
  ],
};

// ── Marla, after the arrival ───────────────────────────────────────────────
const marlaIdle = {
  key: "marla_idle",
  beats: [
    {
      who: "marla",
      line: "The letter is in the bunkhouse drawer if you want it. I would read it once and put it back.",
    },
    {
      who: "marla",
      line: "Dex is at the hangar. Tup is at the bench. Hollis is on the bridge, and he has been on the bridge for eleven years, so he is not hard to find.",
    },
  ],
};

const marlaWing = {
  key: "marla_wing",
  card: {
    kicker: "Act I · Chapter One complete",
    title: "A wing again",
    line: "Panel on, spar in, and the tarp has come back exactly that far.",
  },
  beats: [
    {
      who: "marla",
      line: "You fitted the wing. I watched from here. I am not going to make a speech about it.",
    },
    {
      who: "marla",
      line: "But I will tell you this. Wren had a notebook, and it is not in this field, and I know where it is. Not today.",
    },
    {
      who: "marla",
      line: "Bring the rest of the airframe back and I will tell you where the notebook went. Chapter two. The machine itself.",
      fx: { seen: "chapter_one" },
    },
  ],
};

const marlaProgress = {
  key: "marla_progress",
  beats: [
    {
      who: "marla",
      line: "The field will not chase you. It has not chased anybody in nine years. That is either the best thing about it or the worst.",
    },
  ],
};

// ── Dex: the salvage ───────────────────────────────────────────────────────
const dexFirst = {
  key: "dex_first",
  beats: [
    {
      who: "dex",
      line: "So you're the one. Wren flew my first load out of this strip when I was nineteen and had no business being up in anything.",
    },
    { who: "dex", line: "Which means I owe this field one machine's worth of work, and I would rather pay it to the machine than to a lawyer." },
    {
      who: "dex",
      line: "A wing panel is four sheets and six rivets. You'll want a wing's worth, so: six sheets, ten rivets, and I will not fetch a single one of them for you.",
    },
    { who: "dex", line: "The scrub south-east gives aluminium. The ditches give tube. The creek brings something down every night." },
    { who: "dex", line: "And do not touch the radial. That engine is Wren's and it is not yours to break yet." },
    { who: "dex", line: "Go on. It is good light and it will not stay good light.", fx: { met: "dex", quest: "salvage" } },
  ],
};

const dexProgress = {
  key: "dex_progress",
  beats: [
    {
      who: "dex",
      line: "Short of it still. Scrub's south-east, ditches are everywhere, and the creek is patient but not generous.",
    },
  ],
};

const dexTurnIn = {
  key: "dex_turnin",
  beats: [
    {
      who: "dex",
      line: "That's a wing's worth, or near enough that I will not count it twice in front of you.",
    },
    {
      who: "dex",
      line: "Take it to Tup, at the bench behind the shed. She learned on this field the same way you are learning on it now, only faster.",
    },
    { who: "dex", line: "And put the sheets flat, will you. Flat sheets, straight spars. Everything after that is just patience." },
    { who: "dex", line: "One more thing. Wren would have said the panel is the easy part. Wren was usually right about the easy part.", fx: { questDone: "salvage" } },
  ],
};

const dexIdle = {
  key: "dex_idle",
  beats: [
    { who: "dex", line: "Strip is soft in two places, north and centre. Land long if you ever get up there." },
    { who: "dex", line: "I dust cotton forty miles south of here and I still call this field home. Make of that what you like." },
  ],
};

// ── Tup: the bench ─────────────────────────────────────────────────────────
const tupFirst = {
  key: "tup_first",
  beats: [
    { who: "tup", line: "I'm Tup. I'm the bench." },
    {
      who: "tup",
      line: "Wren taught me here. Rivets in the coffee tin, dope in the blue drum, and never once trust a torque wrench you have not dropped at least once.",
    },
    { who: "tup", line: "You want a wing. A wing is a panel and a spar, and a panel and a spar are an hour each at this bench." },
    { who: "tup", line: "Stand at the bench, open it up, and it tells you what it is short of. It always tells you.", fx: { met: "tup", quest: "bench" } },
  ],
};

const tupProgress = {
  key: "tup_progress",
  beats: [
    { who: "tup", line: "Panel: four sheets, six rivets, one hour. Spar: two tubes, two sheets, one hour. The bench does the rest." },
    { who: "tup", line: "You'll want to be standing at it, too. Nobody builds a wing at the far end of a field, however romantic that sounds." },
  ],
};

const tupTurnIn = {
  key: "tup_turnin",
  beats: [
    { who: "tup", line: "Look at that. Straight as a rule and about as interesting." },
    { who: "tup", line: "Best thing about a spar is you can tell in one second whether it is any good. Worst thing is the same. Take them to the machine." },
    { who: "tup", line: "Panel first, it is heavier and your arms are younger than mine. Then the spar slides into the root, and mind the fabric.", fx: { questDone: "bench" } },
  ],
};

const tupIdle = {
  key: "tup_idle",
  beats: [
    { who: "tup", line: "I keep the tin of rivets full. No reason. Old habit. Wren's habit." },
    { who: "tup", line: "When that radial runs again I want to be standing next to it. Not behind it. Next to it." },
  ],
};

// ── Hollis: the field's story ──────────────────────────────────────────────
const hollisFirst = {
  key: "hollis_first",
  beats: [
    { who: "hollis", line: "Hollis Vane. I ferried everything anybody ever built on this field. Wren built all of it twice." },
    { who: "hollis", line: "Careful on the boards. They are older than you and they have been wet longer." },
    {
      who: "hollis",
      line: "You want to know what you have inherited. Everybody does.",
      choices: [
        { label: "What was Wren like?", goto: "wren" },
        { label: "Why did the machine come apart?", goto: "apart" },
      ],
    },
    {
      id: "wren",
      who: "hollis",
      line: "Impatient with weather. Patient with metal. Flew the machine you are standing near for two hours, brought it back, and took it apart again, because it was not right.",
    },
    {
      id: "apart",
      who: "hollis",
      line: "It came apart because it was not right. That is the whole story. Wren would rather have spent nine years being correct than one afternoon being nearly correct.",
    },
    {
      who: "hollis",
      line: "And it was never right again, because Wren ran out of afternoons. That is what the tarp is. Not grief. An unfinished opinion.",
    },
    { who: "hollis", line: "If you finish it, fly it low over the creek once. I'll be on the bridge, and I will not wave." },
    { who: "hollis", line: "That is all I have to say about it, and more than I have said about it in eleven years.", fx: { met: "hollis", quest: "story", visit: "story" } },
  ],
};

const hollisIdle = {
  key: "hollis_idle",
  beats: [
    { who: "hollis", line: "Creek takes the north fence every spring. Took it the spring Wren died, as it happens. Nobody has replaced it." },
    { who: "hollis", line: "The weather comes up this valley from the south-west and it comes fast. Fly accordingly, if you get that far." },
  ],
};

// ── Rue: the trader ────────────────────────────────────────────────────────
const rueFirst = {
  key: "rue_first",
  beats: [
    { who: "rue", line: "You're the new one. Rue. I ride around. I find things. I don't steal, I trade, and the difference matters to me if not to you." },
    { who: "rue", line: "Wren used to say I was the only honest person on this field, which was a compliment, given who else was standing on it." },
    {
      who: "rue",
      line: "Here's the rate. Two brass, one gasket. Fair today, fair next week, fair in the rain.",
      choices: [
        { label: "Trade. (two brass)", needs: { brass: 2 }, goto: "trade" },
        { label: "Not today.", goto: "later" },
      ],
    },
    {
      id: "trade",
      who: "rue",
      line: "Pleasure. Brass is brass and a gasket is a gasket, and the ditch behind the shed gives the first of those away free.",
      fx: { items: { brass: -2, gasket: 1 }, visit: "rue_trade", quest: "trade" },
    },
    { id: "later", who: "rue", line: "Suit yourself. I'll be here, or on the road, or just behind you, and one of those is true." },
    { who: "rue", line: "If the dog finds something for you, it was probably mine first. I'm only saying it now so we don't have to say it later." },
  ],
};

const rueIdle = {
  key: "rue_idle",
  beats: [{ who: "rue", line: "The creek bank every morning. Something comes down it every night. Ask Dex why that is. He won't know." }],
};

// ── Biscuit: no dialogue, and the best quest giver on the field ────────────
const biscuitIdle = {
  key: "biscuit_idle",
  beats: [
    { who: "biscuit", line: "*Biscuit looks up, considers you at length, and goes back to work on a hole that has clearly offended them.*" },
    { who: "biscuit", line: "*The tail goes once. Twice. Then a serious amount of digging, entirely beside the point.*" },
  ],
};

// ── The machine, the bench, and the rest of the furniture ─────────────────
const machineScript = {
  key: "machine",
  beats: [
    { who: null, line: "Under the tarp: a high-wing monoplane in pieces. The wing root is stripped to bare frames, and the radial sits on the dirt in front of it like a heart on a plate." },
  ],
};

const machineIntro = {
  key: "machine_intro",
  beats: [
    { who: null, line: "Under the tarp: a high-wing monoplane in pieces, laid out in the order it was taken apart, with the radial on the dirt in front of it like a heart on a plate." },
    { who: null, line: "Nine years of dust, and not one tool out of place. Somebody expected to come back to this.", fx: { visit: "machine" } },
  ],
};

const signScript = {
  key: "sign",
  beats: [
    { who: null, line: "A board at the gate, painted by hand: HOLLOW FIELD. NINE ACRES. NO THROUGH ROAD." },
    { who: null, line: "Underneath, in smaller letters, and clearly added later: aeroplanes, occasionally.", fx: { visit: "sign" } },
  ],
};

const sockScript = {
  key: "sock",
  beats: [
    { who: null, line: "The sock stands into the north-east, slow, the way it does an hour before rain. The pole is new. The sock is not." },
    { who: null, line: "Somebody has cut into the pole with a knife, one word, weathered: WIND FIRST.", fx: { visit: "sock" } },
  ],
};

const hangarScript = {
  key: "hangar",
  beats: [
    { who: null, line: "The door is nine years stiff. It opens a foot, then a yard, complaining the whole way." },
    { who: null, line: "Inside: a bench, a stove, and a wall of tools in order. Nobody has taken a thing, in nine years, out of a hangar with a door that opens." , fx: { visit: "hangar" } },
  ],
};

const creekScript = {
  key: "creek",
  beats: [
    { who: null, line: "The creek runs shallow and fast over stones. Wren's bridge has one rail worn smooth by a single hand, in one place, over and over." },
    { who: null, line: "Whatever the water is carrying, it stops here, against the bank, and waits to be looked at." },
  ],
};

const benchScript = {
  key: "bench",
  beats: [
    { who: null, line: "Wren's bench: a vice, a tin of rivets, a blue drum of dope, and a bench hook worn into a curve by somebody's habit." },
    { who: null, line: "It is the most complete thing on this field.", fx: { openMenu: "bench" } },
  ],
};

const pumpScript = {
  key: "pump",
  beats: [
    { who: null, line: "The fuel pump is dry and honest. Nine years of nothing in it, and the handle still turns without complaint." },
    { who: null, line: "There is a tin cup on top, for the days when the pump was not the only thing being filled." },
  ],
};

const dogFind = {
  key: "dog_find",
  beats: [
    { who: "biscuit", line: "*Biscuit has dug a hole at the fence line with enormous commitment and no evident plan.*" },
    { who: null, line: "At the bottom of it: a fistful of rivets, bright, recently disturbed, and clearly a collection somebody has been keeping." },
    { who: "biscuit", line: "*Biscuit sits, delivers the rivets by rolling them at your feet, and expects to be told they are excellent.*", fx: { items: { rivet: 4 }, visit: "dog_find", quest: "dog", hint: "Rivets ×4" } },
  ],
};

const bunkScript = {
  key: "bunk",
  beats: [
    { who: null, line: "The cot in the bunkhouse is made up with a wool blanket and a pillow that has been in the sun for nine years." },
    {
      who: null,
      line: "The light is going. The field stops when the light stops, and it has never once been argued with.",
      choices: [
        { label: "Turn in for the night.", fx: { sleep: true }, goto: "sleep" },
        { label: "Not yet.", goto: "awake" },
      ],
    },
    { id: "sleep", who: null, line: "You sleep the way people sleep in a house that is not theirs yet: lightly, and then all at once." },
    { id: "awake", who: null, line: "There is still light. You spend it standing in the doorway, which is also a way of spending it." },
  ],
};

const wingFit = {
  key: "wing_fit",
  card: {
    kicker: "Hollow Field",
    title: "The tarp comes back",
    line: "Two parts on the machine, and the field notices.",
  },
  beats: [
    { who: null, line: "The panel goes on first. It is heavier than it looks and it fits, which is its own small miracle." },
    { who: null, line: "Then the spar, into the root, bolted, checked twice, and checked once more by a hand that is not quite yours." },
    { who: null, line: "The tarp is pulled back that far and no further. The wing is a wing again, and the rest of the machine is still a pile." },
    { who: "marla", line: "I saw the tarp move from the bunkhouse. Go on, then. Come and tell me what you have.", fx: { quest: "rest" } },
  ],
};

// ── The router: who says what, and when ───────────────────────────────────
const ROUTES = {
  marla: { first: "intro", progress: "marla_progress", turnIn: "marla_progress", idle: "marla_idle" },
  dex: { first: "dex_first", progress: "dex_progress", turnIn: "dex_turnin", idle: "dex_idle", quest: "salvage" },
  tup: { first: "tup_first", progress: "tup_progress", turnIn: "tup_turnin", idle: "tup_idle", quest: "bench" },
  hollis: { first: "hollis_first", progress: "hollis_first", turnIn: "hollis_first", idle: "hollis_idle", quest: "story" },
  rue: { first: "rue_first", progress: "rue_first", turnIn: "rue_first", idle: "rue_idle", quest: "trade" },
  biscuit: { first: "biscuit_idle", progress: "biscuit_idle", turnIn: "biscuit_idle", idle: "biscuit_idle" },
};

export const SCRIPTS = {
  intro,
  marla_idle: marlaIdle,
  marla_progress: marlaProgress,
  marla_wing: marlaWing,
  dex_first: dexFirst,
  dex_progress: dexProgress,
  dex_turnin: dexTurnIn,
  dex_idle: dexIdle,
  tup_first: tupFirst,
  tup_progress: tupProgress,
  tup_turnin: tupTurnIn,
  tup_idle: tupIdle,
  hollis_first: hollisFirst,
  hollis_idle: hollisIdle,
  rue_first: rueFirst,
  rue_idle: rueIdle,
  biscuit_idle: biscuitIdle,
  machine: machineScript,
  machine_intro: machineIntro,
  machine_wing: wingFit,
  sign: signScript,
  sock: sockScript,
  hangar: hangarScript,
  creek: creekScript,
  bench: benchScript,
  pump: pumpScript,
  dog_find: dogFind,
  bunk: bunkScript,
};

export const scriptByKey = (key) => SCRIPTS[key] || null;

// Progress lines, read live from the save (questProgress), so a pilot knows
// exactly how short the player is without a word of it being stored twice.
export function npcScript(npcKey, doc, stats) {
  const route = ROUTES[npcKey];
  if (!route) return null;

  // Marla carries the chapter: the wing fitted is worth more than any idle line.
  if (npcKey === "marla") {
    if ((doc.seen || []).includes("chapter_one")) return "marla_idle";
    if (stats.fitted >= 2 && !(doc.seen || []).includes("chapter_one")) return "marla_wing";
    return "marla_idle";
  }

  if ((doc.met || []).includes(npcKey)) {
    const tracked = route.quest;
    if (tracked) {
      const status = doc.quests?.[tracked];
      if (status === "active" && stats.progress?.[tracked]?.done) return route.turnIn;
      if (status === "active") return route.progress;
    }
    return route.idle;
  }

  return route.first;
}

// Stations answer to the world, not to a person: what they say depends on what
// has already happened on the field.
export const STATION_SCRIPTS = {
  sign: "sign",
  sock: "sock",
  hangar: "hangar",
  creek: "creek",
  bench: "bench",
  pump: "pump",
  bunk: "bunk",
};