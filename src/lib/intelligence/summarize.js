import Anthropic from '@anthropic-ai/sdk';

let _client = null;

function getClient() {
  if (_client) return _client;
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY not set');
  _client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
  return _client;
}

/**
 * Summarize a batch of news headlines for a given category.
 * Returns a 3-5 sentence intelligence brief.
 */
export async function summarizeCategory(category, items) {
  const client = getClient();
  const headlines = items
    .slice(0, 20)
    .map(item => `- ${item.title} (${item.source || item.source_name || ''})`)
    .join('\n');

  const categoryLabels = {
    geopolitics: 'geopolitical',
    defense: 'defense & military',
    aviation: 'aviation & aerospace',
    technology: 'space & technology',
    markets: 'defense market',
  };

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 400,
    messages: [
      {
        role: 'user',
        content: `You are a senior intelligence analyst. Synthesize these ${categoryLabels[category] || category} headlines into a 3-sentence strategic brief. Focus on patterns, emerging trends, and key developments. Be direct and analytical — no preamble.

Headlines:
${headlines}

Brief:`,
      },
    ],
  });

  const text = response.content.find(b => b.type === 'text')?.text || '';
  return text.trim();
}
