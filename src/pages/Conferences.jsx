import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, RotateCcw, Search, Signal, Ticket } from 'lucide-react';
import ConferenceCard from '@/components/conferences/ConferenceCard';
import ConferenceFilters from '@/components/conferences/ConferenceFilters';
import ConferenceModeSwitcher from '@/components/conferences/ConferenceModeSwitcher';
import useConferences from '@/components/conferences/useConferences';
import { filterRooms } from '@/components/conferences/filterConferences';
import { B, HOST_HREF } from '@/components/conferences/conferenceConfig';

// The circuit: every aerospace conference the network is holding rooms in, read as an index
// in date order. A Fellow arrives here to find what is ahead and who is already standing in
// it; the host's workspace is the other door, one switch away.
export default function Conferences() {
  const { state, circuit, upcoming, past, mine, attendeesFor, myRoomIds, retry } = useConferences();

  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState(null);
  const [scope, setScope] = useState('all');

  const filtering = Boolean(query.trim() || domain);
  const clearFilters = () => { setQuery(''); setDomain(null); setScope('all'); };

  const filteredMine = useMemo(() => filterRooms(mine, { query, domain }), [mine, query, domain]);
  const filteredUpcoming = useMemo(() => filterRooms(upcoming, { query, domain }), [upcoming, query, domain]);
  const filteredPast = useMemo(() => filterRooms(past, { query, domain }), [past, query, domain]);

  // What the reader has declared for always stands, whatever they are looking at.
  const shownUpcoming = scope === 'concluded' ? [] : filteredUpcoming;
  const shownPast = scope === 'ahead' ? [] : filteredPast;
  const shown = filteredMine.length + shownUpcoming.length + shownPast.length;

  const card = (room) => (
    <ConferenceCard
      key={room.id}
      room={room}
      attendees={attendeesFor(room)}
      attending={!!myRoomIds?.has?.(room.id)}
    />
  );

  return (
    <div className="min-h-screen" style={{ background: B.cream }}>
      <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 md:px-8 md:pb-16 md:pt-12">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.28em]" style={{ color: B.copper }}>
              AeroSync · The circuit
            </p>
            <h1 className="mt-1 font-heading text-[28px] leading-tight md:text-4xl" style={{ color: B.navy }}>
              Conferences
            </h1>
          </div>
          <ConferenceModeSwitcher mode="attend" />
        </header>

        <p className="mt-3 max-w-xl text-[12.5px] leading-relaxed" style={{ color: B.muted }}>
          One community, across every conference. Find what is ahead, declare your attendance,
          and the Fellows standing in the same rooms are the ones you are there to meet.
        </p>

        <div className="mt-3 flex items-center gap-2">
          <span className="h-px flex-1" style={{ background: B.copper, opacity: 0.35 }} />
        </div>

        {state.failed ? (
          <div className="mt-8 rounded-sm px-5 py-6 text-center" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
            <Signal className="mx-auto h-5 w-5" style={{ color: B.copper }} />
            <p className="mt-2 font-heading text-lg" style={{ color: B.navy }}>
              The circuit could not be read.
            </p>
            <p className="mt-1 text-[11.5px]" style={{ color: B.muted }}>Nothing is lost. It is only the line.</p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
              style={{ background: B.navy, color: '#fff' }}
            >
              <RotateCcw className="h-3 w-3" /> Read it again
            </button>
          </div>
        ) : state.loading ? (
          <div className="mt-8 flex flex-col items-center gap-2 py-12">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: B.copper }} />
            <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: B.copper }}>
              Reading the circuit
            </p>
          </div>
        ) : circuit.length === 0 ? (
          <div className="mt-8 rounded-sm px-5 py-8" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
            <Ticket className="h-5 w-5" style={{ color: B.copper }} />
            <h2 className="mt-3 font-heading text-xl" style={{ color: B.navy }}>
              The calendar is still being set.
            </h2>
            <p className="mt-2 max-w-lg text-[12.5px] leading-relaxed" style={{ color: B.muted }}>
              The first conferences open here as their hosts publish them — the dates, the
              rooms, and the Fellows already declared. If you stage a conference, the door on
              the right is yours.
            </p>
            <Link
              to={HOST_HREF}
              className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ color: B.copper }}
            >
              Host a conference
            </Link>
          </div>
        ) : (
          <>
            <ConferenceFilters
              query={query}
              domain={domain}
              scope={scope}
              onQuery={setQuery}
              onDomain={setDomain}
              onScope={setScope}
              filtering={filtering}
              onClear={clearFilters}
            />

            {shown === 0 ? (
              <div className="mt-6 rounded-sm px-5 py-8 text-center" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
                <Search className="mx-auto h-5 w-5" style={{ color: B.copper }} />
                <h2 className="mt-3 font-heading text-xl" style={{ color: B.navy }}>
                  Nothing on the circuit answers to that.
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed" style={{ color: B.muted }}>
                  The circuit holds {circuit.length} {circuit.length === 1 ? 'conference' : 'conferences'}.
                  Widen the reading and they come back.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
                  style={{ background: B.navy, color: '#fff' }}
                >
                  <RotateCcw className="h-3 w-3" /> Clear the search
                </button>
              </div>
            ) : (
              <>
                {filteredMine.length > 0 && (
                  <section className="mt-7">
                    <div className="flex items-baseline justify-between gap-2">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: B.copper }}>
                        You're going
                      </h2>
                      <span className="text-[10px]" style={{ color: B.muted }}>{filteredMine.length}</span>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {filteredMine.map(card)}
                    </div>
                  </section>
                )}

                {shownUpcoming.length > 0 && (
                  <section className="mt-8">
                    <div className="flex items-baseline justify-between gap-2">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: B.copper }}>
                        On the circuit
                      </h2>
                      <span className="text-[10px]" style={{ color: B.muted }}>{shownUpcoming.length}</span>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {shownUpcoming.map(card)}
                    </div>
                  </section>
                )}

                {shownPast.length > 0 && (
                  <section className="mt-9">
                    <div className="flex items-baseline justify-between gap-2">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: B.muted }}>
                        Concluded
                      </h2>
                      <span className="text-[10px]" style={{ color: B.muted }}>{shownPast.length}</span>
                    </div>
                    <p className="mt-1 text-[11px] italic" style={{ color: B.muted }}>
                      The shows are over. The relationships are not — every room below still holds
                      the people you stood beside.
                    </p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {shownPast.slice(0, 8).map(card)}
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}