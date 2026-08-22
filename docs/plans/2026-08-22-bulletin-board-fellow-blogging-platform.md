# Bulletin Board — Fellow Blogging Platform

**Date:** 2026-08-22
**Status:** Draft for approval
**Owner:** Product

## Mission

Turn the Fellow profile from a static identity artifact into an authored, living surface. A second instrument cluster — the **Bulletin Board** — sits below the masthead/verification cluster and houses a Fellow-configurable set of authored-content tools, Tumblr-esque in expression, institutional in voice. "Bulletin" is the noun for any authored post; the *post type* drives the format.

## Resolved decisions

1. **Brand:** "Bulletin Board" is the surface name. "Bulletin" is the unit noun (every post is a bulletin). `post_type` drives the format — never a collision.
2. **Image upload:** Sanctioned for authored content only (photos in dispatches, gallery, field notes). The personalization ban on "user image upload" continues to apply strictly to *profile chrome* — covers, backgrounds, custom assets. Precedent: `Story.media_url` already uploads authored imagery.
3. **Entity strategy:** `Bulletin` and `Post` stay distinct.
   - `Bulletin` = authored personal content (extended with post_type, media, tags, rich body).
   - `Post` = community discussion (forum-shaped, channel-scoped) — reused by the optional "Threads" tool only.
4. **Personalization model:** Basecamp-style tool toggles. `bulletin_tools` is a Fellow-configurable, server-validated array from an allowlist — mirrors the existing `module_order` governance. Never arbitrary custom tools.
5. **Engagement verb:** Endorse (never "like"). Comments are plain discussion. No reblog in v1 — reblog/amplify chains raise attribution + measurement-weight questions that need their own governance pass.
6. **Compose entry point:** New Fellow-facing compose surface. `StatusCompose`'s dead "Write a blog post" link (currently → admin-only `/Publisher`) repoints to the new composer.

## Entity changes

### `Bulletin` (extend)

Existing fields retained: `author_email`, `author_name`, `author_avatar_url`, `scope`, `title`, `body`, `link`.

New / changed:
- `post_type` — enum: `dispatch` (long-form rich), `note` (short micro — absorbs today's network bulletins), `photo`, `quote`, `link`, `field_note`. Default `note`.
- `rich_body` — string, rich text (Quill) for `dispatch` and `field_note`. Plain `body` stays for `note`/`quote`/`link`.
- `media_urls` — array of strings (uploaded via UploadFile). Drives `photo` and `field_note` galleries.
- `tags` — array of strings, free tag entry (not from an enum — tags are expressive, not governance-bearing).
- `published_date` — date-time, set on first publish.
- `status` — enum: `draft`, `published`, `archived`. Default `draft`.
- `endorse_count` — number, denormalized count of endorsements.
- `comment_count` — number, denormalized.
- `view_count` — number. Owner-visible only (consistent with existing `profile_view_count` pattern — feedback, not ranking).

`scope` semantics tighten:
- `platform` — institutional newsletter (admin-only, unchanged).
- `network` — Fellow-authored, published to the community feed (default for authored posts).

RLS unchanged in shape; owner edits/deletes own, admin overrides.

### `FellowProfileSettings` (extend)

- `bulletin_tools` — array of strings, ordered, from the allowlist. Server-validated. Defaults to `['dispatch', 'notes']`.

## Tool allowlist

Each tool is a self-contained module rendered inside the Bulletin Board cluster.

| Key | Label | Entity | Format |
|-----|-------|--------|--------|
| `dispatch` | Dispatch | Bulletin | Long-form rich text + optional media |
| `notes` | Notes | Bulletin | Short micro-posts (≤1000 chars) |
| `gallery` | Gallery | Bulletin (`post_type=photo`) | Photo wall |
| `quotes` | Quotes | Bulletin (`post_type=quote`) | Curated quote collection |
| `field_notes` | Field Notes | Bulletin (`post_type=field_note`) | Dated entries with optional media |
| `reading_list` | Reading List | Bulletin (`post_type=link`) | Outbound links with commentary |
| `threads` | Threads | Post | Community discussions (reuses forum entity) |

Default install: `['dispatch', 'notes']`. Fellows toggle tools and reorder from their settings.

## UI structure

### Profile page (stacked clusters)

1. **Identity header** (locked, position 1)
2. **Verification band** (locked, position 2)
3. **Instrument cluster** (existing 30/70: StatusCompose + Top100/Stories/News tabs)
4. **Bulletin Board cluster** ← NEW. Same 30/70 split:
   - **30%:** Compose rail — format selector (dispatch / note / photo / quote / link / field note) + composer surface. Repoints `StatusCompose`'s dead blog link here.
   - **70%:** Active tool tabs — renders the Fellow's enabled `bulletin_tools` as tabs, horizontal-scroll pills on mobile (matches existing cluster pattern). Each tool renders its posts.

### Compose surface

- Format-aware composer: dispatch → Quill rich editor; note → textarea (≤1000); photo → UploadFile + caption; quote → attributed quote + source; link → URL + commentary; field note → date + rich body + optional media.
- Draft / publish lifecycle. `status: draft` saves without publishing; `published` sets `published_date`.
- Tag entry (free text, comma-separated).

### Reading surfaces

- **Per-Fellow:** the Bulletin Board on each Fellow's profile IS their blog. Public profile (`/profiles/:id`) renders the board read-only for visitors.
- **Community feed:** follow-driven. A new `/dispatch` route (or a tab in the existing instrument cluster) renders bulletins from endorsed Fellows, newest first. Driven by the `Follow` entity. Not in v1 scope — flagged for phase 2.

### Empty states

Each tool has a designed empty state (not placeholder text):
- Dispatch: "No dispatches filed yet. The desk is open."
- Notes: "No notes pinned to the board."
- Gallery: outlined photo frame grid with "Hang your first frame."
- Quotes: italic "No quotes collected."
- Field Notes: ledger-style empty entry with "First entry pending."
- Reading List: "No links bookmarked."
- Threads: "No threads started."

## Governance check (invariants preserved)

- ✅ Bulletin content carries **zero weight** in measurement / influence tier. `endorse_count` is display-only feedback, never feeds scoring.
- ✅ Discovery and directory ranking never read bulletin fields.
- ✅ Personalization (tool toggle + order) never alters or reorders verification.
- ✅ No profile view counts exposed (bulletin `view_count` is owner-visible only, same pattern as existing `profile_view_count`).
- ✅ Module positions 1 & 2 remain locked; the board sits in Fellow-configurable territory.
- ✅ Image upload sanctioned for authored content only — never profile chrome.

## Phases

### Phase 1 — Foundation (this plan)
- Extend `Bulletin` entity (post_type, rich_body, media_urls, tags, status, published_date, counts).
- Extend `FellowProfileSettings` with `bulletin_tools`.
- Build `BulletinBoardCluster` component + tool-tab shell.
- Build format-aware `BulletinComposer`.
- Build v1 tools: `dispatch`, `notes`. (Highest signal, lowest risk.)
- Repoint `StatusCompose` blog link to the new composer.
- Designed empty states for each enabled tool.

### Phase 2 — Tools + reading feed
- `gallery`, `quotes`, `field_notes`, `reading_list` tools.
- `threads` tool (reuses `Post`).
- Community `/dispatch` feed driven by `Follow`.

### Phase 3 — Engagement depth (needs governance pass)
- Endorse on bulletins (denormalized count).
- Comments / discussion threads on bulletins.
- Reblog / amplify with attribution chains — **only after governance sign-off** that personal amplification carries zero measurement weight.

## Out of scope (explicit)
- Reblog / re-amplify chains (phase 3, governance-gated).
- Analytics dashboards for bulletin performance.
- Cross-channel social broadcasting for Fellows (stays admin-only in Publisher).
- Video / audio bulletins (photo + text only in v1).