import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { issueKey, transitionName, comment } = body;

    if (!issueKey) {
      return Response.json({ error: 'issueKey is required' }, { status: 400 });
    }

    const instanceUrl = Deno.env.get('JIRA_INSTANCE_URL');
    const apiToken = Deno.env.get('JIRA_API_TOKEN');
    const userEmail = Deno.env.get('JIRA_USER_EMAIL');

    if (!instanceUrl || !apiToken || !userEmail) {
      return Response.json({ error: 'Jira credentials not configured' }, { status: 500 });
    }

    const authHeader = 'Basic ' + btoa(`${userEmail}:${apiToken}`);
    const headers = {
      'Authorization': authHeader,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    // 1. Get available transitions for this issue
    const transitionsRes = await fetch(
      `${instanceUrl}/rest/api/3/issue/${issueKey}/transitions`,
      { headers }
    );

    if (!transitionsRes.ok) {
      const errText = await transitionsRes.text();
      return Response.json({ error: `Failed to get transitions: ${transitionsRes.status}`, details: errText }, { status: transitionsRes.status });
    }

    const { transitions } = await transitionsRes.json();

    // If no transitionName provided, just return available transitions
    if (!transitionName) {
      return Response.json({
        issueKey,
        availableTransitions: transitions.map(t => ({ id: t.id, name: t.name, to: t.to?.name })),
      });
    }

    // 2. Find matching transition (case-insensitive)
    const match = transitions.find(
      t => t.name.toLowerCase() === transitionName.toLowerCase()
    );

    if (!match) {
      return Response.json({
        error: `Transition "${transitionName}" not available`,
        availableTransitions: transitions.map(t => ({ id: t.id, name: t.name, to: t.to?.name })),
      }, { status: 400 });
    }

    // 3. Execute transition
    const transitionPayload = { transition: { id: match.id } };

    const execRes = await fetch(
      `${instanceUrl}/rest/api/3/issue/${issueKey}/transitions`,
      { method: 'POST', headers, body: JSON.stringify(transitionPayload) }
    );

    if (!execRes.ok) {
      const errText = await execRes.text();
      return Response.json({ error: `Transition failed: ${execRes.status}`, details: errText }, { status: execRes.status });
    }

    // 4. Optionally add a comment
    if (comment) {
      await fetch(
        `${instanceUrl}/rest/api/3/issue/${issueKey}/comment`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            body: {
              type: 'doc',
              version: 1,
              content: [{ type: 'paragraph', content: [{ type: 'text', text: comment }] }],
            },
          }),
        }
      );
    }

    return Response.json({
      success: true,
      issueKey,
      transitionedTo: match.to?.name || match.name,
    });
  } catch (error) {
    console.error('updateJiraTicket error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});