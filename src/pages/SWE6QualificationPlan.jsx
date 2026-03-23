import ReactMarkdown from 'react-markdown';

const SWE6_DOCUMENT = `
# SWE.6 — Software Qualification Test Plan
## TOP 100 Aerospace & Aviation Platform

**Document Version:** 1.0  
**Date:** 2025-12-05  
**ASPICE Stage:** SWE.6  
**Status:** RELEASED

---

## 1. OBJECTIVE OF SWE.6

Validate the assembled software units (from SWE.4) against the software architectural design (SWE.2), ensuring:
- All module interfaces behave correctly
- Components exchange data properly
- Event-driven interactions fire as expected
- Errors propagate predictably
- Integration paths satisfy all SWE.1 requirements

## 2. INTEGRATION ARCHITECTURE UNDER TEST

**Subsystems:**
- Nomination Module
- Voting Module
- Ranking Engine
- Profile / Honoree Module
- Category & Evaluation Module
- Sponsorship Module
- Community Layer
- Publishing Engine
- Admin Command Center

**Infrastructure:**
- PostgreSQL, Redis, Elasticsearch, Queue Workers

## 3. INTEGRATION TEST SCENARIOS

### Scenario 1 — Nomination → Approval → Profile Creation
**Flow:** Submit Nomination → DB Store → Admin Approve → Auto-Profile → UI Display
**Success:** Profile loads within expected bounds.

### Scenario 2 — Voting → Fraud Guard → Ranking Update (CRITICAL)
**Flow:** Voter Submit → Fraud Guard → Ledger Write → Ranking Recalc → Leaderboard Update
**Success:** Vote count increments exactly once; Rankings adjust by criteria.

### Scenario 3 — Category Scoring → Evaluation Pipeline
**Flow:** Admin adjusts weights → Rubric Update → Ranking Recompute
**Success:** Scores update without corruption.

### Scenario 4 — Publishing Cycle
**Flow:** Finalize → Freeze → Generate Honorees → Archive Year → New Cycle
**Success:** Historical data preserved; new cycle clean.

### Scenario 5 — Sponsor Integration
**Flow:** Contract Added → Tier Resolved → Branding Overlays
**Success:** Platinum sponsors receive visibility boost.

## 4. INTERFACE TEST MATRIX

| Interface Path | Modules | Type | Outcome |
|---|---|---|---|
| POST /nominations → ProfileService | Nomination, Profile | Integration | Auto-profile |
| POST /votes → RankingWorker | Voting, Ranking | Integration | Ranking update |
| CategoryService → RankingCalculator | Category, Ranking | Data | Correct scoring |

## 5. TEST ENVIRONMENT
- **Frontend:** Next.js/React
- **Backend:** NestJS/Deno Functions
- **Data:** PostgreSQL, Redis
- **Modes:** Integration (Shared DB), Qualification (Pre-release)

## 6. EXIT CRITERIA
- All integration tests pass
- No critical defects
- System handles vote surge simulation
- Rankings are deterministic
`;

export default function SWE6QualificationPlan() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-5xl mx-auto prose prose-slate prose-headings:text-slate-900 prose-table:text-sm">
        <ReactMarkdown>{SWE6_DOCUMENT}</ReactMarkdown>
      </div>
    </div>
  );
}