import { ArrowUpRight } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { accentForDomain, typeLabel, levelLabel } from './careerResourceConfig';

// One career resource card. Curated institutional output — the CoE's
// credential and practice library. No ratings, no marketplace framing.
export default function CareerResourceCard({ resource, accent = B.navy }) {
  const a = resource.domain_focus ? accentForDomain(resource.domain_focus) : accent;
  const Wrapper = resource.link ? 'a' : 'div';
  const wrapperProps = resource.link ? { href: resource.link, target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <Wrapper {...wrapperProps} className="block rounded-xl border bg-white overflow-hidden transition-shadow hover:shadow-md" style={{ borderColor: B.border }}>
      <div className="h-1" style={{ background: a }} />
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ background: `${a}12`, color: a }}>{typeLabel(resource.resource_type)}</span>
          {resource.link && <ArrowUpRight className="w-3.5 h-3.5 shrink-0" style={{ color: B.muted }} />}
        </div>
        <h4 className="text-sm font-bold leading-tight" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>{resource.title}</h4>
        {resource.summary && <p className="text-[12px] leading-relaxed line-clamp-2" style={{ color: B.muted }}>{resource.summary}</p>}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {resource.level && <span className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: B.muted }}>{levelLabel(resource.level)}</span>}
          {resource.source_name && <span className="text-[10px]" style={{ color: B.muted }}>· {resource.source_name}</span>}
        </div>
      </div>
    </Wrapper>
  );
}