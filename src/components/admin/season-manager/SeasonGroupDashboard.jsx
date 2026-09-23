import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Plus, Settings2 } from 'lucide-react';
import SeasonChecklist from './SeasonChecklist';
import CohortCard from './CohortCard';
import AddCohortDialog from './AddCohortDialog';
import FinalizePoolPanel from '../finalize-pool/FinalizePoolPanel';
import SeasonPhaseControl from './SeasonPhaseControl';
import SeasonDatesDialog from './SeasonDatesDialog';

const fmt = (d) => (d ? format(new Date(d), 'MMM d, yyyy') : '—');

export default function SeasonGroupDashboard({ entry, handlers }) {
  const { group, cohorts } = entry;
  const [finalizingId, setFinalizingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editingDates, setEditingDates] = useState(false);
  const finalizing = cohorts.find((c) => c.id === finalizingId);
  const edit = (s) => (s.is_group ? setEditingDates(true) : handlers.onEdit(s));

  const openFinalize = (c) => {
    setFinalizingId(c.id);
    requestAnimationFrame(() => document.getElementById('finalize-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-editorial-navy text-white px-6 py-6 md:px-8 border-b-2 border-editorial-copper">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-editorial-gold font-bold">Season</p>
            <h2 className="font-heading text-3xl mt-1">{group.name}</h2>
            <p className="text-sm text-white/60 mt-1">{fmt(group.start_date)} – {fmt(group.end_date)} · {cohorts.length} {cohorts.length === 1 ? 'cohort' : 'cohorts'}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditingDates(true)} className="text-white hover:bg-white/10"><Settings2 className="w-4 h-4 mr-1.5" />Season dates</Button>
            <Button size="sm" onClick={() => setAdding(true)} className="bg-editorial-copper hover:bg-editorial-copper/90 text-white"><Plus className="w-4 h-4 mr-1.5" />Add cohort</Button>
          </div>
        </div>
      </header>

      <SeasonPhaseControl cohorts={cohorts} onChanged={handlers.onChanged} />

      <SeasonChecklist group={group} cohorts={cohorts} backlog={handlers.backlog}
        actions={{ onEdit: edit, onNavigate: handlers.onNavigate, onFinalize: openFinalize, onAddCohort: () => setAdding(true) }} />

      {finalizing && (
        <div id="finalize-panel">
          <FinalizePoolPanel key={finalizing.id} season={finalizing} onClose={() => setFinalizingId(null)} onFinalized={handlers.onChanged} />
        </div>
      )}

      {cohorts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-editorial-navy/20 py-14 text-center">
          <p className="font-heading text-lg text-editorial-navy">No cohorts yet</p>
          <p className="text-sm text-editorial-navy/60 mt-1 mb-4">Add Women, Men, Angels — or a new cohort — to begin.</p>
          <Button onClick={() => setAdding(true)} className="bg-editorial-copper hover:bg-editorial-copper/90 text-white"><Plus className="w-4 h-4 mr-1.5" />Add cohort</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 2xl:grid-cols-3 gap-4">
          {cohorts.map((c) => <CohortCard key={c.id} cohort={c} handlers={handlers} onFinalize={openFinalize} active={c.id === finalizingId} />)}
        </div>
      )}

      {editingDates && (
        <SeasonDatesDialog group={group} cohorts={cohorts} onClose={() => setEditingDates(false)}
          onSaved={() => { setEditingDates(false); handlers.onChanged(); }} />
      )}

      {adding && (
        <AddCohortDialog group={group} existingKeys={cohorts.map((c) => c.cohort_key)} onClose={() => setAdding(false)}
          onAdded={() => { setAdding(false); handlers.onChanged(); }} />
      )}
    </div>
  );
}