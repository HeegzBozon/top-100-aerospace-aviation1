# Signal Component Integration Guide

## Components Overview

### 1. NomineeSignalsSection
Display all signals for a nominee with tabbed type filtering.

**Usage:**
```jsx
import { NomineeSignalsSection } from '@/components/epics/02-signal-feed/feed';

// In Nominee.jsx or PublicProfile.jsx
<NomineeSignalsSection 
  nomineeId={nominee.id} 
  nomineeName={nominee.name} 
/>
```

**Location:** Use after profile header/bio section

---

### 2. SignalBadgeIndicator
Compact badge showing signal count for leaderboards/standings.

**Usage:**
```jsx
import { SignalBadgeIndicator } from '@/components/epics/02-signal-feed/feed';

// In leaderboard/standings row
<SignalBadgeIndicator 
  nomineeId={nominee.id} 
  showBreakdown={true}  // optional: shows type breakdown
/>
```

**Integrations:**
- `pages/Arena.jsx` – standings table
- `components/arena/StandingsCore.jsx` – nominee rows
- `components/leaderboard/NomineeCard.jsx` – profile cards

---

### 3. LinkedInSignalShare
LinkedIn sharing dialog for individual signals.

**Usage:**
```jsx
import { LinkedInSignalShare } from '@/components/epics/02-signal-feed/feed';

// In ShareableSignalCard or profile signal display
<LinkedInSignalShare 
  signal={signal}
  nomineeName={nominee.name}
  nomineeProfileUrl={`/profile/${nominee.id}`}
/>
```

**Note:** Requires LinkedIn app connector authorization (already available)

---

## Integration Checklist

- [ ] Add `NomineeSignalsSection` to `pages/Nominee.jsx` (after bio)
- [ ] Add `NomineeSignalsSection` to `pages/PublicProfile.jsx` (if public profiles show signals)
- [ ] Add `SignalBadgeIndicator` to leaderboard/arena pages
- [ ] Add `LinkedInSignalShare` to `ShareableSignalCard.jsx` (as action button)
- [ ] Test signal fetching & display across network