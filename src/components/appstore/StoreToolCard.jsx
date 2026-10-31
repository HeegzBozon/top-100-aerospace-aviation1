import { B } from '@/components/fellow-home/fellowHomeConfig';

// A tool that is listed but not yet open. It carries no control: the card describes the
// job and the artifact, and stops there, so nothing on the shelf promises work it cannot do.
export default function StoreToolCard({ tool }) {
  const Icon = tool.icon;
  return (
    <article
      className="flex h-full flex-col rounded-xl p-4"
      style={{ background: '#fffdf9', border: `1px solid ${B.border}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: 'rgba(30,58,90,0.06)', border: `1px solid ${B.border}` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: B.navy }} />
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.18em]"
          style={{ background: 'rgba(184,115,51,0.10)', color: B.copper, border: '1px solid rgba(184,115,51,0.22)' }}
        >
          In build
        </span>
      </div>

      <h3 className="mt-3 font-heading text-[15px] leading-snug" style={{ color: B.navy }}>
        {tool.name}
      </h3>
      <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.68)' }}>
        {tool.job}
      </p>
      <p className="mt-auto pt-3 text-[10px] leading-relaxed" style={{ color: B.muted }}>
        {tool.artifact}
      </p>
    </article>
  );
}