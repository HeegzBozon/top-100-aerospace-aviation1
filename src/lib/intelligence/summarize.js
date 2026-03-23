import { base44 } from '@/api/base44Client';

/**
 * Summarize a batch of news headlines for a given category.
 * Returns a 3-5 sentence intelligence brief via Base44 InvokeLLM.
 */
export async function summarizeCategory(category, items) {
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

  const prompt = `You are a senior intelligence analyst. Synthesize these ${categoryLabels[category] || category} headlines into a 3-sentence strategic brief. Focus on patterns, emerging trends, and key developments. Be direct and analytical — no preamble.

Headlines:
${headlines}

Brief:`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: 'claude_sonnet_4_6',
  });

  return typeof result === 'string' ? result.trim() : '';
}