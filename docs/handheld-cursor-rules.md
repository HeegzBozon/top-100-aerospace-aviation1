# The Cursor Law

Where the click wheel's cursor wraps, and where it stops. These are the rules the
handheld console follows on every surface. They are deliberately few, and they
are not taste: each one follows from how a person reads the glass.

## The five rules

**1. A list stops at its ends.**
Any cursor walking an ordered set of things — panels, keys, cards, options,
entries — stops at the first and at the last. A further turn leaves the cursor
where it stands and falls through to the glass, so the wheel still does
something useful at the end of a list (it scrolls the page) instead of
teleporting.

**2. Wrapping is an exception, never a default.**
A wrap would only be correct when the set is a *closed control* rather than an *index
of destinations*: every option already on the glass, the set cyclic by nature, and
travelling around it what the control is for. Nothing on this device qualifies today —
every list of surfaces, panels, cards, drawers, modules or options stops, the
console's own drawer included, which bumps at its first and its last entry the way the
end of a page bumps. A wrap would have to justify itself here before any code moves.

**3. If a set scrolls, it never wraps.**
The moment a set runs past the glass — a long panel menu, a card column, a
roster, a feed — a wrap is a silent teleport: from something you can see to
something you can't, over distance you never travelled. Stop at the end and let
the glass take the turn, which is where reading on belongs.

**4. If the whole set is on the glass, the ends are the point.**
On a set that fits one screen (the title screen's six surfaces, a six-panel
console), the top and the bottom are visible. Stopping there reads as a
boundary — you can see there is nothing above. Wrapping in that situation hides
the edge the user is using to orient themselves.

**5. A stop is announced like a move.**
The rail names the option the ring landed on, and a stop at an end names that
end's own label. A surface that can stop should look like it stopped, and its
legend on the glass says how the ends behave.

## Applying it, by surface type

| Surface type | Behaviour | Where |
| --- | --- | --- |
| Console panel menu (index of panels) | Stops at the ends; a turn past the end scrolls the panel/page | `GlassConsole` — Profile, Selection Committee |
| Title-screen surface keys | Stops at the ends | `StartScreen` |
| Board cards, and the columns across | Stops at the ends in both axes | `useBoardCards` — The Board |
| Console's own drawer (home menu, File, Edit) | Stops at the ends; the ring bumps at the first and the last entry | `HandheldDeck` |
| A page of prose (deck) | Not a picker at all: rotation scrolls the picture | `ModuleSlideDeck` |

Two consequences worth keeping in mind when a new surface is built:

- **Layouts differ, the law doesn't.** A menu, a grid of keys, a card column and
  a slide deck are different shapes, but the cursor behaves identically: it walks
  its own ordered set and stops at the ends. Only the fall-through differs — the
  turn that is declined goes to whatever scrolls in front of the user.
- **Left and right keys are separate from rotation.** Back and forward on the
  ring (`page`) move between neighbours — columns, groups — and stop at their
  ends too, so rotation is never the only bounded axis.

## Implementing a picker

Register with `registerPicker` (`src/components/handheld/handheldPicker.js`).
Return `null` from `step`/`page` at the ends of the list rather than computing a
modulo, so the console hands the turn to the glass:

```js
step: (direction) => {
  const target = cursorRef.current + direction;
  if (target < 0 || target >= list.length) return null; // the law, in one line
  setCursor(target);
  return list[target].label; // the rail announces where the ring landed
},
`