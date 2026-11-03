import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Ticket, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { PARTY } from '@/components/launch-parties/partyConfig';
import { countdownTo, pad, stampOf, timeOf } from '@/components/theatre/theatreConfig';
import TheatreChat from '@/components/theatre/TheatreChat';
import PartyGuestList from '@/components/launch-parties/PartyGuestList';
import PartyInvitePanel from '@/components/launch-parties/PartyInvitePanel';

// One launch party, opened from its invitation: the mission and its clock, the seat you take
// on the door, the room chat, and the desk the host sends invitations from.
export default function LaunchPartyRoom() {
  const { code } = useParams();
  const [me, setMe] = useState(undefined);
  const [party, setParty] = useState(null);
  const [guests, setGuests] = useState([]);
  const [state, setState] = useState('loading');
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const readSeats = useCallback(async (partyId) => {
    const rows = await base44.entities.LaunchPartyGuest.filter({ party_id: partyId }, '-created_date', 120);
    setGuests(rows);
  }, []);

  const load = useCallback(async () => {
    const rows = await base44.entities.LaunchParty.filter({ invite_code: code }, '-created_date', 1);
    const found = rows[0] || null;
    setParty(found);
    if (!found) {
      setState('missing');
      return;
    }
    await readSeats(found.id);
    setState('ready');
  }, [code, readSeats]);

  useEffect(() => {
    base44.auth
      .me()
      .then((user) => {
        setMe(user);
        return load();
      })
      .catch((e) => (e?.status === 401 ? base44.auth.redirectToLogin(window.location.href) : setState('failed')));
  }, [load]);

  const mine = me && party ? guests.find((g) => g.guest_email === me.email) || null : null;

  const answer = async (status) => {
    if (!me || !party) return;
    setBusy(true);
    try {
      if (mine && status === 'out') {
        await base44.entities.LaunchPartyGuest.delete(mine.id);
      } else if (mine) {
        await base44.entities.LaunchPartyGuest.update(mine.id, { status });
      } else if (status !== 'out') {
        await base44.entities.LaunchPartyGuest.create({
          party_id: party.id,
          party_code: party.invite_code,
          guest_name: me.full_name || me.email,
          guest_email: me.email,
          status,
        });
      }
      await readSeats(party.id);
    } finally {
      setBusy(false);
    }
  };

  const shell = (children) => (
    <div className="min-h-screen px-4 py-6 md:px-8" style={{ background: PARTY.stage }}>
      <div className="mx-auto max-w-5xl">{children}</div>
    </div>
  );

  if (state === 'loading') {
    return shell(
      <p className="flex items-center gap-2 text-sm" style={{ color: PARTY.body }}>
        <Loader2 className="h-4 w-4 animate-spin" /> Opening the room
      </p>,
    );
  }

  if (state === 'failed') {
    return shell(<p className="text-sm" style={{ color: PARTY.ink }}>The room could not be opened from here. Try again shortly.</p>);
  }

  if (state === 'missing') {
    return shell(
      <div className="rounded-lg px-5 py-10 text-center" style={{ background: PARTY.plate, border: `1px dashed ${PARTY.line}` }}>
        <Ticket className="mx-auto h-6 w-6" style={{ color: PARTY.gold }} />
        <p className="mt-3 font-heading text-lg" style={{ color: PARTY.ink }}>This invitation is not on the books.</p>
        <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed" style={{ color: PARTY.body }}>
          The party may have been called off, or the link may have lost a character on the way here.
        </p>
        <Link
          to="/launch-parties"
          className="mt-4 inline-flex items-center gap-1.5 rounded px-3.5 py-2 text-xs font-semibold"
          style={{ background: PARTY.copper, color: '#fdf8f0' }}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> The board
        </Link>
      </div>,
    );
  }

  const count = countdownTo(party.net, now);
  const seatTone = mine ? mine.status : null;

  return shell(
    <>
      <Link to="/launch-parties" className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: PARTY.gold }}>
        <ArrowLeft className="h-3 w-3" /> The board
      </Link>

      <header className="mt-3 rounded-lg px-4 py-4" style={{ background: PARTY.plate, border: `1px solid ${PARTY.line}` }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: PARTY.gold }}>Launch party</p>
            <h1 className="mt-1.5 font-heading text-2xl leading-tight sm:text-3xl" style={{ color: PARTY.ink }}>{party.title}</h1>
            <p className="mt-1.5 text-sm" style={{ color: PARTY.body }}>{party.launch_name}</p>
            <p className="mt-1 text-[11px]" style={{ color: PARTY.soft }}>
              {stampOf(party.opens_at)} · lift-off {timeOf(party.net)}
              {party.host_name ? ` · hosted by ${party.host_name}` : ''}
            </p>
          </div>
          {count && (
            <div className="flex-none text-right">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em]" style={{ color: PARTY.gold }}>
                {count.past ? 'Since the pad' : 'To the pad'}
              </p>
              <p className="mt-1 font-heading text-xl tabular-nums" style={{ color: PARTY.ink }}>
                {count.days > 0 ? `${count.days}d ` : ''}{pad(count.hours)}:{pad(count.minutes)}:{pad(count.seconds)}
              </p>
            </div>
          )}
        </div>

        {party.note && <p className="mt-3 text-xs leading-relaxed" style={{ color: PARTY.body }}>{party.note}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {['going', 'maybe'].map((option) => {
            const on = seatTone === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => answer(option)}
                disabled={busy || !me}
                className="rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] disabled:opacity-40"
                style={{
                  background: on ? PARTY.copper : 'rgba(255,255,255,0.07)',
                  color: on ? '#fdf8f0' : PARTY.body,
                  border: `1px solid ${on ? PARTY.copper : PARTY.line}`,
                }}
              >
                {option === 'going' ? 'I am going' : 'Maybe'}
              </button>
            );
          })}
          {mine && (
            <button
              type="button"
              onClick={() => answer('out')}
              disabled={busy}
              className="rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] disabled:opacity-40"
              style={{ color: PARTY.soft, border: `1px solid ${PARTY.line}` }}
            >
              Give up my seat
            </button>
          )}
          <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: PARTY.soft }}>
            <Users className="h-3 w-3" /> {guests.length} on the door
          </span>
          <Link
            to="/LaunchParty"
            className="ml-auto inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
            style={{ background: 'rgba(184,115,51,0.18)', color: PARTY.gold, border: `1px solid ${PARTY.line}` }}
          >
            <Ticket className="h-3 w-3" /> The theatre
          </Link>
        </div>
      </header>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-[26rem]">
          <TheatreChat launchId={party.launch_id} partyId={party.id} title="Party chat" hint={guests.length ? `${guests.length} on the door` : 'First in'} />
        </div>
        <div className="space-y-4">
          <PartyInvitePanel party={party} />
          <section>
            <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: PARTY.gold }}>On the door</h2>
            <PartyGuestList guests={guests} me={me} />
          </section>
        </div>
      </div>

      <div className="h-16" />
    </>,
  );
}