import { useState } from 'react';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { RUBRIC, bandFor } from './editorialRubric';
import { scoreIssue } from './scoreIssue';

// The scorecard.
//
// Six measures, one reading, on demand: the rubric is shown before anything is scored,
// so the writer knows what the issue will be held to, and every mark comes back with the
// evidence for it. Nothing here is stored — it is a reading of the issue as it stands,
// and it is taken again when the copy changes.

const LABEL = 'font-body text-[9px] font-bold uppercase tracking-[0.22em]';

function Mark({ label, score, note }) {
  return (
    <div className="py-3">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <p className={`${LABEL} text-editorial-navy/55`}>{label}</p>
        <p className="ml-auto font-heading text-[15px] tabular-nums text-editorial-navy">{score}</p>
      </div>
      <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-editorial-navy/10">
        <span
          className="block h-full rounded-full bg-editorial-copper transition-all duration-700"
          style={{ width: `${score}%` }}
        />
      </div>
      {note && <p className="mt-2 font-body text-[12.5px] leading-6 text-editorial-navy/70">{note}</p>}
    </div>
  );
}

export default function IssueScorecard({ issue = {}, articles = [], standard }) {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      setReview(await scoreIssue({ issue, articles, standard }));
    } catch (e) {
      setError('The editor could not read the issue just now. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const band = review ? bandFor(review.total) : null;

  return (
    <section className="mt-8 border-t-2 border-editorial-copper pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={`${LABEL} text-editorial-label`}>The scorecard</p>
          <h3 className="mt-1.5 font-heading text-[20px] leading-tight text-editorial-navy sm:text-[24px]">
            Read by the editor
          </h3>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-1.5 border-b border-editorial-copper/60 pb-0.5 font-body text-[10px] font-bold uppercase tracking-[0.16em] text-editorial-copper transition-opacity hover:opacity-70 disabled:opacity-40"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : review ? <RefreshCw className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
          {loading ? 'Reading the issue…' : review ? 'Score again' : 'Score this issue'}
        </button>
      </div>

      {!review && !loading && (
        <>
          <p className="mt-2 max-w-[46rem] font-body text-[12.5px] leading-6 text-editorial-navy/70">
            Six measures an issue is held to before it prints, each scored out of a hundred, against{' '}
            {standard ? `the house standard, v${standard.version}` : 'the house brief'}. The reading is not kept:
            change the copy and score it again.
          </p>
          <ol className="mt-4 divide-y divide-editorial-navy/10 border-y border-editorial-navy/10">
            {RUBRIC.map((row, i) => (
              <li key={row.key} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-2.5">
                <span className="w-5 font-heading text-[12px] text-editorial-copper">{String(i + 1).padStart(2, '0')}</span>
                <span className={`w-44 ${LABEL} text-editorial-navy/70`}>{row.label}</span>
                <span className="min-w-0 flex-1 font-body text-[12px] leading-5 text-editorial-navy/55">{row.test}</span>
              </li>
            ))}
          </ol>
        </>
      )}

      {loading && (
        <p className="mt-4 flex items-center gap-2 font-body text-[12px] text-editorial-navy/60" aria-live="polite">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading the issue against the six measures…
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 font-body text-[11px] leading-5 text-editorial-copper">
          {error}
        </p>
      )}

      {review && (
        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-editorial-navy px-5 py-5">
            <p className="font-heading text-[46px] leading-none tabular-nums text-editorial-gold">{review.total}</p>
            <div className="min-w-0">
              <p className={`${LABEL} text-editorial-cream/60`}>{band.label}</p>
              <p className="mt-1 font-body text-[11px] text-editorial-cream/45">
                {review.criteria.length} of {RUBRIC.length} measures ·{' '}
                {review.standardVersion ? `house standard v${review.standardVersion}` : 'house brief'}
              </p>
            </div>
          </div>

          {review.summary && (
            <p className="mt-4 font-heading text-[15px] leading-7 text-editorial-navy">{review.summary}</p>
          )}

          <div className="mt-2 divide-y divide-editorial-navy/10">
            {review.criteria.map((row) => {
              const measure = RUBRIC.find((r) => r.key === row.key);
              return <Mark key={row.key} label={measure?.label || row.key} score={row.score} note={row.note} />;
            })}
          </div>

          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <p className={`${LABEL} text-editorial-label`}>What holds</p>
              {review.strengths.length ? (
                <ul className="mt-2 space-y-1.5">
                  {review.strengths.map((item) => (
                    <li key={item} className="font-body text-[12.5px] leading-6 text-editorial-navy/80">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 font-heading text-[13px] italic text-editorial-navy/50">Nothing named yet.</p>
              )}
            </div>
            <div>
              <p className={`${LABEL} text-editorial-label`}>What to fix before it prints</p>
              {review.fixes.length ? (
                <ol className="mt-2 space-y-1.5">
                  {review.fixes.map((item, i) => (
                    <li key={item} className="flex gap-2 font-body text-[12.5px] leading-6 text-editorial-navy">
                      <span className="font-heading text-[12px] text-editorial-copper">{i + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-2 font-heading text-[13px] italic text-editorial-navy/50">Nothing outstanding.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}