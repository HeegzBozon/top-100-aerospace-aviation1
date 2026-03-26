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
    const { project, status, maxResults = 50, startAt = 0 } = body;

    const instanceUrl = Deno.env.get('JIRA_INSTANCE_URL');
    const apiToken = Deno.env.get('JIRA_API_TOKEN');
    const userEmail = Deno.env.get('JIRA_USER_EMAIL');

    if (!instanceUrl || !apiToken || !userEmail) {
      return Response.json({ error: 'Jira credentials not configured' }, { status: 500 });
    }

    // Build JQL query — the new /search/jql endpoint requires bounded queries
    const conditions = [];
    if (project) {
      conditions.push(`project = "${project}"`);
    } else {
      // Default: fetch from all projects updated in the last 90 days
      conditions.push('updated >= -90d');
    }
    if (status) conditions.push(`status = "${status}"`);
    const jql = conditions.join(' AND ') + ' ORDER BY updated DESC';

    const params = new URLSearchParams({
      jql,
      maxResults: String(maxResults),
      startAt: String(startAt),
      fields: 'summary,status,assignee,priority,issuetype,created,updated,description,labels,project',
    });

    const authHeader = 'Basic ' + btoa(`${userEmail}:${apiToken}`);

    const response = await fetch(
      `${instanceUrl}/rest/api/3/search/jql?${params.toString()}`,
      {
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Jira API error:', response.status, errorText);
      return Response.json(
        { error: `Jira API returned ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Normalize tickets for frontend consumption
    const tickets = (data.issues || []).map(issue => ({
      id: issue.id,
      key: issue.key,
      summary: issue.fields.summary,
      status: issue.fields.status?.name,
      statusCategory: issue.fields.status?.statusCategory?.name,
      assignee: issue.fields.assignee?.displayName || null,
      assigneeAvatar: issue.fields.assignee?.avatarUrls?.['48x48'] || null,
      priority: issue.fields.priority?.name,
      issueType: issue.fields.issuetype?.name,
      issueTypeIcon: issue.fields.issuetype?.iconUrl,
      created: issue.fields.created,
      updated: issue.fields.updated,
      labels: issue.fields.labels || [],
      project: issue.fields.project?.name,
      projectKey: issue.fields.project?.key,
      url: `${instanceUrl}/browse/${issue.key}`,
    }));

    return Response.json({
      tickets,
      total: data.total,
      startAt: data.startAt,
      maxResults: data.maxResults,
    });
  } catch (error) {
    console.error('getJiraTickets error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});