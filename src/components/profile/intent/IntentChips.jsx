import { B } from '@/components/fellow-home/fellowHomeConfig';

// A curated multi-select. The keys are the whole vocabulary — nothing is typed free —
// so a Fellow's expression stays inside the institution's approved set.
export default function IntentChips({ label, map, values, onToggle, accent }) {
  const keys = Object.keys(map);
  return (
    <div>
      {label && (
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: B.copper }}>
          {label}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {keys.map((key) => {
          const active = values.includes(key);
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(key)}
              className="rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors"
              style={{
                background: active ? `${accent}1f` : 'rgba(255,255,255,0.75)',
                color: active ? B.navy : B.muted,
                border: `1px solid ${active ? `${accent}88` : B.border}`,
              }}
            >
              {map[key]}
            </button>
          );
        })}
      </div>
    </div>
  );
}