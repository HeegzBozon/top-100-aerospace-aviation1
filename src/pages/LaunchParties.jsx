import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, PartyPopper } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUpcomingLaunches } from '@/functions/getUpcomingLaunches';
import { PARTY } from '@/components/launch-parties/partyConfig';
import SchedulePartyForm from '@/components/launch-parties/SchedulePartyForm';
import PartyCard from '@/components/launch-parties/PartyCard';

// The launch party board: every room the house has opened on a mission, and the desk for
// opening another. A party is hosted by a Fellow, and the theatre is where it is watched.
export default function LaunchParties() {
  const [me, setMe] = useState(undefined);
  const [launches, setLaunches] = useState([]);
  const [parties, setParties] = useState([]);
  const [counts, setCounts] = useState({});
  const [seats, setSeats] = useState(new Set());
  const [state, setState] = useState('loading');
  const [busy, setBusy] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const load = useCallback(async (user) => {
    setState('loading');
    const [list, mySeats] = await Promise.all([
      base44.entities.LaunchParty.filter({}, '-opens_at', 40),
      base44.entities.LaunchPartyGuest.filter({ guest_email: user.email }, '-created_date', 60),
    ]);
    setParties(list);
    setSeats(new Set(mySeats.map((g) => g.party_id)));
    const ids = list.map((p) => p.id);
    if (ids.length) {
      const tally = await base44.entities.LaunchPartyGuest.aggregate({
        query: { party_id: { $in: ids } },
        groupBy: 'party_id',
      });
      setCounts(Object.fromEntries((tally.rows || []).map((r) => [r.party_id, r.count])));
    } else {
      setCounts({});
    }
    setState('ready');
  }, []);

  useEffect(() => {
    base44.auth
      .me()
      .then((user) => {
        setMe(user);
        return load(user);
      })
      .catch((e) => (e?.status === 401 ? base44.auth.redirectToLogin(window.location.href) : setState('failed')));
  }, [load]);

  useEffect(() => {
    getUpcomingLaunches({ limit: 12 })
      .then((res) => setLaunches(res?.data?.launches || []))
      .catch(() => setLaunches([]));
  }, []);

  const host = async (draft) => {
    setBusy(true);
    try {
      const party = await base44.entities.LaunchParty.create(draft);
      await base44.entities.LaunchPartyGuest.create({
        party_id: party.id,
        party_code: party.invite_code,
        guest_name: me.full_name || me.email,
        guest_email: me.email,
        status: 'going',
      });
      navigate(`/launch-party/${party.invite_code}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 md:px-8" style={{ background: PARTY.sheet }}>
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center gap-2">
          <PartyPopper className="h-5 w-5" style={{ color: PARTY.copper }} />
          <h1 className="font-heading text-2xl" style={{ color: PARTY.inkOnPaper }}>Launch parties</h1>
        </header>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed" style={{ color: PARTY.bodyOnPaper }}>
          A room on a mission, watched together in the Mission Theatre. Host one, put your name on a door, and the
          house is there at lift-off.
        </p>

        {state === 'loading' && (
          <p className="mt-6 flex items-center gap-2 text-sm" style={{ color: PARTY.bodyOnPaper }}>
            <Loader2 className="h-4 w-4 animate-spin" /> Reading the board
          </p>
        )}
        {state === 'failed' && <p className="mt-6 text-sm text-red-700">The board could not be read. Try again shortly.</p>}

        {state === 'ready' && (
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
            <section>
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: PARTY.copper }}>
                On the books
              </h2>
              {parties.length === 0 ? (
                <div className="rounded-lg px-4 py-8 text-center" style={{ background: PARTY.paper, border: `1px dashed ${PARTY.ruleOnPaper}` }}>
                  <p className="font-heading text-lg" style={{ color: PARTY.inkOnPaper }}>No rooms are open yet.</p>
                  <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed" style={{ color: PARTY.bodyOnPaper }}>
                    Take the first one. Pick a mission off the library, name the gathering, and invite the people you
                    would watch it with.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {parties.map((party) => (
                    <PartyCard key={party.id} party={party} going={seats.has(party.id)} guests={counts[party.id] || 0} />
                  ))}
                </div>
              )}
            </section>

            <aside className="lg:sticky lg:top-4 lg:self-start">
              <SchedulePartyForm
                launches={launches}
                preselect={params.get('launch') || ''}
                hostName={me?.full_name || ''}
                busy={busy}
                onHost={host}
              />
            </aside>
          </div>
        )}

        <div className="h-20" />
      </div>
    </div>
  );
}