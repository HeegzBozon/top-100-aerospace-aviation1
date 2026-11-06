import { useMemo, useState } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import usePatronDesk from '@/components/patronage/usePatronDesk';
import usePatronMeta from '@/components/patronage/usePatronMeta';
import PipelinePanel from '@/components/patronage/PipelinePanel';
import InventoryPanel from '@/components/patronage/InventoryPanel';
import ReportsPanel from '@/components/patronage/ReportsPanel';
import DecisionRegister from '@/components/patronage/DecisionRegister';
import { DESK, P } from '@/components/patronage/patronConfig';

// THE PATRON DESK.
//
// Four leaves, one lifecycle. The pipeline carries a deal from a raised hand to a signed
// agreement; inventory decides what there is to sell; reports are what the buyer is owed
// afterwards; and the register holds every decision that is still somebody's to make.
//
// Nothing on this desk is public. It is admin-only, it is noindex, and the gates it shows
// are the reason a slot is never called sold before the house can stand behind it.

const TABS = [
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'reports', label: 'Reports' },
  { key: 'decisions', label: 'Decisions' },
];

export default function PatronDesk() {
  usePatronMeta({
    title: 'Sponsor desk | TOP 100 Aerospace & Aviation',
    description: 'Internal. The Sponsor of Record lifecycle, its inventory, its reports and its register.',
    path: '/patronage/desk',
    noindex: true,
  });

  const { user, isLoadingAuth } = useAuth();
  const isAdmin = user?.role === 'admin';
  const desk = usePatronDesk(isAdmin);
  const [tab, setTab] = useState('pipeline');

  const openDecisions = useMemo(
    () => desk.decisions.filter((decision) => decision.status !== 'resolved').length,
    [desk.decisions],
  );

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: P.cream }}>
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: P.copper }} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6" style={{ background: P.cream }}>
        <div className="max-w-md border p-7 text-center" style={{ borderColor: P.hair, background: 'white' }}>
          <Lock className="mx-auto h-5 w-5" style={{ color: P.copper }} />
          <h1 className="mt-4 font-heading text-xl" style={{ color: P.navy }}>
            This desk is worked from inside the house
          </h1>
          <p className="mt-2 text-[12px] leading-relaxed" style={{ color: P.muted }}>
            Commercial conversations, rates and agreements are admin-only. The public media kit is open to
            everyone.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link
              to="/mediakit"
              className="rounded-lg px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.18em]"
              style={{ background: P.copper, color: P.cream }}
            >
              The media kit
            </Link>
            <Link
              to="/"
              className="rounded-lg border px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.18em]"
              style={{ borderColor: P.hair, color: P.navy }}
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: P.sand }}>
      <header className="border-b" style={{ borderColor: P.hair, background: P.cream }}>
        <div className="mx-auto w-full max-w-6xl px-5 pb-3 pt-5 md:px-8 md:pb-4 md:pt-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.3em]" style={{ color: P.copper }}>
                Internal &middot; The publication
              </p>
              <h1 className="mt-1.5 font-heading text-[1.7rem] leading-none md:text-[2.2rem]" style={{ color: P.navy }}>
                Sponsor desk
              </h1>
              <p className="mt-1.5 text-[10.5px]" style={{ color: P.muted }}>
                Attribution, never placement. Every advance is gated.
              </p>
            </div>
            <Link
              to="/mediakit"
              className="rounded-lg border px-3 py-2 text-[8.5px] font-bold uppercase tracking-[0.16em]"
              style={{ borderColor: P.hair, color: P.navy, background: 'white' }}
            >
              The media kit
            </Link>
          </div>

          <nav className="mt-4 flex gap-1 overflow-x-auto md:mt-5">
            {TABS.map((item) => {
              const active = tab === item.key;
              const badge = item.key === 'decisions' && openDecisions ? openDecisions : null;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-t-lg px-3 py-2 text-[8.5px] font-bold uppercase tracking-[0.16em]"
                  style={{
                    background: active ? 'white' : 'transparent',
                    color: active ? P.navy : P.muted,
                    border: `1px solid ${active ? P.hair : 'transparent'}`,
                    borderBottomColor: active ? 'white' : P.hair,
                  }}
                >
                  {item.label}
                  {badge ? (
                    <span className="rounded-full px-1.5 text-[8px]" style={{ background: P.copper, color: P.cream }}>
                      {badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-5 md:px-8 md:py-7">
        {desk.error ? (
          <div className={`${DESK.card} mb-4 p-4`} style={{ borderColor: '#8e3a24' }}>
            <p className="text-[11.5px]" style={{ color: '#8e3a24' }}>
              {desk.error}
            </p>
            <button type="button" onClick={desk.reload} className={`${DESK.btn} mt-3`} style={{ background: P.copper, color: P.cream }}>
              Try again
            </button>
          </div>
        ) : null}

        {desk.loading ? (
          <div className="flex items-center gap-2 py-16 text-[11px]" style={{ color: P.muted }}>
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: P.copper }} />
            Reading the desk
          </div>
        ) : (
          <>
            {tab === 'pipeline' ? (
              <PipelinePanel deals={desk.deals} slots={desk.slots} user={user} onChanged={desk.reload} />
            ) : null}
            {tab === 'inventory' ? <InventoryPanel slots={desk.slots} onChanged={desk.reload} /> : null}
            {tab === 'reports' ? (
              <ReportsPanel deals={desk.deals} reports={desk.reports} user={user} onChanged={desk.reload} />
            ) : null}
            {tab === 'decisions' ? <DecisionRegister decisions={desk.decisions} user={user} onChanged={desk.reload} /> : null}
          </>
        )}
      </main>
    </div>
  );
}