import { ArrowRight, CircleDashed, FileSignature, Loader2, PlaneTakeoff } from 'lucide-react';
import SpecialtyOption from '@/components/flight-plan/SpecialtyOption';
import { SPECIALTIES, specialtyFor } from '@/components/flight-plan/specialties';
import useFlightPlan from '@/components/flight-plan/useFlightPlan';

// ── The Flight Plan ──
//
// The committee's fourth surface, and the only one that is about the Analyst rather than
// the field. An Associate Analyst is still on the ground: the office of Analyst is graduated
// into at eight measured sets, so until then the chart stays shut and names the duty that
// opens it. An Analyst chooses the specialty they read the industry from — a curated field,
// filed on their own record, which steers what the platform puts in front of them.
//
// Nothing here is measurement. The specialty never moves a name, a position or a score.
export default function FlightPlan({ user, onOpenVote }) {
  const { status, sets, toAnalyst, specialty, draft, saving, notice, error, isAnalyst, setDraft, save } = useFlightPlan(user);
  const filed = specialtyFor(specialty);
  const dirty = Boolean(draft) && draft !== specialty;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 lg:py-10">
      <p className="font-body text-[9.5px] font-bold uppercase tracking-[0.24em] text-editorial-label">
        Selection Committee · Flight Plan
      </p>
      <h2 className="mt-2 font-heading text-[1.6rem] leading-[1.15] tracking-[-0.01em] text-editorial-navy sm:text-[2rem]">
        Where do you want to sit?
      </h2>
      <p className="mt-2 max-w-xl font-body text-[13px] leading-relaxed text-editorial-navy/70">
        Eight measured sets graduate an Associate Analyst into the office. The Flight Plan is
        where an Analyst says which field they read the industry from — the one choice that
        shapes the desk you land on.
      </p>

      {/* The standing: the office held, the sets behind it, and the rung ahead. */}
      <div className="mt-6 border-t border-editorial-copper/30 pt-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-body text-[9px] font-bold uppercase tracking-[0.2em] text-editorial-label">
            Your office
          </span>
          <span className="font-heading text-[1.1rem] text-editorial-navy">
            {isAnalyst ? 'Analyst' : 'Associate Analyst'}
          </span>
          {status === 'ready' && (
            <span className="font-body text-[11px] tabular-nums text-editorial-navy/55">
              {sets} {sets === 1 ? 'set' : 'sets'} measured
              {!isAnalyst && ` · ${toAnalyst} to Analyst`}
            </span>
          )}
        </div>
      </div>

      {status === 'loading' && (
        <div className="mt-5 flex items-center gap-2 font-body text-[12px] text-editorial-navy/60">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-editorial-copper" />
          Reading your standing…
        </div>
      )}

      {status === 'error' && (
        <p className="mt-5 border-l-2 border-editorial-copper bg-editorial-sand/40 px-3 py-2 font-body text-[12px] text-editorial-navy/75">
          {error || 'Your standing could not be read just now.'}
        </p>
      )}

      {status === 'ready' && !isAnalyst && (
        <div className="mt-5 rounded-[10px] border border-editorial-copper/25 bg-editorial-cream px-4 py-4">
          <p className="flex items-center gap-1.5 font-body text-[9px] font-bold uppercase tracking-[0.2em] text-editorial-label">
            <CircleDashed className="h-3 w-3" /> The chart opens at graduation
          </p>
          <p className="mt-2 font-body text-[12.5px] leading-relaxed text-editorial-navy/70">
            Eight sets of four, measured on the Crosscheck, graduate an Associate Analyst into
            the office of Analyst — and the office is what this desk belongs to. You have
            {` ${sets} `}
            {sets === 1 ? 'set' : 'sets'} behind you: {toAnalyst} more opens the chart, and
            nothing is asked of you before then.
          </p>
          {onOpenVote && (
            <button
              type="button"
              onClick={onOpenVote}
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-[9px] bg-editorial-copper px-4 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-editorial-cream transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper focus-visible:ring-offset-2"
            >
              <PlaneTakeoff className="h-4 w-4" />
              Take up the Crosscheck
            </button>
          )}
        </div>
      )}

      {status === 'ready' && isAnalyst && (
        <>
          {filed && (
            <div className="mt-5 border-l-2 border-editorial-copper bg-editorial-sand/45 px-3.5 py-2.5">
              <p className="font-body text-[9px] font-bold uppercase tracking-[0.2em] text-editorial-label">
                Filed specialty
              </p>
              <p className="mt-0.5 font-heading text-[1rem] text-editorial-navy">{filed.label}</p>
            </div>
          )}

          <div className="mt-5">
            <p className="font-body text-[9px] font-bold uppercase tracking-[0.2em] text-editorial-label">
              {filed ? 'Change the field you read' : 'Choose the field you read'}
            </p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {SPECIALTIES.map((entry) => (
                <SpecialtyOption
                  key={entry.key}
                  specialty={entry}
                  selected={draft === entry.key}
                  onSelect={setDraft}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving}
              className="inline-flex min-h-11 items-center gap-2 rounded-[9px] bg-editorial-copper px-4 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-editorial-cream transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper focus-visible:ring-offset-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSignature className="h-4 w-4" />}
              {filed ? 'Update my specialty' : 'File my specialty'}
            </button>
            {notice && (
              <span className="font-body text-[11px] uppercase tracking-[0.14em] text-editorial-navy/55">{notice}</span>
            )}
            {!notice && !dirty && !filed && (
              <span className="inline-flex items-center gap-1 font-body text-[11px] text-editorial-navy/45">
                Choose one to file it <ArrowRight className="h-3 w-3" />
              </span>
            )}
          </div>

          {error && !saving && (
            <p className="mt-2 font-body text-[11.5px] text-editorial-navy/70">{error}</p>
          )}
        </>
      )}

      <p className="mt-6 border-t border-editorial-copper/25 pt-3 font-body text-[10.5px] leading-relaxed text-editorial-navy/45">
        Your specialty steers what the platform shows you and which desks open first. It is
        never read by discovery, ordering, measurement or scoring, and it never changes how
        your record is shown to anyone else.
      </p>
    </div>
  );
}