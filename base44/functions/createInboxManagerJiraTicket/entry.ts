import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jiraUrl = Deno.env.get('JIRA_INSTANCE_URL');
    const jiraEmail = Deno.env.get('JIRA_USER_EMAIL');
    const jiraToken = Deno.env.get('JIRA_API_TOKEN');

    if (!jiraUrl || !jiraEmail || !jiraToken) {
      return Response.json({ error: 'Jira credentials not configured' }, { status: 500 });
    }

    const description = `## LinkedIn Inbox Manager Enhancement - Straight Line System Integration

### Completed Work

#### 1. Three Tens Certainty Scoring (✓ Complete)
- Implemented Three Tens framework: Product, Personal, and Entity certainty (0-10 scale)
- Logic: Calculates prospect trust based on response status, tier classification, and social proof
- Action Threshold: Dynamically set based on contact tier (S/A-tier need 7+, B/C-tier need 8.5+)
- Pain Threshold: Determines urgency (resolved, moderate, high)
- Lowest Ten Identifier: Surfaces bottleneck to commitment

#### 2. Problem Hypothesis Generation (✓ Complete)
- AI-generated problem diagnosis based on contact role, engagement level, and tier
- Signals detection: Active engagement, urgency, leadership level, opportunity scale
- Confidence scoring: Calculated from signal count
- Actionable insights: Helps prioritize response strategy

#### 3. Solution Range Proposals (✓ Complete)
- Context-aware solution suggestions (3-4 options per contact)
- Role-specific solutions: Executive, Engineering, Sales/BizDev, Operations/Product
- Tier-specific customization: S-Tier gets custom enterprise solutions
- Fallback patterns for unknown roles

#### 4. Individual Contact OKRs (✓ Complete)
- Add/complete/remove OKRs per contact in evaluation modal
- Progress tracking: Shows X/Y completed
- Checkbox-based completion workflow
- Persistent state management per contact

#### 5. Global Inbox Manager OKRs (✓ Complete)
- Top bar OKR section that persists across all contacts
- Add/complete/remove global OKRs for entire inbox
- Progress summary: Shows overall completion rate
- Tag-based UI for compact display
- Agent can reference via "OKR Check-In" quick action

### Architecture
- Central scoring logic in \`lib/straightLineScoring.js\`
- Component: \`components/linkedin/InboxManagerChat.jsx\` (evaluates and displays all metrics)
- Agent instructions: \`agents/inbox_manager.json\` (guides on Three Tens, Straight Line System)
- Contact entity: \`LinkedInContact\` (stores tier scores, response status, triage data)

### Remaining Work

#### 1. Agent Integration Enhancement
- [ ] Agent should reference global + individual OKRs when drafting replies and strategies
- [ ] Inject OKR context into prompt: "Here are the contact's OKRs: [list]. How does this reply move them forward?"
- [ ] Add OKR-aware quick actions: "Draft a reply that advances our OKRs with this contact"

#### 2. Data Persistence
- [ ] Persist global + individual OKRs to backend (currently in-memory state)
- [ ] Create OKRForContact entity or store in LinkedInContact.okrs field
- [ ] Sync OKRs across browser sessions

#### 3. UI/UX Refinements
- [ ] Drag-reorder global OKRs by priority
- [ ] Color-code OKRs by status (on-track, at-risk, completed)
- [ ] Add OKR deadline tracking
- [ ] Archive completed OKRs view

#### 4. Analytics & Reporting
- [ ] Track which OKRs drive the most outreach activity
- [ ] Report: "Which contacts contributed most to OKR completion?"
- [ ] Dashboard: "OKR velocity - how many complete per week?"

#### 5. Agent Skill Expansion
- [ ] Extended skill set to reference Straight Line System in all advice
- [ ] Objection handling: "Your lowest certainty is [X]. Here's how to build it."
- [ ] Scenario coaching: Multi-contact strategy based on OKRs

### Testing & Validation
- [ ] QA: OKR add/remove/complete workflows
- [ ] Edge case: Delete contact with active OKRs
- [ ] Performance: Bulk operations on 100+ contacts
- [ ] Agent training: Verify OKR context is correctly injected into drafts

### Success Metrics
- Users complete OKRs on time
- Agent provides OKR-aware guidance
- Higher reply quality when agent knows contact's OKRs
- Increased conviction/certainty scores when OKRs are tracked`;

    const credentials = `${jiraEmail}:${jiraToken}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(credentials);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const authString = btoa(credentials);

    const payload = {
      fields: {
        project: { id: '10000' }, // Default project ID - will fail gracefully if wrong
        issuetype: { name: 'Story' },
        summary: 'LinkedIn Inbox Manager: Straight Line System + OKRs Integration',
        description: {
          version: 3,
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'LinkedIn Inbox Manager Enhancement - Straight Line System Integration\n\n'
                }
              ]
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: description
                }
              ]
            }
          ]
        },
        priority: { name: 'High' },
      }
    };

    const response = await fetch(`${jiraUrl}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Jira error:', error);
      return Response.json({ error: `Jira API error: ${error}` }, { status: response.status });
    }

    const result = await response.json();
    console.log('Jira ticket created:', result.key);

    return Response.json({
      success: true,
      ticketKey: result.key,
      ticketUrl: `${jiraUrl}/browse/${result.key}`,
      message: `Jira ticket ${result.key} created successfully`
    });
  } catch (error) {
    console.error('Error creating Jira ticket:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});