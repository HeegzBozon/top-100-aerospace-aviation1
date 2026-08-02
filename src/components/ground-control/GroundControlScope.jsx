import { ShieldAlert } from 'lucide-react';

const OUT_OF_SCOPE = [
  'Ad spend and ad management',
  'Website design and build',
  'ERP and MRP integration',
  'Quality management systems',
  'Anything touching production data',
];

export default function GroundControlScope() {
  return (
    <section className="bg-[#0a1626] px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-[#c9a87c]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c9a87c]">What we do not touch</p>
        </div>
        <h2 className="mt-3 font-serif text-3xl leading-tight text-white sm:text-4xl" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          A customer communication system — not a repository for controlled technical data.
        </h2>

        <div className="mt-8 rounded-2xl border border-[#c9a87c]/20 bg-[#c9a87c]/[0.04] p-6">
          <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[#c9a87c]">ITAR &amp; EAR</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            No controlled technical data, drawings, or specifications enter Ground Control. Ever. Customer names, inquiries, quotes, and scheduling only. We will say this again in onboarding, in writing.
          </p>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {OUT_OF_SCOPE.map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-[12px] text-white/55">
              <span className="text-white/30">✕</span> {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}