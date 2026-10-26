import { B } from '@/components/fellow-home/fellowHomeConfig';

// One step of the briefing. Every step is a module to the console, so the wheel
// walks the sequence and announces each title as it lands.
export default function BriefingStep({ step, children }) {
  return (
    <section
      data-hh-module={step.title}
      className="scroll-mt-24 border-t pt-7 md:pt-10"
      style={{ borderColor: B.border }}
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
        {step.index} · {step.kicker}
      </p>
      <h2 className="mt-2 font-heading text-[1.7rem] leading-tight md:text-4xl" style={{ color: B.navy }}>
        {step.title}
      </h2>

      {step.lede ? (
        <p
          className="mt-3 max-w-2xl font-heading text-[15px] italic leading-snug md:text-lg"
          style={{ color: 'rgba(30,58,90,0.78)' }}
        >
          {step.lede}
        </p>
      ) : null}

      {step.subs?.map((sub) => (
        <div key={sub.title} className="mt-5">
          <h3 className="font-heading text-[15px] md:text-lg" style={{ color: B.navy }}>
            {sub.title}
          </h3>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed md:text-[13.5px]" style={{ color: B.muted }}>
            {sub.text}
          </p>
        </div>
      ))}

      {step.paras?.map((para) => (
        <p key={para.slice(0, 24)} className="mt-3.5 max-w-2xl text-[12.5px] leading-relaxed md:text-[13.5px]" style={{ color: B.muted }}>
          {para}
        </p>
      ))}

      {step.terms?.length ? (
        <dl className="mt-5 grid gap-2 md:grid-cols-2">
          {step.terms.map((term, i) => (
            <div
              key={term.term}
              className="rounded-xl p-3.5"
              style={{ background: '#FFFFFF', border: `1px solid ${B.border}` }}
            >
              <dt className="flex items-baseline gap-2">
                <span className="text-[8.5px] font-bold tracking-[0.2em]" style={{ color: B.copper }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-heading text-[14px] md:text-[15px]" style={{ color: B.navy }}>
                  {term.term}
                </span>
              </dt>
              <dd className="mt-1.5 text-[12px] leading-relaxed" style={{ color: B.muted }}>
                {term.note}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {children}
    </section>
  );
}