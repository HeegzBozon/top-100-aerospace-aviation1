import { Play } from 'lucide-react';

// A square on the wall. The plate carries the channel, the brass edge answers the cursor,
// and the lamp tells the truth about whether anything is coming down the line.
export default function StreamGridCard({ stream, isSelected, onClick }) {
  const live = !!stream.is_live;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`desk-plate group relative flex flex-col overflow-hidden text-left transition-colors ${
        isSelected
          ? 'border-editorial-gold'
          : 'border-editorial-cream/10 hover:border-editorial-copper/60'
      }`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black/60">
        {stream.thumbnail_url ? (
          <img
            src={stream.thumbnail_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-70 transition-opacity duration-300 group-hover:opacity-95"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-heading text-2xl tracking-[0.2em] text-editorial-cream/20">
              {stream.title?.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-sm bg-black/70 px-1.5 py-1">
          {live ? (
            <>
              <span className="desk-lamp h-1.5 w-1.5" />
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-editorial-cream/90">
                Live
              </span>
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-editorial-cream/30" />
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-editorial-cream/45">
                Off air
              </span>
            </>
          )}
        </div>

        {stream.region && (
          <span className="absolute right-2.5 top-2.5 rounded-sm bg-black/60 px-1.5 py-1 text-[9px] uppercase tracking-[0.14em] text-editorial-cream/60">
            {stream.region}
          </span>
        )}

        <span className="absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full border border-editorial-cream/25 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          <Play className="h-3 w-3 fill-current text-editorial-cream" />
        </span>
      </div>

      <div className="flex flex-1 flex-col px-3 py-2.5">
        {stream.domain && <p className="pd-label">{stream.domain}</p>}
        <h3 className="mt-1 font-heading text-[15px] leading-snug text-editorial-cream">
          {stream.title}
        </h3>
        {stream.subtitle && (
          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-editorial-cream/45">
            {stream.subtitle}
          </p>
        )}
      </div>
    </button>
  );
}