import { ChevronUp, ChevronDown, X } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';

// One position of the ballot on the glass.
//
// The row is built to be read at a glance and moved without a drag: the rank is a
// two-figure plate at the left, the name and the post under it, and three keys at the
// right — an up, a down, and the way off the ballot. Those keys are the touch fallback;
// the hardware moves the same row by lifting it (see GlassNominateSurface), so a thumb
// and a wheel reach the same order by the two routes each of them is good at.
export default function GlassBallotRow({
  item,
  rank,
  focused = false,
  held = false,
  readOnly = false,
  first = false,
  last = false,
  onFocus,
  onOpen,
  onMove,
  onRemove,
}) {
  return (
    <div
      onPointerDown={onFocus}
      className="flex items-stretch gap-2 rounded-[11px] px-2 py-[5px] transition-[background,border-color,box-shadow] duration-150"
      style={{
        background: held
          ? 'rgb(184 115 51 / 0.08)'
          : focused
            ? 'rgba(255,255,255,0.98)'
            : 'rgba(255,255,255,0.58)',
        border: `1px solid ${
          held ? 'rgb(184 115 51 / 0.60)' : focused ? 'rgb(201 168 124 / 0.85)' : `${brand.navy}10`
        }`,
        boxShadow: focused
          ? '0 6px 16px -8px rgba(7,17,31,0.42), inset 0 0 0 1px rgb(201 168 124 / 0.24)'
          : '0 1px 2px rgba(7,17,31,0.04)',
      }}
    >
      {/* The position, printed as an instrument reads it. */}
      <span
        className="w-[19px] shrink-0 self-center text-right text-[10.5px] font-bold tabular-nums leading-none"
        style={{ color: held ? '#B87333' : focused ? brand.gold : `${brand.navy}45` }}
      >
        {String(rank).padStart(2, '0')}
      </span>

      {/* The record itself: tap to open it. */}
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
        aria-label={`Open the record of ${item.nominee_name}, position ${rank}`}
      >
        <span
          className="flex h-[22px] w-[22px] shrink-0 items-center justify-center overflow-hidden rounded-full text-[9px] font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
        >
          {item.nominee_avatar ? (
            <img src={item.nominee_avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            item.nominee_name?.[0]?.toUpperCase()
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className="block truncate text-[11.5px] font-semibold leading-tight"
            style={{ color: brand.navy }}
          >
            {item.nominee_name}
          </span>
          <span className="mt-[1px] flex items-center gap-1.5">
            {item.nominee_title ? (
              <span className="truncate text-[9px] leading-tight" style={{ color: `${brand.navy}55` }}>
                {item.nominee_title}
                {item.nominee_company ? ` · ${item.nominee_company}` : ''}
              </span>
            ) : null}
            {held ? (
              <span
                className="shrink-0 text-[7px] font-bold uppercase tracking-[0.18em]"
                style={{ color: '#B87333' }}
              >
                Moving
              </span>
            ) : null}
          </span>
        </span>
      </button>

      {!readOnly && (
        <div className="flex shrink-0 items-center gap-0.5">
          <span className="flex flex-col">
            <button
              type="button"
              onClick={() => onMove(-1)}
              disabled={first}
              aria-label={`Move ${item.nominee_name} up`}
              className="flex h-[11px] w-[17px] items-center justify-center rounded disabled:opacity-25"
            >
              <ChevronUp className="h-[11px] w-[11px]" style={{ color: brand.navy }} />
            </button>
            <button
              type="button"
              onClick={() => onMove(1)}
              disabled={last}
              aria-label={`Move ${item.nominee_name} down`}
              className="flex h-[11px] w-[17px] items-center justify-center rounded disabled:opacity-25"
            >
              <ChevronDown className="h-[11px] w-[11px]" style={{ color: brand.navy }} />
            </button>
          </span>
          <button
            type="button"
            onClick={() => onRemove(item.nominee_id)}
            aria-label={`Remove ${item.nominee_name} from the ballot`}
            className="flex h-[22px] w-[22px] items-center justify-center rounded-full active:scale-90"
            style={{ background: `${brand.navy}08` }}
          >
            <X className="h-[11px] w-[11px]" style={{ color: `${brand.navy}60` }} />
          </button>
        </div>
      )}
    </div>
  );
}