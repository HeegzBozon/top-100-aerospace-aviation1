import { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import { AlertCircle, Loader2, RefreshCw, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { NOMINATION_EVENTS } from '@/components/nominate/nominationEvents';
import { NOMINATION_SURVEY_ID } from '@/components/nominate/fileNomination';

// THE NOMINATION FUNNEL — what the house can count, and where the rest of it is read.
//
// A number here is a stored row: a submission filed, or a name put forward. Everything
// between the door and the filing — the hub opened, the first character typed, each stage
// advanced, the stage a reader left on, a page refused by validation, a filing that did
// not get through — is an event on the platform's Analytics page, under the names listed
// at the foot of this panel. Nothing here is read by scoring, selection or ranking.
const LADDER = [
  {
    stage: 'The hub opened',
    event: NOMINATION_EVENTS.formViewed,
    note: 'The nomination surface was on the glass.',
  },
  {
    stage: 'Form started',
    event: NOMINATION_EVENTS.formStarted,
    note: 'The first character typed into it.',
  },
  {
    stage: 'Each stage advanced',
    event: NOMINATION_EVENTS.stageAdvanced,
    note: 'About you, then Women, Men, Angels, Local Legends, Review.',
  },
  {
    stage: 'Each stage abandoned',
    event: NOMINATION_EVENTS.stageAbandoned,
    note: 'The stage the reader left the flow on.',
  },
  {
    stage: 'Submit rejected',
    event: NOMINATION_EVENTS.submitRejected,
    note: 'The page did not pass the hub’s own validation.',
  },
  {
    stage: 'Submit failed',
    event: NOMINATION_EVENTS.submitFailed,
    note: 'The filing did not get through.',
  },
  {
    stage: 'Submitted',
    event: NOMINATION_EVENTS.submitted,
    note: 'Filed — the rows counted on this desk.',
  },
];

export default function NominationFunnelPanel() {
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [counts, setCounts] = useState({ submissions: 0, recent: 0, people: 0, legends: 0, tracks: [] });

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const since = moment().subtract(30, 'days').toISOString();
      const [submissions, recent, people, legends, women, men, angels] = await Promise.all([
        base44.entities.SurveyResponse.count({ survey_id: NOMINATION_SURVEY_ID }),
        base44.entities.SurveyResponse.count({
          survey_id: NOMINATION_SURVEY_ID,
          created_date: { $gte: since },
        }),
        base44.entities.NominationIntake.count({ survey_id: NOMINATION_SURVEY_ID }),
        base44.entities.LocalLegendNomination.count({ survey_id: NOMINATION_SURVEY_ID }),
        base44.entities.NominationIntake.count({ survey_id: NOMINATION_SURVEY_ID, nomination_type: 'women' }),
        base44.entities.NominationIntake.count({ survey_id: NOMINATION_SURVEY_ID, nomination_type: 'men' }),
        base44.entities.NominationIntake.count({ survey_id: NOMINATION_SURVEY_ID, nomination_type: 'angels' }),
      ]);
      setCounts({
        submissions,
        recent,
        people,
        legends,
        tracks: [
          { key: 'women', label: 'TOP 100 Women', count: women },
          { key: 'men', label: 'TOP 100 Men', count: men },
          { key: 'angels', label: 'Angels', count: angels },
        ],
      });
      setState('ready');
    } catch (loadError) {
      setError(loadError?.message || 'The desk could not read the intake.');
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shared = (count, of) => (of > 0 ? Math.round((count / of) * 100) : 0);

  return (
    <div className="desk-plate p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-editorial-gold">
            Nominations
          </p>
          <h2 className="mt-1.5 font-heading text-2xl text-editorial-cream">Where the funnel stops</h2>
          <p className="mt-1.5 max-w-xl font-body text-xs leading-6 text-[#a3b8c9]">
            Submissions filed and names put forward, read from the intake. The stages between the
            door and the filing are recorded as events, so the desk can see where readers leave
            without asking them.
          </p>
        </div>
        <button type="button" onClick={load} disabled={state === 'loading'} className="desk-key disabled:opacity-50">
          {state === 'loading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </button>
      </div>

      {state === 'error' ? (
        <div role="alert" className="mt-5 flex items-start gap-2.5 rounded-md border border-[#f2a1a1]/40 bg-[#f2a1a1]/10 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-[#f2a1a1]" aria-hidden="true" />
          <div>
            <p className="font-body text-sm text-[#f2a1a1]">The intake could not be read.</p>
            <p className="mt-0.5 font-body text-xs text-[#a3b8c9]">{error}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="desk-face px-4 py-4">
              <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-label">
                Submissions filed
              </p>
              <p className="mt-1 font-heading text-3xl text-editorial-navy">
                {state === 'loading' ? '—' : counts.submissions.toLocaleString()}
              </p>
              <p className="mt-1 font-body text-[10px] text-editorial-navy/60">
                {state === 'loading' ? '' : `${counts.recent.toLocaleString()} in the last 30 days`}
              </p>
            </div>
            <div className="desk-face px-4 py-4">
              <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-label">
                People put forward
              </p>
              <p className="mt-1 font-heading text-3xl text-editorial-navy">
                {state === 'loading' ? '—' : counts.people.toLocaleString()}
              </p>
            </div>
            <div className="desk-face px-4 py-4">
              <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-label">
                Local Legends
              </p>
              <p className="mt-1 font-heading text-3xl text-editorial-navy">
                {state === 'loading' ? '—' : counts.legends.toLocaleString()}
              </p>
            </div>
            <div className="desk-face px-4 py-4">
              <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-label">
                Names per submission
              </p>
              <p className="mt-1 font-heading text-3xl text-editorial-navy">
                {state === 'loading'
                  ? '—'
                  : (counts.submissions > 0
                      ? ((counts.people + counts.legends) / counts.submissions).toFixed(1)
                      : '0.0')}
              </p>
              <p className="mt-1 font-body text-[10px] text-editorial-navy/60">Names carried, on average</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-editorial-gold">
              By track
            </p>
            {state === 'loading' ? (
              <div className="mt-4 flex items-center gap-2 font-body text-xs text-[#a3b8c9]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading the intake
              </div>
            ) : counts.people === 0 ? (
              <p className="mt-3 rounded-md border border-white/10 bg-white/[0.03] p-4 font-body text-xs leading-6 text-[#a3b8c9]">
                No name has been filed against the current cycle yet. The hub is open to everyone at
                <span className="text-editorial-cream"> /selection-committee</span> — the first
                submission appears here the moment it is filed.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-white/[0.07]">
                {counts.tracks.map((row) => (
                  <li key={row.key} className="flex flex-wrap items-center gap-3 py-3">
                    <span className="w-40 flex-none font-body text-xs font-semibold text-editorial-cream">
                      {row.label}
                    </span>
                    <span className="min-w-[120px] flex-1">
                      <span className="desk-meter block">
                        <span style={{ width: `${shared(row.count, counts.people)}%` }} />
                      </span>
                    </span>
                    <span className="w-24 flex-none text-right font-body text-xs tabular-nums text-[#a3b8c9]">
                      {row.count.toLocaleString()} · {shared(row.count, counts.people)}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <div className="mt-7">
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-editorial-gold">
          The ladder, and the event that marks each rung
        </p>
        <ol className="mt-3 divide-y divide-white/[0.07]">
          {LADDER.map((rung, index) => (
            <li key={rung.event} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5">
              <span className="w-5 flex-none font-body text-[10px] tabular-nums text-editorial-copper">
                {index + 1}
              </span>
              <Users className="h-3.5 w-3.5 flex-none self-center text-editorial-copper" aria-hidden="true" />
              <span className="w-44 flex-none font-body text-xs font-semibold text-editorial-cream">
                {rung.stage}
              </span>
              <span className="flex-1 font-body text-[11px] leading-5 text-[#a3b8c9]">{rung.note}</span>
              <code className="flex-none font-body text-[10px] tracking-[0.04em] text-[#a3b8c9]">
                {rung.event}
              </code>
            </li>
          ))}
        </ol>
        <p className="mt-3 font-body text-[11px] leading-6 text-[#a3b8c9]">
          No address, name or record id is carried on these events, and none of them is read by
          scoring, selection or ranking. They exist to say where a submission stops.
        </p>
      </div>
    </div>
  );
}