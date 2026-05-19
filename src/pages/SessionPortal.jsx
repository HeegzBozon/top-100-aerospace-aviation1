import { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Rocket, Wand2, LayoutList, BookOpen, History, Flame, Home } from 'lucide-react';
import SessionSelector from '@/components/session-portal/SessionSelector';
import SessionAgenda from '@/components/session-portal/SessionAgenda';
import TacticsLibrary from '@/components/session-portal/TacticsLibrary';
import SessionHistory from '@/components/session-portal/SessionHistory';
import WarmUpLibrary from '@/components/session-portal/WarmUpLibrary';
import SessionWelcome from '@/components/session-portal/SessionWelcome';

const NAV_ITEMS = [
  { path: '/session-portal', label: 'Welcome', icon: Home, exact: true },
  { path: '/session-portal/selector', label: 'Session Selector', icon: Wand2 },
  { path: '/session-portal/warmup', label: 'Warm-Up', icon: Flame },
  { path: '/session-portal/agenda', label: 'Agenda Builder', icon: LayoutList },
  { path: '/session-portal/tactics', label: 'Tactics Library', icon: BookOpen },
  { path: '/session-portal/history', label: 'Session History', icon: History },
];

export default function SessionPortal() {
  const location = useLocation();
  const [currentSession, setCurrentSession] = useState(null);

  return (
    <div className="min-h-screen flex flex-col" style={{
      background: 'linear-gradient(160deg, #07111f 0%, #0d1f36 60%, #111827 100%)',
      fontFamily: "'Montserrat', system-ui, sans-serif"
    }}>
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4 sticky top-0 z-30"
        style={{ background: 'rgba(7,17,31,0.92)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.3), rgba(201,168,124,0.1))' }}>
            <Rocket className="w-5 h-5 text-[#c9a87c]" />
          </div>
          <div>
            <p className="text-[#c9a87c] text-[10px] font-bold uppercase tracking-widest">Operation: Moon Joy</p>
            <h1 className="text-white font-bold text-sm">Mission Control Portal</h1>
          </div>
        </div>

        <nav className="flex-1 flex items-center justify-center gap-1 flex-wrap">
          {NAV_ITEMS.map(({ path, label, icon: NavIcon, exact }) => {
            const isActive = exact ? location.pathname === path || location.pathname === '/session-portal/' : location.pathname === path;
            return (
              <Link key={path} to={path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#c9a87c] text-[#07111f]'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}>
                <NavIcon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <Link to="/moon-joy" className="text-white/40 hover:text-white text-xs transition-colors">← Moon Joy</Link>
      </div>

      {/* Content */}
      <div className="flex-1">
        <Routes>
          <Route index element={<SessionWelcome />} />
          <Route path="selector" element={<SessionSelector currentSession={currentSession} setCurrentSession={setCurrentSession} />} />
          <Route path="warmup" element={<WarmUpLibrary />} />
          <Route path="agenda" element={<SessionAgenda currentSession={currentSession} setCurrentSession={setCurrentSession} />} />
          <Route path="tactics" element={<TacticsLibrary currentSession={currentSession} />} />
          <Route path="history" element={<SessionHistory />} />
        </Routes>
      </div>
    </div>
  );
}