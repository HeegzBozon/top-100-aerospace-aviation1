import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import InboxTriage from '@/components/inbox/InboxTriage';
import PIBoard from '@/components/seasonal-planning/PIBoard';
import SeasonHeader from '@/components/seasonal-planning/SeasonHeader';
import SeasonCalendar from '@/components/seasonal-planning/SeasonCalendar';
import PersonalBoard from '@/components/seasonal-planning/PersonalBoard';
import ReleaseNotes from '@/components/seasonal-planning/ReleaseNotes';
import { seasonFor } from '@/components/seasonal-planning/seasons';

// Seasonal Planning: the Program Increment board, with the former Inbox kept as its triage desk.
export default function Inbox() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('board');
  const [board, setBoard] = useState('platform');
  const [season, setSeason] = useState(() => seasonFor());

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin(window.location.href));
  }, []);

  if (!user) return <div className="flex min-h-screen items-center justify-center bg-editorial-cream"><Loader2 className="h-5 w-5 animate-spin text-editorial-copper" /></div>;

  return (
    <div className="min-h-screen bg-editorial-cream px-2.5 pb-4 pt-3 md:px-8 md:py-6">
      <div className={`mx-auto ${tab !== 'triage' ? 'max-w-6xl' : 'max-w-2xl'}`}>
        <p className="pd-label">Seasonal Planning</p>
        <h1 className="mt-0.5 font-heading text-[22px] leading-tight text-editorial-navy md:mt-1 md:text-3xl">{tab === 'triage' ? 'What needs an answer' : 'The season ahead'}</h1>
        <div className="pd-rule mb-3 mt-2 w-12 md:mb-6 md:mt-3" />
        <div className="mb-2 flex max-w-sm gap-1 rounded-full bg-editorial-sand p-0.5">
          {[['platform', 'TOP 100 Platform'], ['personal', 'My Season']].map(([k, l]) => (
            <button key={k} onClick={() => { setBoard(k); if (k === 'personal' && tab === 'triage') setTab('board'); }}
              className={`flex-1 rounded-full py-1.5 font-body text-[11px] font-semibold ${board === k ? 'bg-editorial-navy text-editorial-cream' : 'text-editorial-navy'}`}>{l}</button>
          ))}
        </div>
        <div role="tablist" className={`mb-3 grid max-w-sm ${board === 'platform' ? 'grid-cols-4' : 'grid-cols-3'} rounded border border-editorial-navy/15 bg-white p-0.5`}>
          {[['board', 'Board'], ['calendar', 'Calendar'], ['releases', board === 'platform' ? 'Releases' : 'Updates'], ...(board === 'platform' ? [['triage', 'Triage']] : [])].map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={`rounded py-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.16em] ${tab === k ? 'bg-editorial-navy text-editorial-cream' : 'text-editorial-navy'}`}>{l}</button>
          ))}
        </div>
        {tab !== 'triage' && <SeasonHeader season={season} setSeason={setSeason} />}
        {tab === 'board' && (board === 'platform' ? <PIBoard isAdmin={user.role === 'admin'} season={season} /> : <PersonalBoard user={user} season={season} />)}
        {tab === 'releases' && <ReleaseNotes key={board} user={user} scope={board} season={season} />}
        {tab === 'calendar' && <SeasonCalendar season={season} />}
        {tab === 'triage' && <InboxTriage user={user} />}
      </div>
    </div>
  );
}