import { format } from 'date-fns';
import { CalendarRange } from 'lucide-react';

export default function PITimeline({ pi, sprints, objectives }) {
  if (!pi) return null;

  const totalDays = (new Date(pi.end_date) - new Date(pi.start_date)) / (1000 * 60 * 60 * 24);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <CalendarRange className="w-6 h-6 text-gray-700" />
        <h2 className="text-xl font-bold text-gray-900">PI Timeline & Sprints</h2>
      </div>
      <div className="relative w-full h-8 bg-gray-200 rounded-full">
        {sprints.map((sprint) => {
          const sprintStart = new Date(sprint.start_date);
          const sprintEnd = new Date(sprint.end_date);
          const piStart = new Date(pi.start_date);
          
          const startOffset = ((sprintStart - piStart) / (1000 * 60 * 60 * 24) / totalDays) * 100;
          const duration = ((sprintEnd - sprintStart) / (1000 * 60 * 60 * 24) / totalDays) * 100;

          return (
            <div
              key={sprint.id}
              className={`absolute h-8 rounded-full border-2 border-white flex items-center justify-center
                ${sprint.status === 'active' ? 'bg-green-500' : 'bg-blue-400'}
              `}
              style={{ left: `${startOffset}%`, width: `${duration}%` }}
              title={`${sprint.name}: ${format(sprintStart, 'MMM d')} - ${format(sprintEnd, 'MMM d')}`}
            >
              <span className="text-xs font-bold text-white truncate px-2">{sprint.name}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <span>{format(new Date(pi.start_date), 'MMM d, yyyy')}</span>
        <span>{format(new Date(pi.end_date), 'MMM d, yyyy')}</span>
      </div>
    </div>
  );
}