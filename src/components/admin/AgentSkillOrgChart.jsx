import { useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const PERSONA_HIERARCHY = {
  'chief-of-staff': {
    title: 'Chief of Staff',
    color: 'bg-violet-100 text-violet-900',
    children: ['principal-engineer', 'scrum-master', 'product-owner', 'art-conductor'],
  },
  'principal-engineer': {
    title: 'Principal Engineer',
    color: 'bg-purple-100 text-purple-900',
    children: ['staff-engineer'],
  },
  'staff-engineer': {
    title: 'Staff Engineer',
    color: 'bg-blue-100 text-blue-900',
    children: ['senior-engineer'],
  },
  'senior-engineer': {
    title: 'Senior Engineer',
    color: 'bg-indigo-100 text-indigo-900',
    children: ['junior-engineer'],
  },
  'junior-engineer': {
    title: 'Junior Engineer',
    color: 'bg-slate-100 text-slate-900',
    children: [],
  },
  'scrum-master': {
    title: 'Scrum Master',
    color: 'bg-orange-100 text-orange-900',
    children: [],
  },
  'product-owner': {
    title: 'Product Owner',
    color: 'bg-rose-100 text-rose-900',
    children: [],
  },
  'art-conductor': {
    title: 'ART Conductor',
    color: 'bg-amber-100 text-amber-900',
    children: [],
  },
  'qa-engineer': {
    title: 'QA Engineer',
    color: 'bg-green-100 text-green-900',
    children: [],
  },
};

function OrgNode({ role, skills, onSelectSkill }) {
  const config = PERSONA_HIERARCHY[role];
  if (!config) return null;

  const roleSkills = skills.filter(s => s.persona_role === role && s.is_active);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Role header */}
      <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${config.color} min-w-[180px] text-center`}>
        {config.title}
      </div>

      {/* Skills under role */}
      {roleSkills.length > 0 && (
        <div className="flex flex-col gap-1 ml-4">
          {roleSkills.map(skill => (
            <button
              key={skill.id}
              onClick={() => onSelectSkill(skill)}
              className="text-xs px-3 py-1 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 transition-colors text-left truncate max-w-[160px]"
              title={skill.display_name}
            >
              {skill.display_name}
            </button>
          ))}
        </div>
      )}

      {/* Children hierarchy */}
      {config.children.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col gap-6">
          {config.children.map(childRole => (
            <div key={childRole} className="flex flex-col items-center">
              <div className="w-0.5 h-4 bg-slate-300 mb-4" />
              <OrgNode role={childRole} skills={skills} onSelectSkill={onSelectSkill} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AgentSkillOrgChart({ skills, onSelectSkill }) {
  const rootSkills = useMemo(() => {
    return skills.filter(s => s.persona_role === 'chief-of-staff' && s.is_active);
  }, [skills]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 overflow-x-auto">
      <h2 className="text-lg font-bold mb-6 text-slate-900">Persona Hierarchy</h2>
      
      {rootSkills.length === 0 ? (
        <div className="text-center text-slate-500 py-12">
          No Chief of Staff persona found. Define a chief-of-staff skill to begin.
        </div>
      ) : (
        <div className="flex flex-col items-center gap-8 min-w-min">
          {rootSkills.map(skill => (
            <div key={skill.id} className="flex flex-col items-center">
              <button
                onClick={() => onSelectSkill(skill)}
                className="px-4 py-2 rounded-lg font-bold text-sm bg-violet-100 text-violet-900 hover:bg-violet-200 transition-colors"
              >
                {skill.display_name}
              </button>
              <div className="w-0.5 h-6 bg-slate-300 mt-2 mb-4" />
              <OrgNode role="principal-engineer" skills={skills} onSelectSkill={onSelectSkill} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}