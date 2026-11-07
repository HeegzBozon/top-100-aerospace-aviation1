import { useId, useState } from 'react';
import { faq } from './voteGateCopy';

// The questions a letter's reader writes back with, answered under the letter. One row
// opens at a time; the first is open so the section never reads as a closed list. The copy
// lives in voteGateCopy, so the printable invitation answers the same questions in full.
const QUESTIONS = faq.questions;

function Mark({ open }) {
  return (
    <span aria-hidden="true" className="relative block h-4 w-4 shrink-0">
      <span className="absolute left-0 top-[7px] h-0.5 w-4 bg-current" />
      <span className={`absolute left-[7px] top-0 h-4 w-0.5 bg-current transition-all duration-300 ${open ? 'scale-y-0 opacity-0' : 'opacity-100'}`} />
    </span>
  );
}

export default function GateFaq() {
  const [openIndex, setOpenIndex] = useState(0);
  const uid = useId();

  return (
    <section aria-labelledby={`${uid}-title`} className="mt-12 sm:mt-16">
      <p className="pd-label">{faq.label}</p>
      <h2 id={`${uid}-title`} className="mb-5 mt-2 font-heading text-2xl text-editorial-navy">{faq.heading}</h2>
      <div className="bg-editorial-cream">
        {QUESTIONS.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={item.q}>
              <h3 className="border-l border-editorial-navy">
                <button
                  type="button"
                  id={`${uid}-h${i}`}
                  aria-expanded={open}
                  aria-controls={`${uid}-p${i}`}
                  onClick={() => setOpenIndex(open ? -1 : i)}
                  className="flex min-h-12 w-full items-center gap-4 border-b border-editorial-navy px-4 py-4 text-left text-editorial-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-editorial-copper sm:px-6"
                >
                  <Mark open={open} />
                  <span className="font-heading text-lg leading-tight sm:text-xl">{item.q}</span>
                </button>
              </h3>
              <div
                id={`${uid}-p${i}`}
                role="region"
                aria-labelledby={`${uid}-h${i}`}
                className={`grid transition-all duration-300 ${open ? 'visible grid-rows-[1fr] opacity-100' : 'invisible grid-rows-[0fr] opacity-0'}`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className={`flex flex-col gap-4 px-4 pb-6 pt-4 transition-opacity delay-150 duration-500 sm:px-10 ${open ? 'opacity-100' : 'opacity-0'}`}>
                    <p className="max-w-2xl font-body text-sm leading-relaxed tracking-wide text-editorial-navy/85">{item.a}</p>
                    <p className="font-body text-sm italic text-editorial-label">{item.note}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}