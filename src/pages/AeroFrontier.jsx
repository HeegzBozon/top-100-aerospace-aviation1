import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { B } from "@/components/fellow-home/fellowHomeConfig";
import useGlass from "@/hooks/useGlass";
import { registerPicker } from "@/components/handheld/handheldPicker";
import { AERO } from "@/components/aero-frontier/aeroConfig";
import { reachable } from "@/components/aero-frontier/aeroEngine";
import { GRID } from "@/components/aero-frontier/aeroMap";
import useAeroFrontier from "@/components/aero-frontier/useAeroFrontier";
import useAeroWorld from "@/components/aero-frontier/useAeroWorld";
import AeroOpening from "@/components/aero-frontier/AeroOpening";
import AeroWorldCanvas from "@/components/aero-frontier/AeroWorldCanvas";
import AeroGameHud from "@/components/aero-frontier/AeroGameHud";
import AeroDialogue from "@/components/aero-frontier/AeroDialogue";
import AeroMenu from "@/components/aero-frontier/AeroMenu";
import AeroTitleCard from "@/components/aero-frontier/AeroTitleCard";

// Aero-Frontier. Hollow Field, walked at ground level: nine acres, one hangar, a
// monoplane under a tarp, and the five people who knew the person who left it to
// you. Salvage is carried, the bench turns it into parts, the machine takes them,
// and the field's own log keeps the account.
//
// The console drives it, not the glass: the click wheel on the chin is the stick —
// hold a zone and you walk that way, slide your thumb round the ring and the walk
// turns with it — the centre button (and A) acts on whatever you are facing, B
// backs out of a line or a panel, and holding the centre still goes home. Inside
// the kit the same four zones are a D-pad: up and down walk the list and repeat
// while held, left and right change tab. On a desk the keyboard does the same job.
const WHEEL_PRINTS = { up: "▲", left: "◀", right: "▶", down: "▼" };
const DESK_FRAME = "h-[70vh] min-h-[520px]";

export default function AeroFrontier() {
  const glass = useGlass();
  const save = useAeroFrontier();
  const world = useAeroWorld({ doc: save.doc, status: save.status, apply: save.apply, setPos: save.setPos });

  // The ring, as a joystick. On the field a held zone is the walk; in a line or a
  // panel the zones are a D-pad, and a hold repeats so a long list is one press.
  const repeat = useRef(0);
  const steer = (dir, on) => {
    if (!on) {
      clearInterval(repeat.current);
      repeat.current = 0;
      world.hold(dir, false);
      return;
    }
    if (world.ui.card) return;
    if (world.ui.menu) {
      if (dir === "left") return world.setMenuTab(-1);
      if (dir === "right") return world.setMenuTab(1);
    } else if (!world.ui.dialogue) {
      world.hold(dir, true);
      return;
    }
    if (dir === "left" || dir === "right") return;
    world.hold(dir, true);
    clearInterval(repeat.current);
    repeat.current = setInterval(() => world.hold(dir, true), 190);
  };

  useEffect(() => () => clearInterval(repeat.current), []);

  // A live handle for the console: the wheel asks this object every time, so the
  // field is never driven by a stale render.
  const handle = useRef({});
  handle.current = {
    rotate: (step) => world.rotate(step),
    page: (step) => world.page(step),
    steer,
    enter: () => {
      world.act();
      return true;
    },
    back: () => {
      if (world.ui.card) {
        world.act();
        return true;
      }
      if (world.ui.menu) {
        world.closeMenu();
        return true;
      }
      // A scene is not something to back out of; B leaves the field instead.
      return !!world.ui.dialogue;
    },
  };

  useEffect(() => {
    if (!glass) return undefined;
    return registerPicker({
      labels: () => [],
      index: () => 0,
      goTo: () => null,
      step: (step) => {
        handle.current.rotate(step);
        return null;
      },
      page: (step) => {
        handle.current.page(step);
        return null;
      },
      enter: () => handle.current.enter(),
      back: () => handle.current.back(),
      // The wheel on the chin, handed over as a stick: its four prints, and the
      // zone under the thumb reported as a direction while it is held down.
      steer: {
        prints: WHEEL_PRINTS,
        hold: (dir, on) => handle.current.steer(dir, on),
      },
    });
  }, [glass]);

  useEffect(() => () => world.release(), [world]);

  if (save.status === "loading") return <AeroOpening />;

  if (save.status === "failed" || !save.doc) {
    return (
      <AeroOpening
        label="The field would not open"
        note="The save could not be read this time. Nothing has been lost; the field is still there."
        onRetry={save.retry}
      />
    );
  }

  const body = world.refs.player.current;
  const atBench = (() => {
    const target = reachable(GRID, body.x, body.y, body.dir);
    return target?.key === "bench" || target?.station === "bench";
  })();

  const act = (optionIndex) => (typeof optionIndex === "number" ? world.choose(optionIndex) : world.act());

  const game = (
    <div className={`relative flex min-h-0 flex-1 flex-col overflow-hidden ${glass ? "" : "rounded-2xl"}`}
      style={{ background: AERO.night, border: glass ? "none" : `1px solid ${B.border}` }}>
      <AeroGameHud
        doc={save.doc}
        synced={save.synced}
        ui={world.ui}
        onToastDone={world.dropToast}
      />

      <div className="relative flex min-h-0 flex-1 flex-col px-2 py-2">
        <AeroWorldCanvas world={world} />
      </div>

      <div className="shrink-0 pb-1.5 pt-0.5" style={{ borderTop: `1px solid ${AERO.line}` }}>
        <p
          className="af-readout text-center text-[7.5px] font-bold uppercase tracking-[0.16em]"
          style={{ color: AERO.muted }}
        >
          {glass ? "Ring ▲▼◀▶ walk · Select act · B back" : "WASD walk · Enter act · I C Q L · Esc"}
        </p>
      </div>

      <AeroDialogue ui={world.ui} inventory={save.doc.inventory} onAct={act} />

      <AeroMenu
        doc={save.doc}
        ui={world.ui}
        atBench={atBench}
        onClose={world.closeMenu}
        onTab={(tab) => world.openMenu(tab)}
        onCursor={(step) => world.moveCursor(step)}
        onPick={(index, key) => {
          world.moveCursor(index - (world.ui.menu?.cursor ?? 0));
          if (key) world.buildAtBench(key);
        }}
      />

      <AeroTitleCard card={world.ui.card} />
    </div>
  );

  if (glass) return <div className="relative flex h-full flex-col">{game}</div>;

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[7.5px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
            TOP 100 · A surface built for play
          </p>
          <h1 className="mt-1 font-heading text-[24px] leading-none" style={{ color: B.navy }}>
            Aero-Frontier
          </h1>
          <p className="mt-1.5 text-[11px]" style={{ color: B.muted }}>
            Act I · The Inheritance · Hollow Field
          </p>
        </div>
        <Link
          to="/"
          className="flex shrink-0 items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.16em] transition-opacity hover:opacity-70"
          style={{ color: B.copper }}
        >
          <ArrowLeft className="h-[11px] w-[11px]" /> Title screen
        </Link>
      </div>

      <div className="mt-4">
        <div className={`${DESK_FRAME} flex flex-col`}>{game}</div>
      </div>

      <p className="mt-3 text-[10.5px] leading-relaxed" style={{ color: B.muted }}>
        On the handheld the click wheel is the stick: hold a zone to walk, slide your thumb round the ring
        and the walk turns, press the centre to act, and B to back out. Take what the scrub gives up, build
        at the bench behind the shed, and fit it to the machine under the tarp. Nothing worked on this field
        is read by discovery, ranking or scoring: play stays play.
      </p>
    </div>
  );
}