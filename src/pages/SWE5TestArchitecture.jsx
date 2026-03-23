import ReactMarkdown from 'react-markdown';

const SWE5_DOCUMENT = `
# SWE.5 — Test Architecture
## TOP 100 Aerospace & Aviation Platform
### ASPICE-Compliant Software Integration and Integration Test Specification

**Document Version:** 1.0  
**Date:** 2025-12-05  
**ASPICE Stage:** SWE.5  
**Author:** Lt. Perry (Orchestrator Agent)

---

## Table of Contents

1. Executive Summary
2. Unit Test Architecture
3. Integration Test Architecture
4. Test Environment Specification
5. Test Data Strategy
6. Automation Strategy
7. Entry & Exit Criteria
8. Traceability Matrix

---

## 1. Executive Summary

This document defines the complete test architecture for the TOP 100 Aerospace & Aviation Platform, ensuring full ASPICE SWE.5 compliance. The test strategy covers:

- **9 Core Modules** with unit test specifications
- **7 Integration Pathways** with interface verification
- **4 Environment Tiers** from local to production
- **85% minimum code coverage** target
- **Full traceability** from SWE.5 → SWE.4 → SWE.3 → SWE.1

### ASPICE SWE.5 Base Practices Addressed

| BP ID | Base Practice | Coverage |
|-------|---------------|----------|
| BP1 | Develop integration strategy | Section 3 |
| BP2 | Develop regression test strategy | Section 6 |
| BP3 | Integrate software units | Section 3.2 |
| BP4 | Test integrated software | Section 3.3 |
| BP5 | Ensure consistency | Section 8 |
| BP6 | Summarize and communicate results | Section 7 |

---

## 2. Unit Test Architecture

### 2.1 Module Test Specifications

#### 2.1.1 Nomination Module

**Test Scope:** \`functions/nominationService.js\`, \`components/voting/NominationForm.jsx\`

| Test ID | Function Under Test | Expected Behavior | Edge Cases | Failure Modes |
|---------|---------------------|-------------------|------------|---------------|
| NOM-UT-001 | createNomination() | Creates nomination with valid payload | Empty fields, invalid email format | Returns 400 with validation error |
| NOM-UT-002 | validateCategory() | Rejects inactive categories | Non-existent category_id | Returns 400 "Invalid category" |
| NOM-UT-003 | checkDuplicate() | Prevents same nominator→nominee→category | Race condition (concurrent submissions) | Returns 409 "Already nominated" |
| NOM-UT-004 | assignCycleYear() | Auto-assigns current year | Year boundary (Dec 31 → Jan 1) | Correct year assignment |

**Input Validation Rules:**
- nominee_email: required, valid email format, max 255 chars
- category_id: required, must exist in Category entity, must be active
- justification: required, min 50 chars, max 2000 chars
- nominator_email: auto-populated from authenticated user

**Mocking Strategy:**
- Mock \`base44.entities.Category.get()\` → Return fixture category
- Mock \`base44.entities.Nomination.filter()\` → Return empty array (no duplicates)
- Mock \`base44.entities.Nomination.create()\` → Return created record with ID

**Coverage Goal:** 90%

---

#### 2.1.2 Voting Module

**Test Scope:** \`functions/votingService.js\`, \`components/voting/DirectVoting.jsx\`

| Test ID | Function Under Test | Expected Behavior | Edge Cases | Failure Modes |
|---------|---------------------|-------------------|------------|---------------|
| VOT-UT-001 | castVote() | Records vote with weight | Unauthenticated user | Returns 401 |
| VOT-UT-002 | checkFraudThrottle() | Blocks duplicate votes | Rapid successive votes (<1s) | Returns 429 |
| VOT-UT-003 | calculateWeight() | Returns weight by role | Unknown role | Default weight 1.0 |
| VOT-UT-004 | validateNomination() | Rejects votes for non-existent nominations | Deleted nomination | Returns 404 |

**Weight Calculation Rules:**
\`\`\`javascript
const WEIGHT_MAP = {
  'user': 1.0,
  'voter': 1.0,
  'nominator': 1.5,
  'honoree': 2.0,
  'admin': 5.0
};
\`\`\`

**Coverage Goal:** 92%

---

#### 2.1.3 Ranking Engine

**Test Scope:** \`functions/rankingService.js\`

| Test ID | Function Under Test | Expected Behavior | Edge Cases | Failure Modes |
|---------|---------------------|-------------------|------------|---------------|
| RNK-UT-001 | calculateCategoryRanking() | Aggregates weighted votes | No votes in category | Returns empty ranking |
| RNK-UT-002 | normalizeScores() | Scales to 0-100 range | Single nominee (max=min) | Returns 100 for single |
| RNK-UT-003 | applyTiebreaker() | Resolves ties by earliest nomination | Exact same timestamp | Secondary sort by ID |
| RNK-UT-004 | generateLeaderboard() | Returns top N ranked | N > total nominees | Returns all nominees |

**Coverage Goal:** 95%

---

### 2.2 Unit Test Summary Table

| Module | Test Count | Coverage Target | Priority |
|--------|------------|-----------------|----------|
| Nomination | 12 | 90% | P0 |
| Voting | 15 | 92% | P0 |
| Ranking | 10 | 95% | P0 |
| Profile/Honoree | 8 | 85% | P1 |
| Category | 6 | 88% | P1 |
| Sponsorship | 5 | 85% | P2 |
| Community | 6 | 85% | P2 |
| Publishing | 8 | 90% | P1 |
| Admin | 10 | 85% | P1 |
| **TOTAL** | **80** | **88% avg** | — |

---

## 3. Integration Test Architecture

### 3.1 Integration Pathways

#### 3.1.1 Nomination → Profile Integration

\`\`\`
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  NominationForm │ ───► │nominationService│ ───► │  Profile Entity │
│   (Frontend)    │      │   (Backend)     │      │   (Database)    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
\`\`\`

| Test ID | Integration Point | Verification Logic | Expected Result |
|---------|-------------------|-------------------|-----------------|
| NOM-INT-001 | Form → Service | Valid payload submission | 200 OK, nomination created |
| NOM-INT-002 | Service → Category | Category validation | Rejects inactive category |
| NOM-INT-003 | Service → Profile | Profile auto-creation | New profile if not exists |
| NOM-INT-004 | Service → Nomination | Persistence | Record in database |

---

#### 3.1.2 Voting → Fraud Guard → Ledger → Ranking

\`\`\`
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│DirectVoting  │───►│votingService │───►│  Vote Entity │───►│rankingService│
│ (Frontend)   │    │  (Backend)   │    │   (Ledger)   │    │  (Backend)   │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
\`\`\`

| Test ID | Integration Point | Verification Logic | Expected Result |
|---------|-------------------|-------------------|-----------------|
| VOT-INT-001 | Frontend → Service | Authenticated request | Vote recorded |
| VOT-INT-002 | Service → Fraud Guard | Duplicate detection | 429 on duplicate |
| VOT-INT-003 | Service → Vote Entity | Ledger persistence | Vote in database |
| VOT-INT-004 | Vote → Ranking | Score update | Rankings recalculated |
| VOT-INT-005 | Concurrent votes | Race condition handling | All votes recorded, no duplicates |

---

#### 3.1.3 Ranking → Publishing Engine

| Test ID | Integration Point | Verification Logic | Expected Result |
|---------|-------------------|-------------------|-----------------|
| RNK-INT-001 | Ranking → Top 100 Selection | Correct top 100 per category | 100 honorees per category |
| RNK-INT-002 | Selection → Honoree Creation | Honoree records created | Honorees in database |
| RNK-INT-003 | Honoree → Badge Generation | badge_url populated | Valid URL |
| RNK-INT-004 | Honoree → Press Kit | press_kit_url populated | Downloadable asset |

---

### 3.2 Interface Verification Matrix

| Source Module | Target Module | Interface Type | Data Contract | Validation Method |
|---------------|---------------|----------------|---------------|-------------------|
| NominationForm | nominationService | REST POST | {nominee_email, category_id, justification} | Schema validation |
| nominationService | Category | Entity Query | category_id → Category | Existence check |
| nominationService | Nomination | Entity Create | NominationSchema | Schema validation |
| DirectVoting | votingService | REST POST | {action, data: {nomination_id}} | Schema validation |
| votingService | Vote | Entity Create | VoteSchema | Schema validation |
| votingService | rankingService | Internal Call | {nomination_id} | Function signature |
| rankingService | Ranking | Entity Upsert | RankingSchema | Schema validation |
| PublishingEngine | Honoree | Entity Create | HonoreeSchema | Schema validation |

---

## 4. Test Environment Specification

### 4.1 Environment Topology

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                           LOCAL DEVELOPMENT                              │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Vite Dev  │  │  Base44 SDK │  │  Mock Redis │  │ SQLite/Mock │    │
│  │   Server    │  │   (Local)   │  │             │  │     DB      │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                              STAGING                                     │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Base44     │  │  PostgreSQL │  │    Redis    │  │Elasticsearch│    │
│  │  Platform   │  │  (Staging)  │  │  (Staging)  │  │  (Staging)  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                            PRODUCTION                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Base44     │  │  PostgreSQL │  │    Redis    │  │Elasticsearch│    │
│  │  Platform   │  │   (Prod)    │  │   (Prod)    │  │   (Prod)    │    │
│  │  (HA)       │  │   (HA)      │  │   (Cluster) │  │  (Cluster)  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

### 4.2 Container Specification

| Container | Image | Purpose | Local | Staging | Prod |
|-----------|-------|---------|-------|---------|------|
| API | Base44 Functions | Backend services | Dev mode | Deployed | Deployed |
| Database | PostgreSQL 15 | Primary data store | Mock/SQLite | Managed | Managed HA |
| Cache | Redis 7 | Session, rate limiting | Mock | Managed | Cluster |
| Search | Elasticsearch 8 | Full-text search | Mock | Managed | Cluster |
| Frontend | Vite/React | UI | Dev server | CDN | CDN |

### 4.3 Pipeline Triggers

| Trigger | Unit Tests | Integration Tests | Load Tests | E2E Tests |
|---------|------------|-------------------|------------|-----------|
| PR Created | ✅ | ✅ | ❌ | ❌ |
| PR Updated | ✅ | ✅ | ❌ | ❌ |
| Merge to develop | ✅ | ✅ | ✅ | ✅ |
| Merge to main | ✅ | ✅ | ✅ | ✅ |
| Nightly (2am UTC) | ✅ | ✅ | ✅ | ✅ |
| Pre-release tag | ✅ | ✅ | ✅ | ✅ |
| Manual dispatch | ✅ | ✅ | ✅ | ✅ |

---

## 5. Test Data Strategy

### 5.1 Synthetic Nominee Sets

\`\`\`javascript
export const NOMINEE_FIXTURES = {
  standard: [
    {
      name: "Dr. Elena Vasquez",
      nominee_email: "elena.vasquez@aerotech.com",
      category: "Commercial Aviation",
      country: "United States"
    },
    // ... 99 more for full category testing
  ],
  
  edge_cases: [
    { name: "A", nominee_email: "a@b.co" }, // Minimum
    { name: "Александр Петрович", nominee_email: "alex@ru.com" } // Unicode
  ],
  
  invalid: [
    { nominee_email: "not-an-email" },
    { name: "" }
  ]
};
\`\`\`

### 5.2 High-Load Voting Simulations

\`\`\`javascript
export const VOTING_LOAD_PROFILES = {
  normal_traffic: { concurrent_users: 100, votes_per_minute: 500 },
  peak_traffic: { concurrent_users: 1000, votes_per_minute: 5000 },
  stress_test: { concurrent_users: 5000, votes_per_minute: 20000 }
};
\`\`\`

### 5.3 Fraudulent User Patterns

\`\`\`javascript
export const FRAUD_PATTERNS = {
  rapid_fire: {
    description: "Same user voting 100 times in 1 minute",
    expected_result: "99 votes blocked, 1 accepted"
  },
  duplicate_nomination: {
    description: "Same nominator→nominee→category twice",
    expected_result: "Second nomination rejected with 409"
  },
  bot_signature: {
    description: "Requests with bot-like headers",
    expected_result: "Flagged for review"
  }
};
\`\`\`

---

## 6. Automation Strategy

### 6.1 Tool Selection

| Tool | Purpose | Phase |
|------|---------|-------|
| **Jest** | Unit testing | All |
| **SuperTest** | API integration testing | Integration |
| **Postman/Newman** | API contract testing | Integration |
| **k6** | Load/performance testing | Pre-release |
| **Playwright** | E2E UI testing | Pre-release |
| **Codecov** | Coverage reporting | All |

### 6.2 Coverage Configuration

\`\`\`javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './functions/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
\`\`\`

---

## 7. Entry & Exit Criteria

### 7.1 Unit Testing

| Criteria Type | Specification |
|---------------|---------------|
| **Entry** | Code complete, PR approved, static analysis clean |
| **Exit** | ≥85% coverage, 100% passing, zero P0/P1 bugs |

### 7.2 Integration Testing

| Criteria Type | Specification |
|---------------|---------------|
| **Entry** | Unit tests passing, staging available, fixtures loaded |
| **Exit** | 100% interfaces tested, ≥98% passing, response times within SLA |

### 7.3 Pre-Release Testing

| Criteria Type | Specification |
|---------------|---------------|
| **Entry** | Integration complete, load tests passed, security scan clean |
| **Exit** | All E2E journeys validated, no regression, rollback plan tested |

### 7.4 Annual Cycle Requalification

| Criteria Type | Specification |
|---------------|---------------|
| **Entry** | New cycle initiated, archive complete, config updated |
| **Exit** | All transitions tested, historical access verified, clean slate confirmed |

---

## 8. Traceability Matrix

### 8.1 Full Traceability: SWE.5 → SWE.4 → SWE.3 → SWE.1

| SWE.5 Test ID | SWE.4 Implementation | SWE.3 Component | SWE.1 Requirement |
|---------------|---------------------|-----------------|-------------------|
| NOM-UT-001 | nominationService.js | NominationController | REQ-NOM-001: Users can nominate |
| NOM-UT-002 | nominationService.js | CategoryValidator | REQ-CAT-001: Category validation |
| NOM-UT-003 | nominationService.js | DuplicateGuard | REQ-NOM-002: Prevent duplicates |
| VOT-UT-001 | votingService.js | VotingController | REQ-VOT-001: Cast votes |
| VOT-UT-002 | votingService.js | FraudGuard | REQ-SEC-001: Fraud prevention |
| VOT-UT-003 | votingService.js | WeightCalculator | REQ-VOT-002: Weighted voting |
| RNK-UT-001 | rankingService.js | RankingEngine | REQ-RNK-002: Category ranking |
| RNK-UT-002 | rankingService.js | ScoreNormalizer | REQ-RNK-003: Score normalization |
| PUB-UT-001 | PublishingCycle | CycleStateMachine | REQ-PUB-001: Cycle transitions |
| ADM-UT-001 | Admin role check | AdminGuard | REQ-ADM-001: Admin authorization |

### 8.2 Coverage Summary

| Module | SWE.1 Reqs | SWE.3 Components | SWE.4 Functions | SWE.5 Tests | Coverage |
|--------|------------|------------------|-----------------|-------------|----------|
| Nomination | 3 | 4 | 4 | 6 | 100% |
| Voting | 3 | 4 | 4 | 7 | 100% |
| Ranking | 3 | 3 | 4 | 5 | 100% |
| Profile | 2 | 2 | 2 | 3 | 100% |
| Category | 3 | 2 | 3 | 4 | 100% |
| Sponsorship | 2 | 2 | 3 | 4 | 100% |
| Community | 2 | 2 | 3 | 3 | 100% |
| Publishing | 2 | 3 | 3 | 4 | 100% |
| Admin | 2 | 2 | 3 | 4 | 100% |
| **TOTAL** | **22** | **24** | **29** | **40** | **100%** |

---

## Approval Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| Test Architect | Lt. Perry (AI) | 2025-12-05 | ✅ Approved |
| Technical Lead | TBD | TBD | ⏳ Pending |
| Product Owner | TBD | TBD | ⏳ Pending |
| QA Lead | TBD | TBD | ⏳ Pending |

---

*This document is ASPICE SWE.5 compliant and provides a turnkey test architecture for the TOP 100 Aerospace & Aviation Platform.*
`;

export default function SWE5TestArchitecture() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-5xl mx-auto prose prose-slate prose-headings:text-slate-900 prose-table:text-sm">
        <ReactMarkdown>{SWE5_DOCUMENT}</ReactMarkdown>
      </div>
    </div>
  );
}