import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { getNomineePoolCount } from '@/functions/getNomineePoolCount';

export default function NomineePoolCounter() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    let mounted = true;
    getNomineePoolCount({})
      .then((res) => {
        if (!mounted) return;
        setCount(res?.data?.count ?? res?.count ?? null);
      })
      .catch(() => { if (mounted) setCount(null); });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="h-full rounded-3xl border border-[#c9a87c]/25 bg-[#07111f]/50 backdrop-blur-xl shadow-[0_0_40px_rgba(201,168,124,0.10)]">
      <div className="flex h-full flex-col items-center justify-center px-4 py-3.5 text-center">
        <div className="mb-1 flex items-center gap-1.5 text-[#c9a87c]">
          <Users className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Candidate Pool</span>
        </div>
        <div
          className="text-3xl font-bold tabular-nums text-white sm:text-4xl"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {count === null ? '—' : count.toLocaleString()}
        </div>
        <p className="mt-0.5 text-[10px] font-semibold text-white/45">verified nominees · all seasons</p>
      </div>
    </div>
  );
}