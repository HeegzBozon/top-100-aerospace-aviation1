import { B } from '@/components/fellow-home/fellowHomeConfig';

// Retro rail block: navy title bar, cream body. Modernized with soft radius and hairline border.
export default function RailBlock({ title, accent = B.gold, children }) {
  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: `${B.navy}18`, background: '#fff' }}>
      <div
        className="px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white"
        style={{ background: B.navy }}
      >
        {title}
      </div>
      <div className="h-[2px]" style={{ background: accent }} />
      <div className="p-3.5">{children}</div>
    </div>
  );
}