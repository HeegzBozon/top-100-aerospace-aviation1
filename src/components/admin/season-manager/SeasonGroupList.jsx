import { cohortName } from './seasonGrouping';

export default function SeasonGroupList({ groups, selectedId, onSelect }) {
  return (
    <nav className="space-y-1">
      {groups.map(({ group, cohorts }) => {
        const active = group.id === selectedId;
        return (
          <button key={group.id} onClick={() => onSelect(group.id)}
            className={`w-full text-left rounded-lg px-4 py-3 border-l-2 transition-colors ${active ? 'border-editorial-copper bg-white shadow-sm' : 'border-transparent hover:bg-white/60'}`}>
            <p className={`font-heading text-base ${active ? 'text-editorial-navy' : 'text-editorial-navy/70'}`}>{group.name}</p>
            <p className="text-xs text-editorial-navy/50 truncate">{cohorts.length ? cohorts.map(cohortName).join(' · ') : 'No cohorts'}</p>
          </button>
        );
      })}
    </nav>
  );
}