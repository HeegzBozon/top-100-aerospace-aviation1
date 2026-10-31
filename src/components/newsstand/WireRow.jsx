import { ArrowUpRight } from 'lucide-react';
import { C } from '@/components/crm/crmConfig';

// One post off the wire: something the house put out on its own account, set on the stand the
// way the papers are — the source printed above it, the caption in the house's type, and the
// photograph beside it. The post itself lives on the network, so the row hands it over.
export default function WireRow({ item, index, focused = false, onFocus, onOpen }) {
  return (
    <article style={{ borderTop: `1px solid ${C.border}` }}>
      <button
        type="button"
        onClick={() => {
          onFocus?.();
          onOpen?.();
        }}
        onMouseEnter={() => onFocus?.()}
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

        {item.mediaUrl ? (
          <img
            src={item.mediaUrl}
            alt=""
            loading="lazy"
            className="h-[54px] w-[54px] shrink-0 rounded-[2px] object-cover"
            style={{ border: `1px solid ${C.border}` }}
          />
        ) : null}

        <span className="min-w-0 flex-1">
          <span className="block text-[7.5px] font-bold uppercase tracking-[0.2em]" style={{ color: C.copper }}>
            {item.kicker}
          </span>
          <span className="mt-1 block text-[12px] leading-relaxed line-clamp-3" style={{ color: C.navy }}>
            {item.title}
          </span>
          {item.meta ? (
            <span className="mt-1 block text-[9.5px]" style={{ color: C.muted }}>
              {item.meta}
            </span>
          ) : null}
        </span>

        <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0" style={{ color: C.muted }} />
      </button>
    </article>
  );
}