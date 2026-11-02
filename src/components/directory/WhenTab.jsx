import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { C } from '@/components/crm/crmConfig';

const fmt = (d) => (d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA');

// When things happen: the current season's phases, with today placed on them.
export default function WhenTab() {
  const [season, setSeason] = useState(undefined);

  useEffect(() => {
    base44.entities.Season.filter({ is_group: { $ne: true } }, { sort: '-start_date', limit: 1 })
      .then((page) => setSeason(page.items?.[0] || null))
      .catch(() => setSeason(null));
  }, []);

  if (season === undefined) return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin" style={{ color: C.copper }} /></div>;
  if (!season) return <p className="py-12 text-center text-sm" style={{ color: C.muted }}>The next season's calendar is being set. Check back soon.</p>;

  const now = Date.now();
  const phases = [
    ['Nominations', season.nomination_start, season.nomination_end, 'Put names forward.'],
    ['Voting', season.voting_start, season.voting_end, 'Fellows order their hundred.'],
    ['Review', season.review_start, season.review_end, 'The committee reviews finalists.'],
  ];
  return (
    <div>
      <p className="font-heading text-xl" style={{ color: C.navy }}>{season.cohort_label ? `${season.name} · ${season.cohort_label}` : season.name}</p>
      <ol className="mt-4 space-y-2">
        {phases.map(([name, s, e, line]) => {
          const live = s && e && now >= new Date(s) && now <= new Date(e) + 864e5;
          return (
            <li key={name} className="rounded-lg bg-white p-4" style={{ border: `1px solid ${live ? C.copper : C.border}` }}>
              <div className="flex items-center justify-between">
                <span className="font-semibold" style={{ color: C.navy }}>{name}</span>
                {live && <span className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: C.copper }}>Now</span>}
              </div>
              <p className="text-[11px]" style={{ color: C.muted }}>{fmt(s)} – {fmt(e)} · {line}</p>
            </li>
          );
        })}
      </ol>
      <Link to="/conferences" className="mt-4 inline-block text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: C.copper }}>See upcoming events →</Link>
    </div>
  );
}