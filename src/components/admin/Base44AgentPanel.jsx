import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bot, ExternalLink, MessageSquare, Zap, BookOpen, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Known Base44 agents in this app (from agents/ directory)
const KNOWN_AGENTS = [
  {
    name: 'ltPerry',
    display_name: 'Lt. Perry',
    description: 'Primary AI agent for platform interactions — handles triage, outreach, RRF routing, and community engagement.',
    file: 'agents/ltPerry.json',
  },
  {
    name: 'ltPerryProfile',
    display_name: 'Lt. Perry (Profile)',
    description: 'Profile-focused variant of Lt. Perry — helps users build and manage their professional profiles.',
    file: 'agents/ltPerryProfile.json',
  },
  {
    name: 'partnership_advisor',
    display_name: 'Partnership Advisor',
    description: 'Advises on partnership opportunities, sponsorships, and strategic connections.',
    file: 'agents/partnership_advisor.json',
  },
  {
    name: 'inbox_manager',
    display_name: 'Inbox Manager',
    description: 'AI chief-of-staff for LinkedIn outreach — priority queuing, reply drafting, inbox audits, and triage coaching. Powers the LinkedIn Inbox Manager page.',
    file: 'agents/inbox_manager.json',
  },
];

function AgentCard({ agent, agentSkills }) {
  const [expanded, setExpanded] = useState(false);

  // Find skills that are linked to this agent by name match or tags
  const linkedSkills = agentSkills.filter(s =>
    s.tags?.some(t => t.toLowerCase().includes(agent.name.toLowerCase())) ||
    s.name?.toLowerCase().includes(agent.name.toLowerCase().replace('ltperry', 'perry'))
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{agent.display_name}</h3>
              <p className="text-xs text-slate-500 font-mono">{agent.name}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs flex-shrink-0 bg-green-100 text-green-700 border-0">
            Live
          </Badge>
        </div>

        <p className="text-sm text-slate-600 mt-3">{agent.description}</p>

        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            <Zap className="w-3 h-3 inline mr-1 text-amber-500" />
            {linkedSkills.length} linked skill{linkedSkills.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setExpanded(e => !e)}
            className="ml-auto text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            {expanded ? 'Hide' : 'Details'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Config file</p>
            <code className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-700">{agent.file}</code>
          </div>
          {linkedSkills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Linked AgentSkills</p>
              <div className="flex flex-wrap gap-1.5">
                {linkedSkills.map(s => (
                  <span key={s.id} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                    {s.display_name || s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="pt-1">
            <p className="text-xs text-slate-400">
              <BookOpen className="w-3 h-3 inline mr-1" />
              Edit agent config in Dashboard → Code → Agents → {agent.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Base44AgentPanel() {
  const { data: agentSkills = [] } = useQuery({
    queryKey: ['agent-skills'],
    queryFn: () => base44.entities.AgentSkill.list('-updated_date', 100),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Base44 Agents</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Real agents deployed on the platform — each powered by skills and tools from the AgentSkill registry.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-100 rounded-lg px-3 py-2">
          <Settings className="w-3.5 h-3.5" />
          Manage in Dashboard → Code → Agents
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {KNOWN_AGENTS.map(agent => (
          <AgentCard key={agent.name} agent={agent} agentSkills={agentSkills} />
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">How Agents + Skills work together</p>
            <p className="text-sm text-amber-700 mt-1">
              <strong>Agents</strong> are the deployable Base44 entities (defined in <code className="bg-amber-100 px-1 rounded">agents/*.json</code>) — they handle conversations, WhatsApp, and tool calls.
              <br />
              <strong>Skills</strong> (AgentSkill records) are the prompt personas and configurations that agents load at runtime to behave in specific ways.
              A Harness wires multiple skills together and routes between them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}