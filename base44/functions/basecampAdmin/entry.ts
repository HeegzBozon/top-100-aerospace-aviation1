import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

// Basecamp, kept behind the house door. The account id and access token live as app secrets
// and are read here, inside the handler, on every call: the browser never receives them.
// Every action is administrator-only, and every record is read or written through the
// Basecamp API for the one account the house has connected.

const HOST = 'https://3.basecampapi.com';
const USER_AGENT = 'TOP 100 Aerospace & Aviation (admin desk)';
const TIMEOUT = 15000;

function readSecret(name) {
  try {
    return secrets.get(name) || '';
  } catch {
    return '';
  }
}

async function bcFetch(token, url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
    signal: AbortSignal.timeout(TIMEOUT),
  });

  if (!response.ok) {
    let detail = '';
    try {
      const payload = await response.json();
      detail = payload?.error || payload?.message || '';
    } catch {
      detail = await response.text().catch(() => '');
    }
    const error = new Error(detail || `Basecamp answered ${response.status}`);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// A couple of endpoints differ between Basecamp's generations. Try the documented paths in
// order and keep the last real failure.
async function fetchFirst(token, urls) {
  let lastError = null;
  for (const url of urls) {
    try {
      return await bcFetch(token, url);
    } catch (error) {
      lastError = error;
      if (error.status !== 404 && error.status !== 400) throw error;
    }
  }
  throw lastError || new Error('Basecamp answered nothing');
}

async function dockToolId(token, account, projectId, tool) {
  const project = await bcFetch(token, `${account}/projects/${projectId}.json`);
  const entry = (project?.dock || []).find((item) => item.name === tool && item.enabled !== false);
  return entry ? entry.id : null;
}

function trimRecords(list, limit) {
  return Array.isArray(list) ? list.slice(0, limit) : [];
}

export default async function (req) {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me().catch((error) => (error.status === 401 ? null : Promise.reject(error)));
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') {
    return Response.json({ error: 'Forbidden: administrators only' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || 'status');
  const token = readSecret('BASECAMP_ACCESS_TOKEN');
  const accountId = readSecret('BASECAMP_ACCOUNT_ID');

  if (action === 'status') {
    if (!token || !accountId) return Response.json({ configured: false });
    const account = `${HOST}/${accountId}`;
    try {
      const projects = await bcFetch(token, `${account}/projects.json`);
      return Response.json({
        configured: true,
        ok: true,
        account: accountId,
        projectCount: Array.isArray(projects) ? projects.length : 0,
      });
    } catch (error) {
      return Response.json({ configured: true, ok: false, account: accountId, error: error.message });
    }
  }

  if (!token || !accountId) {
    return Response.json(
      { error: 'Basecamp is not connected. Add BASECAMP_ACCOUNT_ID and BASECAMP_ACCESS_TOKEN on Dashboard → Secrets.' },
      { status: 400 }
    );
  }

  const account = `${HOST}/${accountId}`;
  const projectId = String(body.projectId || '').trim();
  const recordId = String(body.recordId || '').trim();

  try {
    if (action === 'projects') {
      const projects = await bcFetch(token, `${account}/projects.json`);
      return Response.json({
        account: accountId,
        projects: trimRecords(projects, 100).map((project) => ({
          id: String(project.id),
          name: project.name,
          description: project.description || '',
          status: project.status || '',
        })),
      });
    }

    if (!projectId && action !== 'projects') {
      return Response.json({ error: 'A project is required.' }, { status: 400 });
    }

    const bucket = `${account}/buckets/${projectId}`;

    if (action === 'lists') {
      const lists = await bcFetch(token, `${bucket}/todolists.json`);
      return Response.json({
        lists: trimRecords(lists, 40).map((list) => ({ id: String(list.id), title: list.title })),
      });
    }

    if (action === 'records') {
      const kind = String(body.kind || 'todos');

      if (kind === 'todos') {
        const lists = trimRecords(await bcFetch(token, `${bucket}/todolists.json`), 8);
        const results = await Promise.allSettled(
          lists.map((list) => bcFetch(token, `${bucket}/todolists/${list.id}/todos.json`))
        );
        const records = [];
        results.forEach((result, index) => {
          if (result.status !== 'fulfilled') return;
          for (const todo of trimRecords(result.value, 40)) {
            records.push({ ...todo, list_id: String(lists[index].id), list_title: lists[index].title });
          }
        });
        records.sort((a, b) => {
          if (Boolean(a.completed) !== Boolean(b.completed)) return a.completed ? 1 : -1;
          return String(a.due_on || '9999').localeCompare(String(b.due_on || '9999'));
        });
        return Response.json({ records: records.slice(0, 80) });
      }

      if (kind === 'messages') {
        const boardId = await dockToolId(token, account, projectId, 'message_board').catch(() => null);
        const urls = boardId
          ? [`${bucket}/message_boards/${boardId}/messages.json`, `${bucket}/messages.json`]
          : [`${bucket}/messages.json`];
        const messages = await fetchFirst(token, urls);
        return Response.json({ records: trimRecords(messages, 60) });
      }

      if (kind === 'documents') {
        const documents = await bcFetch(token, `${bucket}/documents.json`);
        return Response.json({ records: trimRecords(documents, 60) });
      }

      if (kind === 'people') {
        const people = await bcFetch(token, `${bucket}/people.json`);
        return Response.json({ records: trimRecords(people, 100) });
      }

      if (kind === 'cards') {
        const tables = await bcFetch(token, `${bucket}/card_tables.json`);
        const columns = [];
        for (const table of Array.isArray(tables) ? tables : []) {
          for (const column of table.lists || table.columns || []) {
            columns.push({ id: String(column.id), title: column.title || 'Column' });
          }
        }
        const results = await Promise.allSettled(
          columns.slice(0, 8).map((column) =>
            bcFetch(token, `${bucket}/card_tables/lists/${column.id}/cards.json`)
          )
        );
        const records = [];
        results.forEach((result, index) => {
          if (result.status !== 'fulfilled') return;
          for (const card of trimRecords(result.value, 30)) {
            records.push({ ...card, column_title: columns[index].title });
          }
        });
        return Response.json({ records: records.slice(0, 80) });
      }

      return Response.json({ error: `Unknown record kind: ${kind}` }, { status: 400 });
    }

    if (action === 'record') {
      if (!recordId) return Response.json({ error: 'A record is required.' }, { status: 400 });
      const kind = String(body.kind || 'todos');
      const path =
        kind === 'messages'
          ? `${bucket}/messages/${recordId}.json`
          : kind === 'documents'
            ? `${bucket}/documents/${recordId}.json`
            : kind === 'cards'
              ? `${bucket}/card_tables/cards/${recordId}.json`
              : kind === 'people'
                ? `${bucket}/people/${recordId}.json`
                : `${bucket}/todos/${recordId}.json`;
      const record = await bcFetch(token, path);
      return Response.json({ record });
    }

    if (action === 'comments') {
      if (!recordId) return Response.json({ error: 'A record is required.' }, { status: 400 });
      const comments = await fetchFirst(token, [
        `${bucket}/recordings/${recordId}/comments.json`,
        `${bucket}/comments.json?recording_id=${recordId}`,
      ]);
      return Response.json({ comments: trimRecords(comments, 100) });
    }

    if (action === 'createTodo') {
      const listId = String(body.listId || '').trim();
      const content = String(body.content || '').trim();
      if (!listId) return Response.json({ error: 'A to-do list is required.' }, { status: 400 });
      if (!content) return Response.json({ error: 'A to-do needs a line to say what it is.' }, { status: 400 });
      const record = await bcFetch(token, `${bucket}/todolists/${listId}/todos.json`, {
        method: 'POST',
        body: JSON.stringify({
          content,
          description: String(body.description || ''),
          due_on: body.due_on || null,
        }),
      });
      return Response.json({ record, created: true });
    }

    if (action === 'updateTodo') {
      const record = await bcFetch(token, `${bucket}/todos/${recordId}.json`, {
        method: 'PUT',
        body: JSON.stringify({
          content: String(body.content || '').trim(),
          description: String(body.description || ''),
          due_on: body.due_on || null,
        }),
      });
      return Response.json({ record });
    }

    if (action === 'toggleTodo') {
      if (!recordId) return Response.json({ error: 'A record is required.' }, { status: 400 });
      await bcFetch(token, `${bucket}/todos/${recordId}/completion.json`, {
        method: body.complete ? 'POST' : 'DELETE',
      });
      const record = await bcFetch(token, `${bucket}/todos/${recordId}.json`);
      return Response.json({ record });
    }

    if (action === 'createMessage') {
      const subject = String(body.subject || '').trim();
      if (!subject) return Response.json({ error: 'A message needs a subject.' }, { status: 400 });
      const boardId = await dockToolId(token, account, projectId, 'message_board');
      if (!boardId) {
        return Response.json(
          { error: 'This project has no message board turned on in Basecamp.' },
          { status: 400 }
        );
      }
      const record = await bcFetch(token, `${bucket}/message_boards/${boardId}/messages.json`, {
        method: 'POST',
        body: JSON.stringify({ subject, content: String(body.content || '') }),
      });
      return Response.json({ record, created: true });
    }

    if (action === 'updateMessage') {
      const record = await bcFetch(token, `${bucket}/messages/${recordId}.json`, {
        method: 'PUT',
        body: JSON.stringify({
          subject: String(body.subject || '').trim(),
          content: String(body.content || ''),
        }),
      });
      return Response.json({ record });
    }

    if (action === 'createComment') {
      const content = String(body.content || '').trim();
      if (!recordId || !content) {
        return Response.json({ error: 'A record and a line to say are required.' }, { status: 400 });
      }
      await bcFetch(token, `${bucket}/recordings/${recordId}/comments.json`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      const comments = await fetchFirst(token, [
        `${bucket}/recordings/${recordId}/comments.json`,
        `${bucket}/comments.json?recording_id=${recordId}`,
      ]);
      return Response.json({ comments: trimRecords(comments, 100) });
    }

    if (action === 'trash') {
      if (!recordId) return Response.json({ error: 'A record is required.' }, { status: 400 });
      await bcFetch(token, `${bucket}/recordings/${recordId}/status/trashed.json`, {
        method: 'PUT',
        body: JSON.stringify({}),
      });
      return Response.json({ removed: true });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: error.status || 502 });
  }
}