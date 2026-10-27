# TOP 100 Aerospace & Aviation — Governance & Operating Rules

**Internal source brief.** Written to be uploaded as a source file so an external research tool understands the platform's established rules before making recommendations.

**Not for publication.** Public-facing governance copy lives at `/governance` (firewall, measurement). This document is the internal rulebook.

Last updated: 2026-10-27

---

## 0. How to use this document

If you are an AI research tool generating recommendations for this platform:

1. Treat everything here as a **binding constraint**, not background context.
2. Before proposing anything, run it against sections 2 (language), 4 (invariants), 6 (surfaces), 12 (never implement) and 13 (already settled).
3. If a recommendation conflicts with a rule, **say so and name the rule** rather than proposing around it silently.
4. A recommendation is an input. It is not an approval, and it does not become a decision by being well-argued.
5. Where a rule and a recommendation disagree, the rule wins.

---

## 1. What this platform is

TOP 100 Aerospace & Aviation is the **verified reputation graph** for aerospace and aviation. The institutional line is: **"We don't rank. We measure."**

- An institutional reputation graph, **not** a social network, **not** an awards list, **not** a ranking app.
- Verified Fellow profiles produced through community nomination and blind pairwise voting, forming a permanent, measurement-grade record of excellence.
- Measurement uses a five-layer holistic model: Perception, Objective Achievement, SME Evaluation, Narrative & Influence, Representation & Normalization.
- Individual Fellow profiles carry schema.org Person and BreadcrumbList structured data.
- Published positioning states 300+ verified Fellows across 40+ countries and 70+ disciplines. Cite that only as published marketing copy; the roster is still being cleaned (see section 15).

**Tone:** editorial, warm, aspirational. Vogue meets NASA. Institutional, not social. Authority-first, not engagement-first.

**Rule:** never frame the platform as an awards list, a ranking app, or a popularity contest in any recommendation, label, or copy.

---

## 2. Language rules (strict, non-negotiable)

| Never use | Use instead |
| --- | --- |
| followers | endorsers, community |
| likes | endorsements |
| rank / ranking as our own verb | measure. Individuals rank; the institution measures. |
| Sponsored by | Patron of Record |
| gigs, freelance, star ratings | introductions, availability (an expert network, not a marketplace) |
| services (user-facing) | introductions, availability. Internal entity is `Service`; the word "services" never appears in surface copy. |
| Signal (in UI) | Follow |
| Most Liked | Top Viral Post |
| Slate, Manifest, Measure, Proceedings, Polling Center | rejected as hub names. Do not revive. |

**Reserved terms:**

- **Roundtable** is reserved exclusively for live, synchronous peer convening (Conference Mission Rooms, Domain Network convenings). Never use it as a hub or feed name.
- **Selection Committee** is the primary organizational noun for nomination and voting workflows. Frame participation as "joining the committee", not as submitting a task.

**Also:** all code comments, system logs, and status updates are written in English.

---

## 3. Brand and visual system

- **Primary:** deep navy / NASA blue `#1E3A5A`
- **Accent:** rose gold `#C9A87C`
- **Accent:** copper `#B87333`
- **Surfaces:** cream `#FAF8F5`, sand, beige

**Dual-metal rule:** copper for structural rules and primary buttons; rose gold for the masthead and secondary accents.

- Gradients used sparingly and with intent.
- Institutional preview artifacts use a duotone navy-to-rose-gold treatment.
- Editorial composition with generous rhythm; serif for display, clean sans for interface.
- Mobile-first: new UI is designed for small screens first, then scaled to desktop.

---

## 4. Governance invariants — never violate

1. **The firewall.** Discovery and directory surfaces must never read any transaction, payment, availability, or sponsorship field. Not for sorting, not for filtering, not for featured placement.
2. **Featured placement is editorial only, never purchasable.** Paid featured-position functions are not part of the platform and must never be proposed or built.
3. **Personal list entries carry zero weight** in measurement or influence tier calculation.
4. **Availability state never influences directory position.**
5. **Personalization never alters, obscures, or reorders verification display.**
6. **Ranking formulas are never exposed.** Influence tier bands are visible; weights are not.
7. **Archival records are immutable** once finalized per cycle.
8. **Coordination signals confer zero selection weight** and are never read by discovery, ranking, or scoring: `ConferenceRsvp.volunteer`, `DomainNetwork.facilitator_email`, `ConferenceRoom.patron_of_record_name`.
9. **Display-only fields stay display-only.** Never read by discovery, ranking, or scoring: `og_card_url`, `public_slug`, `linkedin_proudest_screenshot_url`, all viral-post staging fields, and nomination provenance (`nomination_count`, `linked_nomination_ids`).
10. **The ballot is sealed.** A Fellow's ranked ballot (`RankedVote`) is readable only by that Fellow and by admins, and only its voter may create or change it. Tallies are folded server-side; no published surface receives voters or ballots, only per-subject totals. A visitor reaches none of it.
11. **A published list never writes a ballot.** The Eight (`UserTop100List`) is a public, ordinal publication. Casting, updating or mirroring a ranked ballot on a list edit is prohibited; ballots are cast on the ballot surface alone.

---

## 5. Architecture — v2.0 Identity Layer

Three stacked layers, in order:

1. **Identity** — profile as home, governed personalization, activity state
2. **Affiliation** — The Eight, public and scarce ordinal personal lists
3. **Availability** — introduction-only economic surface, zero take rate

**Profile as home.** The Fellow profile is the home surface of the app, not a detail view. Authenticated Fellows land on their own profile; Directory, Feed and every other surface are navigated from there.

**Profile page order.** Identity header, then verification, then everything else in Fellow-configured order. Flightography renders below the fold. The credential is the foundation and does not need to render first.

**Personalization is a set of curated choices, never freedom, and never a blank field.**

- Domain accent: select from the approved set only.
- Cover: verified asset library only. No user upload.
- Module order: Fellow-configurable, server-validated against an allowlist.

**Locked modules.** Identity header locks to module position 1. Verification locks to position 2. Reorder attempts on locked modules are rejected **server-side**, not only in the UI.

**Expression renders in accent and ordering. It never alters structure.** The page reads as an institutional artifact with a person in it, not the reverse.

---

## 6. Surfaces and their canonical entity

Every feature lives on a named surface backed by **one** canonical entity. New work targets that entity. Do not split a surface across entities, and do not duplicate a surface.

| Surface | Canonical entity |
| --- | --- |
| Identity | `FellowProfileSettings`, `User`, `Nominee` |
| Affiliation (The Eight) | `UserTop100List` |
| Availability | `Service`, `IntroRequest` |
| Editions / publisher | `FellowEdition`, `Bulletin` |
| Conference mission rooms | `ConferenceRoom` (+ `ConferenceRsvp`, `ConferenceAttendance`, `ConferenceRoomNote`) |
| Domain networks (Communities of Practice) | `DomainNetwork` |
| Chamber (jobs, introductions) | `Job`, `Service`, `IntroRequest` |
| Career resources | `CareerResource` |
| Platform board / roadmap | `RoadmapItem`, `Initiative`, `Objective` |

---

## 7. The Eight (Affiliation)

Entity: `UserTop100List`.

- **Eight slots. Public. Ordered.** Position 1 reads as position 1.
- **Empty slots always render as visible outlined placeholders with the position number.** Never hide, collapse, auto-fill, or gray out an empty slot. Vacancy is the call to action; a collapsed grid destroys the feature.
- **Every entry requires a written reason.** Block submission without one.
- **Promotion into an occupied slot demotes the displaced entry to the tail.** It never deletes it.
- **Subjects are Fellows and Nominees only.** No free-text or external subjects.
- Entries carry **zero weight** in measurement or influence tier calculation.
- **Publishing the list never writes a ballot.** Editing the list must not cast, update or mirror a `RankedVote`. The list is a publication; the ballot is a private vote cast on the ballot surface.

---

## 8. Profile claims

Self-serve nominee profile claims, by email or LinkedIn.

- `claim_status` tracks: `unclaimed` → `pending` → `approved` | `rejected`
- **Instant self-claim** on email match (`claim_method = "email_match"`) or LinkedIn profile match (`claim_method = "linkedin_match"`).
- **Mismatched or contested claims** fall to admin review (`claim_method = "admin_review"`).
- `claimed_by_user_id` is the **authoritative** owner link. `claimed_by_user_email` is display-only legacy.
- The claim panel is a **floating, dismissible banner**. Never a modal that blocks the profile.
- On approval a **Claim Approved** welcome email is sent automatically, with an automated trigger covering every future approval. Approval is one flow: extensions or one-off sends must not bypass the trigger.

---

## 9. SEO and crawler policy

- **Canonical profile route:** `/profiles/:id`. Legacy routes redirect to canonical via `<Navigate>`; a new canonical route supersedes its legacy alias.
- **Indexability is gated** on content completeness and public status: thin or empty profiles emit `noindex`; complete public profiles are `index, follow`. The gate runs client-side in `useProfileSeo` and is mirrored server-side in `getProfilePrerender`.
- **Prerender** supplies capped title, meta description, canonical URL, Open Graph tags, and Person + BreadcrumbList JSON-LD.
- **Sitemap** is backend-generated by `getProfileSitemap`: one URL per indexable profile. Note the static `/sitemap.xml` lists top-level pages only and does **not** contain profiles; both URLs are declared in `robots.txt`.
- **AI crawlers** (GPTBot, ClaudeBot, PerplexityBot, Applebot) are explicitly allowed in `robots.txt`, alongside Googlebot and Bingbot. All internal operational routes (Admin, FactoryReset, Analytics, Colony, platform board, simulators, session portal) are disallowed and `noindex`, and are auth-gated.
- **`/llms.txt`** is the AI-facing summary of crawlable surfaces.
- **Deep links** (`/Top100Women2025/:year/:month/:slug`) are `noindex` and canonical to `/profiles/:id`; they must never cannibalize the indexable profile.
- **Adjacent profile links** come from `getAdjacentNomineeIds` as one tiny payload. Never fetch the full collection for previous/next.
- Public profile routes render **visible breadcrumbs** for UX and internal linking.

**Legacy redirects:** `/Profile`, `/PublicProfile`, `/Nominee`, `/UserProfile` → `/ProfileView`; `/Top100Women2025/:nomineeId` → `/profiles/:id`; `/my-top100` → `/nominate`; `/Home`, `/Landing`, `/home-v2` → `/`; `/volume-one*`, `/volume-two*` → `/archive/:id`.

---

## 10. Data integrity and identity resolution

- **Dedupe key order:** canonical LinkedIn slug, **then** email (union-find, so two records sharing a LinkedIn URL collapse even when emails disagree).
- **A record must resolve to its canonical master.** Merged records may still exist as standalone rows, but any surface resolving a person (profile route, slug lookup, counters, exports) must land on the master, never on a merged row.
- **RFC-ish email validity gate at the source.** Garbage like `z` or `name@gmail` (no TLD) never reaches claim-readiness, dedupe, or an export.
- **Public counters agree with the export.** `NomineePoolCounter` and `NomineeTally` count unique non-rejected people through the same resolver as the GoHighLevel export, so the public number and the export row count always match.

---

## 11. CRM

All CRM, lead capture, newsletter and contact automation routes through **GoHighLevel (GHL) exclusively**.

- HubSpot is removed. Never add it back.
- Dedupe by canonical LinkedIn slug, then email, **before** any GHL export.
- Reuse existing functions rather than creating new ones: `syncNomineesToGhl`, `syncUsersToGhl`, `syncDiscoveryToGhl`, `syncLocalLegendToGhl`, `createGhlSmartLists`, `createGhlMonthlySignalDraft`, `exportOutreachList`.

---

## 12. Never implement (hard exclusions)

- Custom CSS
- Arbitrary color pickers
- Custom fonts
- User image upload
- Autoplay media
- Animated backgrounds
- Profile view counts
- Purchasable featured placement, and paid featured-position functions of any kind
- Exposure of ranking formulas or influence-tier weights
- Free-text or external subjects in The Eight
- Blocking modals for profile claims
- Collapsed, hidden, or auto-filled empty slots in The Eight

---

## 13. Already settled — do not re-propose

These were tried, rejected, or replaced. Recommending them again wastes a cycle.

- **Client-rendered SPA for front-door marketing and high-intent conversion pages.** Fails crawler and AI-agent diligence. The pattern is server-served static HTML.
- **Relative imports across directories in backend functions.** Breaks bundling; use shared modules.
- **Framer-motion for infinite UI animations.** Restarts and flickers on parent re-render; native CSS keyframes are the standard.
- **One reusable list entity for both ballots and The Eight.** Conflicts with the Borda scoring governance. They are distinct entities.
- **Sequential database updates for bulk migration or rollover.** Times out on large sets; use batched bulk updates.
- **Cloning entire external repositories.** Licensing conflicts and maintenance debt; integrate specific features or data layers with clear attribution.
- **Non-commercial-licensed data sources:** OpenSky Network, Google News RSS (replaced by GDELT), TeleGeography submarine cables.
- **Government CCTV camera packs.** Maintenance debt, off-mission.
- **Client-side generation of pairwise voting for large nominee sets.** Memory exhaustion.
- **AI image generation for share cards carrying precise text** (name, position number). It renders text unreliably; deterministic canvas composition is the standard.
- **Serving the app and a static share page at the same URL.** They collide.
- **Deprecated LinkedIn profile-access endpoints for verification.** Use the soft-signal fallback; never let it throw at runtime.
- **National flags embedded as badge backdrops.** Corners bleed and clutter when cropped circular.
- **Hub names:** Slate, Manifest, Measure, Proceedings, Polling Center, and Roundtable-as-hub.

---

## 14. Checklist before proposing anything

1. **Which surface, and which canonical entity?** Name both. A surface cannot span two entities.
2. **Does it read a firewall field** (transaction, payment, availability, sponsorship)? If yes, stop.
3. **Does it imply ranking, purchasability, or engagement-weighting?** If yes, stop.
4. **Does the copy follow section 2?** Rewrite before proposing, including the recommendation's own wording.
5. **Does something already exist for this?** Reuse the function, entity, or surface instead of adding a parallel one.
6. **Does it need a route?** Routes are explicit, not auto-generated, and every new canonical route needs a legacy/redirect decision.
7. **Does it have loading, empty (designed, not placeholder text), and error states?**
8. **Is it on the never-implement list, or already settled?**

---

## 15. Open items (state as of this brief)

Listed so recommendations do not assume these are already solved.

- **Canonical host** decision pending. The app is published at `https://top100aerospaceandaviation.base44.app`.
- **Sitemap submission** to Search Console pending.
- **Merged duplicate rows persist as rows**, and that is intended: a retired row keeps its own cycle membership and its measured standing, so its cycle's published order cannot shift. Resolution follows `raw_nomination_data.merged_into` to the master, and the confirmed case (a folded row still holding a shareable slug) is closed — the master holds the slug, the retired row gives it up. Fold any new case the same way.
- **The per-cycle score snapshot field** (`Nominee.seasonScores`) will not hold a season-keyed map: a written map returns an empty shape. Per-cycle scores stay on the row belonging to that cycle until the field's schema is corrected.
- **Roster cleanup** outstanding: records missing indexable content, plus duplicate person rows.
- **Automated third-person biography text** was generated before honorees could self-submit, and in at least one case contradicts what the honoree actually wrote. Automated text must never be presented as authored by the honoree.
- **Rating and engagement fields are largely at defaults** (no signal yet), so they cannot be read as evidence of anything.
- **Profile routes reachable as an app shell** where prerender is not hit.
- **Truncated free-text imports**: at least one record's role answer was cut at 100 characters and stored as a job title. Field-level length validation on import is outstanding.