import { base44 } from '@/api/base44Client';
import { entryContext } from './EntryDetail';

const SCHEMA = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['note', 'task', 'contact', 'upload'] },
    title: { type: 'string' },
    person_name: { type: 'string' },
    body: { type: 'string' },
    due_date: { type: 'string', description: 'YYYY-MM-DD or empty' },
  },
};

// One file in, one filed entry out: read the screenshot, name it, and hand it to the Superagent.
export async function smartCapture(file, user) {
  const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
  const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 600 });
  const read = await base44.integrations.Core.InvokeLLM({
    prompt: `Today is ${new Date().toISOString().slice(0, 10)}. This is a screenshot or file a professional captured into their inbox to keep a relationship moving (a message, profile, email, business card, event, document). Extract: kind (contact if mainly a person/profile/card, task if it implies something to do, otherwise note), a short title (max 70 chars), the person or organization it is with, a concise body summarizing the key facts and where the conversation stands, and a follow-up date only if one is stated or clearly implied.`,
    file_urls: [signed_url],
    response_json_schema: SCHEMA,
  });
  const entry = await base44.entities.InboxEntry.create({
    kind: read.kind || 'upload', title: read.title || file.name, person_name: read.person_name || undefined,
    body: read.body || '', due_date: /^\d{4}-\d{2}-\d{2}$/.test(read.due_date || '') ? read.due_date : undefined,
    file_uri, file_name: file.name,
  });
  await base44.entities.AgentHandoff.create({
    source_key: `entry:${entry.id}`, status: 'requested', owner_email: user.email, source_title: entry.title,
    context: entryContext(entry), instruction: 'Suggest the next action, a follow-up message and any task to keep this relationship moving',
  });
  return entry;
}