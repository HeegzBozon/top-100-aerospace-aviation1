import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GRID, MAP_H, MAP_W, OBJECTS, SPAWN } from "./aeroMap";
import { canStand, clampCamera, facingTile, nodeAvailable, reachable, spawnPoint, TILE_PX } from "./aeroEngine";
import { DAY_LINE, HOURS_PER_DAY, TILE, VIEW_H, VIEW_W, capLog, entry } from "./aeroConfig";
import { CAST, npcScript, scriptByKey, STATION_SCRIPTS } from "./aeroScripts";
import { canBuild, FITS, fittedFor, itemLabel, recipeByKey, TOTAL_FITS } from "./aeroItems";
import { questByKey, questProgress, QUESTS } from "./aeroQuests";

const SPEED = 46; // pixels a second, a shade under three tiles
const NUDGE_MS = 260; // how long one turn of the wheel walks for
const TYPE_MS = 26; // per character, so a line arrives like somebody saying it
const TABS = ["bag", "bench", "quests", "journal"];

// The world: walking, looking, talking, working.
//
// React holds what the player reads — the dialogue, the menu, the log. Refs hold
// what the player is doing — position, facing, camera, who is where. Nothing in
// the frame loop renders React except the one line currently being typed, so a
// hundred steps a second cost nothing, and no re-render can teleport a body.
export default function useAeroWorld({ doc, status, apply, setPos }) {
  const [ui, setUi] = useState({ dialogue: null, card: null, menu: null, toasts: [], note: null });

  const docRef = useRef(doc);
  docRef.current = doc;
  const uiRef = useRef(ui);
  uiRef.current = ui;

  const player = useRef({ ...spawnPoint(), dir: "up", frame: 0, step: 0, moving: false });
  const cam = useRef({ x: 0, y: 0 });
  const npcs = useRef([]);
  const intents = useRef({ up: false, down: false, left: false, right: false, nudge: null, until: 0 });
  const tRef = useRef(0);
  const seated = useRef(false);

  // Parked where the save left off, on the first frame the field is open.
  useEffect(() => {
    if (!doc || seated.current) return;
    seated.current = true;
    const at = doc.at?.x != null ? doc.at : SPAWN;
    player.current.x = at.x * TILE_PX + 8;
    player.current.y = at.y * TILE_PX + 8;
    cam.current = clampCamera(
      player.current.x - (VIEW_W * TILE_PX) / 2,
      player.current.y - (VIEW_H * TILE_PX) / 2,
      VIEW_W * TILE_PX,
      VIEW_H * TILE_PX,
    );
  }, [doc]);

  useEffect(() => {
    npcs.current = OBJECTS.filter((object) => object.kind === "npc").map((object) => ({
      key: object.key,
      cast: CAST[object.cast] || CAST.marla,
      x: object.x * TILE_PX + 8,
      y: object.y * TILE_PX + 16,
      dir: object.dir || "down",
      frame: 0,
      wander: object.patrol || null,
    }));
  }, []);

  const toast = useCallback((text) => {
    if (!text) return;
    setUi((current) => ({
      ...current,
      toasts: [...current.toasts.slice(-2), { id: `${Date.now()}-${Math.random()}`, text }],
    }));
  }, []);

  const dropToast = useCallback((id) => {
    setUi((current) => ({ ...current, toasts: current.toasts.filter((item) => item.id !== id) }));
  }, []);

  // ── Progress, read live ─────────────────────────────────────────────────
  const statsFor = useCallback((source) => {
    const progress = {};
    QUESTS.forEach((quest) => {
      progress[quest.key] = questProgress(source, quest);
    });
    return { fitted: (source.installed || []).length, progress };
  }, []);

  // ── Scripts ─────────────────────────────────────────────────────────────
  const playScript = useCallback((script, options = {}) => {
    if (!script) return;
    const beats = script.beats.map((beat, index) => ({ ...beat, index }));
    // A title card plays itself out in CSS over 2.6 seconds; the game takes it
    // away on the beat it finishes, so nothing waits on a timer that missed.
    const card = script.card ? { ...script.card, id: `${script.key}-${Date.now()}` } : null;
    setUi((current) => ({
      ...current,
      menu: null,
      note: null,
      card,
      dialogue: { key: script.key, beats, index: 0, typed: 0, cursor: 0, focus: options.focus || null },
    }));
    if (card) {
      setTimeout(() => {
        setUi((current) => (current.card?.id === card.id ? { ...current, card: null } : current));
      }, 2600);
    }
  }, []);

  const startScript = useCallback(
    (key, options) => playScript(scriptByKey(key), options),
    [playScript],
  );

  const endScript = useCallback(() => {
    setUi((current) => ({ ...current, dialogue: null }));
  }, []);

  // ── Effects: the only place the world writes ─────────────────────────────
  // A beat that hands over salvage, opens a door and begins a quest is still one
  // mutation, one write, and one line in the log, in the order it happened.
  const applyFx = useCallback(
    (fx = {}) => {
      if (!docRef.current) return;
      const lines = [];
      const finished = [];

      apply((current) => {
        let next = current;

        if (fx.items) {
          const inventory = { ...(next.inventory || {}) };
          Object.entries(fx.items).forEach(([key, count]) => {
            inventory[key] = Math.max(0, (inventory[key] || 0) + count);
            if (count > 0) lines.push(`${itemLabel(key)} ×${count} into the bag.`);
          });
          next = { ...next, inventory };
        }

        if (fx.hint) lines.push(fx.hint);
        if (fx.met && !next.met.includes(fx.met)) next = { ...next, met: [...next.met, fx.met] };
        if (fx.seen && !next.seen.includes(fx.seen)) next = { ...next, seen: [...next.seen, fx.seen] };

        if (fx.visit) {
          const keys = Array.isArray(fx.visit) ? fx.visit : [fx.visit];
          const fresh = keys.filter((key) => !next.visited.includes(key));
          if (fresh.length) next = { ...next, visited: [...next.visited, ...fresh] };
        }

        if (fx.quest) {
          const keys = Array.isArray(fx.quest) ? fx.quest : [fx.quest];
          const quests = { ...next.quests };
          keys.forEach((key) => {
            if (quests[key] !== "done") quests[key] = "active";
          });
          next = { ...next, quests };
        }

        if (fx.questDone) {
          const quest = questByKey(fx.questDone);
          next = { ...next, quests: { ...next.quests, [fx.questDone]: "done" } };
          if (quest) {
            finished.push(quest);
            lines.push(quest.line);
          }
        }

        if (fx.fit) {
          const key = fx.fit;
          const recipe = recipeByKey(key);
          if (recipe) {
            const built = [...(next.crafted || [])];
            const index = built.indexOf(key);
            if (index >= 0) built.splice(index, 1);
            const installed = [...(next.installed || []), key];
            next = {
              ...next,
              crafted: built,
              installed,
              hours: Math.max(0, next.hours - recipe.hours),
            };
            lines.push(recipe.fitted);
            if (installed.length >= 2 && !(next.seen || []).includes("chapter_one")) {
              setTimeout(() => playScript(scriptByKey("machine_wing")), 500);
            }
          }
        }

        if (fx.sleep) {
          const day = next.day + 1;
          next = { ...next, day, hours: HOURS_PER_DAY, log: capLog([entry(day, DAY_LINE(day)), ...next.log]) };
        }

        if (lines.length) {
          next = {
            ...next,
            log: capLog(lines.reduce((log, text) => [entry(next.day, text), ...log], next.log)),
          };
        }

        return next;
      });

      // Quests that finish on their own — walking the field — say so themselves.
      const after = docRef.current;
      if (after) {
        QUESTS.filter(
          (quest) => quest.auto && after.quests?.[quest.key] === "active" && questProgress(after, quest).done,
        ).forEach((quest) => {
          apply((current) => ({
            ...current,
            quests: { ...current.quests, [quest.key]: "done" },
            log: capLog([entry(current.day, quest.line), ...current.log]),
          }));
          toast(quest.title);
        });
      }

      if (fx.openMenu) setUi((current) => ({ ...current, menu: { tab: fx.openMenu, cursor: 0, note: null } }));
      lines.slice(0, 3).forEach(toast);
      if (finished.length) toast(finished[0].title);
    },
    [apply, playScript, toast],
  );

  const advance = useCallback(() => {
    const dialogue = uiRef.current.dialogue;
    if (!dialogue) return;
    const beat = dialogue.beats[dialogue.index];
    const length = (beat.line || "").length;
    if (dialogue.typed < length) {
      setUi((current) => ({ ...current, dialogue: { ...dialogue, typed: length } }));
      return;
    }
    if (beat.choices && !beat.answered) return;
    if (beat.fx) applyFx(beat.fx);
    if (dialogue.beats[dialogue.index + 1]) {
      setUi((current) => ({ ...current, dialogue: { ...dialogue, index: dialogue.index + 1, typed: 0, cursor: 0 } }));
      return;
    }
    endScript();
  }, [applyFx, endScript]);

  const choose = useCallback(
    (optionIndex) => {
      const dialogue = uiRef.current.dialogue;
      if (!dialogue) return;
      const beat = dialogue.beats[dialogue.index];
      const option = beat.choices?.[optionIndex];
      if (!option) return;

      if (option.needs) {
        const have = docRef.current.inventory || {};
        const short = Object.entries(option.needs).some(([key, need]) => (have[key] || 0) < need);
        if (short) {
          toast(`Not enough ${Object.keys(option.needs).map(itemLabel).join(" or ")} for that.`);
          return;
        }
      }

      if (option.fx) applyFx(option.fx);

      const settled = dialogue.beats.map((candidate) =>
        candidate.index === dialogue.index ? { ...candidate, choices: null, answered: true } : candidate,
      );

      const goto = option.goto;
      const target = goto ? settled.findIndex((candidate) => candidate.id === goto) : -1;
      setUi((current) => ({
        ...current,
        dialogue: { ...dialogue, beats: settled, index: target >= 0 ? target : dialogue.index, typed: 0, cursor: 0 },
      }));
    },
    [applyFx, toast],
  );

  const moveCursor = useCallback((step) => {
    setUi((current) => {
      const dialogue = current.dialogue;
      if (dialogue) {
        const beat = dialogue.beats[dialogue.index];
        if (!beat.choices) return current;
        if (dialogue.typed < (beat.line || "").length) return current;
        const cursor = Math.max(0, Math.min(beat.choices.length - 1, dialogue.cursor + step));
        return { ...current, dialogue: { ...dialogue, cursor } };
      }
      if (current.menu) {
        return { ...current, menu: { ...current.menu, cursor: Math.max(0, current.menu.cursor + step) } };
      }
      return current;
    });
  }, []);

  // ── Menus ───────────────────────────────────────────────────────────────
  const openMenu = useCallback((tab = "bag") => {
    setUi((current) => ({ ...current, menu: { tab, cursor: 0, note: null } }));
  }, []);

  const closeMenu = useCallback(() => {
    let closed = false;
    setUi((current) => {
      closed = !!current.menu;
      return current.menu ? { ...current, menu: null } : current;
    });
    return closed;
  }, []);

  const setMenuTab = useCallback((step) => {
    setUi((current) => {
      if (!current.menu) return current;
      const index = TABS.indexOf(current.menu.tab);
      const next = Math.max(0, Math.min(TABS.length - 1, index + step));
      return { ...current, menu: { ...current.menu, tab: TABS[next], cursor: 0, note: null } };
    });
  }, []);

  // ── Work ────────────────────────────────────────────────────────────────
  const gatherNode = useCallback(
    (object) => {
      const current = docRef.current;
      if (!nodeAvailable(object, current)) {
        playScript({
          key: `node_${object.key}_empty`,
          beats: [
            {
              who: null,
              line: object.daily
                ? "Nothing has come down the creek since this morning. It will give something tomorrow."
                : "That ground has given up everything it had.",
            },
          ],
        });
        return;
      }

      const items = object.loot || {};
      apply((state) => ({
        ...state,
        nodes: { ...(state.nodes || {}), [object.key]: state.day },
        hours: Math.max(0, state.hours - 1),
      }));
      applyFx({ items });

      playScript({
        key: `node_${object.key}`,
        beats: [{ who: null, line: object.line || "The ground gives up something, slowly, as it always does." }],
      });
    },
    [apply, applyFx, playScript],
  );

  const buildAtBench = useCallback(
    (key) => {
      const recipe = recipeByKey(key);
      const current = docRef.current;
      if (!recipe || !current) return;
      if (!canBuild(recipe, current.inventory || {})) {
        setUi((now) => (now.menu ? { ...now, menu: { ...now.menu, note: "The bench is short of something." } } : now));
        return;
      }
      if (current.hours < recipe.hours) {
        setUi((now) =>
          now.menu ? { ...now, menu: { ...now.menu, note: "Not enough light left. Sleep on it." } } : now,
        );
        return;
      }
      apply((state) => {
        const inventory = { ...(state.inventory || {}) };
        Object.entries(recipe.needs).forEach(([item, need]) => {
          inventory[item] = Math.max(0, (inventory[item] || 0) - need);
        });
        return {
          ...state,
          inventory,
          crafted: [...(state.crafted || []), recipe.key],
          hours: Math.max(0, state.hours - recipe.hours),
          log: capLog([entry(state.day, `Built at the bench: ${recipe.label.toLowerCase()}.`), ...state.log]),
        };
      });
      toast(`${recipe.label} built.`);
      setUi((now) => (now.menu ? { ...now, menu: { ...now.menu, note: `${recipe.label} is ready to fit.` } } : now));
    },
    [apply, toast],
  );

  // ── Acting ──────────────────────────────────────────────────────────────
  const fitOptionsFor = useCallback((current) => {
    const ready = Object.keys(FITS).filter(
      (key) =>
        (current.crafted || []).includes(key) &&
        fittedFor(current.installed || [], key) < FITS[key],
    );
    if (!ready.length) return null;
    const names = ready.map((key) => recipeByKey(key)?.label.toLowerCase());
    return {
      key: "machine_fit",
      beats: [
        {
          who: null,
          line: `The machine is waiting for what you have built: ${names.join(", ")}. It has waited nine years. It can wait while you decide.`,
          choices: ready
            .map((key) => ({
              label: `Fit the ${recipeByKey(key)?.label.toLowerCase()}.`,
              fx: { fit: key },
            }))
            .concat([{ label: "Not yet.", fx: {} }]),
        },
      ],
    };
  }, []);

  const act = useCallback(() => {
    const state = uiRef.current;
    const current = docRef.current;
    if (!current) return;

    if (state.card) {
      setUi((now) => ({ ...now, card: null }));
      return;
    }

    if (state.dialogue) {
      const beat = state.dialogue.beats[state.dialogue.index];
      if (beat.choices) {
        if (state.dialogue.typed < (beat.line || "").length) advance();
        else choose(state.dialogue.cursor);
        return;
      }
      advance();
      return;
    }

    if (state.menu) {
      if (state.menu.tab === "bench") {
        const target = reachable(GRID, player.current.x, player.current.y, player.current.dir);
        if (target?.key !== "bench" && target?.station !== "bench") {
          setUi((now) => (now.menu ? { ...now, menu: { ...now.menu, note: "Walk to the bench to build." } } : now));
          return;
        }
        const keys = Object.keys(FITS);
        buildAtBench(keys[Math.min(state.menu.cursor, keys.length - 1)]);
        return;
      }
      closeMenu();
      return;
    }

    const target = reachable(GRID, player.current.x, player.current.y, player.current.dir);
    if (!target) {
      const tile = facingTile(player.current.x, player.current.y, player.current.dir);
      if (GRID[tile.ty]?.[tile.tx] === "w") toast("The creek is up and cold, and gives nothing from this side.");
      return;
    }

    if (target.kind === "npc") {
      const npc = npcs.current.find((candidate) => candidate.key === target.key);
      if (npc) {
        const dx = player.current.x - npc.x;
        const dy = player.current.y - npc.y;
        npc.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "left" : "right") : dy > 0 ? "up" : "down";
      }
      const key = npcScript(target.key, current, statsFor(current));
      applyFx({ met: target.key });
      startScript(key, { focus: { x: target.x * TILE_PX + 8, y: target.y * TILE_PX + 16 } });
      return;
    }

    const focus = { x: target.x * TILE_PX + 8, y: target.y * TILE_PX + 16 };

    if (target.key === "machine") {
      const fits = fitOptionsFor(current);
      if (fits) {
        playScript(fits, { focus: { x: target.x * TILE_PX + 48, y: target.y * TILE_PX + 24 } });
        return;
      }
      const stats = statsFor(current);
      startScript(stats.fitted >= 2 ? "machine_wing" : "machine", {
        focus: { x: target.x * TILE_PX + 48, y: target.y * TILE_PX + 24 },
      });
      return;
    }

    if (target.station) {
      if (target.station === "bench" && !(current.met || []).includes("tup")) {
        toast("Nobody has shown you the bench yet. Tup is around the shed.");
      }
      if (target.station === "dog" && (current.visited || []).includes("dog_find")) {
        toast("Biscuit has moved on to a hole of greater importance.");
        return;
      }
      startScript(STATION_SCRIPTS[target.station], { focus });
      return;
    }

    if (target.kind === "node") gatherNode(target);
  }, [
    advance,
    applyFx,
    buildAtBench,
    choose,
    closeMenu,
    fitOptionsFor,
    gatherNode,
    playScript,
    startScript,
    statsFor,
    toast,
  ]);

  // ── Input, from wherever it comes ───────────────────────────────────────
  // A turn of the wheel and a drag of the pad land in the same two doors: the
  // menu takes them first, the field takes what is left.
  const rotate = useCallback(
    (step) => {
      const state = uiRef.current;
      if (state.card) return;
      if (state.dialogue || state.menu) {
        moveCursor(step > 0 ? 1 : -1);
        return;
      }
      intents.current.nudge = step > 0 ? "right" : "left";
      intents.current.until = performance.now() + NUDGE_MS;
    },
    [moveCursor],
  );

  const page = useCallback(
    (step) => {
      const state = uiRef.current;
      if (state.card) return;
      if (state.menu) {
        setMenuTab(step > 0 ? 1 : -1);
        return;
      }
      if (state.dialogue) {
        moveCursor(step > 0 ? 1 : -1);
        return;
      }
      intents.current.nudge = step > 0 ? "right" : "left";
      intents.current.until = performance.now() + NUDGE_MS * 1.5;
    },
    [moveCursor, setMenuTab],
  );

  const hold = useCallback(
    (dir, on) => {
      const state = uiRef.current;
      if (state.menu || state.dialogue || state.card) {
        if (on && !state.card) moveCursor(dir === "down" || dir === "right" ? 1 : -1);
        return;
      }
      intents.current[dir] = on;
      if (on) intents.current.nudge = null;
    },
    [moveCursor],
  );

  const release = useCallback(() => {
    intents.current.up = false;
    intents.current.down = false;
    intents.current.left = false;
    intents.current.right = false;
  }, []);

  useEffect(() => {
    const KEYS = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
    const down = (event) => {
      if (KEYS[event.key]) {
        event.preventDefault();
        hold(KEYS[event.key], true);
      } else if (event.key === "w") hold("up", true);
      else if (event.key === "s") hold("down", true);
      else if (event.key === "a") hold("left", true);
      else if (event.key === "d") hold("right", true);
      else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        act();
      } else if (event.key === "Escape") {
        setUi((current) => ({ ...current, menu: null, card: null }));
      } else if (event.key === "i") openMenu("bag");
      else if (event.key === "c") openMenu("bench");
      else if (event.key === "q") openMenu("quests");
      else if (event.key === "l") openMenu("journal");
    };
    const up = (event) => {
      if (KEYS[event.key]) hold(KEYS[event.key], false);
      else if (event.key === "w") hold("up", false);
      else if (event.key === "s") hold("down", false);
      else if (event.key === "a") hold("left", false);
      else if (event.key === "d") hold("right", false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [act, hold, openMenu]);

  // The arrival plays once, the first time the field is open.
  useEffect(() => {
    if (!doc || status !== "ready") return;
    if ((doc.seen || []).includes("intro")) return;
    const timer = setTimeout(() => startScript("intro"), 600);
    return () => clearTimeout(timer);
  }, [doc, startScript, status]);

  // Where the player is standing is kept for the next session, without a write
  // per step: the save picks up the last known tile when it next files anything.
  useEffect(() => {
    const remember = () => {
      if (!seated.current) return;
      setPos({
        x: Math.round(player.current.x / TILE_PX),
        y: Math.round(player.current.y / TILE_PX),
      });
    };
    const id = setInterval(remember, 4000);
    return () => {
      remember();
      clearInterval(id);
    };
  }, [setPos]);

  // ── The frame ───────────────────────────────────────────────────────────
  const update = useCallback(
    (dt) => {
      tRef.current += dt;
      const state = uiRef.current;
      const blocked = !!(state.dialogue || state.menu || state.card);
      const body = player.current;
      const now = performance.now();

      if (!blocked) {
        const held = intents.current;
        let dx = 0;
        let dy = 0;
        if (held.up) dy -= 1;
        if (held.down) dy += 1;
        if (held.left) dx -= 1;
        if (held.right) dx += 1;
        if (held.nudge && held.until > now) {
          if (held.nudge === "left") dx -= 1;
          if (held.nudge === "right") dx += 1;
          if (held.nudge === "up") dy -= 1;
          if (held.nudge === "down") dy += 1;
        } else if (held.nudge) {
          held.nudge = null;
        }

        if (dx || dy) {
          const len = Math.hypot(dx, dy) || 1;
          const step = SPEED * dt;
          const mx = (dx / len) * step;
          const my = (dy / len) * step;
          if (canStand(GRID, body.x + mx, body.y)) body.x += mx;
          if (canStand(GRID, body.x, body.y + my)) body.y += my;
          body.dir = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
          body.moving = true;
          body.step += step;
          if (body.step > 7) {
            body.step = 0;
            body.frame = body.frame === 1 ? 2 : 1;
          }
        } else {
          body.moving = false;
          body.step = 0;
          body.frame = 0;
        }
      } else {
        body.moving = false;
        body.frame = 0;
      }

      // The camera watches whoever is speaking, and the player otherwise.
      const focus = state.dialogue?.focus;
      const want = clampCamera(
        (focus?.x ?? body.x) - (VIEW_W * TILE_PX) / 2,
        (focus?.y ?? body.y) - (VIEW_H * TILE_PX) / 2,
        VIEW_W * TILE_PX,
        VIEW_H * TILE_PX,
      );
      const lerp = blocked ? 0.07 : 0.16;
      cam.current.x += (want.x - cam.current.x) * lerp;
      cam.current.y += (want.y - cam.current.y) * lerp;

      // Life: a bob for everyone standing, and a dog on a patrol.
      const t = tRef.current;
      npcs.current.forEach((npc) => {
        npc.frame = Math.floor(t * 1.7 + npc.x * 0.05) % 3;
        if (!npc.wander) return;
        const wander = npc.wander;
        wander.dir = wander.dir || 1;
        npc.x += wander.dir * wander.speed * dt;
        const min = wander.x0 * TILE_PX + 8;
        const max = wander.x1 * TILE_PX + 8;
        if (npc.x <= min) {
          npc.x = min;
          wander.dir = 1;
        }
        if (npc.x >= max) {
          npc.x = max;
          wander.dir = -1;
        }
        npc.dir = wander.dir > 0 ? "right" : "left";
      });

      // The only thing in the frame that touches React: a line still arriving.
      const dialogue = state.dialogue;
      if (dialogue) {
        const beat = dialogue.beats[dialogue.index];
        const length = (beat?.line || "").length;
        if (dialogue.typed < length) {
          const next = Math.min(length, dialogue.typed + (dt * 1000) / TYPE_MS);
          if (next - dialogue.typed >= 0.5) {
            setUi((current) =>
              current.dialogue ? { ...current, dialogue: { ...current.dialogue, typed: next } } : current,
            );
          }
        }
      }
    },
    [],
  );

  const state = useMemo(
    () => ({
      grid: GRID,
      objects: OBJECTS,
      doc: doc || { day: 1, hours: HOURS_PER_DAY, nodes: {} },
      fitted: doc?.installed?.length || 0,
      total: TOTAL_FITS,
      carbFitted: (doc?.installed || []).includes("carb"),
      opened: (doc?.visited || []).includes("hangar"),
      lit: (doc?.hours ?? HOURS_PER_DAY) <= 2,
      markers: (() => {
        const list = {};
        if (!doc) return list;
        const stats = statsFor(doc);
        Object.keys(CAST).forEach((key) => {
          if (key === "you") return;
          const route = npcScript(key, doc, stats);
          if (!route) return;
          if (route === "marla_wing") list[key] = "!";
          else if (route.endsWith("_turnin")) list[key] = "?";
          else if (route.endsWith("_first")) list[key] = "!";
        });
        return list;
      })(),
    }),
    [doc, statsFor],
  );

  return {
    ui,
    state,
    refs: { npcs, player, cam, t: tRef },
    update,
    act,
    choose,
    rotate,
    page,
    hold,
    release,
    moveCursor,
    openMenu,
    closeMenu,
    setMenuTab,
    buildAtBench,
    dropToast,
    mapSize: { w: MAP_W, h: MAP_H },
  };
}