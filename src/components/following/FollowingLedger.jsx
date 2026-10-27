import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, RotateCcw, Users } from 'lucide-react';
import FollowingRow from '@/components/following/FollowingRow';
import useFollowing from '@/components/following/useFollowing';
import useListEntry from '@/components/following/useListEntry';
import useRolodexLedger from '@/components/following/useRolodexLedger';
import { BTN, BTN_BASE, C } from '@/components/crm/crmConfig';

const ORDERS = [
  { key: 'name', label: 'By name' },
  { key: 'recent', label: 'Recent' },
];

// The people a Fellow follows, and the cards they hold for them.
//
// This is where the edition and the rolodex meet. A name followed in the magazine's Index
// of Names arrives here, and where the Fellow already holds her card the two are read
// together — the same record the Contacts surface keeps, matched on the address. Where
// there is no card yet, the ledger offers one press to keep her and never attaches one
// itself. Following is a Fellow's own keeping: it carries no weight in measurement, in the
// index, or in anything the institution counts.
export default function FollowingLedger() {
  const following = useFollowing();
  const list = useListEntry();
  const emails = useMemo(
    () => following.rows.map((row) => row.following_email).filter(Boolean),
    [following.rows],
  );
  const rolodex = useRolodexLedger(emails);

  const [order, setOrder] = useState('name');
  const [notice, setNotice] = useState('');

  const rows = useMemo(() => {
    const sorted = [...following.rows];
    if (order === 'recent') {
      sorted.sort((a, b) => String(b.created_date || '').localeCompare(String(a.created_date || '')));
    } else {
      sorted.sort((a, b) => String(a.following_name || '').localeCompare(String(b.following_name || '')));
    }
    return sorted;
  }, [following.rows, order]);

  const held = rows.filter((row) => rolodex.match(row.following_email)).length;

  const keep = async (row) => {
    const res = await rolodex.keep({
      name: row.following_name,
      email: row.following_email,
      avatar: row.following_avatar_url,
    });
    if (res.ok) setNotice(`${res.name} is in your rolodex`);
    else if (res.reason === 'no-address') setNotice('No address on her record, so no card can be kept');
    else if (res.reason !== 'signed-out') setNotice('That did not go through. Try it again.');
  };

  const addToList = async (row) => {
    // Resolved on her address: a follow row knows a name and an address, and the record
    // behind them is found by the address and by nothing else.
    const res = await list.add({
      name: row.following_name,
      email: row.following_email,
      avatar: row.following_avatar_url,
    });
    if (res.ok) setNotice(res.already ? `${res.name} is already on your list` : `${res.name} added to your TOP 100`);
    else if (res.reason === 'no-record') setNotice('This name is not linked to a record yet');
    else if (res.reason !== 'signed-out') setNotice('That did not go through. Try it again.');
  };

  if (!following.signedIn && !following.loading) {
    return (
      <div className="rounded-xl p-5 text-center" style={{ background: C.paper, border: `1px solid ${C.border}` }}>
        <Heart className="mx-auto h-5 w-5" style={{ color: C.copper }} />
        <p className="mt-3 text-[13px] font-semibold" style={{ color: C.navy }}>
          Following belongs to an account.
        </p>
        <p className="mx-auto mt-1.5 max-w-md text-[11.5px] leading-relaxed" style={{ color: C.muted }}>
          Sign in and the names you follow — in the edition's Index of Names, and on any Fellow's
          profile — are kept here, beside the cards you hold for them.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.16em]" style={{ color: C.muted }}>
          {following.loading
            ? 'Reading the people you follow'
            : `${rows.length} followed · ${held} in your rolodex`}
        </p>
        <div className="flex items-center gap-1.5">
          {ORDERS.map((option) => {
            const active = order === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setOrder(option.key)}
                aria-pressed={active}
                className="rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em]"
                style={{
                  color: active ? C.cream : C.navy,
                  background: active ? C.navy : 'transparent',
                  border: `1px solid ${active ? C.navy : C.border}`,
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {notice ? (
        <p role="status" className="mt-2 text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ color: C.copper }}>
          {notice}
        </p>
      ) : null}

      {following.failed ? (
        <div className="mt-2 rounded-lg p-4" style={{ background: C.paper, border: `1px solid ${C.border}` }}>
          <p className="text-[13px] font-semibold" style={{ color: C.navy }}>
            The people you follow could not be read. Nothing is lost.
          </p>
          <button type="button" onClick={following.reload} className={`${BTN_BASE} mt-3`} style={BTN.navy}>
            <RotateCcw className="h-3.5 w-3.5" /> Read it again
          </button>
        </div>
      ) : following.loading ? (
        <div className="mt-2 space-y-1.5">
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className="flex animate-pulse items-center gap-2.5 rounded-lg px-2.5 py-2.5"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <span className="h-10 w-10 shrink-0 rounded-lg" style={{ background: C.sand }} />
              <span className="flex-1 space-y-2">
                <span className="block h-2.5 w-32 rounded-full" style={{ background: C.sand }} />
                <span className="block h-2 w-44 rounded-full" style={{ background: C.sand }} />
              </span>
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-2 rounded-lg p-5" style={{ background: C.paper, border: `1px dashed ${C.border}` }}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: C.sand }}>
            <Users className="h-4 w-4" style={{ color: C.copper }} />
          </span>
          <p className="mt-3 text-[13px] font-semibold" style={{ color: C.navy }}>
            No one followed yet.
          </p>
          <p className="mt-1 max-w-md text-[11.5px] leading-relaxed" style={{ color: C.muted }}>
            A name is kept where it is published. Open an issue and walk its Index of Names, or open
            any honoree's profile, and press Follow — she stands here, with the card you hold for
            her beside her.
          </p>
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <Link to="/women-2025" className={BTN_BASE} style={BTN.primary}>
              <Heart className="h-3.5 w-3.5" /> TOP 100 Women 2025
            </Link>
            <Link to="/ArchiveLanding" className={BTN_BASE} style={BTN.outline}>
              <BookOpen className="h-3.5 w-3.5" /> The full archive
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-2 space-y-1.5">
          {rows.map((row) => (
            <FollowingRow
              key={row.id}
              person={{
                name: row.following_name || 'Unnamed',
                email: row.following_email,
                avatar: row.following_avatar_url,
                created_date: row.created_date,
              }}
              contact={rolodex.match(row.following_email)}
              inList={!!list.positionOf(row.nominee_id)}
              listPosition={list.positionOf(row.nominee_id)}
              busy={rolodex.loading}
              keeping={rolodex.busyKey === (row.following_email || '').trim().toLowerCase()}
              onKeep={() => keep(row)}
              onList={() => addToList(row)}
            />
          ))}
        </div>
      )}
    </section>
  );
}