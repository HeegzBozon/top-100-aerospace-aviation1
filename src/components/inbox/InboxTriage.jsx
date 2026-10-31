import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import useInbox from './useInbox';
import InboxBundle from './InboxBundle';

const BUNDLES = [
  { key: 'introductions', label: 'Introductions' },
  { key: 'referrals', label: 'Referrals' },
];
const VIEWS = ['inbox', 'pinned', 'done'];

export default function InboxTriage({ user }) {
  const { items, states, status, reload, setState } = useInbox(user);
  const [view, setView] = useState('inbox');
  const now = Date.now();

  if (status === 'loading') return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-editorial-copper" /></div>;
  if (status === 'error') return (
    <p className="py-8 text-center font-body text-sm text-editorial-navy">
      The inbox could not be read. <button className="font-semibold text-editorial-copper underline" onClick={reload}>Try again</button>
    </p>
  );

  const visible = items.filter((i) => {
    const s = states[i.key] || {};
    if (view === 'done') return s.done;
    if (s.done) return false;
    if (view === 'pinned') return s.pinned;
    return !s.snoozed_until || new Date(s.snoozed_until).getTime() <= now;
  });

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {VIEWS.map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={`rounded-full border px-3 py-1 font-body text-xs font-semibold uppercase tracking-[0.12em] ${view === v ? 'border-editorial-navy bg-editorial-navy text-editorial-cream' : 'border-editorial-navy/20 text-editorial-navy'}`}>
            {v}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <div className="rounded border border-editorial-copper/40 bg-editorial-cream px-6 py-10 text-center">
          <p className="font-heading text-2xl text-editorial-navy">{view === 'done' ? 'Nothing done yet.' : 'All clear.'}</p>
          <p className="mt-2 font-body text-sm text-editorial-navy/70">
            {view === 'inbox' ? 'Every referral and introduction is handled. Snoozed items return on their own.' : view === 'pinned' ? 'Pin an item to keep it here.' : 'Items you finish are kept here.'}
          </p>
        </div>
      ) : BUNDLES.map((b) => (
        <InboxBundle key={b.key} label={b.label} states={states} onSet={setState} showSweep={view === 'inbox'}
          items={visible.filter((i) => i.bundle === b.key)} />
      ))}
    </div>
  );
}