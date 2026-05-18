# GHL (GoHighLevel) Integration Skill
## TOP 100 Aerospace & Aviation — Base44 + GHL Power Combo

This skill governs all GoHighLevel integrations for the TOP 100 platform. HubSpot has been fully replaced by GHL. All CRM, lead capture, newsletter, automation, and contact management flows route through GHL exclusively.

---

## Environment & Credentials

All GHL calls require these secrets (already configured in the app):
- `GOHIGHLEVEL_API_KEY` — Location-level private API key
- `GOHIGHLEVEL_LOCATION_ID` — The sub-account location ID
- `GOHIGHLEVEL_USER_ID` — Used for note attribution

**NEVER use HubSpot.** The `hubspotLeadCapture` function is deprecated — it now routes to GHL.

---

## GHL API Standards

There are TWO GHL API versions in use. Know which to use:

### V1 (Legacy REST) — Use only when V2 is unavailable
```
Base URL: https://rest.gohighlevel.com/v1
Auth: Authorization: Bearer ${GOHIGHLEVEL_API_KEY}
```

### V2 (LeadConnector) — PREFERRED for all new code
```
Base URL: https://services.leadconnectorhq.com
Auth: Authorization: Bearer ${GOHIGHLEVEL_API_KEY}
Headers: Version: 2023-02-21
```

**Canonical GHL request helper (always reuse this pattern):**
```js
const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2023-02-21';

async function ghlRequest(path, options = {}) {
  const token = Deno.env.get('GOHIGHLEVEL_API_KEY');
  const response = await fetch(`${GHL_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Version': GHL_VERSION,
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  return { ok: response.ok, status: response.status, data };
}
```

---

## Contact Upsert — The Core Pattern

All lead/contact creation uses `/contacts/upsert` (V2). This deduplicates by email automatically.

```js
const result = await ghlRequest('/contacts/upsert', {
  method: 'POST',
  body: JSON.stringify({
    locationId: Deno.env.get('GOHIGHLEVEL_LOCATION_ID'),
    email,
    name: name || email,
    firstName: first_name,
    lastName: last_name,
    source: 'TOP 100 [specific source]',
    tags: [...sourceTags, smartListTag],
    customFields: [
      { key: 'custom_field_key', field_value: 'value' },
    ],
  }),
});
const contactId = result.data?.contact?.id;
```

---

## Tag Strategy — The Segmentation Engine

Tags are the primary segmentation mechanism for GHL Smart Lists, workflows, and campaigns. All tag names follow these conventions:

### Source Tags (applied at point of entry)
| Source | Tags Applied |
|--------|-------------|
| Newsletter: Moon Joy | `Newsletter`, `Moon Joy`, `Operation Moon Joy`, `Community Interest`, `SmartList: Moon Joy Subscribers` |
| Newsletter: CommonGround | `Newsletter`, `CommonGround`, `CommonGround 5.0`, `Civic Interest`, `SmartList: CommonGround Subscribers` |
| Newsletter: 2030 Vision | `Newsletter`, `2030 Vision`, `Institutional Interest`, `SmartList: 2030 Vision Subscribers` |
| Newsletter: General | `Newsletter`, `General Subscribe`, `SmartList: General Newsletter` |
| App User Sync | `TOP 100 App User`, `Role: [user.role]` |
| Discovery Questionnaire | `discovery-questionnaire`, `hangouts-1on1-intake` |
| Nomination Form | `Nomination Submitted`, `[nomination_type]` |

### Smart List Tags (for GHL Smart List filtering)
- `SmartList: Moon Joy Subscribers`
- `SmartList: CommonGround Subscribers`
- `SmartList: 2030 Vision Subscribers`
- `SmartList: General Newsletter`

### Status Tags (updated as contacts progress)
- `Fellow` — TOP 100 recognized Fellow
- `Alumni` — Past season Fellow
- `Booster` — Community advocate/voter
- `Nominee` — Active nomination in progress
- `Investor` — Wefunder investor
- `Moon Joy Attendee` — Has attended a Moon Joy session
- `Joy Fund Contributor` — Has contributed to Joy Fund

---

## Existing GHL Backend Functions (DO NOT DUPLICATE)

| Function | Purpose |
|----------|---------|
| `subscribeNewsletter` | Newsletter signups from all pages → GHL upsert + smart list tag |
| `syncUsersToGhl` | Batch sync all app users → GHL contacts (admin only) |
| `syncDiscoveryToGhl` | Discovery questionnaire responses → GHL contact + notes |
| `syncNomineesToGhl` | Nominee records → GHL contacts |
| `syncLocalLegendToGhl` | Local Legend nominations → GHL |
| `createGhlSmartLists` | Creates/documents GHL smart lists + email templates |
| `createGhlMonthlySignalDraft` | Monthly signal draft for GHL email campaigns |
| `hubspotLeadCapture` | DEPRECATED — now routes to GHL (keep function, do not add HubSpot back) |

**Rule:** Always check this list before creating a new GHL function. Extend existing functions if the scope is close.

---

## Adding Notes to a GHL Contact

After creating/upserting a contact, add context notes for the sales team:

```js
if (contactId) {
  await ghlRequest(`/contacts/${contactId}/notes`, {
    method: 'POST',
    body: JSON.stringify({
      userId: Deno.env.get('GOHIGHLEVEL_USER_ID'),
      body: `Context:\n\n${notesText}`,
    }),
  });
}
```

---

## Adding to a GHL Workflow/Campaign

Trigger a GHL workflow by adding a tag. Workflows in GHL are configured to fire when a specific tag is added. This is the Base44→GHL automation bridge:

```js
// Tag the contact to trigger a GHL workflow
await ghlRequest(`/contacts/${contactId}`, {
  method: 'PUT',
  body: JSON.stringify({
    tags: [...existingTags, 'Trigger: [workflow-name]'],
  }),
});
```

Common trigger tags to set up in GHL:
- `Trigger: Moon Joy Welcome Sequence`
- `Trigger: Fellowship Announcement`
- `Trigger: Nomination Acknowledgement`
- `Trigger: Discovery Follow-Up`

---

## Custom Fields in GHL

Custom fields must be pre-created in GHL dashboard (Contacts → Custom Fields) before they can be written. Known configured fields:

| Key | Purpose |
|-----|---------|
| `discovery_notes` | Full discovery questionnaire dump (max 3000 chars) |
| `newsletter_source` | Which page triggered the newsletter subscription |
| `subscribed_at` | ISO timestamp of subscription |
| `source` | Human-readable source label |
| `nomination_type` | Type of nomination submitted |

---

## The Base44 + GHL Power Combo: Architecture Principles

### 1. Base44 = Source of Truth for App State
- All app entities, user records, voting, nominations, scoring → stay in Base44
- Base44 is the operational database

### 2. GHL = Source of Truth for CRM & Outreach
- All contact records, conversations, email campaigns, SMS, pipelines → GHL
- GHL is the engagement and conversion layer

### 3. The Bridge: Backend Functions
- Every meaningful user action in Base44 fires a backend function that syncs the signal to GHL
- Pattern: `User does X in Base44 → backend function → GHL contact upsert + tag`

### 4. Segmentation via Tags (not lists)
- Never hard-code audience lists. Use tags + Smart Lists so segments update dynamically
- One contact can have 20+ tags — that's fine and expected

### 5. GHL Automation Triggers via Tags
- GHL workflows fire on tag-added events
- Base44 backend functions apply the tag
- This creates a clean event-driven automation bridge without webhooks

### 6. GHL Embeds for Booking & Forms
- Use GHL calendar embeds (`/widget/booking/{ID}`) directly in Base44 pages
- Use GHL form embeds for intake forms where GHL automation is needed
- Script: `https://link.msgsndr.com/js/form_embed.js`

### 7. Never Duplicate Data in Both Systems
- Base44 holds rich entity data (nominee profiles, scores, votes, etc.)
- GHL holds contact records + a summary (name, email, tags, notes, custom fields)
- Don't try to push ALL Base44 data to GHL — just the contact + key signals

---

## When to Create a New GHL Function vs. Extend Existing

**Create new** when:
- A new touchpoint exists (new page, new form, new user action)
- You need a specialized tag set for a new segment

**Extend existing** when:
- The contact upsert pattern is the same, just different tags
- You can add a new `source` option to an existing function

**Never** create a new function that duplicates the `ghlRequest` helper — import pattern is inline in Deno, so just copy the helper into the new function.

---

## HubSpot → GHL Migration Checklist

- [x] `hubspotLeadCapture` — redirected to GHL (LiveStreamLead entity capture)
- [x] Newsletter subscribe → GHL via `subscribeNewsletter`
- [x] User sync → GHL via `syncUsersToGhl`
- [x] Discovery questionnaire → GHL via `syncDiscoveryToGhl`
- [x] Nominee sync → GHL via `syncNomineesToGhl`
- [ ] Any remaining HubSpot embed scripts or form IDs in frontend — audit and remove
- [ ] HubSpot API key secret — can be deleted from dashboard once confirmed clean

---

## GHL Calendar / Booking Widget IDs (TOP 100)

| Widget | ID |
|--------|-----|
| Operation: Moon Joy RSVP | `URctiv0FD5Mi8vQUADec` |
| Moon Joy 1:1 Consulting Booking | `ecQ2KuPT6vntXMcNyrnu` |

To embed: `https://api.leadconnectorhq.com/widget/booking/{ID}`

---

## Analytics & Reporting in GHL

GHL provides built-in reporting for:
- Contact pipeline stages
- Campaign open/click rates
- Appointment booking rates
- Source attribution (by tag/smart list)
- Workflow conversion funnels

For app-level analytics (page traffic, feature usage), use Google Analytics 4 (connector already authorized). GHL analytics = CRM/marketing funnel. GA4 = product usage.