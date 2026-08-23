# Career Logbook — Sweat-Equity XP

> Strava for aerospace careers. A Fellow-facing practice log that visualizes
> sweat equity on the platform. Firewalled from all measurement, selection,
> influence tiers, and discovery. Purely a motivational / self-quantification
> surface — a measuring tool for the Fellow, not an institutional scale.

## Intent

Fellows have no visible arc on the platform today. "Where am I, what's next,
what have I actually done here" is invisible. Career Logbook makes logged
practice visible to the person who did it, and to their community — the way a
Strava athlete sees their weekly volume. Nobody hands you points that change
your official standing. The motivating pressure is "the activity exists and my
community can see I showed up."

## Non-Negotiable Firewall

Career XP **never** touches:
- Discovery / directory ranking or filtering
- Influence tier calculation (aura, holistic, SME, perception, normalization, objective layers)
- Selection / measurement of any kind
- Availability, transactions, sponsorship, or Patron-of-Record placement

It is a Fellow-facing mirror, not an institutional scale. The scoring engine
does not read this entity. This is enforced by RLS (owner + admin read only)
and by architectural separation — no scoring function imports or queries it.

XP is a **derived display number** (sum of log entry values), never stored as
an authority field on Nominee or User. It cannot "leak" because it is not a
field the measurement layer can reach.

## Vocabulary

- **Career Logbook** — the surface (profile module). Renders the practice feed
  + rolling volume + milestones. Aerospace-native framing (a pilot's logbook),
  not a game UI.
- **Log Entry** — one immutable record of a real practice event.
- **XP** — the derived sum of entry values. "Sweat equity." Display-only.
- **Milestone** — a named gate earned by accumulating specific entries
  (e.g. "First Dispatch," "Verified Credential," "Complete Profile").
  Authority shown by example, not by a score.

Never call it "points" in UI copy. The number reads as logged practice volume.

## Activity Taxonomy (the crux)

Only **real practice** earns entries — never vanity engagement. Spamming
bulletins, gaming endorsements, or empty actions do not count. Each entry is
idempotent (one per real event, keyed by `source_id`) so nothing is farmable.

### Onboarding & Profile Foundation (teaches app basics, incentivizes setup)
- First profile photo set
- First bio written
- First six-word story set
- First domain accent chosen
- First cover selected
- Profile marked complete (all foundation fields filled)
- First module reorder (teaches personalization)
- First status set

### Verification & Credential (real authority signals)
- Credential verified (license, type rating, degree, patent — each counts once)
- Conference attendance verified (Flightography write)
- LinkedIn profile connected
- Bio submission approved

### Community Practice (showing up, not farming)
- First dispatch published (one-time milestone; subsequent dispatches do NOT
  each award — prevents a posting spree from inflating volume)
- First endorsement *given* (capped per cycle, not per recipient)
- First connection accepted
- First follow
- First entry added to The Eight (with required written reason)

### Convening & Contribution (real participation)
- First Mission Room RSVP
- First volunteer-to-host signal
- First mentee placed (if mentoring features exist)
- First ribbon-cutting / demo-day participation

### Sustained Practice (rhythm, not streaks)
- A "weekly rhythm" counter — distinct days with logged real activity in the
  trailing 7 days. Rendered as a quiet calendar-dot grid (Strava-style), never
  a flame icon or a literal "streak" with loss-aversion mechanics. The grid
  shows presence; it does not punish absence.

**Explicitly excluded from XP:** posting volume beyond the first, endorsement
*received* (that's measurement, not practice), profile views, likes, any
engagement metric that could be farmed.

## Point Values

Fixed, curated, transparent (transparency is fine — it's firewalled). Small
integers. Onboarding actions = 1–2. Verification events = 3–5. Milestones =
10–20. The absolute scale is arbitrary; the relative weighting communicates
"verified credential > profile photo," which is the right signal.

Configured in a single allowlist file (`src/components/career-logbook/logbookConfig.js`)
so values and activity keys are governed, not free.

## Data Model

New entity: **`CareerLogEntry`**

- `fellow_email` — owner
- `activity_key` — from the curated allowlist (e.g. `profile_photo_set`,
  `credential_verified`, `first_dispatch`)
- `xp_value` — integer, from the allowlist (denormalized for fast sum)
- `source_id` — id of the originating record/event. Idempotency key.
- `source_entity` — e.g. `Nominee`, `ConferenceAttendance`, `Bulletin`
- `summary` — one-line human description for the feed ("Verified A&P license")
- `earned_at` — timestamp

RLS: read = owner + admin only. create/update/delete = admin only (entries are
produced by automations/backend, never written by the Fellow directly — this is
what makes it unfarmable). The Fellow cannot self-award.

Derived `xp_total` is computed on read (sum of entry values for the owner) —
not stored as a field on User/Nominee, so it cannot be read by measurement.

## Surface

A new **CareerLogbook** module available in the Fellow module registry
(`fellowHomeConfig.js` MODULES list). Fellow-configurable position (below the
locked identity + verification modules). Renders:

1. **Volume header** — the derived XP total as "logged practice," with a
   quiet editorial label. Not a progress bar to a cap (no cap exists).
2. **Weekly rhythm grid** — trailing 7-day dot grid, Strava-style. Shows
   presence without punishing absence.
3. **Practice feed** — recent log entries, newest first, with the summary
   line and a subtle timestamp. Loading + empty states designed (empty =
   "Your logbook is open. Start with your profile.").
4. **Milestones strip** — named gates earned, with unearned gates shown as
   outlined placeholders (mirrors The Eight's vacancy-as-CTA pattern).

Visual language: editorial, navy/cream/sand, no neon, no flame icons, no
confetti. Reads as a logbook page, not a game HUD.

## Production (how entries get created)

Entries are produced by **entity automations** on real events, not by the
Fellow:

- `Bulletin` create (automation) → awards `first_dispatch` if it's the owner's
  first published dispatch (idempotent on `source_id`).
- `ConferenceAttendance` create (automation, via existing verifyConferenceAttendance
  flow) → awards `conference_attendance_verified`.
- `FellowProfileSettings` update (automation) → awards foundation milestones as
  fields are first populated.
- Credential verification → awards `credential_verified`.

A single shared backend function (`awardCareerLogEntry`) handles idempotent
insertion. Automations call it; it checks `source_id` uniqueness before
inserting. Replays are safe.

No entry is ever created by a frontend action. This is the anti-farming core.

## Sequencing (build plan, when we build)

1. Entity + RLS + allowlist config (governed activity taxonomy).
2. `awardCareerLogEntry` shared backend function (idempotent).
3. Seed automations on the highest-signal events (profile foundation, first
   dispatch, credential/conference verification).
4. `CareerLogbook` profile module (volume header, rhythm grid, feed,
   milestones strip) with loading/empty/error states.
5. Register module in `fellowHomeConfig.js` MODULES allowlist.

Deferred (named, not built now):
- Milestone definitions beyond the first set.
- Any future promotion of XP toward measurement — only considered after
  real activity data exists, and requires an explicit governance decision.
- Public visibility of the practice feed (currently owner + admin only; could
  open to community later, still firewalled from measurement).

## Open Question (for the builder)

Milestone gates: should unearned milestones render as visible placeholders
(like The Eight — vacancy as CTA), or stay hidden until earned? Visible is
more motivating and on-brand with The Eight; hidden is less pressure. Recommend
visible, but this is a taste call.