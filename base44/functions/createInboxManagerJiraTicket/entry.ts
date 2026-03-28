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

    const descText = 'LinkedIn Inbox Manager Enhancement - Straight Line System Integration. Completed: Three Tens Certainty Scoring, Problem Hypothesis Generation, Solution Range Proposals, Individual Contact OKRs, Global Inbox Manager OKRs. Remaining: Agent Integration Enhancement, Data Persistence, UI/UX Refinements, Analytics & Reporting, Agent Skill Expansion, Testing & Validation.';

    const credentials = `${jiraEmail}:${jiraToken}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(credentials);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const authString = btoa(credentials);

    const payload = {
      fields: {
        project: { key: 'PLATFORM' },
        issuetype: { name: 'Task' },
        summary: 'LinkedIn Inbox Manager: Straight Line System + OKRs Integration'
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