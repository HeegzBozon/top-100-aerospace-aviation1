import { useEffect, useState } from 'react';
import { getNomineePoolCount } from '@/functions/getNomineePoolCount';
import { B } from '@/components/fellow-home/fellowHomeConfig';

export default function NomineeTally({ accent }) {
  const [state, setState] = useState({ loading: true, count: null, failed: false });

  useEffect(() => {
    let mounted = true;
    getNomineePoolCount({})
      .then((res) => {
        if (!mounted) return;
        const count = res?.data?.count ?? res?.count ?? null;
        setState({ loading: false, count, failed: count === null });
      })
      .catch(() => mounted && setState({ loading: false, count: null, failed: true }));
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: B.muted }}>
        Under measurement
      </p>

      {state.loading ? (
        <div className="h-9 w-24 rounded animate-pulse" style={{ background: `${B.navy}0f` }} />
      ) : state.failed ? (
        <p className="text-xs" style={{ color: B.muted }}>Tally returns on your next visit.</p>
      ) : (
        <>
          <div
            className="text-3xl sm:text-4xl leading-none tabular-nums"
            style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
          >
            {state.count.toLocaleString()}
          </div>
          <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: accent }}>
            Nominees
          </p>
        </>
      )}
    </div>
  );
}