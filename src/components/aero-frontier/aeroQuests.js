// The work, in the order the field asks for it.
//
// A quest holds no progress of its own: what is done is read off the save every
// time it is drawn, from the bag, the bench, the airframe and the ground you have
// walked. One source of truth, so the quest log can never disagree with the world.

import { FITS } from "./aeroItems";

export const QUESTS = [
  {
    key: "walk",
    chapter: "Arrival",
    title: "Walk the field",
    brief: "See what has been left to you: the windsock, the hangar, and what is under the tarp.",
    giver: "marla",
    goal: { type: "visit", keys: ["sock", "hangar", "machine"], label: "Walk the field" },
    auto: true,
    next: "salvage",
    line: "Nine acres, walked. The field is a shape you now know by foot.",
  },
  {
    key: "salvage",
    chapter: "Arrival",
    title: "A wing's worth of salvage",
    brief: "Dex wants six sheets and ten rivets, and he is not going to fetch them for you.",
    giver: "dex",
    goal: { type: "collect", items: { alu: 6, rivet: 10 } },
    next: "bench",
    line: "Dex turned the sheets over twice, the way a man checks a bill he already trusts.",
  },
  {
    key: "bench",
    chapter: "The airframe",
    title: "Build a panel and a spar",
    brief: "Tup says the bench has done it before and can do it again. Wing panel, then wing spar.",
    giver: "tup",
    goal: { type: "craft", keys: ["panel", "spar"] },
    next: "wing",
    line: "Panel and spar, both true, both straight, both yours.",
  },
  {
    key: "wing",
    chapter: "The airframe",
    title: "Fit them to the machine",
    brief: "Two parts onto Wren's monoplane. The tarp comes back that far and no further.",
    giver: "tup",
    goal: { type: "fit", count: 2, of: Object.keys(FITS) },
    auto: true,
    next: null,
    line: "Panel and spar fitted. It has been nine years since this wing held anything up.",
  },
  {
    key: "story",
    chapter: "The people",
    title: "Hear the field's story",
    brief: "Hollis Vane has been standing on that bridge for eleven years. Ask him about Wren.",
    giver: "hollis",
    goal: { type: "visit", keys: ["story"], label: "Ask Hollis about Wren" },
    auto: true,
    line: "Wren, in somebody else's words. The field has a person in it now.",
  },
  {
    key: "trade",
    chapter: "The people",
    title: "Trade with Rue",
    brief: "Two brass for a gasket, and Rue will remember your face for the rest of the game.",
    giver: "rue",
    goal: { type: "visit", keys: ["rue_trade"], label: "Trade with Rue" },
    auto: true,
    line: "Rue took the brass, handed over the gasket, and was gone up the path.",
  },
  {
    key: "dog",
    chapter: "The people",
    title: "See what Biscuit has found",
    brief: "The dog is digging at the fence line again, and the dog has better instincts than most.",
    giver: "biscuit",
    goal: { type: "visit", keys: ["dog_find"], label: "Take what Biscuit digs up" },
    auto: true,
    line: "Biscuit's find, salvaged and squared away. The dog was paid in attention.",
  },
  {
    key: "rest",
    chapter: "The seasons",
    title: "Keep the light",
    brief: "When the hours are gone the field stops. Sleep in the bunkhouse and the day comes back.",
    giver: "marla",
    goal: { type: "day", count: 2, label: "Sleep a night in the bunkhouse" },
    auto: true,
    line: "A night in the bunkhouse, and the field at six in the morning, which nobody else came to see.",
  },
];

export const questByKey = (key) => QUESTS.find((quest) => quest.key === key);

export const questStatus = (doc, key) => doc.quests?.[key] || null;

export const isActive = (doc, key) => questStatus(doc, key) === "active";
export const isDone = (doc, key) => questStatus(doc, key) === "done";

// Progress is read, never stored.
export function questProgress(doc, quest) {
  const goal = quest.goal;
  const lines = [];

  if (goal.type === "visit") {
    const seen = goal.keys.filter((key) => (doc.visited || []).includes(key));
    lines.push([goal.label || "Places seen", seen.length, goal.keys.length]);
    return { done: seen.length >= goal.keys.length, have: seen.length, need: goal.keys.length, lines };
  }

  if (goal.type === "collect") {
    let done = true;
    Object.entries(goal.items).forEach(([key, need]) => {
      const have = Math.min(doc.inventory?.[key] || 0, need);
      if (have < need) done = false;
      lines.push([key, have, need]);
    });
    const have = lines.reduce((sum, [, h]) => sum + h, 0);
    const need = lines.reduce((sum, [, , n]) => sum + n, 0);
    return { done, have, need, lines };
  }

  if (goal.type === "craft") {
    const made = goal.keys.filter((key) => (doc.crafted || []).includes(key));
    lines.push(["Parts built", made.length, goal.keys.length]);
    return { done: made.length >= goal.keys.length, have: made.length, need: goal.keys.length, lines };
  }

  if (goal.type === "fit") {
    const fitted = (doc.installed || []).length;
    const use = Math.min(fitted, goal.count);
    lines.push(["Parts fitted", use, goal.count]);
    return { done: fitted >= goal.count, have: fitted, need: goal.count, lines };
  }

  if (goal.type === "day") {
    const day = doc.day || 1;
    lines.push(["Nights slept", Math.max(0, day - 1), goal.count - 1]);
    return { done: day >= goal.count, have: day, need: goal.count, lines };
  }

  return { done: false, have: 0, need: 1, lines };
}

export const activeQuests = (doc) =>
  QUESTS.filter((quest) => isActive(doc, quest.key));

export const filedQuests = (doc) =>
  QUESTS.filter((quest) => isDone(doc, quest.key));

export const openQuests = (doc) => activeQuests(doc);

// The chapter the field is currently standing in, for the HUD and the log.
export function currentChapter(doc) {
  const active = activeQuests(doc);
  if (active.length) return active[0].chapter;
  const unfiled = QUESTS.find((quest) => !isDone(doc, quest.key));
  if (unfiled) return unfiled.chapter;
  return "The airframe";
}