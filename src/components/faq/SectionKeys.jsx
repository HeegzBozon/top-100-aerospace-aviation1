import { B } from '@/components/fellow-home/fellowHomeConfig';
import { ArrowRight } from 'lucide-react';

// The three sections, as keys.
//
// This is the level the wheel starts on and returns to: three cards, each naming a
// section, what is behind it, and how much of it there is. # opens the one under the
// cursor, and a section's own back key comes back here.
export default function SectionKeys({ sections, cursorIndex = null, onOpen, counts = {} }) {
  return (
    <div>
      {sections.map((section, i) => {
        const active = cursorIndex === i;
        return (
          <button
            key={section.key}
            type="button"
            onClick={() => onOpen(section.key)}
            data-hh-key={`section-${section.key}`}
            aria-current={active ? 'true' : undefined}
            className="flex w-full items-start gap-2.5 border-b py-2.5 text-left transition-colors md:gap-3 md:py-4"
            style={{
              borderColor: 'rgba(30,58,90,0.14)',
              background: active ? 'rgba(201,168,124,0.16)' : 'transparent',
            }}
          >
            <span
              className="mt-0.5 w-5 shrink-0 text-[9.5px] font-bold tabular-nums tracking-[0.14em] md:mt-1 md:w-6 md:text-[10px]"
              style={{ color: B.copper }}
            >
              {section.index}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-baseline gap-2">
                <span
                  className="font-heading text-[16.5px] leading-tight md:text-[22px]"
                  style={{ color: B.navy }}
                >
                  {section.label}
                </span>
                {counts[section.key] ? (
                  <span
                    className="text-[7px] font-bold uppercase tracking-[0.2em] md:text-[7.5px]"
                    style={{ color: 'rgba(30,58,90,0.42)' }}
                  >
                    {counts[section.key]} entries
                  </span>
                ) : null}
              </span>
              <span
                className="mt-0.5 block text-[10px] leading-snug md:mt-1 md:text-[11.5px] md:leading-relaxed"
                style={{ color: B.muted }}
              >
                {section.lede}
              </span>
            </span>

            <ArrowRight className="mt-1 h-3 w-3 shrink-0 md:mt-1.5 md:h-3.5 md:w-3.5" style={{ color: 'rgba(30,58,90,0.4)' }} />
          </button>
        );
      })}
    </div>
  );
}