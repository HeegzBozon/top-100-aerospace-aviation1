# The deck key — documentation

**Branch:** `speaker-focus-style`
**Written:** 2026-11-09
**Status:** built and verified on the branch; nothing reaches the published app until this branch is merged to `main` and published from there.

---

## 1. What it is

A handheld is a thing you put down. The deck key is the one control that does not go down with it: a single round copper key, floating at the foot of the picture, that lowers the whole hardware set — the chin, the wheel (or the radio's keypad), the speaker and the readout band — and puts it back with the same press.

It is the machine's own key, not a surface's. It stands on every route, on both machines, all the time. Nothing of a surface's content is taken away to make room for it.

- **Press once (case up):** the case goes away. The surface fills the whole of the phone's glass, or the whole of the desk's tube. The key settles onto the foot of the picture, lit, as the only thing left to press.
- **Press again:** the case comes back exactly as it was, in the same position, with the same face (wheel or radio) it had before.

---

## 2. Where it lives

`src/components/handheld/DeckPowerKey.jsx` — a 30-line component that renders a single `<button>` **through a portal onto `document.body`**.

It is deliberately *not* mounted inside the deck. The deck is drawn inside drawers, sheets and fixed frames, several of which clip their own overflow; a key placed inside any of them disappears with the frame that holds it. On the document, it stands over the picture whatever frame, drawer or sheet the case is drawn inside.

It draws no state of its own. `standing` and `onToggle` are handed down from the shell.

---

## 3. Who owns the state

| File | Role |
| --- | --- |
| `src/components/handheld/HandheldShell.jsx` | **Owns `hardwareOn`.** One `useState(true)` for the whole machine. Also owns the press (`toggleHardware`), the blip and haptic on a phone, and decides where the key is rendered. |
| `src/components/handheld/DeckPowerKey.jsx` | The key itself. Presentation and accessible naming only. |
| `src/components/handheld/HandheldDeck.jsx` | Takes `deckOn` and `onToggle` as props. No longer owns the toggle or the key; the case is now something the shell lowers, not something the deck decides about itself. |
| `src/components/desktop/DesktopShell.jsx` | Reads `hardwareOn` from the same context and stands its machinery back when the case is down. |

State lives in the shell, not the deck, for one reason: **the deck is what the key lowers**, so the state cannot live inside the thing it removes from the picture. The shell sits above the deck in the tree and survives the deck unmounting.

The context value the shell already published (`useDevice`) now carries `hardwareOn` alongside `inside`, so no second provider, no second store, and no new context was introduced. On the desk the shell publishes a desk-shaped value (`inside: false`, `hardwareOn`) so `DesktopShell` can read the same switch without claiming to be the device.

---

## 4. Behaviour

### On a phone (`HandheldShell`)

```
{!putAway && hardwareOn && <HandheldDeck deckOn={hardwareOn} onToggle={toggleHardware} />}
{!putAway && <DeckPowerKey standing={hardwareOn} onToggle={toggleHardware} />}
```

The case is **unmounted**, not hidden. That is what closes its drawers, search, notifications and readout in one movement, with nothing left behind to reopen. Playback is not lost with it: the record belongs to the sound module's own player (`consoleMusic.js`, module-level state), not to the plate, so lowering the case does not stop the music.

With the deck unmounted its layout effect releases, and every `--hh-*` geometry token is handed back to `0px`. The `hh-shell` body class comes off. The practical result:

- `--hh-bottom` returns to `0`, so the picture's window (`--hh-glass-inset`, `--hh-top`, `--hh-bottom`) opens to the edges of the viewport. The surface gets the whole screen.
- The key's own `bottom` is measured from the same tokens, so as the case leaves, the key travels down with it and comes to rest 10px above the foot of the freed picture, plus the safe-area inset on a notched phone.
- While the keyboard is up, `--hh-bottom` is re-declared by the keyboard, and the key follows it — it never sits on top of the keys.

### On the desk (`DesktopShell`)

```jsx
if (hardwareOn === false) return <Outlet />;
```

The desk's tube, chin, dock and chrome stand back and the surface is rendered bare, edge to edge. The key is rendered by the same shell, on the same `hardwareOn`, so the one key on the desk's picture puts the whole desk machine away and brings it back. This is the only place the desk shell takes a decision from the handheld shell's context.

---

## 5. Styling

`.deck-power-key` in `src/styles/handheldHardware.css`. **Tokens only** — no hex, no `bg-white`, no inline colour:

- Body: `--hh-metal-1` → `--hh-metal` → `--hh-metal-2` (the wheel's own centre metal, so the key reads as struck from the same stock as the case).
- Print: `--hh-key-1`.
- Edge and depth: `--hh-ink-rgb` hairline, inset top light, drop shadow.
- Placement: `calc(var(--hh-bottom, 0px) + var(--hh-foot, 0px) + env(safe-area-inset-bottom) + 10px)` on a phone; `calc(var(--imac-bottom, 24px) + 12px)` from 768px up, so it rides the desk's own chin.
- `z-index: 49` — above the picture and the deck's frames, below the opening card (46 is the app opening's frame, 80 on the desk) and below a Radix panel lifted to 70 for the wheel.
- 44 × 44px touch target, `border-radius: 9999px`.
- States: hover lifts 1px, active presses to 0.94, `[data-away="true"]` adds the copper ring that says *this is the only thing left to press*, and `:focus-visible` draws cream-then-copper rings.

Motion is confined to the press: `transition: transform, box-shadow 160ms`, and both are switched off under `prefers-reduced-motion`.

---

## 6. Accessibility

- Real `<button type="button">`, keyboard reachable, activated by Enter/Space.
- `aria-pressed` reports the state (true = case is away), so it is a genuine toggle rather than a mystery button.
- `aria-label` and `title` both change with the state: *"Put the console away"* / *"Bring the console back"* — the label describes what the press does, not the state it is in.
- The glyph is `aria-hidden`; the words carry the meaning.
- No hover-only affordance, no right-click, no new tab, no browser back as the only escape — one press each way, from wherever the reader is standing.
- Contrast comes from the copper key against cream print, the same pairing the wheel's centre button already uses.

---

## 7. Store-build compliance

| Rule | How this meets it |
| --- | --- |
| Works without a browser | One tap, both directions. No gesture, no context menu, no download. |
| Never assumes a new window | Nothing opens; the change is on the picture itself. |
| Permissions earned at a tap | None requested. |
| Local storage is not the record | No persistence at all — the switch is a session state, and nothing about the record depends on it. |
| Account deletable, UGC reportable, Apple sign-in | Untouched by this change. |

---

## 8. What it deliberately does not do

- **No new entity, function, route, context or provider.** No schema, no RLS, no backend call.
- **No governance field is read or written.** The key is presentation only: it does not touch discovery, directory ordering, measurement, verification display, availability or sponsorship, and cannot.
- **No persistence across reload.** Closing the tab and returning puts the case back up. This is intentional: the machine you arrive at should be the machine, and a preference for it is not worth a record.
- **No content is hidden.** Lowering the case takes the hardware away and nothing else; every surface, every route and every way back stays exactly where it was.
- **No second key.** There is one switch and one button. Surfaces and the deck itself do not draw their own.

---

## 9. Known limits — read before merging

1. **A surface can still take the key away with the case.** `Comms.jsx` calls `device.setPutAway(composerActive)` to clear the glass while its composer is open, and the key follows that rule (`{!putAway && <DeckPowerKey …>}`). So on the Comms surface, with the composer open, neither the case nor the key is shown. If the key must be sovereign — never absent while the machine is running — the fix is to render it outside the `putAway` condition. Not done here, because it changes what the Comms composer is for.
2. **The state is not persisted.** The case returns up on reload (see §8).
3. **`onToggle` is passed to `HandheldDeck` but not used inside it.** The deck no longer draws a key, so the prop is currently only carried for symmetry. It can be dropped, or the speaker's own sound key can be wired through it, but nothing reads it today.
4. **`--hh-bottom` is released to `0px` on unmount, not to the deck's own depth.** Correct while the case is away; worth knowing if any future surface expects to read the deck's clearance while the hardware is down.

---

## 10. Verification performed

- `npx vite build` completes; the only output is Tailwind's pre-existing ambiguity warnings for `duration-[20s]` and `ease-[cubic-bezier(...)]`, which are not from this change.
- The built stylesheet was read back to confirm both placements survived the build: the phone rule resolving against `--hh-bottom / --hh-foot / safe-area`, and the desk rule against `--imac-bottom` at `min-width: 768px`.
- The press was traced end to end: shell state → deck unmount → geometry tokens released → picture opens to the viewport → key re-seats at the foot → same state lowers the desk's machinery.
- Not walked on a physical phone. The 373px preview shows the key in place; a device pass on the merge target is the remaining check.

---

## 11. Files in the change

```
src/components/handheld/DeckPowerKey.jsx         +30   the key (new)
src/components/handheld/HandheldShell.jsx        +35 -2   owns the state, renders the key, sounds the press
src/components/handheld/HandheldDeck.jsx         +24 -4   takes deckOn / onToggle; releases geometry when down
src/components/desktop/DesktopShell.jsx           +5     stands its machinery back on the same state
src/styles/handheldHardware.css                 +124    .deck-power-key, states, placements, reduced motion
src/components/handheld/HandheldSpeaker.jsx       +5 -2   the plate's focus box struck; framed flag
src/components/handheld/radio/RadioSpeaker.jsx    +2 -1   the same strike on the radio's sound cap
```

### Companion change on the same branch

The speaker plate in the deck was a square outline that read as part of the face; it was the browser's own focus outline, standing permanently around a button that always holds focus on a device pressed rather than typed into. It is struck in every state, and keyboard focus now lights the well's copper circle instead. The one surface where the record is set into a frame is the Colony, where the fitting is a machined square cut into the moulding (`data-framed="true"`, set when the route is `/Colony`). Nothing else on the machine wears it.

---

## 12. Merging

This is a branch. The key is live in the editor's preview; it reaches the published app only after **Merge to main** (top of the chat panel) and then **Publish** from `main`. Items §9.1–§9.3 are the decisions worth settling before that merge, not after.