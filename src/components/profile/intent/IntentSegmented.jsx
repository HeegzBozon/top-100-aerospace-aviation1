import { B } from '@/components/fellow-home/fellowHomeConfig';

// A single choice from a short approved set, drawn as one seated rail.
export default function IntentSegmented({ label, options, value, onChange }) {
  return (
    <div>
      {label && (
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: B.copper }}>
          {label}
        </p>
      )}
      <div className="flex flex-wrap gap-1 rounded-xl p-1" style={{ background: 'rgba(30,58,90,0.05)' }}>
        {options.map((option) => {
          const active = value === option.key;
          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.key)}
              className="flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all"
              style={{
                background: active ? '#fff' : 'transparent',
                color: active ? B.navy : B.muted,
                boxShadow: active ? '0 1px 3px rgba(7,17,31,0.12)' : 'none',
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}