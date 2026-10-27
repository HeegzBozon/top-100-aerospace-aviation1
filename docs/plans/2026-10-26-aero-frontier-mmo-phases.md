# Aero-Frontier — phased plan from prototype to MMORPG

Surface: Aero-Frontier. Canonical entity: `AeroFrontierSave` (one document per player).
Route: `/aero-frontier`. Entry: the seventh key on the Start Screen.

## Governance (fixed for every phase)

- The game is a **separate canonical entity**. It never writes into Nominee, UserTop100List,
  Season, Vote, or any measurement-bearing record.
- Discovery, ranking, scoring and influence tiers **never read** game state — not play time,
  not flights, not salvage, not crew membership. Play confers no selection weight.
- Game state is play state: expressive, personal, and outside the institution's ledger.
- Purchases in the game (later phases) are cosmetic or access to play, never measurement,
  never featured placement in the directory.

## Phase 0 — this build (done)

Playable browser prototype, Act I: The Inheritance, inside the existing handheld surface.

- The field: five ground tasks that cost hours and pay salvage.
- The airframe: five systems, parts paid once to open, hours spent a step at a time.
- The first flight: five legs, twelve discipline choices, a circuit score, a logged result.
- The field log: days worked, newest first; turn the day to bank the next six hours.
- The Road Ahead: four acts, with Acts II–IV declared as staged.
- Save: `AeroFrontierSave`, mirrored to the device so the surface opens instantly and
  still plays if the record cannot be reached (the panel says which one it is).

Presentation: painterly 16-bit plates (airfield, hangar, first flight) under a warm
instrument palette, kept deliberately distinct from the institution's chrome.

## Phase 1 — Act I, deep enough to keep

- Economy that bites: fuel, wear, and weather that make a flight cost something.
- Systems with failure modes: the radial that ran yesterday may not run today.
- Checkride gate before the first solo; an instructor voice that reacts to the log.
- Server-side day cycle (workflow per day) instead of a manual "turn the day".
- Save shape promoted to a versioned game document with migrations.

## Phase 2 — Act II: Regional Charter

- Certification: study and checkride loops per rating (private, night, instrument, tailwheel).
- Routes and contracts: short-haul cargo, medical, fire patrol, survey work.
- Specialisation tracks: pilot, engineer, dispatcher, owner-operator. Each changes what the
  field can take on rather than the numbers attached to it.
- Strip progression: lengthen, light, and hard-surface the runway; each upgrade opens work.
- NPC instructors, mechanics and operators with their own schedules.

## Phase 3 — Multiplayer foundations

- Presence and shared fields: see other players working the same strip.
- Crew entity: shared hours, shared aircraft, shared log. Coordination, never measurement.
- Chat and radio channels scoped to a field or a crew.
- Deterministic game server for shared state; the browser keeps the presentation.
- Architecture decision deferred to this phase: authoritative tick service plus a realtime
  room (the platform's actor rooms or a dedicated service) versus polling the save record.

## Phase 4 — Act III: The Orbit

- Cooperative orbital contracts: crews pool hours into shared missions above the weather.
- Launch and station operations: windows, payloads, crew roles, failure and recovery.
- Progression from atmospheric operator to orbital operator, gated by crew record.
- Requires the Phase 3 multiplayer layer; no single-player version of this phase.

## Phase 5 — Act IV: The Standing

- Clubs, fly-ins and events: scheduled gatherings on the platform's calendar, with RSVP
  and attendance flowing through the existing conference-room surfaces.
- Identity link: a Fellow's field and crew may be shown beside their profile — displayed as
  play, never as credential, and never read by discovery or scoring.
- Editions: a Fellow's flights can be written into their own edition as a spread.

## Deferred architecture decisions

- **Engine.** Phase 0 is DOM and painted plates, which keeps the surface inside the app's
  own stack and works at 402px. A 3D or tile engine (three.js is already installed) is worth
  revisiting only when Phase 2 needs a world to move through.
- **Networking.** No realtime layer in Phase 0. Decide in Phase 3 between actor rooms,
  a WebSocket service, and turn-based reconciliation over the save record.
- **Economy.** Deliberately frictionless in Phase 0 (hours are banked by turning the day).
  A real economy needs the Phase 1 sinks before it can be priced honestly.
- **Desktop client.** The browser prototype is the product until Phase 3 proves the loop.
  A packaged client (Tauri or Electron) is a distribution problem, not a design one.
- **Asset pipeline.** Painted plates are generated per scene today. A consistent pixel-art
  set needs an art direction pass before Phase 2 expands the world.