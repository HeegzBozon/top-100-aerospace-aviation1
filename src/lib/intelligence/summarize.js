import { base44 } from '@/api/base44Client';

const CATEGORY_LABELS = {
  geopolitics: 'geopolitical',
  defense: 'defense & military',
  aviation: 'aviation & aerospace',
  technology: 'space & technology',
  markets: 'defense market',
};

/**
 * Summarize a batch of news headlines for a given category.
 * Returns a 3-5 sentence intelligence brief via Base44 InvokeLLM.
 */
export async function summarizeCategory(category, items) {
  const headlines = items
    .slice(0, 20)
    .map(item => `- ${item.title} (${item.source || item.source_name || ''})`)
    .join('\n');

  const label = CATEGORY_LABELS[category] || category;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are a senior intelligence analyst. Synthesize these ${label} headlines into a 3-sentence strategic brief. Focus on patterns, emerging trends, and key developments. Be direct and analytical — no preamble.\n\nHeadlines:\n${headlines}\n\nBrief:`,
    model: 'claude_sonnet_4_6',
  });

  const text = typeof result === 'string' ? result : result?.text || result?.content || '';
  return text.trim();
}
