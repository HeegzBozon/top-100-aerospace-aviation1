import { Link } from 'react-router-dom';
import { DoorOpen, Swords, Trophy } from 'lucide-react';
import ArcadeCabinet from './ArcadeCabinet';
import ArcadeBadges from './ArcadeBadges';
import { MACHINES } from './arcadeConfig';
import useArcadeRecords from './useArcadeRecords';
import useArcadeProgress from './useArcadeProgress';
import { earnedIds } from './arcadeProgress';

const format = (n) => (n ? n.toLocaleString() : 'not yet set');

// THE HALL
//
// The machines, read from the floor: a marquee over each one, the badges the hall has
// struck for you, and the board the house keeps its records on. The same hall stands in
// the Colony's east wing, so the surface and the room are one place with two doors.
export default function ArcadeHall({ onPlay, embedded = false }) {
  const { records, clear } = useArcadeRecords();
  const { progress } = useArcadeProgress();
  const badges = earnedIds(progress);

  // What the board prints for a machine: the record it holds, or the sorties the simulator
  // has flown.
  const held = (cabinet) => (cabinet.to ? progress?.sorties || 0 : records[cabinet.id]);
  const anyRecord = MACHINES.some((c) => held(c));

  return (
    <div className={embedded ? 'px-4 py-5' : 'mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-10'}>
      <header className="border-b border-editorial-copper/40 pb-4">
        <p className="pd-label text-editorial-gold/80">East Wing · Main Campus</p>
        <h1 className="mt-1 font-heading text-3xl leading-tight text-editorial-cream md:text-4xl">The Arcade</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-editorial-cream/70">
          Three cabinets and the simulator, kept in the east wing. Sit down, take a machine, and put a number on the
          board before you leave — the record belongs to the room, not the person.
        </p>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MACHINES.map((cabinet) => (
          <ArcadeCabinet key={cabinet.id} cabinet={cabinet} record={held(cabinet)} onPlay={onPlay} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="desk-plate p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="pd-label text-editorial-gold/80">The Record Board</p>
            {anyRecord && (
              <button
                type="button"
                onClick={clear}
                className="text-[10px] uppercase tracking-[0.14em] text-editorial-cream/45 transition-colors hover:text-editorial-cream/80"
              >
                Clear
              </button>
            )}
          </div>
          <ul className="mt-3 divide-y divide-editorial-cream/10">
            {MACHINES.map((cabinet) => (
              <li key={cabinet.id} className="flex items-baseline justify-between gap-3 py-2">
                <span className="min-w-0">
                  <span className="block truncate font-heading text-base text-editorial-cream">{cabinet.label}</span>
                  <span className="block text-[10px] uppercase tracking-[0.14em] text-editorial-cream/45">
                    {cabinet.recordLabel ? `${cabinet.mechanism} · ${cabinet.recordLabel}` : cabinet.mechanism}
                  </span>
                </span>
                <span className="shrink-0 font-heading text-lg" style={{ color: cabinet.accent }}>
                  {format(held(cabinet))}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-editorial-cream/45">
            Records are held on this machine. They are never counted toward a Fellow's record or the platform's
            measurement.
          </p>
        </section>

        <section className="desk-plate flex flex-col p-4">
          <ArcadeBadges progress={progress} />
          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            <Link
              to="/Colony?room=arcade"
              className="inline-flex items-center gap-1.5 rounded border border-editorial-copper/70 bg-editorial-copper/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-editorial-cream transition-colors hover:bg-editorial-copper/30"
            >
              <DoorOpen className="h-3.5 w-3.5" />
              Step into the room
            </Link>
            <Link
              to="/ChessClub"
              className="inline-flex items-center gap-1.5 rounded border border-editorial-cream/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-editorial-cream/80 transition-colors hover:border-editorial-copper hover:text-editorial-cream"
            >
              <Swords className="h-3.5 w-3.5" />
              Chess Club
            </Link>
          </div>
          <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-editorial-cream/45">
            <Trophy className="h-3 w-3 text-editorial-gold/80" />
            {badges.length} of 7 cabinet badges struck. A house record is a thing you set in a room, not a leaderboard
            you climb.
          </p>
        </section>
      </div>
    </div>
  );
}