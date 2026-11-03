import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, PartyPopper } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { C } from '@/components/crm/crmConfig';
import { stampOf } from '@/components/theatre/theatreConfig';

// The parties in a Fellow's own diary: the rooms they host, and the doors they hold a seat
// at. It reads the same records the theatre does, so a party never has two answers about
// when it opens or who is on the door.
export default function LaunchPartiesRail({ me }) {
  const [rows, setRows] = useState([]);
  const [state, setState] = useState('loading');

  const load = useCallback(async () => {
    const [hosted, seats] = await Promise.all([
      base44.entities.LaunchParty.filter({ created_by_id: me.id }, '-opens_at', 6),
      base44.entities.LaunchPartyGuest.filter({ guest_email: me.email }, '-created_date', 30),
    ]);
    const seen = new Set(hosted.map((p) => p.id));
    const others = [...new Set(seats.map((s) => s.party_id))].filter((id) => !seen.has(id));
    const attending = others.length
      ? await base44.entities.LaunchParty.filter({ id: { $in: others } }, '-opens_at', 8)
      : [];
    const merged = [...hosted, ...attending]
      .filter((p) => p.status !== 'cancelled')
      .sort((a, b) => new Date(a.opens_at || a.net || 0) - new Date(b.opens_at || b.net || 0));
    setRows(merged.slice(0, 4));
    setState('ready');
  }, [me?.id, me?.email]);

  useEffect(() => {
    if (!me) return;
    load().catch(() => setState('failed'));
  }, [me, load]);

  if (!me) return null;

  return (
    <section className="mt-8">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: '#8F5C2C' }}>
          <PartyPopper className="h-3.5 w-3.5" /> Launch parties
        </h2>
        <Link to="/launch-parties" className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: '#B87333' }}>
          The board
        </Link>
      </div>

      {state === 'loading' && (
        <p className="flex items-center gap-1.5 text-xs" style={{ color: C.muted }}>
          <Loader2 className="h-3 w-3 animate-spin" /> Reading your parties
        </p>
      )}
      {state === 'failed' && <p className="text-xs text-red-700">Your parties could not be read.</p>}
      {state === 'ready' && rows.length === 0 && (
        <p className="rounded-lg border border-dashed p-4 text-xs leading-relaxed" style={{ borderColor: C.border, color: C.muted }}>
          No party in the diary. Open a room on a mission and the people you invite are on the door.
        </p>
      )}
      {state === 'ready' && rows.length > 0 && (
        <ul className="grid gap-2">
          {rows.map((party) => (
            <li key={party.id}>
              <Link
                to={`/launch-party/${party.invite_code}`}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2"
                style={{ background: C.paper, border: `1px solid ${C.border}` }}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm" style={{ color: C.navy }}>{party.title}</span>
                  <span className="block truncate text-[11px]" style={{ color: C.muted }}>
                    {stampOf(party.opens_at)}{party.created_by_id === me.id ? ' · you host' : ''}
                  </span>
                </span>
                <span className="flex-none text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: '#B87333' }}>
                  Enter
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}