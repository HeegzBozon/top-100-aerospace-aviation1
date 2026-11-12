import { Circle, Dot } from 'lucide-react';

// The projects the connected account can reach, kept as a rail of the desk. On a phone the
// rail lies on its side so the project being read is always the one under the thumb.
export default function BasecampProjectRail({ projects, value, onChange }) {
  return (
    <div className="desk-plate overflow-hidden">
      <div className="flex items-baseline justify-between gap-2 px-3 pb-2 pt-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-editorial-gold">
          Projects
        </p>
        <span className="text-[10px] text-editorial-cream/45">{projects.length}</span>
      </div>
      <div className="desk-rule" />

      <div className="flex gap-1 overflow-x-auto p-1.5 md:max-h-[62vh] md:flex-col md:overflow-y-auto">
        {projects.map((project) => {
          const active = value === project.id;
          return (
            <button
              key={project.id}
              type="button"
              onClick={() => onChange(project.id)}
              aria-current={active ? 'true' : undefined}
              className="flex min-w-[178px] items-start gap-2 rounded px-2.5 py-2 text-left transition-colors md:min-w-0"
              style={{ background: active ? 'rgba(184,115,51,0.20)' : 'transparent' }}
            >
              {active ? (
                <Dot className="mt-0.5 h-4 w-4 flex-shrink-0 text-editorial-gold" />
              ) : (
                <Circle className="mt-1 h-3 w-3 flex-shrink-0 text-editorial-cream/25" />
              )}
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-semibold text-editorial-cream">
                  {project.name}
                </span>
                <span className="block truncate text-[10px] uppercase tracking-[0.14em] text-editorial-cream/45">
                  {project.status || 'project'}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}