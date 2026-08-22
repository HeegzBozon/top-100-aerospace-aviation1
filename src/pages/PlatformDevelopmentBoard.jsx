import { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import BoardSwitcher from '@/components/platform-board/BoardSwitcher';
import PlatformBoardView from '@/components/platform-board/PlatformBoardView';

// Standalone deep-link to the platform board. Reuses the same view rendered
// inside the instrument cluster, so behavior is identical.
const ACCENT = B.navy;

export default function PlatformDevelopmentBoard() {
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser).catch(() => setUser(null)); }, []);

  return (
    <div className="min-h-screen" style={{ background: B.sand }}>
      <header className="sticky top-0 z-30 px-5 sm:px-8 py-4 flex items-center gap-3" style={{ background: B.cream, borderBottom: `1px solid ${B.border}` }}>
        <Layers className="w-5 h-5 shrink-0" style={{ color: ACCENT }} />
        <div className="min-w-0">
          <h1 className="text-base font-bold leading-tight" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>Platform Development Board</h1>
          <p className="text-[11px]" style={{ color: B.muted }}>Strategic themes, OKRs, epics & side quests — a communal build ledger.</p>
        </div>
        <div className="ml-auto"><BoardSwitcher active="platform" accent={ACCENT} /></div>
      </header>
      <main className="px-4 sm:px-8 py-6 max-w-6xl mx-auto">
        <PlatformBoardView user={user} accent={ACCENT} />
      </main>
    </div>
  );
}