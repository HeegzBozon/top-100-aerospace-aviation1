import { Fragment } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { pad, useCountdown } from "@/components/events/useCountdown";
import NotifyMe from "@/components/start/NotifyMe";
import { RESULTS_GO_LIVE } from "@/components/start/PublicationCountdown";
import { ACCOUNT_KEYS, VOTE_OPTION } from "@/components/start/startMenuConfig";

// The two dates the cycle is read against, set as instrument figures rather than as
// a line of small print: the close of voting, and the day the issue ships. The title
// screen's own actions stand at the right of the same band, so the date and the way
// to act on it are read in one glance.
const PRIMARY =
  "inline-flex h-[46px] items-center gap-2.5 rounded-full px-7 text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#16293F] transition-transform duration-200 hover:brightness-105 active:scale-[0.98]";
const SECONDARY =
  "inline-flex h-[46px] items-center gap-2 rounded-full border px-6 text-[10.5px] font-bold uppercase tracking-[0.22em] transition-colors duration-200 hover:bg-editorial-cream/[0.07]";
const PRIMARY_STYLE = {
  background: "linear-gradient(135deg, #E6CDA4 0%, #C9A87C 52%, #B87333 100%)",
  boxShadow: "0 16px 34px -16px rgba(201, 168, 124, 0.9)",
};
const SECONDARY_STYLE = {
  borderColor: "rgb(var(--editorial-gold-rgb) / 0.45)",
  color: "rgb(var(--editorial-gold-rgb) / 0.95)",
};
/* Small caps on the navy plate take rose gold, never copper: rose gold carries AA
   there where the burnished copper is reserved for cream surfaces. */
const LABEL = "text-[9px] font-bold uppercase tracking-[0.3em] text-editorial-gold/85";

function Figure({ label, parts, note }) {
  return (
    <div className="min-w-[150px]">
      <p className={LABEL}>{label}</p>

      {note ? (
        <p className="mt-2 font-heading text-[21px] leading-none text-editorial-cream/75">{note}</p>
      ) : (
        <div className="mt-2 flex items-end gap-2">
          {parts.map(({ value, unit }, i) => (
            <Fragment key={unit}>
              {i > 0 && <span className="mb-[19px] h-2.5 w-px bg-editorial-gold/25" />}
              <span className="flex flex-col items-center">
                <span className="font-heading text-[29px] leading-none tabular-nums tracking-[0.01em] text-editorial-cream">
                  {value}
                </span>
                <span className="mt-2 text-[7.5px] font-bold uppercase tracking-[0.24em] text-editorial-cream/55">
                  {unit}
                </span>
              </span>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DesktopCyclePanel({
  status,
  onRetry,
  signedIn,
  voteLive,
  vote,
  notifyOpen,
  onNotifyChange,
}) {
  const results = useCountdown(RESULTS_GO_LIVE);
  const toLogin = () => base44.auth.redirectToLogin("/Profile");

  const remaining = vote.days * 86400 + vote.hours * 3600 + vote.mins * 60 + vote.secs;
  const voteParts = [
    { value: vote.days, unit: "days" },
    { value: pad(vote.hours), unit: "hrs" },
    { value: pad(vote.mins), unit: "min" },
    ...(remaining < 48 * 3600 ? [{ value: pad(vote.secs), unit: "sec" }] : []),
  ];

  return (
    <div
      className="ds-rise border-y py-7"
      style={{ borderColor: "rgb(var(--editorial-cream-rgb) / 0.10)", animationDelay: "300ms" }}
    >
      <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
        <div className="flex flex-wrap items-end gap-x-14 gap-y-8">
          {status.failed ? (
            <div className="min-w-[150px]">
              <p className={LABEL}>Voting closes</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 flex items-center gap-1.5 font-heading text-[21px] leading-none text-editorial-cream/75 transition-colors hover:text-editorial-gold"
              >
                <RotateCcw className="h-3 w-3" /> Read again
              </button>
            </div>
          ) : status.loading ? (
            <div className="min-w-[150px]">
              <p className={LABEL}>Voting closes</p>
              <p className="mt-2 font-heading text-[21px] leading-none text-editorial-cream/45">
                Reading the season…
              </p>
            </div>
          ) : vote.done ? (
            <Figure label="Voting closes" note="Closed" />
          ) : status.votingEnd ? (
            <Figure label="Voting closes" parts={voteParts} />
          ) : (
            <Figure label="Voting closes" note="No season on the calendar" />
          )}

          <Figure
            label="Results go live"
            parts={[
              { value: results.days, unit: "days" },
              { value: pad(results.hours), unit: "hrs" },
              { value: pad(results.mins), unit: "min" },
            ]}
            note={results.done ? "Live" : null}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {signedIn
            ? voteLive && (
                <Link to={VOTE_OPTION.to} className={PRIMARY} style={PRIMARY_STYLE}>
                  Vote now
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )
            : ACCOUNT_KEYS.map((key, i) => {
                const Icon = key.icon;
                const isAsk = i === ACCOUNT_KEYS.length - 1;
                return (
                  <button
                    key={key.key}
                    type="button"
                    onClick={toLogin}
                    className={isAsk ? PRIMARY : SECONDARY}
                    style={isAsk ? PRIMARY_STYLE : SECONDARY_STYLE}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {key.label}
                    {isAsk && <ArrowRight className="h-3.5 w-3.5" />}
                  </button>
                );
              })}

          <NotifyMe large open={notifyOpen} onOpenChange={onNotifyChange} />
        </div>
      </div>
    </div>
  );
}