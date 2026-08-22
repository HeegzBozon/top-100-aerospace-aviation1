import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// The action-driving engine. Surfaces the highest-leverage unfinished step.
// Bare content — the ModuleGrid card frames it.
export default function NextMove({ data, user, accent, onCompose, onJumpToTile, onJumpToEight, onEditIdentity }) {
  const { eightCount = 0, hasFlightography, hasSixWord } = data || {};
  const [dispatchCount, setDispatchCount] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.Bulletin.filter({ author_email: user.email, post_type: 'dispatch', status: 'published' }, '-created_date', 1)
      .then((r) => setDispatchCount(r?.length || 0))
      .catch(() => setDispatchCount(0));
  }, [user?.email]);

  const steps = [
    { ready: eightCount >= 8, label: `Fill position ${Math.min(eightCount + 1, 8)} of your Eight`, action: onJumpToEight },
    { ready: (dispatchCount ?? 0) > 0, label: 'File your first dispatch', action: () => onCompose('dispatch') },
    { ready: hasFlightography, label: 'Add your career history', action: () => onJumpToTile('flightography') },
    { ready: hasSixWord, label: 'Write your six-word story', action: onEditIdentity },
  ];

  const next = steps.find((s) => !s.ready);

  if (dispatchCount === null) {
    return (
      <div className="flex items-center gap-2 py-2 h-full">
        <Sparkles className="w-4 h-4 animate-pulse" style={{ color: accent }} />
        <span className="text-xs" style={{ color: B.muted }}>Finding your next move…</span>
      </div>
    );
  }

  if (!next) {
    return (
      <div className="flex flex-col h-full justify-between gap-3 py-1">
        <p className="text-sm font-semibold leading-snug" style={{ color: B.navy }}>Your profile is complete</p>
        <Link
          to="/Top100Women2025"
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90"
          style={{ background: B.navy }}
        >
          Explore <ArrowRight className="w-4 h-4" style={{ color: accent }} />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-between gap-3 py-1">
      <p className="text-sm font-semibold leading-snug" style={{ color: B.navy }}>{next.label}</p>
      <button
        onClick={next.action}
        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90"
        style={{ background: B.navy }}
      >
        Begin <ArrowRight className="w-4 h-4" style={{ color: accent }} />
      </button>
    </div>
  );
}