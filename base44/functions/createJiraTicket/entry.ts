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
    const { summary, description, issueType = 'Task', projectKey = 'DEV', labels = [], assigneeEmail } = body;

    if (!summary) {
      return Response.json({ error: 'summary is required' }, { status: 400 });
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

    // Build issue payload
    const issuePayload = {
      fields: {
        project: { key: projectKey },
        summary,
        issuetype: { name: issueType },
        labels,
      },
    };

    if (description) {
      issuePayload.fields.description = {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: description }],
          },
        ],
      };
    }

    // Optional: assign to user by email (if Jira project supports it)
    if (assigneeEmail) {
      issuePayload.fields.assignee = { emailAddress: assigneeEmail };
    }

    const response = await fetch(
      `${instanceUrl}/rest/api/3/issue`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(issuePayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Jira create error:', response.status, errorText);
      return Response.json(
        { error: `Failed to create ticket: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();

    return Response.json({
      success: true,
      ticketKey: result.key,
      ticketId: result.id,
      url: `${instanceUrl}/browse/${result.key}`,
    });
  } catch (error) {
    console.error('createJiraTicket error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});