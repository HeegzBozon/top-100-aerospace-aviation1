import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ClaimSteps from '@/components/claim/ClaimSteps';
import ClaimProfileRow from '@/components/claim/ClaimProfileRow';

const FIELDS = ['id', 'name', 'title', 'company', 'avatar_url', 'photo_url', 'nominee_email', 'secondary_emails', 'claim_status', 'claimed_by_user_id', 'claimed_by_user_email', 'claim_requested_by'];

function stateFor(n, user) {
  if (n.claimed_by_user_id === user.id || n.claimed_by_user_email === user.email) return 'mine';
  if (n.claimed_by_user_id || n.claimed_by_user_email) return 'taken';
  if (n.claim_status === 'pending' && n.claim_requested_by === user.email) return 'pending';
  if (n.nominee_email === user.email || n.secondary_emails?.includes(user.email)) return 'match';
  return 'open';
}

// The one place to claim a profile: what you already hold, then a search of the record.
export default function ClaimProfile() {
  const [user, setUser] = useState(null);
  const [mine, setMine] = useState(null);
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      if (!me) return base44.auth.redirectToLogin(window.location.href);
      setUser(me);
      const rows = await base44.entities.Nominee.filter({ $or: [
        { claimed_by_user_id: me.id }, { claimed_by_user_email: me.email }, { claim_requested_by: me.email },
        { nominee_email: me.email }, { secondary_emails: me.email },
      ] }, { limit: 20, fields: FIELDS });
      setMine(rows.items || rows);
    })();
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setResults(null); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const page = await base44.entities.Nominee.filter({ name: { $regex: escaped, $options: 'i' }, status: { $ne: 'rejected' } }, { limit: 20, fields: FIELDS });
      setResults(page.items || page);
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  if (!user || !mine) return <div className="flex min-h-screen items-center justify-center bg-editorial-cream"><Loader2 className="h-6 w-6 animate-spin text-editorial-copper" /></div>;

  return (
    <div className="min-h-screen bg-editorial-cream px-4 py-8">
      <div className="mx-auto max-w-xl space-y-6">
        <header>
          <p className="pd-label">Your record</p>
          <h1 className="font-heading text-3xl text-editorial-navy">Claim your profile</h1>
          <p className="mt-1 text-sm text-editorial-navy/70">If you were nominated, a profile of you already exists. Claim it to edit it and keep it current.</p>
        </header>
        <ClaimSteps />
        {mine.length > 0 && (
          <section>
            <p className="pd-label mb-2">Linked to {user.email}</p>
            <div className="border-t-2 border-editorial-copper">{mine.map(n => <ClaimProfileRow key={n.id} nominee={n} state={stateFor(n, user)} />)}</div>
          </section>
        )}
        <section>
          <p className="pd-label mb-2">Find your profile</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-editorial-navy/40" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search your name" className="bg-white pl-9" />
          </div>
          <div className="mt-2 border-t-2 border-editorial-copper">
            {searching && <div className="flex justify-center p-4"><Loader2 className="h-4 w-4 animate-spin text-editorial-copper" /></div>}
            {!searching && results?.map(n => <ClaimProfileRow key={n.id} nominee={n} state={stateFor(n, user)} />)}
            {!searching && results?.length === 0 && (
              <p className="bg-white p-4 text-sm text-editorial-navy/70">No profile under that name yet. Try another spelling, or ask a colleague to nominate you.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}