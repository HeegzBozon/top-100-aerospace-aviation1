import { useState } from 'react';
import { Clapperboard, Newspaper, ListOrdered } from 'lucide-react';
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

// The masthead's instrument cluster: Stories, In the News, and My TOP 100 — toggled.
export default function InstrumentCluster({ user, nominee, accent, groups = [], onOpen, onAdd, top100 = [] }) {
  const hasNews = !!nominee?.id;
  const [tab, setTab] = useState('stories');

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 rounded-full p-1 w-fit" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
        <Tab active={tab === 'stories'} onClick={() => setTab('stories')} icon={Clapperboard} label="Stories" accent={accent} />
        {hasNews && <Tab active={tab === 'news'} onClick={() => setTab('news')} icon={Newspaper} label="In the News" accent={accent} />}
        <Tab active={tab === 'top100'} onClick={() => setTab('top100')} icon={ListOrdered} label="My TOP 100" accent={accent} />
      </div>
      {tab === 'stories' && <StoriesBar user={user} accent={accent} groups={groups} onOpen={onOpen} onAdd={onAdd} />}
      {tab === 'news' && hasNews && <NomineeNewsSection nomineeId={nominee.id} />}
      {tab === 'top100' && <Top100Rail rankings={top100} groups={groups} onOpen={onOpen} accent={accent} />}
    </div>
  );
}