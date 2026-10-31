import { ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { ACCOUNT_KEYS } from "./startMenuConfig";

// The way in, and nothing else.
//
// Measuring is a Fellow's work, so the ballot stands on the cycle band, on the reading
// that closes it (see StartCycleReadout) — which leaves this row to the one reader who
// has no account: signing in, or making one. A Fellow is offered nothing here, so the
// row is not drawn at all rather than standing empty under the band.
/* min-h-[24px] is the smallest a target may be — the type stays at 8.5px, the box grows
   around it, so the pill reads exactly as it did and the thumb has something to land on. */
const PILL =
  "inline-flex min-h-[24px] shrink-0 items-center gap-1 rounded-full px-2.5 py-[5px] text-[8.5px] font-bold uppercase tracking-[0.18em] transition-[transform,box-shadow] duration-200 active:scale-95 md:text-[9.5px]";

const loud = (selected) => ({
  color: "#16293F",
  background: "rgb(var(--editorial-gold-rgb) / 0.95)",
  boxShadow: selected
    ? "0 0 0 1px rgb(var(--editorial-gold-rgb) / 0.7), 0 6px 16px rgba(3,6,13,0.4)"
    : "0 6px 16px rgba(3,6,13,0.34)",
});

const quiet = (selected) => ({
  color: selected ? "#16293F" : "rgb(var(--editorial-gold-rgb) / 0.92)",
  background: selected ? "rgb(var(--editorial-gold-rgb) / 0.95)" : "rgb(var(--editorial-gold-rgb) / 0.14)",
  boxShadow: selected
    ? "0 0 0 1px rgb(var(--editorial-gold-rgb) / 0.7), 0 6px 16px rgba(3,6,13,0.4)"
    : "inset 0 0 0 1px rgb(var(--editorial-gold-rgb) / 0.5)",
});

export default function StartTitleActions({ signedIn = false, selectedKey = null }) {
  if (signedIn) return null;

  // The platform's own door: it signs a Fellow in, and opens the account a visitor has
  // not made yet. Either reading comes back to the Fellow's own profile — the home
  // surface — so signing in lands somewhere instead of on the screen it left from.
  const toLogin = () => base44.auth.redirectToLogin('/Profile');

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5 md:mt-3 md:gap-2">
      {ACCOUNT_KEYS.map((key, i) => {
        const Icon = key.icon;
        const isAsk = i === ACCOUNT_KEYS.length - 1;
        const selected = selectedKey === key.key;
        return (
          <button
            key={key.key}
            type="button"
            onClick={toLogin}
            data-hh-key={key.key}
            aria-current={selected ? "true" : undefined}
            className={PILL}
            style={isAsk ? loud(selected) : quiet(selected)}
          >
            <Icon className="h-[9px] w-[9px]" />
            {key.label}
            {isAsk && <ArrowRight className="h-[9px] w-[9px]" />}
          </button>
        );
      })}
    </div>
  );
}