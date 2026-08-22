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
      <div className="flex items-center gap-2 py-1">
        <Sparkles className="w-4 h-4 animate-pulse" style={{ color: accent }} />
        <span className="text-xs" style={{ color: B.muted }}>Finding your next move…</span>
      </div>
    );
  }

  if (!next) {
    return (
      <div className="flex items-center justify-between gap-3 py-1">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 shrink-0" style={{ color: accent }} />
          <span className="text-sm font-semibold truncate" style={{ color: B.navy }}>Your profile is complete</span>
        </div>
        <Link to="/Top100Women2025" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] shrink-0" style={{ color: B.navy }}>
          Explore <ArrowRight className="w-3.5 h-3.5" style={{ color: accent }} />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles className="w-4 h-4 shrink-0" style={{ color: accent }} />
        <span className="text-sm font-semibold truncate" style={{ color: B.navy }}>{next.label}</span>
      </div>
      <button onClick={next.action} className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] shrink-0 px-3 py-1.5 rounded-full text-white transition-opacity hover:opacity-90" style={{ background: B.navy }}>
        Begin <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}