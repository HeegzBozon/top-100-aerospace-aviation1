# Three Tens Certainty Scoring - QA Testing & Analysis

**Document Purpose:** QA validation of the Three Tens certainty scoring algorithm and its application in the Straight Line System.

**Date:** March 28, 2026  
**Status:** Implementation Review

---

## 1. Scoring Philosophy

The Three Tens framework measures certainty on a **0-10 scale** (not 0-5). This reflects the real-world dynamics of prospect psychology:

- **0-3:** Certainty is low. Major objections or unknowns exist.
- **4-6:** Moderate certainty. They're interested but have reservations.
- **7-8:** High certainty. They're ready to move forward with minor clarifications.
- **9-10:** Complete certainty. They're committed or have already acted.

**Key Insight:** A brand-new contact who has responded to an initial outreach should NOT score 8+ on Personal or Entity certainty. They responded because they saw potential value (your Product Certainty might be 4-5), but they don't yet know, trust, or are deeply invested in you or your organization.

---

## 2. Three Tens Scoring Rules

### A. PERSONAL CERTAINTY (Trust in YOU)

**What it measures:** Does the prospect trust you personally? Do they see you as sharp, competent, honest, and invested in their success?

**Scoring Logic:**

| Response Status | Score | Rationale |
|---|---|---|
| `done` | 9 | They've committed → They trust you deeply |
| `sent` | 7 | Active engagement → They're listening and interested in your guidance |
| `draft` | 4 | Early stage → Minimal personal trust built yet; you've drafted something but haven't engaged |
| `pending` | 4 | Brand new → They connected but you haven't proven anything yet |

**Boost for Social Proof:**
- If `mutual_connections_count > 0`: +1 point (up to max 5 for pending/draft)
- Mutual connections signal you're in their trusted network

**Why new contacts don't auto-max:**
- Responding to your outreach ≠ trusting you
- They might be curious, bored, or just being polite
- You haven't demonstrated competence or follow-through yet
- Trust builds through dialogue and delivery

---

### B. ENTITY CERTAINTY (Trust in YOUR ORGANIZATION)

**What it measures:** Does the prospect trust your company? Do they see credibility, stability, and legitimacy?

**Scoring Logic:**

| Scenario | Score | Rationale |
|---|---|---|
| Response status = `done` | 8 | They already committed → They trust your org |
| High-profile contact (`followers > 50k`) | 5 | They likely researched you; high-profile people verify orgs |
| S-Tier or A-Tier contact | 4 | Strategic fit suggests they might validate you more thoroughly |
| Default (new contact) | 2 | They've never heard of you; no credibility proof yet |

**Why new contacts start at 2:**
- "Never heard of you" is the default state
- No brand recognition = no entity certainty
- They need proof points: press mentions, customer logos, partnerships, longevity
- A single response doesn't change this

---

### C. PRODUCT CERTAINTY (Do they understand your solution solves their problem?)

**What it measures:** Does the prospect believe your product/service genuinely solves their specific problem? Is it worth the investment?

**Scoring Logic:**

| Response Status | Tier | Score | Rationale |
|---|---|---|---|
| `done` | Any | 9 | They bought/committed → Fully convinced |
| `sent` | Any | 6 | You've explained the value; they're interested enough to wait |
| `draft`/`pending` | S-Tier or A-Tier | 4 | High relevance suggests good fit, but untested |
| `draft`/`pending` | B-Tier | 3 | Medium relevance |
| `draft`/`pending` | C-Tier or unknown | 2 | Low/unknown relevance; you haven't proven fit |

**Why tier matters for Product Certainty:**
- S/A-Tier contacts are ranked highly because they match your ideal customer profile
- This **suggests** your product is relevant to them
- But they haven't engaged yet, so the certainty is **potential, not proven**
- You still have to explain and demonstrate value

---

## 3. Action & Pain Thresholds

### Action Threshold (How much certainty before they move?)

**Definition:** The minimum combined certainty level where a prospect will take action.

| Tier | Threshold | Reason |
|---|---|---|
| S-Tier | 7.0 | Decision-makers. They move faster. Smaller commitments satisfy them. |
| A-Tier | 7.5 | High-value but slightly more cautious. Still relatively decisive. |
| B-Tier | 8.5 | Mid-market. Need more proof. Longer decision cycles. |
| C-Tier | 8.5 | Lower priority. Require high certainty before moving. |

**Strategy:** Lower their action threshold by reducing perceived risk (pilot programs, guarantees, smaller first steps).

### Pain Threshold (How much discomfort are they feeling?)

**Definition:** How much discomfort/urgency is the prospect feeling about their current situation?

| Response Status | Level | Meaning |
|---|---|---|
| `done` | Resolved | They solved it. Maintenance mode. |
| `sent` | Moderate | Waiting to see if your solution works. Medium urgency. |
| `draft`/`pending` | High | They're actively seeking a solution. Maximum receptiveness. |

**Strategy:** Capitalize on high pain by moving quickly. For moderate/resolved, use future pacing to rebuild urgency.

---

## 4. Test Cases: New Contact Scoring

### Test Case 1: Brand New S-Tier Contact (Just Responded)

**Scenario:**
- Contact: John, VP at major tech company
- Status: Responded to your initial outreach (`pending`)
- Followers: 25,000
- Mutual connections: 3
- Tier: S-Tier

**Calculated Scores:**
```
Personal Certainty = 4 (pending status) + 1 (mutual connections) = 5/10
Entity Certainty = 2/10 (default, they don't know you yet)
Product Certainty = 4/10 (S-Tier relevance, but untested)

Action Threshold = 7.0 (S-Tier)
Pain Threshold = High (actively seeking)
```

**Analysis:**
- ✅ Correct: This contact has **potential** but low certainty across the board
- ✅ Realistic: They responded, but you haven't proven anything
- ✅ Actionable: Focus on building Personal (dialogue) and Product certainty (proof points)
- ❌ Wrong interpretation: If this showed 9/9/9, the system would be broken

---

### Test Case 2: Engaged Contact (Your Sent Reply, Waiting)

**Scenario:**
- Contact: Sarah, Director at mid-market firm  
- Status: You sent a reply; they're reviewing (`sent`)
- Followers: 5,000
- Mutual connections: 1
- Tier: A-Tier

**Calculated Scores:**
```
Personal Certainty = 7/10 (sent status = active engagement)
Entity Certainty = 4/10 (A-Tier slightly researches you more)
Product Certainty = 6/10 (You've explained value; they're interested)

Action Threshold = 7.5
Pain Threshold = Moderate (waiting for your reply)
```

**Analysis:**
- ✅ Correct: Personal certainty jumped to 7 because you've engaged in dialogue
- ✅ Realistic: They're listening, but still uncertain about company/product fit
- ✅ Actionable: Address their lowest certainty (Entity = 4). Share social proof or customer case studies.

---

### Test Case 3: Converted Contact (They've Committed)

**Scenario:**
- Contact: Marcus, CEO of aligned firm
- Status: Deal closed / they've committed (`done`)
- Followers: 50,000
- Mutual connections: 5
- Tier: S-Tier

**Calculated Scores:**
```
Personal Certainty = 9/10 (committed = high trust)
Entity Certainty = 8/10 (done status + high-profile = thorough validation)
Product Certainty = 9/10 (they bought/committed = fully convinced)

Action Threshold = 7.0 (S-Tier)
Pain Threshold = Resolved (they solved it)
```

**Analysis:**
- ✅ Correct: All three tens are high because they've already moved
- ✅ Realistic: They validated you thoroughly before committing
- ✅ Actionable: Maintain momentum. Follow up on implementation and next steps.

---

## 5. Common Mistakes (Anti-Patterns)

### ❌ Mistake 1: Auto-Maxing New Contacts
**Problem:** New contact responds → Assume 9/9/9 certainty  
**Why it's wrong:** Responding ≠ trusting. They haven't validated you or your company.  
**Fix:** Start low (4-5 for Personal, 2 for Entity). Let certainty build through dialogue.

### ❌ Mistake 2: Ignoring Entity Certainty
**Problem:** "They responded, so they know us."  
**Why it's wrong:** Most new contacts have never heard of you. They researched the problem, not your company.  
**Fix:** Build entity certainty with case studies, press, customer logos, guarantees.

### ❌ Mistake 3: Conflating Engagement with Trust
**Problem:** They replied quickly → They trust me  
**Why it's wrong:** Quick replies mean they have time or curiosity, not necessarily trust.  
**Fix:** Watch for follow-up engagement, specific questions, and gradual commitment to judge trust.

### ❌ Mistake 4: Not Tracking Pain Threshold Over Time
**Problem:** High pain at Day 1; weeks later, still high pain.  
**Why it's wrong:** If pain stays high without action, either certainty is too low OR other blockers exist.  
**Fix:** Monitor pain + certainty together. If pain drops, they found another solution or moved on.

---

## 6. Validation Checklist

### Algorithm Correctness
- [x] New `pending` contacts start with Personal ≤ 5, Entity = 2, Product 2-4
- [x] `sent` contacts have higher Personal (7) but low Entity unless high-profile
- [x] `done` contacts have high certainty across all three (8-9)
- [x] Tier influences Product Certainty (S/A > B > C)
- [x] Action Threshold varies by tier (S/A = 7-7.5, B/C = 8.5)

### Real-World Applicability
- [x] Scoring reflects the Straight Line System philosophy
- [x] New contacts don't auto-win
- [x] Each Ten builds separately (low Product ≠ automatic low Personal)
- [x] Pain + Certainty inform strategy (not just one or the other)

### UI/UX Clarity
- [x] Progress bars (0-10 scale) are intuitive
- [x] Lowest bottleneck is clearly identified
- [x] Action Threshold is specific (7.0, not "7-8")
- [x] Recommended next actions match the diagnostic (address lowest Ten)

---

## 7. Future Improvements

1. **Historical Tracking:** Store certainty snapshots over time to see progression
2. **Predictive Scoring:** Use conversation patterns to estimate next certainty level
3. **Custom Weighting:** Allow users to adjust how they weight each Ten for their business
4. **Batch Analysis:** Identify common bottlenecks across your pipeline (all low Entity? Low Product across B-Tier contacts?)
5. **A/B Testing:** Track which messaging strategies improve which certainties fastest

---

## 8. Summary

The Three Tens certainty framework is **realistic**, **diagnostic**, and **actionable**:

- **Realistic:** New contacts don't auto-max. Trust and certainty build over time.
- **Diagnostic:** Each Ten is separate. You can address the specific bottleneck (lowest certainty).
- **Actionable:** Combine Action + Pain Thresholds to know *when* to push and *what to push on*.

Use this framework to stop guessing whether a prospect is "qualified" and start diagnosing exactly what certainty gap is blocking forward motion.