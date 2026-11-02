import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import useSeasonCalendar from './useSeasonCalendar';

const KIND = {
  event: { label: 'Event', dot: 'bg-editorial-gold' },
  conference: { label: 'Conference', dot: 'bg-editorial-copper' },
  milestone: { label: 'Roadmap', dot: 'bg-editorial-navy' },
};
const LINK = { event: () => '/events', conference: (e) => `/conferences/${e.id}`, milestone: () => null };

// The season as three months: every event, conference and roadmap milestone on its day.
export default function SeasonCalendar({ season }) {
  const { data, isLoading, error } = useSeasonCalendar(season);
  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-editorial-copper" /></div>;
  if (error) return <p className="py-8 text-center font-body text-sm text-editorial-navy/70">The calendar could not be loaded.</p>;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3">
        {Object.values(KIND).map((k) => (
          <span key={k.label} className="flex items-center gap-1.5 font-body text-[11px] text-editorial-navy/70"><i className={`h-2 w-2 rounded-full ${k.dot}`} />{k.label}</span>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {season.months.map((m) => {
          const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
          const rows = (data || []).filter((e) => e.date.startsWith(key));
          return (
            <section key={key} className="rounded border border-editorial-navy/10 bg-white p-2.5">
              <h2 className="font-heading text-lg text-editorial-navy">{m.toLocaleString('en-US', { month: 'long' })}</h2>
              <div className="pd-rule mb-2 mt-1 w-8" />
              {rows.length === 0 && <p className="py-3 font-body text-xs text-editorial-navy/40">A clear month. Room to plan.</p>}
              <ul className="space-y-1.5">
                {rows.map((e) => {
                  const to = LINK[e.kind](e);
                  const body = (
                    <div className="flex items-start gap-2">
                      <span className="w-6 shrink-0 font-heading text-sm text-editorial-navy">{Number(e.date.slice(8, 10))}</span>
                      <i className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${KIND[e.kind].dot}`} />
                      <span className="font-body text-[13px] leading-snug text-editorial-navy">{e.title}</span>
                    </div>
                  );
                  return <li key={`${e.kind}-${e.id}`}>{to ? <Link to={to} className="block rounded hover:bg-editorial-cream">{body}</Link> : body}</li>;
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}