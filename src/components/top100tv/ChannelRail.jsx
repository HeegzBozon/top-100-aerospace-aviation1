// THE WALL, AS A LIST — every channel the desk carries, with the lamp telling the truth.
// The rail is how a reader walks the wall without going back to the grid.
export default function ChannelRail({ streams, selectedId, onSelect }) {
  const onAir = streams.filter((s) => s.is_live).length;

  return (
    <section className="desk-plate overflow-hidden">
      <header className="flex items-baseline justify-between gap-3 border-b border-editorial-copper/30 px-3.5 py-2.5">
        <p className="pd-label">The Wall</p>
        <p className="text-[10px] uppercase tracking-[0.14em] text-editorial-cream/45">
          {onAir} of {streams.length} on air
        </p>
      </header>

      <ul className="divide-y divide-editorial-cream/10">
        {streams.map((stream) => {
          const selected = stream.id === selectedId;
          return (
            <li key={stream.id}>
              <button
                type="button"
                onClick={() => onSelect(stream.id)}
                aria-current={selected}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors ${
                  selected ? 'bg-editorial-gold/10' : 'hover:bg-editorial-cream/5'
                }`}
              >
                {stream.is_live ? (
                  <span className="desk-lamp h-1.5 w-1.5" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-editorial-cream/25" />
                )}
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-[12.5px] leading-tight ${
                      selected ? 'text-editorial-cream' : 'text-editorial-cream/80'
                    }`}
                  >
                    {stream.title}
                  </span>
                  <span className="block truncate text-[9.5px] uppercase tracking-[0.14em] text-editorial-cream/40">
                    {stream.region || stream.domain}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}