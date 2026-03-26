import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';

function TrainNode({ train, onSelectTrain }) {
  const [expanded, setExpanded] = useState(false);

  const { data: arts = [] } = useQuery({
    queryKey: ['arts-for-train', train.id],
    queryFn: () => base44.entities.AgileReleaseTrain.filter({ solution_train_id: train.id }),
    enabled: expanded,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 hover:bg-slate-100 rounded"
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <div className="bg-violet-100 text-violet-900 px-3 py-1.5 rounded font-semibold text-sm">
          {train.name}
        </div>
      </div>

      {expanded && (
        <div className="ml-6 border-l-2 border-slate-200 pl-4 space-y-2">
          {arts.length === 0 ? (
            <div className="text-xs text-slate-400 italic">No ARTs</div>
          ) : (
            arts.map(art => <ARTNode key={art.id} art={art} />)
          )}
        </div>
      )}
    </div>
  );
}

function ARTNode({ art }) {
  const [expanded, setExpanded] = useState(false);

  const { data: teams = [] } = useQuery({
    queryKey: ['teams-for-art', art.id],
    queryFn: () => base44.entities.AgentTeam.filter({ art_id: art.id }),
    enabled: expanded,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 hover:bg-slate-100 rounded"
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <div className="bg-amber-100 text-amber-900 px-3 py-1.5 rounded font-semibold text-sm">
          {art.name}
        </div>
      </div>

      {expanded && (
        <div className="ml-6 border-l-2 border-slate-200 pl-4 space-y-2">
          {teams.length === 0 ? (
            <div className="text-xs text-slate-400 italic">No Teams</div>
          ) : (
            teams.map(team => <TeamNode key={team.id} team={team} />)
          )}
        </div>
      )}
    </div>
  );
}

function TeamNode({ team }) {
  const [expanded, setExpanded] = useState(false);

  const { data: skills = [] } = useQuery({
    queryKey: ['skills-for-team', team.id],
    queryFn: () => base44.entities.AgentSkill.filter({ team_id: team.id }),
    enabled: expanded,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 hover:bg-slate-100 rounded"
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <div className="bg-blue-100 text-blue-900 px-3 py-1.5 rounded font-semibold text-sm">
          {team.name}
        </div>
      </div>

      {expanded && (
        <div className="ml-6 border-l-2 border-slate-200 pl-4 space-y-1">
          {skills.length === 0 ? (
            <div className="text-xs text-slate-400 italic">No Skills assigned</div>
          ) : (
            skills.map(skill => (
              <div key={skill.id} className="bg-slate-50 border border-slate-200 px-2 py-1 rounded text-sm truncate">
                {skill.display_name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function SAFeHierarchyViewer() {
  const { data: trains = [], isLoading } = useQuery({
    queryKey: ['solution-trains-hierarchy'],
    queryFn: () => base44.entities.SolutionTrain.list(),
  });

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-lg font-bold mb-6 text-slate-900">SAFe Hierarchy</h2>

      {isLoading ? (
        <div className="text-slate-400">Loading...</div>
      ) : trains.length === 0 ? (
        <div className="text-center py-8 text-slate-400">No Solution Trains found</div>
      ) : (
        <div className="space-y-4">
          {trains.map(train => (
            <TrainNode key={train.id} train={train} />
          ))}
        </div>
      )}
    </div>
  );
}