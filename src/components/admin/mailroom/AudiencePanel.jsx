import { useEffect, useState } from 'react';
import { RotateCw, Search, X } from 'lucide-react';
import DeskTile from '@/components/admin/desk/DeskTile';
import { DISPATCH_ENTRY_POINTS } from '@/components/newsletter/dispatchConfig';
import { LEDGER_LABEL } from './mailRoomConfig';

function formatDate(value) {
  if (!value) return '—';
  const stamp = new Date(value);
  if (Number.isNaN(stamp.getTime())) return '—';
  return stamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function LedgerRow({ row }) {
  return (
    <div
      className="grid grid-cols-1 gap-1 border-b px-3 py-2.5 last:border-b-0 sm:grid-cols-[1.6fr_0.9fr_0.8fr_1.3fr_0.7fr] sm:items-center sm:gap-3"
      style={{ borderColor: 'rgba(250,248,245,0.07)' }}
    >
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold" style={{ color: '#f5efe4' }}>
          {row.name || '—'}
        </p>
        <p className="truncate text-[11px]" style={{ color: '#7d94aa' }}>
          {row.email}
        </p>
      </div>
      <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: '#a3b8c9' }}>
        {LEDGER_LABEL[row.source] || row.source}
      </p>
      <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: '#a3b8c9' }}>
        {row.role === 'admin' ? 'admin' : row.has_account ? 'member' : '—'}
      </p>
      <p className="truncate text-[10px]" style={{ color: '#a3b8c9' }}>
        {row.entry_points?.length
          ? row.entry_points.map((entry) => DISPATCH_ENTRY_POINTS[entry]?.label || entry).join(' · ')
          : '—'}
      </p>
      <p className="text-[10px] tabular-nums" style={{ color: row.status === 'unsubscribed' ? '#f2a1a1' : '#7d94aa' }}>
        {row.status === 'unsubscribed' ? 'left the list' : formatDate(row.joined_at)}
      </p>
    </div>
  );
}

// THE AUDIENCE — one folded ledger of everyone the house can reach, read from the member
// record and the Dispatch list together. It is a reading, not a mailing list: nothing here
// is copied out, and the only thing that ever leaves is a letter.
export default function AudiencePanel({ room }) {
  const [term, setTerm] = useState(room.search || '');

  useEffect(() => {
    if (term === (room.search || '')) return undefined;
    const timer = setTimeout(() => room.searchFor(term), 400);
    return () => clearTimeout(timer);
  }, [term, room]);

  const summary = room.data?.summary;
  const rows = room.data?.rows || [];
  const byEntry = room.data?.by_entry || [];
  const busy = room.state === 'loading';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        <DeskTile
          label="Reachable"
          value={summary ? summary.mailable.toLocaleString() : '—'}
          note="addresses a letter may be posted to"
        />
        <DeskTile label="Members" value={summary ? summary.members.toLocaleString() : '—'} note="hold a record" />
        <DeskTile label="Readers" value={summary ? summary.readers.toLocaleString() : '—'} note="joined the Dispatch" />
        <DeskTile label="Both" value={summary ? summary.both.toLocaleString() : '—'} note="member and reader" />
        <DeskTile label="New · 30 days" value={summary ? summary.joined_30d.toLocaleString() : '—'} note="arrived this month" />
        <DeskTile
          label="Left the list"
          value={summary ? summary.unsubscribed.toLocaleString() : '—'}
          note="never written to"
          tone="#8f5c2c"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.8fr_1fr]">
        <div className="desk-plate p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: '#c9a87c' }}>
              The ledger
            </p>
            <button
              onClick={() => room.reload()}
              className="desk-key desk-key-quiet"
              disabled={busy}
            >
              <RotateCw className="h-3 w-3" /> {room.state === 'refreshing' ? 'reading' : 'read again'}
            </button>
          </div>

          <div className="mt-2.5 flex items-center gap-2 rounded-md px-2.5 py-1.5" style={{ background: 'rgba(6,12,20,0.55)' }}>
            <Search className="h-3.5 w-3.5" style={{ color: '#7d94aa' }} />
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search an address, a name or a door"
              className="w-full bg-transparent text-xs outline-none placeholder:text-[#5f7387]"
              style={{ color: '#efe9dc' }}
            />
            {term && (
              <button onClick={() => setTerm('')} aria-label="Clear search">
                <X className="h-3.5 w-3.5" style={{ color: '#7d94aa' }} />
              </button>
            )}
          </div>

          {room.state === 'error' ? (
            <div className="mt-3 rounded-md px-3 py-6 text-center" style={{ background: 'rgba(242,161,161,0.08)' }}>
              <p className="text-xs" style={{ color: '#f2a1a1' }}>{room.error}</p>
              <button onClick={() => room.reload()} className="desk-key mt-3">Try again</button>
            </div>
          ) : busy && !rows.length ? (
            <p className="py-8 text-center text-xs" style={{ color: '#7d94aa' }}>
              Reading the ledgers…
            </p>
          ) : rows.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs font-semibold" style={{ color: '#f5efe4' }}>
                {term ? 'No address matches that.' : 'Nobody has joined yet.'}
              </p>
              <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed" style={{ color: '#7d94aa' }}>
                {term
                  ? 'Try the first part of an address, or clear the field to read the whole ledger.'
                  : 'The ledger fills itself from the member record and from the Dispatch invitations on the public pages.'}
              </p>
            </div>
          ) : (
            <>
              <div className="mt-2 hidden grid-cols-[1.6fr_0.9fr_0.8fr_1.3fr_0.7fr] gap-3 px-3 pb-1 sm:grid">
                {['Person', 'Ledger', 'Role', 'Arrived via', 'Joined'].map((head) => (
                  <p key={head} className="text-[8.5px] font-bold uppercase tracking-[0.16em]" style={{ color: '#5f7387' }}>
                    {head}
                  </p>
                ))}
              </div>
              <div className="max-h-[430px] overflow-y-auto">
                {rows.map((row) => (
                  <LedgerRow key={row.email} row={row} />
                ))}
              </div>
              {room.data?.matching > rows.length && (
                <p className="pt-2 text-center text-[10px]" style={{ color: '#7d94aa' }}>
                  Showing {rows.length} of {room.data.matching.toLocaleString()} · search to narrow the reading
                </p>
              )}
            </>
          )}
        </div>

        <div className="desk-plate p-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: '#c9a87c' }}>
            Where they arrived
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: '#7d94aa' }}>
            The Dispatch invitation is printed at several doors. This is which door a reader came through.
          </p>
          <div className="mt-3 space-y-2">
            {byEntry.length === 0 && (
              <p className="text-[11px]" style={{ color: '#7d94aa' }}>No reader has joined yet.</p>
            )}
            {byEntry.map((entry) => {
              const total = summary?.readers || 1;
              const share = Math.max(0.02, Math.min(1, entry.count / total));
              return (
                <div key={entry.entry_point}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[11px]" style={{ color: '#dfe8f0' }}>
                      {DISPATCH_ENTRY_POINTS[entry.entry_point]?.label || entry.entry_point}
                    </p>
                    <p className="text-[11px] tabular-nums" style={{ color: '#c9a87c' }}>
                      {entry.count}
                    </p>
                  </div>
                  <div className="mt-1 h-[3px] rounded-full" style={{ background: 'rgba(250,248,245,0.12)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${share * 100}%`, background: 'linear-gradient(90deg,#8f5c2c,#c9a87c)' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 border-t pt-2.5 text-[10px] leading-relaxed" style={{ borderColor: 'rgba(250,248,245,0.08)', color: '#7d94aa' }}>
            GoHighLevel remains the CRM of record. This ledger is the house's own reading of who it may address, and it is never exported from here.
          </p>
        </div>
      </div>
    </div>
  );
}