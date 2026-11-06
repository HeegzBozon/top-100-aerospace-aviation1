import useLivePresence from './useLivePresence';

// Who is on the wire this minute — the site's live readers, and the campus floor beneath
// them. The reading is taken again every minute; nothing here is a stored figure.
//
// Each source answers for itself: a property that will not answer still leaves the campus
// floor readable, so one dead feed never blanks the whole strip.

const num = (value) => (Number(value) || 0).toLocaleString();

const clock = (date) =>
  date ? date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';

function Reading({ label, value, note, down }) {
  return (
    <div className="min-w-0">
      <p className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-editorial-navy/45">
        {label}
      </p>
      <p className="mt-0.5 flex items-baseline gap-1 text-editorial-navy">
        <span className="font-heading text-[22px] leading-none tabular-nums">
          {down ? '—' : num(value)}
        </span>
        {note && !down && (
          <span className="truncate text-[9px] text-editorial-navy/40">{note}</span>
        )}
      </p>
    </div>
  );
}

export default function LivePresence() {
  const { state, site, campus, readAt } = useLivePresence();

  const readers = Number(site?.active) || 0;
  const onFloor = Number(campus?.total) || 0;
  const rooms = campus?.rooms || [];
  const busiest = site?.pages?.[0] || null;
  const quiet = state === 'ready' && readers === 0 && onFloor === 0;

  return (
    <div className="rounded-xl border border-editorial-navy/10 bg-card px-3 py-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-editorial-label">
          On the wire
        </p>
        <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.12em] text-editorial-navy/40">
          {state === 'ready' && <span className="desk-lamp" aria-hidden="true" />}
          {state === 'loading' ? 'reading' : state === 'ready' ? `live · ${clock(readAt)}` : 'no reading'}
        </span>
      </div>

      {state === 'error' ? (
        <p className="mt-1.5 text-[10.5px] leading-relaxed text-editorial-navy/55">
          The wire did not answer. It is read again in a minute.
        </p>
      ) : (
        <>
          <div className="mt-1 grid grid-cols-2 gap-3">
            <Reading
              label="On the site"
              value={readers}
              note="last 30 min"
              down={site?.state === 'error' || site?.state === 'empty'}
            />
            <Reading
              label="On campus"
              value={onFloor}
              note={rooms.length ? `${rooms.length} room${rooms.length > 1 ? 's' : ''}` : undefined}
              down={campus?.state === 'error'}
            />
          </div>

          {rooms.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1 border-t border-editorial-navy/10 pt-2">
              {rooms.map((room) => (
                <span
                  key={room.key}
                  className="flex items-center gap-1 rounded-full border border-editorial-navy/15 px-2 py-0.5 text-[9px] text-editorial-navy/65"
                >
                  {room.label}
                  <span className="tabular-nums text-editorial-navy">{num(room.count)}</span>
                </span>
              ))}
            </div>
          )}

          <p className="mt-1.5 truncate text-[9px] leading-relaxed text-editorial-navy/40">
            {state === 'loading' && 'Taking the reading…'}
            {state === 'ready' && quiet && 'The building is quiet: nobody reading, nobody on the floor.'}
            {state === 'ready' && !quiet && busiest && (
              <>
                Most read now:{' '}
                <span className="text-editorial-navy/60">{busiest.label}</span> ·{' '}
                {num(busiest.users)}
              </>
            )}
          </p>
        </>
      )}
    </div>
  );
}