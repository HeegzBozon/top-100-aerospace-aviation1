# Pages Directory Restructure Design

**Date:** 2026-03-13
**Goal:** Reorganize `src/pages/` from 129 flat files into an epic/capability hierarchy that mirrors the component structure.

---

## Motivation

129 page files in a single flat directory make it hard to find pages or understand what belongs to which product area. The component directory was already reorganized to mirror the 8 Jira epics — pages should follow the same structure so the mental model is consistent across the codebase.

---

## Key Constraint: pages.config.js

The `@base44/vite-plugin` **only scans the top-level `pages/` directory** — it does not discover files in subdirectories. Moving pages into subdirectories means `pages.config.js` must be **manually maintained** going forward.

To preserve existing behavior:
- The "AUTO-GENERATED — do not edit" header is removed
- All 129 routing **keys stay identical** (e.g. `"Profile": Profile`) → URLs are unchanged
- `mainPage: "Home"` stays unchanged
- `Layout: __Layout` stays unchanged

---

## New Directory Tree

```
src/pages/
  epics/
    01-index-engine/
    02-signal-feed/
    03-mission-rooms/
    04-project-containers/
    05-rapid-response-cells/
    06-nomination-engine/
    07-endorsement-system/
    08-sponsor-commercial/

  capabilities/
    admin/
    calendar/
    comms/
    onboarding/
    services/
    resources/
    support/
    membership/

  (root — global/public pages, stay flat)
```

Note: Pages only need **2 levels** (unlike components which needed 3). Each epic has 5–20 pages, so a third level would be over-engineering.

---

## Migration Map

### Root (stay flat — global/public pages)

| File | New path |
|------|----------|
| `Home.jsx` | `pages/Home.jsx` |
| `Home2.jsx` | `pages/Home2.jsx` |
| `Landing.jsx` | `pages/Landing.jsx` |
| `NotFound.jsx` | `pages/NotFound.jsx` |
| `About.jsx` | `pages/About.jsx` |
| `OriginStory.jsx` | `pages/OriginStory.jsx` |
| `MissionVisionValues.jsx` | `pages/MissionVisionValues.jsx` |
| `PrivacyPolicy.jsx` | `pages/PrivacyPolicy.jsx` |

### EPIC 01 — Index Engine

| File | New path |
|------|----------|
| `Profile.jsx` | `pages/epics/01-index-engine/Profile.jsx` |
| `ProfileView.jsx` | `pages/epics/01-index-engine/ProfileView.jsx` |
| `PublicProfile.jsx` | `pages/epics/01-index-engine/PublicProfile.jsx` |
| `UserProfile.jsx` | `pages/epics/01-index-engine/UserProfile.jsx` |
| `EditProfile.jsx` | `pages/epics/01-index-engine/EditProfile.jsx` |
| `ClaimProfile.jsx` | `pages/epics/01-index-engine/ClaimProfile.jsx` |
| `Biographer.jsx` | `pages/epics/01-index-engine/Biographer.jsx` |
| `Passport.jsx` | `pages/epics/01-index-engine/Passport.jsx` |
| `TalentExchange.jsx` | `pages/epics/01-index-engine/TalentExchange.jsx` |
| `TalentExchangeLanding.jsx` | `pages/epics/01-index-engine/TalentExchangeLanding.jsx` |
| `TalentLanding.jsx` | `pages/epics/01-index-engine/TalentLanding.jsx` |
| `SMEPortal.jsx` | `pages/epics/01-index-engine/SMEPortal.jsx` |
| `MentorPortal.jsx` | `pages/epics/01-index-engine/MentorPortal.jsx` |
| `AlumniRadar.jsx` | `pages/epics/01-index-engine/AlumniRadar.jsx` |
| `AlumniInResearch.jsx` | `pages/epics/01-index-engine/AlumniInResearch.jsx` |
| `RadarDashboard.jsx` | `pages/epics/01-index-engine/RadarDashboard.jsx` |
| `RadarIntelligence.jsx` | `pages/epics/01-index-engine/RadarIntelligence.jsx` |
| `StartupDirectory.jsx` | `pages/epics/01-index-engine/StartupDirectory.jsx` |
| `Demographics.jsx` | `pages/epics/01-index-engine/Demographics.jsx` |

### EPIC 02 — Signal Feed

| File | New path |
|------|----------|
| `SignalFeed.jsx` | `pages/epics/02-signal-feed/SignalFeed.jsx` |
| `SignalAnalytics.jsx` | `pages/epics/02-signal-feed/SignalAnalytics.jsx` |
| `SignalSearch.jsx` | `pages/epics/02-signal-feed/SignalSearch.jsx` |
| `SignalTimeline.jsx` | `pages/epics/02-signal-feed/SignalTimeline.jsx` |
| `SignalReview.jsx` | `pages/epics/02-signal-feed/SignalReview.jsx` |
| `SignalEmbed.jsx` | `pages/epics/02-signal-feed/SignalEmbed.jsx` |
| `SignalEngineRoadmap.jsx` | `pages/epics/02-signal-feed/SignalEngineRoadmap.jsx` |
| `TrendingSignals.jsx` | `pages/epics/02-signal-feed/TrendingSignals.jsx` |
| `Article.jsx` | `pages/epics/02-signal-feed/Article.jsx` |
| `Articles.jsx` | `pages/epics/02-signal-feed/Articles.jsx` |
| `SpaceNews.jsx` | `pages/epics/02-signal-feed/SpaceNews.jsx` |
| `LaunchParty.jsx` | `pages/epics/02-signal-feed/LaunchParty.jsx` |

### EPIC 03 — Mission Rooms

| File | New path |
|------|----------|
| `MissionControl.jsx` | `pages/epics/03-mission-rooms/MissionControl.jsx` |
| `Quests.jsx` | `pages/epics/03-mission-rooms/Quests.jsx` |
| `HabitWizard.jsx` | `pages/epics/03-mission-rooms/HabitWizard.jsx` |
| `GamesHub.jsx` | `pages/epics/03-mission-rooms/GamesHub.jsx` |
| `GamesLanding.jsx` | `pages/epics/03-mission-rooms/GamesLanding.jsx` |
| `Arcade.jsx` | `pages/epics/03-mission-rooms/Arcade.jsx` |
| `Play.jsx` | `pages/epics/03-mission-rooms/Play.jsx` |
| `TheHangar.jsx` | `pages/epics/03-mission-rooms/TheHangar.jsx` |
| `ChessClub.jsx` | `pages/epics/03-mission-rooms/ChessClub.jsx` |
| `ChessGame.jsx` | `pages/epics/03-mission-rooms/ChessGame.jsx` |
| `Arena.jsx` | `pages/epics/03-mission-rooms/Arena.jsx` |
| `Events.jsx` | `pages/epics/03-mission-rooms/Events.jsx` |
| `EventPage.jsx` | `pages/epics/03-mission-rooms/EventPage.jsx` |
| `DemoDayEvent.jsx` | `pages/epics/03-mission-rooms/DemoDayEvent.jsx` |
| `Festival.jsx` | `pages/epics/03-mission-rooms/Festival.jsx` |
| `Afterparty.jsx` | `pages/epics/03-mission-rooms/Afterparty.jsx` |
| `GatherSpace.jsx` | `pages/epics/03-mission-rooms/GatherSpace.jsx` |
| `Huddle.jsx` | `pages/epics/03-mission-rooms/Huddle.jsx` |
| `Season4.jsx` | `pages/epics/03-mission-rooms/Season4.jsx` |
| `RaisingJupiter.jsx` | `pages/epics/03-mission-rooms/RaisingJupiter.jsx` |

### EPIC 04 — Project Containers

| File | New path |
|------|----------|
| `ClientDashboard.jsx` | `pages/epics/04-project-containers/ClientDashboard.jsx` |
| `EmployerDashboard.jsx` | `pages/epics/04-project-containers/EmployerDashboard.jsx` |
| `FounderDashboard.jsx` | `pages/epics/04-project-containers/FounderDashboard.jsx` |
| `IntelligenceDashboard.jsx` | `pages/epics/04-project-containers/IntelligenceDashboard.jsx` |
| `InvestorDashboard.jsx` | `pages/epics/04-project-containers/InvestorDashboard.jsx` |
| `ProviderDashboard.jsx` | `pages/epics/04-project-containers/ProviderDashboard.jsx` |
| `PIPlanner.jsx` | `pages/epics/04-project-containers/PIPlanner.jsx` |
| `FundraisingTracker.jsx` | `pages/epics/04-project-containers/FundraisingTracker.jsx` |
| `CapitalExchange.jsx` | `pages/epics/04-project-containers/CapitalExchange.jsx` |
| `SWE5TestArchitecture.jsx` | `pages/epics/04-project-containers/SWE5TestArchitecture.jsx` |
| `SWE6QualificationPlan.jsx` | `pages/epics/04-project-containers/SWE6QualificationPlan.jsx` |
| `SYS4IntegrationPlan.jsx` | `pages/epics/04-project-containers/SYS4IntegrationPlan.jsx` |
| `SYS5SystemValidation.jsx` | `pages/epics/04-project-containers/SYS5SystemValidation.jsx` |

### EPIC 05 — Rapid Response Cells

| File | New path |
|------|----------|
| `HypeSquad.jsx` | `pages/epics/05-rapid-response-cells/HypeSquad.jsx` |
| `HypeSquadWizard.jsx` | `pages/epics/05-rapid-response-cells/HypeSquadWizard.jsx` |
| `MilestoneDetail.jsx` | `pages/epics/05-rapid-response-cells/MilestoneDetail.jsx` |
| `RecruitmentRun.jsx` | `pages/epics/05-rapid-response-cells/RecruitmentRun.jsx` |
| `AcceleratorHub.jsx` | `pages/epics/05-rapid-response-cells/AcceleratorHub.jsx` |

### EPIC 06 — Nomination Engine

| File | New path |
|------|----------|
| `Nominations.jsx` | `pages/epics/06-nomination-engine/Nominations.jsx` |
| `Nominee.jsx` | `pages/epics/06-nomination-engine/Nominee.jsx` |
| `BatchNominations.jsx` | `pages/epics/06-nomination-engine/BatchNominations.jsx` |
| `HowWePick.jsx` | `pages/epics/06-nomination-engine/HowWePick.jsx` |
| `Top100Nominees2025.jsx` | `pages/epics/06-nomination-engine/Top100Nominees2025.jsx` |
| `Top100Women2025.jsx` | `pages/epics/06-nomination-engine/Top100Women2025.jsx` |
| `Top100OS.jsx` | `pages/epics/06-nomination-engine/Top100OS.jsx` |
| `NomineesByDomain.jsx` | `pages/epics/06-nomination-engine/NomineesByDomain.jsx` |
| `ArchiveLanding.jsx` | `pages/epics/06-nomination-engine/ArchiveLanding.jsx` |
| `BallotBox.jsx` | `pages/epics/06-nomination-engine/BallotBox.jsx` |
| `RankedChoice.jsx` | `pages/epics/06-nomination-engine/RankedChoice.jsx` |
| `VotingHub.jsx` | `pages/epics/06-nomination-engine/VotingHub.jsx` |
| `ResultsCountdown.jsx` | `pages/epics/06-nomination-engine/ResultsCountdown.jsx` |

### EPIC 07 — Endorsement System

| File | New path |
|------|----------|
| `Endorse.jsx` | `pages/epics/07-endorsement-system/Endorse.jsx` |

### EPIC 08 — Sponsor & Commercial

| File | New path |
|------|----------|
| `Sponsors.jsx` | `pages/epics/08-sponsor-commercial/Sponsors.jsx` |
| `SponsorPitch.jsx` | `pages/epics/08-sponsor-commercial/SponsorPitch.jsx` |
| `SponsorResources.jsx` | `pages/epics/08-sponsor-commercial/SponsorResources.jsx` |
| `Tips.jsx` | `pages/epics/08-sponsor-commercial/Tips.jsx` |
| `PayoutDashboard.jsx` | `pages/epics/08-sponsor-commercial/PayoutDashboard.jsx` |
| `PayoutSettings.jsx` | `pages/epics/08-sponsor-commercial/PayoutSettings.jsx` |
| `PaymentCancel.jsx` | `pages/epics/08-sponsor-commercial/PaymentCancel.jsx` |
| `PaymentSuccess.jsx` | `pages/epics/08-sponsor-commercial/PaymentSuccess.jsx` |
| `Shop.jsx` | `pages/epics/08-sponsor-commercial/Shop.jsx` |

### Capabilities

| File | New path |
|------|----------|
| `Admin.jsx` | `pages/capabilities/admin/Admin.jsx` |
| `AdminAction.jsx` | `pages/capabilities/admin/AdminAction.jsx` |
| `FactoryReset.jsx` | `pages/capabilities/admin/FactoryReset.jsx` |
| `Calendar.jsx` | `pages/capabilities/calendar/Calendar.jsx` |
| `MyBookings.jsx` | `pages/capabilities/calendar/MyBookings.jsx` |
| `MyFavorites.jsx` | `pages/capabilities/calendar/MyFavorites.jsx` |
| `Comms.jsx` | `pages/capabilities/comms/Comms.jsx` |
| `GetStarted.jsx` | `pages/capabilities/onboarding/GetStarted.jsx` |
| `InvestorOnboarding.jsx` | `pages/capabilities/onboarding/InvestorOnboarding.jsx` |
| `FounderApplication.jsx` | `pages/capabilities/onboarding/FounderApplication.jsx` |
| `ProviderApplication.jsx` | `pages/capabilities/onboarding/ProviderApplication.jsx` |
| `AvailabilitySettings.jsx` | `pages/capabilities/onboarding/AvailabilitySettings.jsx` |
| `JobDetail.jsx` | `pages/capabilities/services/JobDetail.jsx` |
| `ServiceDetail.jsx` | `pages/capabilities/services/ServiceDetail.jsx` |
| `ServiceCategories.jsx` | `pages/capabilities/services/ServiceCategories.jsx` |
| `ServicePackagesMarketplace.jsx` | `pages/capabilities/services/ServicePackagesMarketplace.jsx` |
| `ServicesLanding.jsx` | `pages/capabilities/services/ServicesLanding.jsx` |
| `CompareServices.jsx` | `pages/capabilities/services/CompareServices.jsx` |
| `ProviderInbox.jsx` | `pages/capabilities/services/ProviderInbox.jsx` |
| `BusinessResources.jsx` | `pages/capabilities/resources/BusinessResources.jsx` |
| `CareerResources.jsx` | `pages/capabilities/resources/CareerResources.jsx` |
| `EnterpriseResources.jsx` | `pages/capabilities/resources/EnterpriseResources.jsx` |
| `HonoreeResources.jsx` | `pages/capabilities/resources/HonoreeResources.jsx` |
| `NomineeResources.jsx` | `pages/capabilities/resources/NomineeResources.jsx` |
| `StudentResources.jsx` | `pages/capabilities/resources/StudentResources.jsx` |
| `FounderResources.jsx` | `pages/capabilities/resources/FounderResources.jsx` |
| `HelpCenter.jsx` | `pages/capabilities/support/HelpCenter.jsx` |
| `Feedback.jsx` | `pages/capabilities/support/Feedback.jsx` |
| `Membership.jsx` | `pages/capabilities/membership/Membership.jsx` |

---

## Implementation Strategy

1. **Write a migration script** (`scripts/migrate-pages.mjs`) that:
   - Creates all target subdirectories
   - Moves each page file to its new location
   - Rewrites `pages.config.js` — updates all import paths, removes the auto-generated header
   - Supports `--dry-run` flag

2. **Dry-run first** — verify all moves look correct

3. **Execute** — apply the migration

4. **Verify build** — run `npm run build`, fix any remaining import issues

---

## What Stays Untouched

- `src/App.jsx` — no changes needed (it reads from `pagesConfig`, keys unchanged)
- All routing keys in `pages.config.js` — identical to today
- All URL routes — unchanged
- `src/components/` — untouched
- `src/pages/` root files: Home, Home2, Landing, NotFound, About, OriginStory, MissionVisionValues, PrivacyPolicy
