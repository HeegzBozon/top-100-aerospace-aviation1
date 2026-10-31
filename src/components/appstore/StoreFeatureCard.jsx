import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// The tool that is open. It is drawn as the shelf's featured piece: the name, the one job
// it does, the artifact it hands back, and the single way in.
export default function StoreFeatureCard({ tool }) {
  const Icon = tool.icon;
  return (
    <section
      className="relative overflow-hidden rounded-2xl p-5 md:p-7"
      style={{ background: B.navyDeep, border: '1px solid rgba(201,168,124,0.34)' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(120% 90% at 100% 0%, rgba(201,168,124,0.20) 0%, rgba(201,168,124,0) 58%)',
        }}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-bold uppercase tracking-[0.3em]" style={{ color: B.gold }}>
            {tool.kicker}
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.2em]"
            style={{ background: 'rgba(250,248,245,0.10)', color: B.cream, border: '1px solid rgba(250,248,245,0.24)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#8FD3E8' }} />
            Available now
          </span>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'rgba(201,168,124,0.16)', border: '1px solid rgba(201,168,124,0.38)' }}
          >
            <Icon className="h-4.5 w-4.5" style={{ color: B.gold }} />
          </span>
          <div className="min-w-0">
            <h2 className="font-heading text-2xl leading-tight text-editorial-cream md:text-3xl">{tool.name}</h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-editorial-cream/70">{tool.job}</p>
          </div>
        </div>

        <p className="mt-4 border-t pt-4 text-[11.5px] leading-relaxed" style={{ borderColor: 'rgba(201,168,124,0.22)', color: 'rgba(250,248,245,0.66)' }}>
          <span className="font-bold uppercase tracking-[0.18em]" style={{ color: B.gold }}>
            You get
          </span>{' '}
          {tool.artifact}
        </p>

        <Link
          to={tool.to}
          className="group mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] transition-transform active:scale-[0.98]"
          style={{ background: B.gold, color: B.navy }}
        >
          Open {tool.name}
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}