import { useEffect, useState } from 'react';
import { Loader2, PartyPopper } from 'lucide-react';
import { PARTY, defaultOpensAt, inviteCodeFor, isoFromLocalInput } from './partyConfig';

const field = {
  background: '#ffffff',
  border: `1px solid ${PARTY.ruleOnPaper}`,
  color: PARTY.inkOnPaper,
};

const label = 'text-[10px] font-semibold uppercase tracking-[0.18em]';

// Opening a party: pick the mission off the launch library, name the gathering, and say when
// the room opens. The mission's own clock carries onto the invitation, so the party always
// knows what it is watching.
export default function SchedulePartyForm({ launches, preselect = '', hostName = '', busy = false, onHost }) {
  const [launchId, setLaunchId] = useState('');
  const [title, setTitle] = useState('');
  const [opensAt, setOpensAt] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const chosen = launches.find((l) => l.id === launchId) || null;

  const pick = (launch) => {
    setLaunchId(launch.id);
    setTitle(`Watch party: ${launch.name}`);
    setOpensAt(defaultOpensAt(launch.net));
  };

  useEffect(() => {
    if (launchId || !launches.length) return;
    pick(launches.find((l) => l.id === preselect) || launches[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [launches, preselect, launchId]);

  const submit = (event) => {
    event.preventDefault();
    if (!chosen) return setError('Pick the mission the party is for.');
    if (!title.trim()) return setError('Give the party a name.');
    const opens = isoFromLocalInput(opensAt);
    if (!opens) return setError('Set the hour the room opens.');
    setError('');
    onHost({
      title: title.trim(),
      invite_code: inviteCodeFor(title),
      launch_id: chosen.id,
      launch_name: chosen.name,
      provider: chosen.launch_service_provider?.name || '',
      rocket: chosen.rocket?.configuration?.name || '',
      pad: chosen.pad?.location?.name || chosen.pad?.name || '',
      net: chosen.net || '',
      opens_at: opens,
      host_name: hostName,
      venue: 'The Mission Theatre, online',
      note: note.trim(),
      status: 'scheduled',
    });
  };

  return (
    <form onSubmit={submit} className="rounded-lg p-4" style={{ background: PARTY.paper, border: `1px solid ${PARTY.ruleOnPaper}` }}>
      <p className={label} style={{ color: PARTY.copper }}>Open a party</p>
      <h2 className="mt-1 font-heading text-xl" style={{ color: PARTY.inkOnPaper }}>Put a room on a mission.</h2>

      {launches.length === 0 ? (
        <p className="mt-3 text-xs leading-relaxed" style={{ color: PARTY.bodyOnPaper }}>
          The launch library is not answering, so there is nothing to put a room on yet. The board returns with the feed.
        </p>
      ) : (
        <>
          <label className="mt-4 block">
            <span className={label} style={{ color: PARTY.bodyOnPaper }}>The mission</span>
            <select
              value={launchId}
              onChange={(e) => pick(launches.find((l) => l.id === e.target.value))}
              className="mt-1 w-full rounded px-2 py-2 text-sm outline-none"
              style={field}
            >
              {launches.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </label>

          <label className="mt-3 block">
            <span className={label} style={{ color: PARTY.bodyOnPaper }}>The party</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={90}
              className="mt-1 w-full rounded px-2 py-2 text-sm outline-none"
              style={field}
            />
          </label>

          <label className="mt-3 block">
            <span className={label} style={{ color: PARTY.bodyOnPaper }}>The room opens</span>
            <input
              type="datetime-local"
              value={opensAt}
              onChange={(e) => setOpensAt(e.target.value)}
              className="mt-1 w-full rounded px-2 py-2 text-sm outline-none"
              style={field}
            />
          </label>

          <label className="mt-3 block">
            <span className={label} style={{ color: PARTY.bodyOnPaper }}>One line for your guests</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={140}
              placeholder="Bring a drink. We watch the whole burn."
              className="mt-1 w-full rounded px-2 py-2 text-sm outline-none"
              style={field}
            />
          </label>

          {error && <p className="mt-3 text-xs font-semibold text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-4 inline-flex items-center gap-1.5 rounded px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] disabled:opacity-50"
            style={{ background: PARTY.copper, color: '#fdf8f0' }}
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PartyPopper className="h-3.5 w-3.5" />}
            Take the room
          </button>
        </>
      )}
    </form>
  );
}