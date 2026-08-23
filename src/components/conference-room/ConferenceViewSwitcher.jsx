import { B } from '@/components/fellow-home/fellowHomeConfig';

// Segmented control for switching the Conference Room board between views.
export default function ConferenceViewSwitcher({ views, active, onChange, accent }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
      {views.map((v) => {
        const isActive = v.key === active;
        return (
          <button
            key={v.key}
            type="button"
            onClick={() => onChange(v.key)}
            className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors"
            style={{
              background: isActive ? accent : `${B.navy}06`,
              color: isActive ? '#fff' : B.navy,
            }}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}