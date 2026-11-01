import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import useInbox from './useInbox';
import InboxBundle from './InboxBundle';
import InboxMetrics from './InboxMetrics';
import InboxControls, { SORTS } from './InboxControls';
import useInboxPicker from './useInboxPicker';
import Newsstand from '@/pages/Newsstand';
import InboxCapture from './InboxCapture';

import { BUNDLES, STAGES, inFilter } from './inboxFunnel';

const VIEWS = ['inbox', 'pinned', 'done'];

export default function InboxTriage({ user }) {
  const { items, states, status, reload, setState, setEnquiryStatus } = useInbox(user);
  const [view, setView] = useState('inbox');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [openKey, setOpenKey] = useState(null);
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get('tab') === 'newsstand' ? 'newsstand' : 'inbox');
  const now = Date.now();
  const toggle = (key) => setOpenKey((k) => (k === key ? null : key));

  const visible = items.filter((i) => {
    const s = states[i.key] || {};
    if (!inFilter(filter, i.bundle)) return false;
    if (view === 'done') return s.done;
    if (s.done) return false;
    if (view === 'pinned') return s.pinned;
    return !s.snoozed_until || new Date(s.snoozed_until).getTime() <= now;
  }).sort(SORTS.find((x) => x.key === sort).compare);
  // Rows in the order they print, so the wheel walks them top to bottom.
  const shown = BUNDLES.filter((b) => inFilter(filter, b.key));
  const rows = shown.flatMap((b) => visible.filter((i) => i.bundle === b.key));
  const { cursorKey } = useInboxPicker({
    rows: tab === 'inbox' ? rows : [], views: VIEWS, view, setView, onOpen: toggle,
    onDone: (key) => setState(key, { done: true, snoozed_until: null }),
  });

  if (status === 'loading') return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-editorial-copper" /></div>;
  if (status === 'error') return (
    <p className="py-8 text-center font-body text-sm text-editorial-navy">
      The inbox could not be read. <button className="font-semibold text-editorial-copper underline" onClick={reload}>Try again</button>
    </p>
  );

  const label = filter === 'all' ? 'item in the funnel' : `item in ${(BUNDLES.find((b) => b.key === filter) || STAGES.find((s) => s.key === filter)).label.toLowerCase()}`;

  return (
    <div>
      <div role="tablist" className="mb-3 grid grid-cols-3 rounded border border-editorial-navy/15 bg-white p-0.5">
        {['funnel', 'inbox', 'newsstand'].map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`rounded py-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.16em] ${tab === t ? 'bg-editorial-navy text-editorial-cream' : 'text-editorial-navy'}`}>
            {t === 'newsstand' ? 'Latest' : t}
          </button>
        ))}
      </div>
      {tab === 'newsstand' ? (
        <div className="-mx-2.5 md:mx-0"><Newsstand /></div>
      ) : tab === 'funnel' ? (
        <InboxMetrics items={items} states={states} filter={filter} onFilter={(f) => { setFilter(f); setTab('inbox'); }} />
      ) : (<>
      <InboxCapture user={user} onSaved={reload} />
      <InboxControls views={VIEWS} view={view} setView={setView} sort={sort} setSort={setSort}
        filter={filter} setFilter={setFilter} />
      {rows.length === 0 ? (
        <div className="rounded border border-editorial-copper/40 bg-editorial-cream px-6 py-10 text-center">
          <p className="font-heading text-2xl text-editorial-navy">{view === 'done' ? 'Nothing done yet.' : 'All clear.'}</p>
          <p className="mt-2 font-body text-sm text-editorial-navy/70">
            {view === 'inbox' ? `Every ${label} is handled. Snoozed items return on their own.` : view === 'pinned' ? 'Pin an item to keep it here.' : 'Items you finish are kept here.'}
          </p>
        </div>
      ) : shown.map((b) => (
        <InboxBundle key={b.key} ownerEmail={user.email} label={b.label} states={states} onSet={setState} showSweep={view === 'inbox'} cursorKey={cursorKey}
          openKey={openKey} onOpen={toggle} onEnquiryStatus={setEnquiryStatus}
          items={visible.filter((i) => i.bundle === b.key)} />
      ))}
      </>)}
    </div>
  );
}