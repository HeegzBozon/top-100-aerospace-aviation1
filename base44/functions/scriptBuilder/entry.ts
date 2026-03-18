import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * scriptBuilder
 * Accepts raw content + context, returns N posts mapped to
 * JJJH + AIDA + Hero's Journey slots using Claude Sonnet.
 *
 * Payload: {
 *   raw_content: string,
 *   title: string,
 *   objective: string,
 *   platform: string,        // "linkedin" | "instagram" | "threads"
 *   post_count: number,      // 1–12
 * }
 */

const HERO_STEPS = [
  { slot: 0, step: "Ordinary World",          jjjh: "Jab",  aida: "Attention" },
  { slot: 1, step: "Call to Adventure",       jjjh: "Jab",  aida: "Interest"  },
  { slot: 2, step: "Refusal of the Call",     jjjh: "Jab",  aida: "Interest"  },
  { slot: 3, step: "Meeting the Mentor",      jjjh: "Hook", aida: "Action"    },
  { slot: 4, step: "Crossing the Threshold",  jjjh: "Jab",  aida: "Attention" },
  { slot: 5, step: "Tests, Allies & Enemies", jjjh: "Jab",  aida: "Interest"  },
  { slot: 6, step: "Approach the Inmost Cave",jjjh: "Jab",  aida: "Desire"    },
  { slot: 7, step: "The Ordeal",              jjjh: "Hook", aida: "Action"    },
  { slot: 8, step: "Reward",                  jjjh: "Jab",  aida: "Desire"    },
  { slot: 9, step: "The Road Back",           jjjh: "Jab",  aida: "Desire"    },
  { slot: 10, step: "Resurrection",           jjjh: "Jab",  aida: "Interest"  },
  { slot: 11, step: "Return with the Elixir", jjjh: "Hook", aida: "Action"    },
];

const CHAR_LIMITS = { linkedin: 3000, instagram: 2200, threads: 500 };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { raw_content, title, objective, platform = 'linkedin', post_count = 4 } = await req.json();

    if (!raw_content?.trim()) {
      return Response.json({ error: 'raw_content is required' }, { status: 400 });
    }

    const count = Math.min(Math.max(1, parseInt(post_count) || 4), 12);
    const charLimit = CHAR_LIMITS[platform] || 3000;
    const slots = HERO_STEPS.slice(0, count);

    const prompt = `You are a world-class social media copywriter specialising in the Straight Line System, AIDA framework, and Jab Jab Jab Hook (JJJH) content strategy.

SOURCE MATERIAL:
Title: ${title || 'Untitled'}
Objective (OKR): ${objective || 'Build authority and grow audience'}
Platform: ${platform} (max ${charLimit} characters per post)
Raw Content:
---
${raw_content.slice(0, 8000)}
---

TASK:
Generate exactly ${count} standalone social media posts. Each post maps to a specific Hero's Journey slot and AIDA/JJJH role as defined below.

SLOTS TO FILL:
${slots.map(s => `Slot ${s.slot}: "${s.step}" | JJJH: ${s.jjjh} | AIDA: ${s.aida}`).join('\n')}

FRAMEWORK RULES:
- Jab posts (AIDA: Attention/Interest/Desire): Give value freely. No hard sell. Educate, entertain, or inspire. Build trust.
- Hook posts (AIDA: Action): Clear CTA. Invite connection, comment, share, or follow. One ask only.
- Straight Line System: Each post is a step on the journey from "prospect doesn't know us" to "committed believer".
- Write for ${platform}: ${platform === 'linkedin' ? 'Professional tone, use line breaks liberally, no hashtag spam (max 3 relevant tags)' : platform === 'threads' ? 'Conversational, punchy, under 500 chars' : 'Visual-first captions, 3-5 hashtags'}
- Each post must be self-contained and valuable even without the others.
- Do NOT mention "Hero's Journey", "AIDA", or "JJJH" in the posts.

Return a JSON object with this exact schema:
{
  "posts": [
    {
      "slot": <number>,
      "hero_step": "<step name>",
      "jjjh": "<Jab|Hook>",
      "aida": "<Attention|Interest|Desire|Action>",
      "content": "<the post text, ready to publish>",
      "hook_line": "<the first 1-2 lines — the scroll-stopper>",
      "notes": "<1 sentence explaining the strategic intent of this post>"
    }
  ]
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: 'object',
        properties: {
          posts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                slot: { type: 'number' },
                hero_step: { type: 'string' },
                jjjh: { type: 'string' },
                aida: { type: 'string' },
                content: { type: 'string' },
                hook_line: { type: 'string' },
                notes: { type: 'string' },
              },
              required: ['slot', 'hero_step', 'jjjh', 'aida', 'content', 'hook_line', 'notes'],
            },
          },
        },
        required: ['posts'],
      },
    });

    // InvokeLLM with response_json_schema wraps output under result.response
    const parsed = result?.response ?? result;
    const posts = Array.isArray(parsed?.posts) ? parsed.posts : [];
    console.log('[scriptBuilder] generated', posts.length, 'posts');
    return Response.json({ posts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});