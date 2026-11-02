import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import PlanningDay from './PlanningDay';
import { PLANNING_DAYS } from './planningDays';

// The PI Planning event as two modules. Progress is kept on the member's own account,
// separately for each board and season.
export default function PlanningItinerary({ user, scope, season }) {
  const key = `${scope}:${season?.name || season || 'current'}`;
  const [all, setAll] = useState(user?.planning_progress || {});
  const done = all[key] || [];

  const toggle = (step) => {
    const nextDone = done.includes(step) ? done.filter((s) => s !== step) : [...done, step];
    const next = { ...all, [key]: nextDone };
    setAll(next);
    base44.auth.updateMe({ planning_progress: next });
  };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {PLANNING_DAYS.map((day) => <PlanningDay key={day.key} day={day} done={done} onToggle={toggle} />)}
    </div>
  );
}