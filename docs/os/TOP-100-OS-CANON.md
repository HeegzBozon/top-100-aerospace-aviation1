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
| Desk shelf | `components/desktop/DesktopDock.jsx` | Mounted **once**, at shell level. |
| Glass launcher | `components/handheld/handheldDestinations.js` + `useHandheldDestinations.js` | `NAVIGATOR_GROUPS` + admin-configured `RailItem` rail. |
| Hardware keys | `components/handheld/handheldKeys.js` | A surface claims the face keys here (`useFaceKeysClaimed`), so the rail drops its hints while they are taken. |
| Case finish | `useImacFinish`, `imac.css`, `deskDock.css`, `hh-*` tokens | One finish recasts the machine; nothing hard-codes a colour. |
| Page transition | `components/core/PageTurn.jsx` | The sheet that peels on every surface change. |
| Opening | `components/core/AppSplash.jsx` | Title card, once per session. |
| Loading | `components/core/ConsoleLoading.jsx`, `SurfaceLoader.jsx` | The machine is painted first; the wait happens inside its glass. |
| Immersive surfaces | `components/desktop/DesktopShell.jsx` → `FULL_BLEED` | Surfaces that own the whole tube put the shelf away. |

---

## 4. The app contract — rules for building any surface

1. **Route inside the shells.** Every new route is a child of `DesktopShell`/`HandheldShell` in `src/App.jsx`. A route rendered outside them is not an application on the machine; it is a leak.
2. **No private chrome.** A surface must not render its own top bar, sidebar, nav, footer, logo, or menu. The bar belongs to the machine. A surface that needs a command adds it to `barMenus` / `surfaceFileMenu`.
3. **Orientation is provided, not invented.** The lamp, the surface name, the section suffix, the clock, the way home — supplied by `MenuBar`. Nothing re-states them inside the picture.
4. **Respect the window.** On the glass, bottom-anchored elements ride the chin via `.hh-lift` / `.hh-lift-center` / `.hh-lift-right`, and read `--hh-top`, `--hh-bottom`, `--hh-foot`, `--hh-glass-inset`. Never hard-code a viewport offset.
5. **Colour comes from tokens.** `--editorial-*`, `--hh-*`, `--fd-*`. No raw hex in a component; no ad-hoc palette. Copper for structural rules and primary buttons; rose gold for masthead and secondary accents.
6. **Immersive is declared, not improvised.** A surface that needs the whole tube is added to `FULL_BLEED` in `DesktopShell` (and, for the glass, hidden via `setPutAway` from `HandheldShell`). Never hide the machine from inside a page.
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

### Gaps — the spine is not yet universal ⚠

1. **Legacy comms layout still inside the machine (highest priority).**
   14 routes are wrapped in `LayoutWrapper` (`CommsLayoutDesktop` / `CommsLayoutMobile`) *inside* the OS: `LaunchParty`, `AgentSkillRegistry` (×2), `AuthorityStackPortal`, `Solutions`, `LinkedInManager`, `Top100AerospaceAviationTV`, `ArtemisArticle`, `MonthlyNewsletterMay2026`, `CommunityRound`, `STARSummit`, `MissionRooms`, `Top100TV` — plus the `pagesConfig` loop at `App.jsx:330`, which still mounts every legacy page that way.
   **Effect:** those surfaces draw a second chrome (icon rail + drawer sidebar) inside the tube on desk, and on the glass they can put the console away and run their own `MobileHomeView` / `MobileCommsView`. They are outside the OS grammar.
2. **Three dock implementations, two dead.**
   Live: `components/desktop/DesktopDock.jsx` (419 lines). Dead: `components/dock/DesktopDock.jsx` and `components/capabilities/dock/DesktopDock.jsx` (identical 210-line copies), referenced only by `components/layout/PublicLayout.jsx`, which nothing imports. Competing canon is a trap for future builds.
3. **Two independent launcher registries.**
   The desk shelf declares its own `SHELF` + `INDEX_GROUPS` inside `DesktopDock`; the glass reads `NAVIGATOR_GROUPS` + the admin-configured `RailItem` rail. The two machines therefore offer **different sets of applications**, and an admin's rail configuration reaches only one of them.
4. **Immersive policy is declared on the desk only.**
   `FULL_BLEED` is a desktop list. The glass has no equivalent declaration, so "owns the whole screen" is implicit and undocumented per surface.
5. **No surface registry.** Nothing enumerates "the applications this machine runs": title screen keys (`startMenuConfig`), desk shelf, glass groups, and `pagesConfig` are four lists.

---

## 7. Migration backlog (ordered, with acceptance)

1. **Retire `LayoutWrapper` / the comms layout.** Every route becomes a bare surface inside the shells.
   *Accept when* `grep -c LayoutWrapper src/App.jsx` is 0, `CommsLayoutDesktop`/`CommsLayoutMobile` are unreferenced, and the 14 listed surfaces render with the machine's bar and shelf only.
2. **Delete the dead docks.** Remove `components/dock/DesktopDock.jsx`, `components/capabilities/dock/DesktopDock.jsx`, and `components/layout/PublicLayout.jsx` once confirmed unreferenced. One dock remains.
3. **Unify the launcher registry.** One module owns "the applications this machine runs" — one list, two presentations (shelf on desk, wheel groups on glass), admin `RailItem` honoured by both.
   *Accept when* adding an application in one place makes it reachable on both machines and in the title screen's keys.
4. **Declare immersive per surface, not per machine.** One policy (`{ path, mode }`) read by both shells, so "owns the whole screen" is stated once.

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