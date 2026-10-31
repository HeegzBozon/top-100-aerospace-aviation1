import { B } from '@/components/fellow-home/fellowHomeConfig';

// One line of the composer: a small-caps label, the field, and a note about what prints.
export default function KitField({ label, hint, children }) {
  return (
    <label className="block">
      <span
        className="block text-[8px] font-bold uppercase tracking-[0.24em]"
        style={{ color: B.copper }}
      >
        {label}
      </span>
      {hint ? (
        <span className="mt-1 block text-[10px] leading-relaxed" style={{ color: B.muted }}>
          {hint}
        </span>
      ) : null}
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

export const kitInputClass =
  'w-full rounded-lg bg-white px-3 py-2 text-[13px] leading-relaxed outline-none focus:ring-1 focus:ring-editorial-gold';