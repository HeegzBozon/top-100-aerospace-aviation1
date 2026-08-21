import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clapperboard, Newspaper, ListOrdered, ArrowRight } from 'lucide-react';
import StoriesBar from '@/components/fellow-home/StoriesBar';
import NomineeNewsSection from '@/components/profile/NomineeNewsSection';
import Top100Rail from '@/components/fellow-home/Top100Rail';
import { B } from '@/components/fellow-home/fellowHomeConfig';

function Tab({ active, onClick, icon: Icon, label, accent }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.14em] transition-colors"
      style={{ background: active ? B.navy : 'transparent', color: active ? '#fff' : B.muted }}
    >
      <Icon className="w-3.5 h-3.5" style={{ color: active ? '#fff' : accent }} />
      {label}
    </button>
  );
}

// The masthead's instrument cluster: My TOP 100 (default), Stories, In the News.
// 70/30 split — tabs + content on the left, status composer + ballot refine on the right.
export default function InstrumentCluster({ user, nominee, accent, groups = [], onOpen, onAdd, top100 = [], statusSlot }) {
  const hasNews = !!nominee?.id;
  const [tab, setTab] = useState('top100');

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-4 items-start">
      {/* Left ~70% — tabs + content */}
      <div className="space-y-3 min-w-0">
        <div className="flex items-center gap-1 rounded-full p-1 w-fit" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
          <Tab active={tab === 'top100'} onClick={() => setTab('top100')} icon={ListOrdered} label="My TOP 100" accent={accent} />
          <Tab active={tab === 'stories'} onClick={() => setTab('stories')} icon={Clapperboard} label="Stories" accent={accent} />
          {hasNews && <Tab active={tab === 'news'} onClick={() => setTab('news')} icon={Newspaper} label="In the News" accent={accent} />}
        </div>
        {tab === 'top100' && <Top100Rail rankings={top100} groups={groups} onOpen={onOpen} accent={accent} />}
        {tab === 'stories' && <StoriesBar user={user} accent={accent} groups={groups} onOpen={onOpen} onAdd={onAdd} />}
        {tab === 'news' && hasNews && <NomineeNewsSection nomineeId={nominee.id} />}
      </div>

      {/* Right ~30% — status composer + ballot refine */}
      <div className="space-y-3 flex flex-col self-stretch">
        {statusSlot}
        <div className="rounded-xl p-4 flex-1 flex flex-col min-h-[160px]" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: B.muted }}>Ballot</span>
            <Link
              to="/nominate"
              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-70"
              style={{ color: B.navy }}
            >
              Refine <ArrowRight className="w-3 h-3" style={{ color: accent }} />
            </Link>
          </div>
          <p className="mt-2 text-xs leading-snug" style={{ color: B.muted }}>
            Refine your TOP 100 ballot.
          </p>
        </div>
      </div>
    </div>
  );
}