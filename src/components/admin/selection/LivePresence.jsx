import useLivePresence from './useLivePresence';

// Who is on the wire this minute — the accounts standing on the platform, and the campus
// floor beneath them. Read again every minute; nothing here is a stored figure.
//
// The two sources answer for themselves: a floor that will not answer still leaves the
// signed-in count readable, so one dead feed never blanks the whole strip.

const num = (value) => (Number(value) || 0).toLocaleString();

const clock = (date) =>
  date ? date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';

// A surface printed for a hand rather than a keyboard: /profiles/abc → profiles/abc.
const surface = (route) => String(route || '/').replace(/^\//, '') || 'title screen';

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
        {note && !down && <span className="truncate text-[9px] text-editorial-navy/40">{note}</span>}
      </p>
    </div>
  );
}

export default function LivePresence() {
  const { state, people, campus, readAt } = useLivePresence();

  const online = Number(people?.online) || 0;
  const standing = people?.standing || [];
  const onFloor = Number(campus?.total) || 0;
  const rooms = campus?.rooms || [];
  const quiet = state === 'ready' && online === 0 && onFloor === 0;

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
              label="Signed in"
              value={online}
              note="last 3 min"
              down={state === 'loading' && online === 0}
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

          <div className="mt-1.5 text-[9px] leading-relaxed text-editorial-navy/40">
            {state === 'loading' && 'Taking the reading…'}
            {state === 'ready' && quiet && 'The building is quiet: nobody signed in, nobody on the floor.'}
            {state === 'ready' && !quiet && standing.length > 0 && (
              <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                {standing.slice(0, 5).map((person) => (
                  <span key={person.name + person.route} className="truncate text-editorial-navy/60">
                    {person.name}
                    <span className="text-editorial-navy/30"> · {surface(person.route)}</span>
                  </span>
                ))}
                {online > 5 && <span>+{online - 5}</span>}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}