import { Clapperboard, Newspaper, ListOrdered } from 'lucide-react';
import StoriesBar from '@/components/fellow-home/StoriesBar';
import NomineeNewsSection from '@/components/profile/NomineeNewsSection';
import Top100Rail from '@/components/fellow-home/Top100Rail';
import { B } from '@/components/fellow-home/fellowHomeConfig';

function Tab({ active, onClick, icon: Icon, label, accent }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.14em] transition-colors shrink-0 whitespace-nowrap"
      style={{ background: active ? B.navy : 'transparent', color: active ? '#fff' : B.muted }}
    >
      <Icon className="w-3.5 h-3.5" style={{ color: active ? '#fff' : accent }} />
      {label}
    </button>
  );
}

// The masthead's instrument cluster: My TOP 100 (default), Stories, In the News.
// Tab state is owned by the page (persisted in the URL) so it survives navigation.
export default function InstrumentCluster({ user, nominee, accent, groups = [], onOpen, onAdd, top100 = [], activeTab = 'top100', onTabChange, top100Loading, storiesLoading, composePanel }) {
  const hasNews = !!nominee?.id;
  const tab = activeTab;
  const setTab = onTabChange || (() => {});

  return (
    <div className="flex flex-col md:flex-row gap-3">
      {composePanel && (
        <div className="md:flex-[0_0_30%] shrink-0 min-w-0">{composePanel}</div>
      )}
      <div className="md:flex-1 min-w-0 flex flex-col gap-3">
        <div className="flex items-center gap-1 rounded-full p-1 w-fit max-w-full overflow-x-auto scrollbar-hide" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
          <Tab active={tab === 'top100'} onClick={() => setTab('top100')} icon={ListOrdered} label="My TOP 100" accent={accent} />
          <Tab active={tab === 'stories'} onClick={() => setTab('stories')} icon={Clapperboard} label="Stories" accent={accent} />
          {hasNews && <Tab active={tab === 'news'} onClick={() => setTab('news')} icon={Newspaper} label="In the News" accent={accent} />}
        </div>
        {tab === 'top100' && <Top100Rail rankings={top100} groups={groups} onOpen={onOpen} accent={accent} loading={top100Loading} />}
        {tab === 'stories' && <StoriesBar user={user} accent={accent} groups={groups} onOpen={onOpen} onAdd={onAdd} loading={storiesLoading} />}
        {tab === 'news' && hasNews && <NomineeNewsSection nomineeId={nominee.id} />}
      </div>
    </div>
  );
}