import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { THEATRE } from './theatreConfig';
import useMissionFeed from './useMissionFeed';
import useTheatreStream from './useTheatreStream';
import TheatreScreen from './TheatreScreen';
import TheatreBill from './TheatreBill';
import TheatreProgramme from './TheatreProgramme';

// The Mission Theatre: the broadcast on the pad, the bill beside it, and the rest of the
// programme under both. It reads the launch library itself, so the same theatre stands in
// the Space Pavilion, on its own page, and anywhere else the house wants a screen.
export default function MissionTheatre({ variant = 'page' }) {
  const { launches, state, note, reload } = useMissionFeed(8);
  const [pickedId, setPickedId] = useState(null);
  const panel = variant === 'panel';

  const featured = launches.find((l) => l.id === pickedId) || launches[0] || null;
  const rest = launches.filter((l) => l.id !== featured?.id);
  const { streamId, searching } = useTheatreStream(featured);

  // A new programme puts the theatre back on the next mission rather than a stale pick.
  useEffect(() => {
    if (pickedId && !launches.some((l) => l.id === pickedId)) setPickedId(null);
  }, [launches, pickedId]);

  return (
    <section className={panel ? 'px-3 py-3' : 'px-4 py-6 sm:px-8 sm:py-9'} style={{ background: THEATRE.stage }}>
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.34em]" style={{ color: THEATRE.gold }}>
              Mission Theatre
            </p>
            <h1 className={`mt-1.5 font-heading leading-none ${panel ? 'text-xl' : 'text-[30px]'}`} style={{ color: THEATRE.ink }}>
              The pad, live.
            </h1>
            <p className="mt-2 max-w-xl text-xs leading-relaxed" style={{ color: THEATRE.body }}>
              Every launch the house is watching, with the broadcast and the clock that matters.
            </p>
          </div>
          <button
            type="button"
            onClick={reload}
            className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ border: `1px solid ${THEATRE.line}`, color: THEATRE.body }}
          >
            <RefreshCw className={`h-3 w-3 ${state === 'loading' ? 'animate-spin' : ''}`} /> Re-read
          </button>
        </div>

        {state === 'loading' && (
          <div className="mt-6 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
            <div className="aspect-video w-full animate-pulse rounded-lg" style={{ background: THEATRE.plate }} />
            <div className="space-y-3">
              <div className="h-3 w-24 animate-pulse rounded" style={{ background: THEATRE.plateSoft }} />
              <div className="h-6 w-3/4 animate-pulse rounded" style={{ background: THEATRE.plateSoft }} />
              <div className="h-3 w-2/3 animate-pulse rounded" style={{ background: THEATRE.plateSoft }} />
              <div className="h-10 w-40 animate-pulse rounded" style={{ background: THEATRE.plateSoft }} />
            </div>
          </div>
        )}

        {(state === 'empty' || state === 'error') && (
          <div className="mt-6 rounded-lg px-5 py-10 text-center" style={{ background: THEATRE.plate, border: `1px dashed ${THEATRE.line}` }}>
            <AlertCircle className="mx-auto h-6 w-6" style={{ color: THEATRE.gold }} />
            <p className="mt-3 font-heading text-lg" style={{ color: THEATRE.ink }}>
              {state === 'error' ? 'The theatre is off the air.' : 'No missions are billed yet.'}
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed" style={{ color: THEATRE.body }}>
              {note || 'The launch library has nothing scheduled. The programme fills as soon as a mission is confirmed.'}
            </p>
            <button
              type="button"
              onClick={reload}
              className="mt-4 inline-flex items-center gap-1.5 rounded px-3.5 py-2 text-xs font-semibold"
              style={{ background: THEATRE.copper, color: '#fdf8f0' }}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Ask again
            </button>
          </div>
        )}

        {state === 'ready' && featured && (
          <>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
              <TheatreScreen launch={featured} streamId={streamId} searching={searching} />
              <div
                className="rounded-lg px-4 py-4"
                style={{ background: THEATRE.plate, border: `1px solid ${THEATRE.line}` }}
              >
                <TheatreBill launch={featured} />
              </div>
            </div>

            <div className="mt-6">
              <TheatreProgramme launches={rest} onOpen={(l) => setPickedId(l.id)} activeId={featured.id} />
            </div>

            {note && (
              <p className="mt-4 text-[10px]" style={{ color: THEATRE.soft }}>{note}</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}