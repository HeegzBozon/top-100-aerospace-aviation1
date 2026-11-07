import { useState } from 'react';
import { Cpu, Mail, PlaneTakeoff } from 'lucide-react';
import VoteGate from '@/components/voting/VoteGate';
import BoardingPass from '@/components/my-top100/BoardingPass';

// ── Pre-Flight ──
//
// Two keys on one desk, read in the order the desk is worked. The Invitation is the letter
// that convened the committee: it carries everything the office is — how the two ballots
// work, who may serve, and the questions a reader writes back with. Credentials follow it,
// because they are the answer: the badge, the boarding pass and the business card the
// Fellow is handed, all of them the same record printed three ways.
//
// The sub-key row sits under the committee's own tabs, smaller and quieter, so a reader can
// see at a glance that Pre-Flight holds two things rather than three.

const KEYS = [
  { key: 'invitation', label: 'Invitation', icon: Mail },
  { key: 'boarding', label: 'Credentials', icon: PlaneTakeoff },
];

export default function PreFlightSurface({
  user,
  hasExisting,
  onBegin,
  onVote,
  onOpenOS,
  adminKey = null,
  initial = 'invitation',
}) {
  const [sub, setSub] = useState(() => {
    const asked = new URLSearchParams(window.location.search).get('preflight');
    return KEYS.some((k) => k.key === asked) ? asked : initial;
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-editorial-copper/25 bg-editorial-cream/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-5 px-4 lg:px-6">
          <p className="hidden shrink-0 py-2.5 font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-label sm:block">
            Pre-Flight
          </p>
          <div className="flex min-w-0 items-end gap-5 overflow-x-auto overflow-y-hidden scrollbar-hide">
            {KEYS.map(({ key, label, icon: Icon }) => {
              const active = sub === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSub(key)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex shrink-0 items-center gap-1.5 pb-2 pt-2.5 font-body text-[10px] font-bold uppercase tracking-[0.18em] transition-colors focus-visible:outline-none ${
                    active ? 'text-editorial-navy' : 'text-editorial-navy/45 hover:text-editorial-navy/80'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                  {active && (
                    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] bg-editorial-copper" />
                  )}
                </button>
              );
            })}
          </div>

          {onOpenOS && (
            <button
              type="button"
              onClick={onOpenOS}
              aria-label="How this works"
              className="ml-auto flex shrink-0 items-center gap-1.5 py-2 font-body text-[9.5px] font-bold uppercase tracking-[0.16em] text-editorial-navy/50 transition-colors hover:text-editorial-navy focus-visible:outline-none"
            >
              <Cpu className="h-3 w-3" />
              <span className="hidden sm:inline">How this works</span>
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {sub === 'invitation' ? (
          <div className="flex flex-col">
            {adminKey}
            <VoteGate sealed={false} onPreviewContinue={() => setSub('boarding')} />
          </div>
        ) : (
          <BoardingPass
            user={user}
            hasExisting={hasExisting}
            onBegin={onBegin}
            onVote={onVote}
          />
        )}
      </div>
    </div>
  );
}