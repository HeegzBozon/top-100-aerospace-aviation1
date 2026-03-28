import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Zap, Database, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const ACTION_CARDS = [
  {
    id: 'tone_analyzer',
    icon: Bot,
    label: 'Tone Analyzer',
    description: 'Analyze their message sentiment and communication style.',
    color: 'from-violet-50 to-purple-50',
    border: 'border-violet-200',
    iconColor: 'text-violet-600',
    badgeColor: 'bg-violet-100 text-violet-700',
    skillTag: 'analysis',
    buildPrompt: (contact) =>
      `Analyze the tone, sentiment, and communication style of this LinkedIn message from ${contact.full_name} (${contact.headline}, ${contact.current_company || 'unknown company'}).

Message: "${contact.last_received_message}"

Return a short structured analysis (3–5 bullet points) covering: overall tone, emotional register, intent signals, what they want, and the ideal response posture. Be concise and tactical.`,
  },
  {
    id: 'leverage_brief',
    icon: Zap,
    label: 'Leverage Brief',
    description: 'Surface strategic leverage points for this relationship.',
    color: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-600',
    badgeColor: 'bg-amber-100 text-amber-700',
    skillTag: 'strategy',
    buildPrompt: (contact) =>
      `You are a strategic relationship advisor for TOP 100 Women in Aerospace. Given this contact's profile, identify key leverage points for advancing this relationship.

Contact: ${contact.full_name}
Headline: ${contact.headline}
Company: ${contact.current_company || 'N/A'}
Position: ${contact.current_position || 'N/A'}
TIER-S Score: ${contact.tier_score || 'Not evaluated'} (${contact.tier_classification || 'unclassified'})
Their message: "${contact.last_received_message || 'No message'}"

Provide 3–4 specific leverage points: mutual value propositions, credibility anchors, and conversation hooks that would resonate with this person.`,
  },
  {
    id: 'nomination_fit',
    icon: CheckCircle2,
    label: 'Nomination Fit',
    description: 'Assess nomination potential and TOP 100 alignment.',
    color: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    skillTag: 'evaluation',
    buildPrompt: (contact) =>
      `Assess whether ${contact.full_name} is a strong candidate for TOP 100 Women in Aerospace.

Profile data:
- Headline: ${contact.headline}
- Company: ${contact.current_company || 'N/A'}
- Position: ${contact.current_position || 'N/A'}
- Location: ${contact.location || 'N/A'}
- Followers: ${contact.followers || 'unknown'}
- TIER-S: ${contact.tier_classification || 'not evaluated'} (${contact.tier_score || 0}/20)
- Triage reasoning: ${contact.triage_reasoning || 'none'}

Rate their nomination fit (High / Medium / Low) and explain why in 3–4 sentences. Include what additional information would strengthen or weaken their candidacy.`,
  },
  {
    id: 'resource_match',
    icon: Database,
    label: 'Resource Match',
    description: 'Match available resources and tools to this outreach.',
    color: 'from-blue-50 to-cyan-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
    badgeColor: 'bg-blue-100 text-blue-700',
    skillTag: 'resources',
    buildPrompt: (contact, resources) =>
      `Given this contact and the available resources below, recommend which resources are most relevant to support this outreach.

Contact: ${contact.full_name} — ${contact.headline} at ${contact.current_company || 'N/A'}
Message context: "${contact.last_received_message || 'No message'}"

Available resources:
${resources.length > 0
  ? resources.map(r => `- ${r.display_name} (${r.type}): ${r.description}`).join('\n')
  : '- No resources configured yet'}

For each relevant resource, explain in one sentence how it can be used in this outreach. Then suggest one concrete next action using those resources.`,
  },
];

export default function PerceptionEngineering({ contact, agentSkills = [], resources = [] }) {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const runCard = async (card) => {
    setLoading(prev => ({ ...prev, [card.id]: true }));
    setResults(prev => ({ ...prev, [card.id]: null }));
    try {
      // Find a skill that matches the card's tag or any active skill
      const matchedSkill = agentSkills.find(s =>
        s.tags?.some(t => t.toLowerCase().includes(card.skillTag)) ||
        s.description?.toLowerCase().includes(card.skillTag)
      ) || agentSkills[0];

      const skillContext = matchedSkill
        ? `You are acting as ${matchedSkill.display_name} (${matchedSkill.persona_role}). ${matchedSkill.instructions}\n\n`
        : '';

      const prompt = skillContext + card.buildPrompt(contact, resources);

      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      setResults(prev => ({ ...prev, [card.id]: result }));
    } catch (err) {
      setResults(prev => ({ ...prev, [card.id]: `Error: ${err.message}` }));
    } finally {
      setLoading(prev => ({ ...prev, [card.id]: false }));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-[#1e3a5a] uppercase tracking-widest">Perception Engineering</h3>
          <p className="text-xs text-slate-500 mt-0.5">AI-powered intelligence cards — powered by agent skills & resources</p>
        </div>
        {agentSkills.length > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
            <Bot className="w-3 h-3 text-indigo-500" />
            <span className="text-xs font-semibold text-indigo-600">{agentSkills.length} agents active</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ACTION_CARDS.map((card, idx) => {
          const Icon = card.icon;
          const isLoading = loading[card.id];
          const result = results[card.id];

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className={`rounded-xl border ${card.border} bg-gradient-to-br ${card.color} p-4 flex flex-col gap-3`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center shadow-sm`}>
                    <Icon className={`w-4 h-4 ${card.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{card.label}</p>
                    <p className="text-xs text-slate-500 leading-tight">{card.description}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${card.badgeColor}`}>
                  {card.skillTag}
                </span>
              </div>

              {/* Result area */}
              {result && (
                <div className="bg-white/80 rounded-lg p-3 text-xs text-slate-700 leading-relaxed border border-white/60 max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {result}
                </div>
              )}

              {/* Action */}
              <Button
                onClick={() => runCard(card)}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className={`w-full mt-auto text-xs font-semibold bg-white/70 border-white/80 hover:bg-white transition-all ${card.iconColor}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                    Running...
                  </>
                ) : result ? (
                  'Re-run'
                ) : (
                  'Run Analysis'
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}