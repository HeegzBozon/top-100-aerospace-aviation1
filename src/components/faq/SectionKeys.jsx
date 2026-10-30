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
            className="flex w-full items-start gap-3 border-b py-4 text-left transition-colors"
            style={{
              borderColor: 'rgba(30,58,90,0.14)',
              background: active ? 'rgba(201,168,124,0.16)' : 'transparent',
            }}
          >
            <span
              className="mt-1 w-6 shrink-0 text-[10px] font-bold tabular-nums tracking-[0.14em]"
              style={{ color: B.copper }}
            >
              {section.index}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block font-heading text-[19px] leading-tight md:text-[22px]" style={{ color: B.navy }}>
                {section.label}
              </span>
              <span className="mt-1 block text-[11.5px] leading-relaxed" style={{ color: B.muted }}>
                {section.lede}
              </span>
              {counts[section.key] ? (
                <span
                  className="mt-1.5 block text-[7.5px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: 'rgba(30,58,90,0.45)' }}
                >
                  {counts[section.key]} entries
                </span>
              ) : null}
            </span>

            <ArrowRight className="mt-1.5 h-3.5 w-3.5 shrink-0" style={{ color: 'rgba(30,58,90,0.4)' }} />
          </button>
        );
      })}
    </div>
  );
}