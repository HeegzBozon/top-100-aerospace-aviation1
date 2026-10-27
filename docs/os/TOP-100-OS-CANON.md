# TOP 100 OS — Canonical Interface Specification

**Status:** CANONICAL (v1.0, 2026-10-27)
**Scope:** every surface in the platform, on both machines.
**Precedence:** this document governs interface structure. `docs/governance/TOP100-Governance.md` governs measurement, selection, and data. Where the two meet, governance wins.

---

## 1. Thesis — the platform is a virtual computer

TOP 100 is **not a website with pages**. It is a **virtual computer that a Fellow sits down at**.

- The machine is the product. Pages are *applications the machine runs*.
- A Fellow does not "browse to a page". They **change what is on the screen** of a machine that stays put.
- Orientation is permanent: the menu bar, the clock, the lamp on the current surface, the shelf of applications, and the way home are always in the same place.
- The machine is inherited, not summoned: a surface never arrives in a different computer than the one it left.

This is the organising metaphor for every interface decision. If a change makes the product read more like a dashboard of routes and less like a machine someone is operating, it is wrong regardless of how good it looks.

### Brand expression of the thesis

Vogue meets NASA, expressed as hardware: **an institutional instrument.** Warm cream paper inside a machined moulding. Rose gold and copper fittings. No gloss, no glow, no floating chrome. Print-quality editorial inside a device that looks like it costs money.

---

## 2. Two machines, one operating system

| | **Desk machine** (viewport ≥ 768px) | **Handheld** (viewport < 768px) |
|---|---|---|
| Housing | `components/desktop/ImacHousing` — room → moulding → crown → tube glass → chin | `components/handheld/HandheldShell` — stage → glass → chin |
| Shell mount | `components/desktop/DesktopShell` | `components/handheld/HandheldShell` |
| Menu seat | `components/desktop/DesktopMenuBar` (head of the tube, sticky) | `components/handheld/ScreenTopBar` (rail cut across the head of the glass) |
| Launcher | `components/desktop/DesktopDock` (the shelf, mounted once by `DesktopShell`) | `components/handheld/HandheldDeck` (wheel, face keys, drawers) + `handheldDestinations` |
| Input model | pointer + keyboard; menu + shelf | wheel, four face keys, centre key (hold = home) |
| Finish | `useImacFinish` packs, `imac.css` | `hh-*` finish tokens in `src/index.css` |
| Opening | `AppSplash` title card, `as-*` sequence | power-on (`hh-boot`, `hh-flicker`) inside the glass |

**Rule: one machine on screen, never two, never none.** The split is made once, in `useIsMobile()`. A surface must never detect the viewport itself to decide which chrome to draw.

**Rule: the machines are siblings, not a desktop with a mobile fallback.** Both are first-class. A feature is not finished until it has been walked on both.

---

## 3. The shared spine

These modules are the operating system. They are **single-source-of-truth**: a surface consumes them, never copies them, never forks them.

| Concern | Canonical module | Notes |
|---|---|---|
| Shell mount | `src/App.jsx` route tree | `HandheldShell` → `DesktopShell` → routes. Pages never mount chrome. |
| Menu bar (the object) | `components/shell/MenuBar.jsx` | **One bar, two seats.** Consumed by `DesktopMenuBar` and `ScreenTopBar`. |
| Menu model | `components/shell/barMenus.js` | The named menus that exist on both machines. |
| File / Edit + per-surface commands | `components/shell/surfaceFileMenu.js` | `registerSurfaceFileGroups` / `registerSurfaceEditGroups`. A surface adds its own commands here so they appear identically on desk and glass. |
| Menu drop-down | `components/shell/MenuDropdown.jsx` | Used by the desk seat. |
| Clock | `components/shell/MenuBarClock.jsx` | Inside `MenuBar` — therefore on both. |
| Operator lens (view-as-visitor) | `components/shell/ViewAsCell.jsx` + `lib/viewerPreview.js` | Admin only. Answers to the **record**, not to the reading. |
| Notifications | `components/notifications/NotificationCenter.jsx` | Reached from the bar, not from a page header. |
| **Application registry** | `components/shell/appRegistry.js` | **The one list of applications the machine runs** (`APP_GROUPS`, `SHELF`, `INDEX_GROUPS`). Every launcher reads it. |
| Desk shelf | `components/desktop/DesktopDock.jsx` | Mounted **once**, at shell level; draws `SHELF` + `INDEX_GROUPS` from the registry. |
| Glass launcher | `components/handheld/handheldDestinations.js` + `useHandheldDestinations.js` | `NAVIGATOR_GROUPS` (= registry) + admin-configured `RailItem` rail. |
| Hardware keys | `components/handheld/handheldKeys.js` | A surface claims the face keys here (`useFaceKeysClaimed`), so the rail drops its hints while they are taken. |
| Case finish | `useImacFinish`, `imac.css`, `deskDock.css`, `hh-*` tokens | One finish recasts the machine; nothing hard-codes a colour. |
| Page transition | `components/core/PageTurn.jsx` | The sheet that peels on every surface change. |
| Opening | `components/core/AppSplash.jsx` | Title card, once per session. |
| Loading | `components/core/ConsoleLoading.jsx`, `SurfaceLoader.jsx` | The machine is painted first; the wait happens inside its glass. |
| Immersive surfaces | `components/shell/immersiveSurfaces.js` | One policy, read by the shells: the desk stands the shelf back, the glass keeps its console. |
| Machine services | `components/core/MachineProviders.jsx` | Theme, conversations, unread, comms theme, sidebar — mounted once above the router. No page layout owns them. |

---

## 4. The app contract — rules for building any surface

1. **Route inside the shells.** Every new route is a child of `DesktopShell`/`HandheldShell` in `src/App.jsx`. A route rendered outside them is not an application on the machine; it is a leak.
2. **No private chrome.** A surface must not render its own top bar, sidebar, nav, footer, logo, or menu. The bar belongs to the machine. A surface that needs a command adds it to `barMenus` / `surfaceFileMenu`.
3. **Orientation is provided, not invented.** The lamp, the surface name, the section suffix, the clock, the way home — supplied by `MenuBar`. Nothing re-states them inside the picture.
4. **Respect the window.** On the glass, bottom-anchored elements ride the chin via `.hh-lift` / `.hh-lift-center` / `.hh-lift-right`, and read `--hh-top`, `--hh-bottom`, `--hh-foot`, `--hh-glass-inset`. Never hard-code a viewport offset.
5. **Colour comes from tokens.** `--editorial-*`, `--hh-*`, `--fd-*`. No raw hex in a component; no ad-hoc palette. Copper for structural rules and primary buttons; rose gold for masthead and secondary accents.
6. **Immersive is declared, not improvised.** A surface that needs the whole picture is added to `components/shell/immersiveSurfaces.js`. Never hide the machine from inside a page.
7. **The three states are built.** Loading, empty, and error are designed surfaces, not placeholders or a spinner in the corner.
8. **The machine persists across a surface change.** Data lives in entities; a surface never re-invents state the machine already holds (`AuthContext`, `viewerPreview`, finish, draft).
9. **Both machines, one story.** New work is walked on desk and handheld before it is called done.
10. **Nothing floats over the picture.** No fixed widgets, no floating chat bubbles, no cookie-bar furniture. If it is needed, it belongs on the shelf, in the menu, or in the drawer.

---

## 5. Vocabulary (interface grammar)

| Say | Not |
|---|---|
| surface, application, app (on the shelf) | page, screen, view |
| the machine, the computer | the site, the app shell |
| the tube / the glass (per machine) | the window, the viewport |
| the shelf (desk dock), the drawer (expanded shelf) | dock, nav rail |
| the rail (glass top bar), the strip | header, navbar |
| the wheel, the face keys, the centre key | controls, buttons |
| the finish (case colour) | theme |
| the seal (the one primary action) | CTA, button |

Content vocabulary is unchanged and still binding: **endorsers** (never followers), **endorsements** (never likes), we **measure** (individuals rank), **Patron of Record** (never Sponsored by), the availability layer is an **expert network** of **introductions**, never a marketplace.

---

## 6. Audit register — verified state of the spine (2026-10-27)

Verified by reading the route tree and every consumer of the chrome modules.

### Wired correctly ✅

- **Every route renders inside both machines.** The whole route table in `src/App.jsx` sits inside `<Route element={<HandheldShell />}>` → `<Route element={<DesktopShell />}>`. No page mounts its own shell, dock, or bar (grep for `DesktopDock` / `ScreenTopBar` / `MenuBarClock` under `src/pages` returns nothing).
- **One menu, two seats.** `shell/MenuBar.jsx` is the only bar implementation, consumed by `DesktopMenuBar` and `ScreenTopBar`. The clock and the admin operator lens ride it on both machines.
- **One menu model.** `shell/barMenus.js` and `shell/surfaceFileMenu.js` are shared by `DesktopMenuBar` *and* `HandheldDeck`, including per-surface command registration (`useIssueFileMenu`, `useIssueEditMenu`).
- **The shelf is part of the desk, not of a page.** `DesktopDock` is mounted once in `DesktopShell` beside the tube, with `FULL_BLEED` standing it back for immersive surfaces.
- **One machine at every moment.** `HandheldShell` puts the console away for the keyboard and on request (`setPutAway`); `CommsLayoutMobile` reuses that context instead of building a second device.
- **The chassis and the loading state are the same machine.** `ConsoleLoading` / `AppSplash` / `PageTurn` are mounted at app level, above the router's surfaces.

### Gaps — all closed on 2026-10-27 ✅

Fixed in the change that ratified this document; verified in code.

1. **Legacy comms layout retired.** `grep -c LayoutWrapper src/App.jsx` is 0. The provider stack lives in `components/core/MachineProviders.jsx`, mounted once above the router, so a route renders its own content and nothing else. `CommsLayoutDesktop`, `CommsLayoutMobile` and `PublicLayout` are deleted. `/Comms` is now an ordinary surface (`src/pages/Comms.jsx`) that owns its view and asks the console to step aside only while a message is composed on a phone.
2. **One dock.** `components/dock/DesktopDock.jsx`, `components/capabilities/dock/DesktopDock.jsx` and the barrel that re-exported it are deleted; `components/desktop/DesktopDock.jsx` is the only shelf.
3. **One launcher registry.** `components/shell/appRegistry.js` declares the applications once. Desk shelf, index drawer and glass navigator all read it, so a surface added there is reachable on both machines.
4. **Immersive declared once.** `components/shell/immersiveSurfaces.js` holds the policy; the desk stands the shelf back, the glass keeps its console.
5. **One list, not four.** `pagesConfig` now only routes. Title-screen keys remain a curated front row — ordered for the reading, not a launcher.

---

## 7. Migration backlog

**Closed 2026-10-27 — all four items. See §6.**

### Watching (keep these from creeping back)

- `components/comms/Drawer.jsx`, `components/comms/CommsIconRail.jsx` and `components/comms/MobileHomeView.jsx` are unreferenced leftovers of the retired layout; delete on sight.
- `pagesConfig` still exports a `Layout`; `src/Layout.jsx` is a passthrough and must stay empty.
- The glass keeps its console on immersive surfaces by design. Do not "fix" that.
- No launcher may declare its own application list again. Add to `appRegistry.js`.

---

## 8. Definition of done — any interface change

- [ ] Renders inside the shells; no private header, nav, or footer.
- [ ] Commands that belong to the machine are registered in `barMenus` / `surfaceFileMenu`, and appear on both machines.
- [ ] Bottom-anchored elements ride the chin via `hh-lift*`; no hard-coded offsets.
- [ ] Colour and type from tokens only; `bg-primary`-style mapped classes, no raw hex.
- [ ] Loading, empty, and error states designed.
- [ ] Walked at 402px (handheld) and at desk width, on the same branch.
- [ ] No new chrome: nothing floats over the picture.
- [ ] Vocabulary from §5; content vocabulary from governance.

---

*This document is the brand book for the machine. When a build decision is not covered here, the answer is: what would a well-made physical instrument do?*