import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Settings2, ClipboardCheck, ExternalLink, Eye } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { statusOf } from './seasonStatusConfig';
import { cohortName } from './seasonGrouping';
import CohortLifecycleStrip from './CohortLifecycleStrip';
import CohortLifecycleActions from './CohortLifecycleActions';

const fmt = (d) => (d ? format(new Date(d), 'MMM d') : '—');

export default function CohortCard({ cohort, handlers, onFinalize, active }) {
  const status = statusOf(cohort);
  const StatusIcon = status.icon;
  const archived = cohort.status === 'archived';
  return (
    <article className={`rounded-xl bg-white border transition-shadow ${active ? 'border-editorial-copper shadow-md' : 'border-editorial-navy/10 hover:shadow-sm'}`}>
      <div className="p-5 space-y-4">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.25em] text-editorial-gold font-bold">{cohort.parent_season_id ? 'Cohort' : 'Season'}</p>
            <h4 className="font-heading text-xl text-editorial-navy truncate">{cohortName(cohort)}</h4>
            {cohort.cohort_label && <p className="text-xs text-editorial-navy/50 truncate">{cohort.name}</p>}
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.tone}`}>
            <StatusIcon className="w-3 h-3" /> {status.label}
          </span>
        </header>
        <dl className="grid grid-cols-2 gap-3 text-xs border-t border-editorial-copper/30 pt-3">
          <div><dt className="text-editorial-navy/50">Nominations</dt><dd className="text-editorial-navy font-medium">{fmt(cohort.nomination_start)} – {fmt(cohort.nomination_end)}</dd></div>
          <div><dt className="text-editorial-navy/50">Voting</dt><dd className="text-editorial-navy font-medium">{fmt(cohort.voting_start)} – {fmt(cohort.voting_end)}</dd></div>
        </dl>
        <CohortLifecycleStrip season={cohort} backlogCount={handlers.backlog[cohort.cohort_key] || 0} />
        <CohortLifecycleActions season={cohort} onChanged={handlers.onChanged} onRollover={handlers.onRollover} />
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Button size="sm" variant="ghost" onClick={() => handlers.onEdit(cohort)} className="text-editorial-navy"><Settings2 className="w-3.5 h-3.5 mr-1.5" />Configure</Button>
          {!archived && <Button size="sm" variant="ghost" onClick={() => onFinalize(cohort)} className="text-editorial-navy"><ClipboardCheck className="w-3.5 h-3.5 mr-1.5" />Finalize pool</Button>}
          <Button size="sm" variant="ghost" onClick={() => handlers.onView(cohort)} className="text-editorial-navy"><Eye className="w-3.5 h-3.5 mr-1.5" />View</Button>
          <Button size="sm" variant="ghost" asChild className="text-editorial-navy">
            <Link to={createPageUrl('Arena') + `?season_id=${cohort.id}`} target="_blank"><ExternalLink className="w-3.5 h-3.5 mr-1.5" />Standings</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}