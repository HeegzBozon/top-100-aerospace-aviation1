import { Loader2 } from 'lucide-react';
import PlanningDay from './PlanningDay';
import { PLANNING_DAYS } from './planningDays';
import usePlanningSteps from './usePlanningSteps';

// The PI Planning event as two modules. The platform itinerary is shared and kept by
// admins; the personal one belongs to each member.
export default function PlanningItinerary({ user, scope, season }) {
  const seasonKey = String(season?.name || season || 'current');
  const { records, loading, error, save } = usePlanningSteps(user, scope, seasonKey);
  const canEdit = scope === 'personal' || user.role === 'admin';

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-editorial-navy" /></div>;
  if (error) return <p className="py-10 text-center font-body text-sm text-editorial-navy/70">{error}</p>;

  return (
    <div>
      {!canEdit && <p className="mb-2 font-body text-[11px] text-editorial-navy/60">The platform itinerary is kept by the admins. Read-only.</p>}
      <div className="grid items-start gap-3 md:grid-cols-2">
        {PLANNING_DAYS.map((day) => <PlanningDay key={day.key} day={day} records={records} canEdit={canEdit} onSave={save} />)}
      </div>
    </div>
  );
}