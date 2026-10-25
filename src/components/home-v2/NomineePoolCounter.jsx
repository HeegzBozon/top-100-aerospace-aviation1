import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Public pool count — unique non-rejected people, counted by the same resolver the
// outreach export uses, so the public number and the export row count always agree.
export default function NomineePoolCounter() {
  const [state, setState] = useState({ status: 'loading', count: null });

  useEffect(() => {
    let mounted = true;

    base44.functions
      .invoke('getNomineePoolCount', {})
      .then((res) => {
        const count = res?.data?.count ?? res?.count ?? null;
        if (!mounted) return;
        setState(count === null ? { status: 'unavailable', count: null } : { status: 'ready', count });
      })
      .catch(() => {
        if (mounted) setState({ status: 'unavailable', count: null });
      });

    return () => { mounted = false; };
  }, []);

  return (
    <div className="h-full rounded-3xl border border-[#c9a87c]/25 bg-[#07111f]/50 backdrop-blur-xl shadow-[0_0_40px_rgba(201,168,124,0.10)]">
      <div className="flex h-full flex-col items-center justify-center px-4 py-3.5 text-center">
        <div className="mb-1 flex items-center gap-1.5 text-[#c9a87c]">
          <Users className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Nominees</span>
        </div>

        {state.status === 'loading' && (
          <div className="h-8 w-16 animate-pulse rounded bg-white/10 sm:h-9 sm:w-20" aria-hidden="true" />
        )}

        {state.status === 'ready' && (
          <div
            className="text-3xl font-bold tabular-nums text-white sm:text-4xl"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {state.count.toLocaleString()}
          </div>
        )}

        {state.status === 'unavailable' && (
          <div
            className="text-2xl font-semibold tabular-nums text-white/30 sm:text-3xl"
            title="The nominee count could not be loaded"
          >
            —
          </div>
        )}
      </div>
    </div>
  );
}