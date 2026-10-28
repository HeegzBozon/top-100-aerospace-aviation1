import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

const OPTIONS = [
  { key: 'flipbook', label: 'Flipbook' },
  { key: 'single', label: 'Single Page' },
];

// The two ways an issue is read, as the reader's own segmented control.
//
// It sits in the bar the reader already wears instead of floating over the picture: on a
// desk the spread is the thing being read, so nothing is laid on top of it.
export default function ReaderModeToggle({ mode, onChange, onDark = true }) {
  if (!onChange) return null;

  return (
    <div
      className="flex items-center rounded-full p-0.5"
      style={{
        background: onDark ? 'rgba(250,248,245,0.07)' : 'rgba(30,58,90,0.06)',
        border: `1px solid ${onDark ? 'rgba(201,168,124,0.24)' : 'rgba(30,58,90,0.12)'}`,
      }}
      role="group"
      aria-label="Reading mode"
    >
      {OPTIONS.map((option) => {
        const active = mode === option.key;
        return (
          <button
            key={option.key}
            onClick={() => onChange(option.key)}
            aria-pressed={active}
            className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors"
            style={{
              background: active ? P.gold : 'transparent',
              color: active ? P.navyVoid : onDark ? 'rgba(250,248,245,0.72)' : 'rgba(30,58,90,0.62)',
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}