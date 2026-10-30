import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Search, Users } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import TalentDeskCard from '@/components/talent-desk/TalentDeskCard';
import { DISCIPLINE_LABELS } from '@/components/profile/intent/intentConfig';

const MODE_FILTERS = [
  { key: 'all', label: 'Everyone' },
  { key: 'hire', label: 'Job & Career' },
  { key: 'commercial', label: 'Deal & BD' },
];

// The Talent Desk: who has a door open. Public, alphabetical, and informational only.
// Availability state and intent are shown; they never order, weight or feature anyone.
export default function TalentDesk({ embedded = false }) {
  const [mode, setMode] = useState('all');
  const [discipline, setDiscipline] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [people, setPeople] = useState([]);
  const [facets, setFacets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 320);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const res = await base44.functions.invoke('getTalentDesk', { mode, discipline, search: query });
        if (!alive) return;
        setPeople(res?.data?.people || []);
        setFacets(res?.data?.facets || {});
      } catch (err) {
        if (alive) setError('The desk could not be read just now.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [mode, discipline, query, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  const disciplineKeys = Object.keys(facets);

  // Embedded, the desk is one tab of People rather than a page of its own: the shell and the
  // masthead belong to that surface, so only the reading itself is drawn here.
  return (
    <div className={embedded ? '' : 'min-h-screen'} style={embedded ? undefined : { background: B.cream }}>
      <div className={embedded ? '' : 'mx-auto max-w-6xl px-3 pb-16 pt-6 md:px-6 lg:px-8'}>
        <header>
          {!embedded && (
            <>
              <p className="text-[8.5px] font-bold uppercase tracking-[0.34em]" style={{ color: B.copper }}>
                Classifieds
              </p>
              <h1 className="mt-2 font-heading text-[28px] font-semibold leading-[1.1] md:text-[38px]" style={{ color: B.navy }}>
                Who is open to a conversation.
              </h1>
            </>
          )}
          <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed md:text-[13.5px]" style={{ color: B.muted }}>
            Fellows who have opened a door on their record. Listed alphabetically, always — the
            desk carries no ranking, no featured place and no paid position. Each introduction is
            made privately through the person&rsquo;s own profile.
          </p>
          <div className="mt-3 h-px w-full" style={{ background: `linear-gradient(90deg, ${B.copper}66, ${B.border})` }} />
        </header>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {MODE_FILTERS.map((filter) => {
              const active = mode === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setMode(filter.key)}
                  className="rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors"
                  style={{
                    background: active ? B.navy : 'rgba(255,255,255,0.8)',
                    color: active ? '#fff' : B.navy,
                    border: `1px solid ${active ? B.navy : B.border}`,
                  }}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: B.muted }} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, role or company"
                aria-label="Search the desk"
                className="w-full rounded-full py-2 pl-9 pr-3 text-[12.5px] outline-none"
                style={{ background: '#fff', border: `1px solid ${B.border}`, color: B.navy }}
              />
            </label>
            {disciplineKeys.length > 0 && (
              <select
                value={discipline}
                onChange={(event) => setDiscipline(event.target.value)}
                aria-label="Filter by domain"
                className="rounded-full px-3 py-2 text-[12px] font-medium outline-none"
                style={{ background: '#fff', border: `1px solid ${B.border}`, color: B.navy }}
              >
                <option value="">All domains</option>
                {disciplineKeys.map((key) => (
                  <option key={key} value={key}>
                    {DISCIPLINE_LABELS[key] || key} ({facets[key]})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <p className="mt-3 text-[10.5px] uppercase tracking-[0.16em]" style={{ color: B.muted }} aria-live="polite">
          {loading ? 'Reading the desk' : `${people.length} ${people.length === 1 ? 'person' : 'people'} on the desk`}
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: B.gold }} />
          </div>
        ) : error ? (
          <div className="mt-4 rounded-2xl px-5 py-8 text-center" style={{ border: `1px solid ${B.border}`, background: 'rgba(255,255,255,0.7)' }}>
            <p className="font-heading text-[17px]" style={{ color: B.navy }}>The desk is momentarily closed.</p>
            <p className="mt-1 text-[12px]" style={{ color: B.muted }}>{error}</p>
            <button
              type="button"
              onClick={reload}
              className="mt-3 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ background: B.navy, color: '#fff' }}
            >
              Try again
            </button>
          </div>
        ) : people.length === 0 ? (
          <div className="mt-4 rounded-2xl px-5 py-10 text-center" style={{ border: `1px dashed ${B.border}`, background: 'rgba(255,255,255,0.6)' }}>
            <Users className="mx-auto h-7 w-7" style={{ color: B.gold }} />
            <p className="mt-2 font-heading text-[18px]" style={{ color: B.navy }}>No one matches that reading.</p>
            <p className="mx-auto mt-1 max-w-md text-[12px] leading-relaxed" style={{ color: B.muted }}>
              Fellows open these doors themselves, and nothing is listed on their behalf. Clear the
              filters, or read the roster again later.
            </p>
            {(mode !== 'all' || discipline || search) && (
              <button
                type="button"
                onClick={() => { setMode('all'); setDiscipline(''); setSearch(''); }}
                className="mt-3 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{ background: B.navy, color: '#fff' }}
              >
                Clear the filters
              </button>
            )}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
              <TalentDeskCard key={person.id} person={person} />
            ))}
          </div>
        )}

        <p className="mt-8 text-[10px] leading-relaxed" style={{ color: B.muted }}>
          Availability is information, never position. The desk never reads transaction, payment or
          sponsorship data, and no place on it can be bought.
        </p>
      </div>
    </div>
  );
}