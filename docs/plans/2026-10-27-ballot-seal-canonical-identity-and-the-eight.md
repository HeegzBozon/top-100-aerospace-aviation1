# Ballot Seal, Canonical Identity, and The Eight Decoupled from the Ballot

**Date:** 2026-10-27
**Status:** Shipped. The two rules under section 5 are now in force in `TOP100-Governance.md`
(invariants 10 and 11).

## Premise

Three gaps between what the platform says it does and what the running app did, closed in one cycle.

1. **A sealed ballot was not sealed.** `RankedVote` was readable by any signed-in user, so every
   Fellow's ranking of every other Fellow could be read straight from the browser. Tallies were also
   folded client-side: each publication surface pulled the whole ballot corpus into the page.
2. **One person could be reachable as two records.** A folded duplicate row could still hold the
   authoritative owner link, the shareable slug and the claim state, so a single Fellow resolved to
   two profiles carrying two different biographies.
3. **A published list cast a ballot.** Editing My TOP 100 wrote a ranked vote, which made a public,
   ordinal affiliation list and a private measurement act the same object.

Alongside those two defects of honesty: writes that failed in silence, and profile view counts still
stored on Fellow settings despite standing on the never-implement list.

## 1. The ballot is sealed

| Layer | Change |
| --- | --- |
| Entity | `RankedVote` row-level security: read is own-ballot-or-admin; create is own name only; update and delete are own-ballot-or-admin. A visitor, or a signed-out reader, reaches nothing. |
| Server | New `getBordaTally` folds ballots into per-subject totals (`borda_score`, `total_votes`, `first_choice_votes`) with the weights applied server-side. The response carries no voter and no ballot. |
| Client | The published edition and the index landing (both copies) no longer read ballots. They request totals and join them to standings by subject id. |

**Verified live:** `getBordaTally` returns 200 with totals for a season that holds ballots; the only
season-wide ballot reads left in the browser are the admin ledgers (`VoteLedger`, `ResultsDashboard`,
`AdvancedAnalyticsPanel`, `MonitoringDashboard`, `SeasonCommandCenter`), all admin-gated and now
admin-permitted by the rule. A Fellow's own ballot remains readable and still upserts.

**Order is unchanged.** The arithmetic did not move, so the published order cannot move: a seal that
shifts the podium would be a different feature, not a security fix.

## 2. The Eight no longer writes a ballot

`UserTop100List` is a publication. `persistAndSync` saves the list and nothing else: no cast, no
upsert, no mirror into `RankedVote`. Ballots are cast on the ballot surface alone.

Why it mattered: a published order that mirrors a private ranking hands the ranking to anyone who
reads the profile, which defeats the seal from the other side. The band above the list
(`BallotStatusBanner`) reports the list and only the list, and no longer narrates a ballot state it
cannot substantiate.

**Behaviour change for Fellows:** the list is edited on the hub; the ballot is cast on the ballot
surface. The two are no longer the same act.

## 3. Canonical identity is enforced, and the confirmed duplicate is folded

- Resolution follows `raw_nomination_data.merged_into` to the master, chaining where a master was
  itself folded — `src/lib/nomineeMerge.js`, `src/hooks/useProfileResolution.js`, and the server-side
  resolvers alongside them.
- The confirmed case is closed: a Fellow's duplicate pair. The master now holds her own first-person
  biography and her title, owns the authoritative owner link on both rows
  (`claim_status = approved`, `claim_method = email_match`, `claimed_by_user_id`), carries the
  shareable slug, and is the only row a slug lookup returns. The retired row keeps its content, its
  own cycle membership and its measured standing, records the master it was folded into, and gives up
  the slug — so its cycle's published order cannot shift.
- The Studio's settings row now points at the canonical person record.

**Residual, recorded rather than fixed:** the per-cycle score snapshot field
(`Nominee.seasonScores`) will not hold a season-keyed map — a written map comes back as an empty
shape. Per-cycle scores therefore stay on the row belonging to that cycle. The field's schema needs
correcting before scores can be consolidated under one person.

## 4. Integrity of writes, and view counts removed

- `ProfileWizard` no longer swallows a failed mirror onto the canonical record: a write that does not
  land says so, instead of leaving a Fellow believing their profile was updated.
- The list's own save reports failure rather than failing in silence.
- Profile view counts are gone at every layer: nothing counts a visit, nothing stores one, the stored
  values were cleared from `FellowProfileSettings`, and no surface prints one. `FellowStatsBox`
  reports endorsements and tenure instead, with the exclusion stated in the file so it cannot creep
  back.

## 5. Invariants added to the rulebook

> **The ballot is sealed.** A Fellow's ranked ballot is readable only by that Fellow and by admins,
> and only its voter may create or change it. Tallies are folded server-side; no published surface
> receives voters or ballots, only per-subject totals.

> **A published list never writes a ballot.** The Eight is a public, ordinal publication. Casting,
> updating or mirroring a ranked ballot on a list edit is prohibited.

## Touchpoints

- `base44/entities/RankedVote.jsonc` — sealed row-level security.
- `base44/functions/getBordaTally/entry.ts` — server-side tally fold.
- `src/components/publication/useTop100WomenNominees.jsx`,
  `src/components/comms/IndexLanding.jsx`, `src/components/capabilities/comms/IndexLanding.jsx` —
  totals instead of ballots.
- `src/pages/MyTop100.jsx`, `src/components/my-top100/BallotStatusBanner.jsx` — the list publishes;
  the ballot is cast elsewhere.
- `src/lib/nomineeMerge.js`, `src/hooks/useProfileResolution.js`,
  `base44/shared/nomineeResolve.ts` — identity resolution.
- `src/components/profile/wizard/ProfileWizard.jsx`,
  `src/components/fellow-home/FellowStatsBox.jsx` — reporting failures; view counts removed.