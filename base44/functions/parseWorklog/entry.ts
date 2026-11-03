import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Reads a work log kept outside the platform — a Gemini Notebook session summary, a
// pasted transcript, a CSV of timestamps, a screenshot of a timer — and hands the desk one
// draft session: the day, the clock times, the elapsed duration the log reports, and the
// jobs inside it. Nothing here writes to the ledger: the draft is reviewed by a person
// before it is filed.

const CATEGORIES = [
  'editorial',
  'research',
  'production',
  'travel',
  'lodging',
  'meals',
  'software',
  'equipment',
  'services',
  'other',
];

const EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    session_date: { type: 'string', description: 'Local calendar day of the work, YYYY-MM-DD. Empty when the log gives no date.' },
    start_time: { type: 'string', description: '24-hour HH:MM in the log\'s own local time. Empty when the log states no start time.' },
    end_time: { type: 'string', description: '24-hour HH:MM in the log\'s own local time. Empty when the log states no end time.' },
    duration_minutes: { type: 'number', description: 'Whole minutes of elapsed session time the log reports, as a number only.' },
    timezone: { type: 'string', description: 'IANA zone the log times are in, when it states one, e.g. America/Los_Angeles. Empty otherwise.' },
    person: { type: 'string', description: 'Whose hours these are, when the log names them.' },
    project: { type: 'string', description: 'The piece of work the session belongs to, in a few words.' },
    summary: { type: 'string', description: 'One sentence, at most 140 characters, naming the work the session did.' },
    category: { type: 'string', enum: CATEGORIES, description: 'The closest curated category for the work.' },
    tasks: {
      type: 'array',
      description: 'The discrete jobs inside the session, in the order they were worked.',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string', description: 'The job, as a short phrase.' },
          minutes: { type: 'number', description: 'Minutes for this job.' },
          reported: { type: 'boolean', description: 'True only when the log itself gives this job\'s minutes or clock times. False when the time was allocated across the session by you.' },
          note: { type: 'string', description: 'One line of detail, when the log carries it.' },
        },
      },
    },
    deliverables: {
      type: 'array',
      description: 'What the session produced or settled: drafts, files, links, decisions. Short noun phrases.',
      items: { type: 'string' },
    },
    notes: { type: 'string', description: 'Anything the desk should know that the fields above do not hold.' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'], description: 'How completely the log supported this reading.' },
  },
};

function buildPrompt(text: string, hasFile: boolean, fileName: string) {
  const source = hasFile
    ? `The work log is attached as a document or an image${fileName ? ` (${fileName})` : ''}. Read it.`
    : `Here is the work log:\n\n"""\n${text}\n"""`;

  return `You read a work log kept by someone doing editorial, research and operational work, and turn it into ONE timecard session. The log may be a Gemini Notebook session summary, a chat transcript, a CSV or spreadsheet export of timestamps, a screenshot of a timer, or hand-written notes.

${source}

Rules:
- Read only what the log supports. Never invent a time, a project, a task or a deliverable. Where the log is silent, leave the field empty or zero.
- session_date is the local calendar day the work happened. If the log gives several days, describe the first session of the most fully documented day and say so in notes.
- start_time and end_time are the log's own local clock times, 24-hour. Never derive them from a duration, and never guess them.
- duration_minutes is the elapsed time the log reports, as whole minutes. If the log gives only clock times, use the difference between them. If it gives neither, use 0.
- duration_minutes is wall-clock time, not active typing or attention time. Do not inflate it.
- tasks are the jobs inside the session. Put them in the order they were worked. When the log states minutes or clock times for a job, use them and set reported true. When it does not, allocate the session's duration across the jobs in proportion to the work described, and set reported false. Mark every task either way.
- deliverables are what the session actually produced: a draft, a file, a link, a decision, a reply. Short noun phrases, no sentences of praise.
- summary names the work in one sentence of at most 140 characters, in plain editorial English. No exclamation marks, no marketing.
- category must be one of: ${CATEGORIES.join(', ')}.
- confidence is high when the log states the day and the times, medium when only one of them is stated, low when the session had to be reconstructed.

Return the JSON object only.`;
}

function timeOf(value: unknown) {
  const raw = typeof value === 'string' ? value.trim() : '';
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '';
  const hour = Math.min(23, Number(match[1]));
  const minute = Math.min(59, Number(match[2]));
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function dateOf(value: unknown) {
  const raw = typeof value === 'string' ? value.trim().slice(0, 10) : '';
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : '';
}

async function fingerprintOf(parts: string[]) {
  const joined = parts.map((p) => (p || '').trim().toLowerCase()).join('|').replace(/\s+/g, ' ');
  const bytes = new TextEncoder().encode(joined);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth
      .me()
      .catch((e: { status?: number }) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const text = typeof body.text === 'string' ? body.text.trim().slice(0, 40000) : '';
    const fileUri = typeof body.file_uri === 'string' ? body.file_uri.trim() : '';
    const fileName = typeof body.file_name === 'string' ? body.file_name.trim().slice(0, 160) : '';

    if (!text && !fileUri) {
      return Response.json(
        { error: 'Paste the work log, or attach the file it was exported to.' },
        { status: 400 },
      );
    }

    const fileUrls: string[] = [];
    if (fileUri) {
      const signed = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 900 });
      const url = signed?.signed_url || signed?.signedUrl || '';
      if (!url) return Response.json({ error: 'That file could not be opened.' }, { status: 400 });
      fileUrls.push(url);
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = (await base44.integrations.Core.InvokeLLM({
        prompt: buildPrompt(text, fileUrls.length > 0, fileName),
        ...(fileUrls.length ? { file_urls: fileUrls } : {}),
        response_json_schema: EXTRACTION_SCHEMA,
      })) as Record<string, unknown>;
    } catch {
      return Response.json(
        { error: 'That log could not be read. Try pasting the text of the session instead.' },
        { status: 502 },
      );
    }

    if (!parsed || typeof parsed !== 'object') {
      return Response.json({ error: 'Nothing could be read out of that log.' }, { status: 422 });
    }

    const minutes = Math.max(0, Math.round(Number(parsed.duration_minutes) || 0));
    const sessionDate = dateOf(parsed.session_date) || new Date().toISOString().slice(0, 10);
    const startTime = timeOf(parsed.start_time);
    const endTime = timeOf(parsed.end_time);
    const project = typeof parsed.project === 'string' ? parsed.project.trim() : '';
    const summary = typeof parsed.summary === 'string' ? parsed.summary.trim().slice(0, 240) : '';
    const category = CATEGORIES.includes(String(parsed.category)) ? String(parsed.category) : 'other';

    const rawTasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    const tasks = rawTasks
      .map((task: Record<string, unknown>) => ({
        label: typeof task?.label === 'string' ? task.label.trim().slice(0, 160) : '',
        minutes: Math.max(0, Math.round(Number(task?.minutes) || 0)),
        estimated: task?.reported !== true,
        note: typeof task?.note === 'string' ? task.note.trim().slice(0, 240) : '',
      }))
      .filter((task: { label: string; minutes: number }) => task.label || task.minutes)
      .slice(0, 24);

    const deliverables = (Array.isArray(parsed.deliverables) ? parsed.deliverables : [])
      .map((item: unknown) => (typeof item === 'string' ? item.trim().slice(0, 200) : ''))
      .filter(Boolean)
      .slice(0, 20);

    const draft = {
      session_date: sessionDate,
      start_time: startTime,
      end_time: endTime,
      duration_minutes: minutes,
      timezone: typeof parsed.timezone === 'string' ? parsed.timezone.trim().slice(0, 60) : '',
      person: typeof parsed.person === 'string' ? parsed.person.trim().slice(0, 120) : '',
      project: project.slice(0, 120),
      summary,
      category,
      tasks,
      deliverables,
      notes: typeof parsed.notes === 'string' ? parsed.notes.trim().slice(0, 1000) : '',
      confidence: ['high', 'medium', 'low'].includes(String(parsed.confidence))
        ? String(parsed.confidence)
        : 'medium',
      tasks_reported: tasks.filter((t: { estimated: boolean }) => !t.estimated).length,
    };

    // The same log filed twice is recognised by what the session actually says, not by
    // the file it arrived in.
    const fingerprint = await fingerprintOf([sessionDate, startTime, endTime, project, summary]);
    const existing = await base44.entities.Timecard.filter(
      { source_fingerprint: fingerprint },
      { limit: 1 },
    );
    const match = existing?.items?.[0] || null;

    return Response.json({
      draft,
      fingerprint,
      duplicate: match
        ? {
            id: match.id,
            entry_date: match.entry_date,
            description: match.description,
            status: match.status,
          }
        : null,
    });
  } catch (error) {
    return Response.json({ error: error?.message || 'The work log could not be read.' }, { status: 500 });
  }
}