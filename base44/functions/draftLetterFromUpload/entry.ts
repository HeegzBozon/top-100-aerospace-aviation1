import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// WRITES A DRAFT LETTER OUT OF WHAT WAS UPLOADED.
//
// A colleague drops in whatever the letter is being made from — a report, a set of notes, a
// rough article, a press release, a screenshot of one — and this reads it into ONE issue of
// the Dispatch in the house's brief shape: a headline, the gist of each item, why it matters,
// a short run of quick hits and a sign-off.
//
// Nothing is filed here. The draft comes back to the desk, where a person reads it, changes
// what they like and saves it. Nothing is invented either: the reader is told to write fewer
// items rather than pad, and to carry a link only when the source printed one.

const TEXTUAL = /\.(txt|md|markdown|csv|json|rtf|log)$/i;
const MAX_FILES = 5;
const MAX_TEXT = 24000;

const LETTER_SCHEMA = {
  type: 'object',
  properties: {
    kicker: {
      type: 'string',
      description: 'The small line above the headline, e.g. "The Dispatch · Wednesday".',
    },
    headline: {
      type: 'string',
      description: 'The subject line. A real statement of what is inside, under 55 characters. Never a tease.',
    },
    standfirst: {
      type: 'string',
      description: 'One sentence, under 100 characters, carried as the inbox preview line.',
    },
    sections: {
      type: 'array',
      description: 'One to three items, strongest first. Fewer items rather than padding.',
      items: {
        type: 'object',
        properties: {
          label: {
            type: 'string',
            description: 'A two- or three-word rubric for the item, e.g. "On the pad", "The record", "Appointments".',
          },
          title: {
            type: 'string',
            description: 'The item\'s own headline, under 70 characters, in plain declarative English.',
          },
          body: {
            type: 'string',
            description:
              'Two to four short sentences. The FIRST sentence is the gist and must stand alone. The sentences after it say why it matters to the reader.',
          },
          url: {
            type: 'string',
            description: 'A link that appears verbatim in the source. Empty string when the source names none.',
          },
        },
      },
    },
    quick_links: {
      type: 'array',
      description: 'Up to five further one-line items with a link each. Empty array when the source has no more.',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'One short line, under 60 characters.' },
          url: { type: 'string', description: 'A link that appears verbatim in the source. Empty when none.' },
        },
      },
    },
    closing: {
      type: 'string',
      description: 'The sign-off: one line, under 20 words, that the house can put its name to.',
    },
    cta_label: { type: 'string', description: 'The one key the letter carries, e.g. "Read the record".' },
    cta_url: { type: 'string', description: 'Where that key goes. An in-house path or an https address.' },
  },
};

function buildPrompt(corpus: string, hasFiles: boolean, names: string[], note: string, weekday: string) {
  const source = hasFiles
    ? `The source material is attached${names.length ? ` (${names.join(', ')})` : ''}. Read all of it.`
    : '';

  return `You are the editor of the Dispatch, the short weekly letter of TOP 100 Aerospace & Aviation, sent to the house's members, honorees, nominators and readers. A colleague has handed you source material for the next issue. Turn it into ONE issue of the Dispatch.

${source}
${corpus ? `\nHere is the material as text:\n\n"""\n${corpus}\n"""\n` : ''}
${note ? `The editor's instruction for this issue: ${note}\n` : ''}
The shape, and it does not change: a headline and one preview line, then one to three items, then a short run of quick hits, then a sign-off and one key.

Voice:
- Quick and plain, in the second person. Short declarative sentences. Say the thing, then say why it matters.
- Institutional, not social. The house measures and records; it does not cheer, and it never hypes.
- No exclamation marks. No emoji. No hashtags. No markdown. No "folks" or "guys".
- Never write "followers", "likes", "sponsored", or "rank" as a verb. Endorsements, the record, Patron of Record.
- The first sentence of every item's body is the gist: it must make sense on its own, with no warm-up.
- British or American spelling consistently: use American.

Rules:
- Use only what the material supports. Never invent a fact, a number, a name, a date, a quotation or a link.
- A url must appear verbatim in the material. When there is no link, return an empty string.
- If the material only supports one item, write one item. Never pad to reach three.
- The headline is the subject line as it lands in an inbox: state the substance, do not tease it.
- The kicker reads "The Dispatch · ${weekday}".
- closing is a line the house can put its name to — a settled thought, not a call to action; the key below is the call.
- cta_label should be short and concrete ("Read the record", "Meet the 2026 cohort"). cta_url is "/" or an in-house path or an https address on top100aero.space unless the material names a better page.

Return the JSON object only.`;
}

function asText(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
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
    const note = asText(body?.note, 600);
    const raw = Array.isArray(body?.files) ? body.files : [];
    const files = raw
      .map((file: Record<string, unknown>) => ({
        file_uri: asText(file?.file_uri, 500),
        name: asText(file?.name, 160),
      }))
      .filter((file: { file_uri: string }) => file.file_uri)
      .slice(0, MAX_FILES);

    if (!files.length) {
      return Response.json({ error: 'Attach at least one file to draft from.' }, { status: 400 });
    }

    const fileUrls: string[] = [];
    const texts: string[] = [];

    for (const file of files) {
      const signed = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri: file.file_uri,
        expires_in: 900,
      });
      const url = signed?.signed_url || signed?.signedUrl || '';
      if (!url) continue;

      // A plain text export is read here and handed over as text; everything else (a PDF, a
      // document, a screenshot) goes to the reader as the file itself.
      if (TEXTUAL.test(file.name)) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
          if (res.ok) {
            const text = (await res.text()).slice(0, MAX_TEXT);
            if (text.trim()) texts.push(text.trim());
            continue;
          }
        } catch {
          // Fall through: the file is handed over as a file instead.
        }
      }
      fileUrls.push(url);
    }

    if (!fileUrls.length && !texts.length) {
      return Response.json({ error: 'Those files could not be opened.' }, { status: 400 });
    }

    const weekday = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      timeZone: 'America/Los_Angeles',
    });

    let parsed: Record<string, unknown>;
    try {
      parsed = (await base44.integrations.Core.InvokeLLM({
        prompt: buildPrompt(
          texts.join('\n\n---\n\n').slice(0, MAX_TEXT * 2),
          fileUrls.length > 0,
          files.map((file: { name: string }) => file.name).filter(Boolean),
          note,
          weekday,
        ),
        ...(fileUrls.length ? { file_urls: fileUrls } : {}),
        response_json_schema: LETTER_SCHEMA,
      })) as Record<string, unknown>;
    } catch {
      return Response.json(
        { error: 'That material could not be read. Try another file, or write the issue by hand.' },
        { status: 502 },
      );
    }

    if (!parsed || typeof parsed !== 'object') {
      return Response.json({ error: 'Nothing could be read out of that material.' }, { status: 422 });
    }

    const sections = (Array.isArray(parsed.sections) ? parsed.sections : [])
      .map((story: Record<string, unknown>) => ({
        label: asText(story?.label, 40),
        title: asText(story?.title, 120),
        body: asText(story?.body, 900),
        url: asText(story?.url, 400),
      }))
      .filter((story: { title: string; body: string }) => story.title || story.body)
      .slice(0, 3);

    const quickLinks = (Array.isArray(parsed.quick_links) ? parsed.quick_links : [])
      .map((link: Record<string, unknown>) => ({
        title: asText(link?.title, 120),
        url: asText(link?.url, 400),
      }))
      .filter((link: { title: string }) => link.title)
      .slice(0, 5);

    const headline = asText(parsed.headline, 160);
    if (!headline || !sections.length) {
      return Response.json(
        { error: 'That material did not hold enough for an issue. Try a fuller document.' },
        { status: 422 },
      );
    }

    const draft = {
      kicker: asText(parsed.kicker, 80) || `The Dispatch · ${weekday}`,
      headline,
      standfirst: asText(parsed.standfirst, 200),
      sections,
      quick_links: quickLinks,
      closing: asText(parsed.closing, 300),
      cta_label: asText(parsed.cta_label, 60) || 'Read the record',
      cta_url: asText(parsed.cta_url, 400) || 'https://top100aero.space',
    };

    return Response.json({
      ok: true,
      draft,
      files: files.map((file: { name: string }) => file.name),
    });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'The material could not be read.' }, { status: 500 });
  }
}