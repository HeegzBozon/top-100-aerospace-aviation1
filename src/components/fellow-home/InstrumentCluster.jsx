import { useState } from 'react';
import { Clapperboard, Newspaper } from 'lucide-react';
import StoriesBar from '@/components/fellow-home/StoriesBar';
import NomineeNewsSection from '@/components/profile/NomineeNewsSection';
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

// The masthead's instrument cluster: live signal (Stories) and press (In the News), toggled.
export default function InstrumentCluster({ user, nominee, accent }) {
  const hasNews = !!nominee?.id;
  const [tab, setTab] = useState('stories');

  if (!hasNews) return <StoriesBar user={user} accent={accent} />;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 rounded-full p-1 w-fit" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
        <Tab active={tab === 'stories'} onClick={() => setTab('stories')} icon={Clapperboard} label="Stories" accent={accent} />
        <Tab active={tab === 'news'} onClick={() => setTab('news')} icon={Newspaper} label="In the News" accent={accent} />
      </div>
      {tab === 'stories' && <StoriesBar user={user} accent={accent} />}
      {tab === 'news' && <NomineeNewsSection nomineeId={nominee.id} />}
    </div>
  );
}