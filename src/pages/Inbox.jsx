import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import InboxTriage from '@/components/inbox/InboxTriage';
import Newsstand from '@/pages/Newsstand';

const TABS = [{ key: 'inbox', label: 'Inbox' }, { key: 'newsstand', label: 'Newsstand' }];

// The Inbox, as its own application: everything that needs an answer, and the Newsstand beside it.
export default function Inbox() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get('tab') === 'newsstand' ? 'newsstand' : 'inbox');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin(window.location.href));
  }, []);

  if (!user) return <div className="flex min-h-screen items-center justify-center bg-editorial-cream"><Loader2 className="h-5 w-5 animate-spin text-editorial-copper" /></div>;

  const tabBar = (
    <div role="tablist" className="flex gap-4 border-b border-editorial-navy/15 bg-editorial-cream px-2.5 pt-2 md:px-8">
      {TABS.map((t) => (
        <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
          className={`-mb-px border-b-2 pb-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] ${tab === t.key ? 'border-editorial-copper text-editorial-navy' : 'border-transparent text-editorial-navy/55'}`}>
          {t.label}
        </button>
      ))}
    </div>
  );

  if (tab === 'newsstand') return <div>{tabBar}<Newsstand /></div>;

  return (
    <div className="min-h-screen bg-editorial-cream">
      {tabBar}
      <div className="px-2.5 pb-4 pt-3 md:px-8 md:py-6">
        <div className="mx-auto max-w-2xl">
          <p className="pd-label">Inbox <span className="ml-2 hidden normal-case tracking-normal text-editorial-navy/50 md:inline">Wheel walks · ◀ ▶ switch view · confirm opens · back marks done</span></p>
          <h1 className="mt-0.5 font-heading text-[22px] leading-tight text-editorial-navy md:mt-1 md:text-3xl">What needs an answer</h1>
          <div className="pd-rule mb-3 mt-2 w-12 md:mb-6 md:mt-3" />
          <InboxTriage user={user} />
        </div>
      </div>
    </div>
  );
}