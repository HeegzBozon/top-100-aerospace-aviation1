import { ChevronRight } from 'lucide-react';
import { C } from '@/components/crm/crmConfig';
import { TYPE_TAGS } from './classifiedsConfig';

// One listing on the board: what kind of notice it is, its headline, and the one line
// under it. The standing row is marked the way the console's cursor marks it, so the
// ring and a thumb always agree on which notice is about to be read.
export default function ClassifiedRow({ listing, focused, onFocus, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => {
        onFocus?.();
        onOpen?.();
      }}
      aria-current={focused ? 'true' : undefined}
      className="w-full rounded-lg px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2"
      style={{
        background: focused ? C.surface : 'rgba(255,255,255,0.7)',
        border: `1px solid ${focused ? `${C.copper}66` : C.border}`,
        boxShadow: focused ? `inset 2px 0 0 ${C.copper}` : 'none',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: C.copper }}>
          {TYPE_TAGS[listing.type]}
        </p>
        {listing.when ? (
          <p className="shrink-0 text-[8.5px] uppercase tracking-[0.12em]" style={{ color: C.muted }}>
            {listing.when}
          </p>
        ) : null}
      </div>

      <div className="mt-0.5 flex items-start justify-between gap-1.5">
        <div className="min-w-0">
          <h3 className="font-heading text-[14.5px] font-semibold leading-tight" style={{ color: C.navy }}>
            {listing.title}
          </h3>
          {listing.meta ? (
            <p className="mt-0.5 line-clamp-1 text-[10.5px]" style={{ color: C.muted }}>{listing.meta}</p>
          ) : null}
          {listing.sub ? (
            <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed" style={{ color: C.navy }}>{listing.sub}</p>
          ) : null}
        </div>
        <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0" style={{ color: focused ? C.copper : `${C.muted}` }} />
      </div>
    </button>
  );
}