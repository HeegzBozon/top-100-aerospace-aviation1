import { Check } from 'lucide-react';
import { B } from './journeyConfig';
import { PACK_ITEMS } from './stageProgress';

// The Pack stage: one curated checklist, ticked off before the show.
export default function PackPanel({ plan, onSave }) {
  const packed = plan?.packed || [];
  const toggle = (key) => onSave({
    packed: packed.includes(key) ? packed.filter((k) => k !== key) : [...packed, key],
  });
  return (
    <section className="rounded-sm p-3.5" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: B.copper }}>Pack list</p>
        <p className="text-[10px] font-semibold tabular-nums" style={{ color: B.muted }}>{packed.length}/{PACK_ITEMS.length}</p>
      </div>
      <ul className="mt-2 divide-y" style={{ borderColor: B.border }}>
        {PACK_ITEMS.map((item) => {
          const done = packed.includes(item.key);
          return (
            <li key={item.key}>
              <button type="button" onClick={() => toggle(item.key)} className="flex w-full items-center gap-2.5 py-2.5 text-left">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px]"
                  style={{ background: done ? B.copper : '#fff', border: `1px solid ${done ? B.copper : B.border}` }}
                >
                  {done && <Check className="h-3.5 w-3.5 text-white" />}
                </span>
                <span className="text-[12.5px]" style={{ color: done ? B.muted : B.navy, textDecoration: done ? 'line-through' : 'none' }}>
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}