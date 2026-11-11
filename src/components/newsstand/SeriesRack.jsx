import { ArrowUpRight } from 'lucide-react';
import { C } from '@/components/crm/crmConfig';

// One post off the series: the screenshot the house staged, the Fellow it belongs to, and the
// takeaway printed with it. A featured post is read on its own page, so the row leaves the
// stand rather than opening in the glass — the same way a volume or a spotlight does.
export default function SeriesRack({ items, cursorKey, registerRef, onFocus, onOpen }) {
  return (
    <div>
      {items.map((item, index) => {
        const focused = cursorKey === item.key;
        return (
          <article
            key={item.key}
            ref={(node) => registerRef?.(item, node)}
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            <button
              type="button"
              onClick={() => {
                onFocus?.(item.key);
                onOpen?.(item);
              }}
              onMouseEnter={() => onFocus?.(item.key)}
              className="flex w-full items-start gap-3 py-3.5 text-left"
              style={{
                background: focused ? 'rgba(184,115,51,0.07)' : 'transparent',
                transition: 'background 160ms ease',
              }}
            >
              <span
                className="mt-[2px] w-5 shrink-0 text-[9px] font-bold tabular-nums"
                style={{ color: focused ? C.copper : 'rgba(30,58,90,0.32)' }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              {item.plate ? (
                <img
                  src={item.plate}
                  alt=""
                  loading="lazy"
                  className="h-[58px] w-[46px] shrink-0 rounded-[2px] object-cover"
                  style={{ border: `1px solid ${C.border}` }}
                />
              ) : null}

              <span className="min-w-0 flex-1">
                <span className="block text-[7.5px] font-bold uppercase tracking-[0.2em]" style={{ color: C.copper }}>
                  {item.kicker}
                </span>
                <span className="mt-1 block font-heading text-[15px] leading-snug md:text-[16.5px]" style={{ color: C.navy }}>
                  {item.title}
                </span>
                {item.meta ? (
                  <span className="mt-0.5 block text-[9.5px]" style={{ color: C.muted }}>
                    {item.meta}
                  </span>
                ) : null}
                {item.teaser ? (
                  <span className="mt-1.5 block text-[11.5px] leading-relaxed line-clamp-2" style={{ color: C.muted }}>
                    {item.teaser}
                  </span>
                ) : null}
              </span>

              <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0" style={{ color: C.muted }} />
            </button>
          </article>
        );
      })}
    </div>
  );
}