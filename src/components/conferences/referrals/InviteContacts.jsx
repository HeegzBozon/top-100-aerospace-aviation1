import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ScanLine, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Shown when the rolodex is too thin to refer anyone: capture someone, or invite them.
export default function InviteContacts({ count }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');

  const invite = async () => {
    setState('sending');
    await base44.users.inviteUser(email.trim(), 'user').then(() => { setState('sent'); setEmail(''); }).catch(() => setState('error'));
  };

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-editorial-cream/20 p-4 text-center">
      <p className="font-heading text-[15px] text-editorial-cream">{count ? 'One more contact needed' : 'Bring your people in'}</p>
      <p className="text-[11px] text-editorial-cream/60">A referral joins two of your contacts. Capture a card, or invite someone to TOP 100.</p>
      <Link to="/aerosync/scan" className="flex items-center justify-center gap-1.5 rounded-md border border-editorial-cream/20 py-2 text-[12px] text-editorial-cream">
        <ScanLine className="h-3.5 w-3.5" /> Capture a contact
      </Link>
      <div className="flex gap-2">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com"
          className="min-w-0 flex-1 rounded-md border border-editorial-cream/15 bg-editorial-navy/60 px-2.5 py-2 text-editorial-cream" />
        <button type="button" disabled={!EMAIL.test(email.trim()) || state === 'sending'} onClick={invite}
          className="flex items-center gap-1 rounded-md bg-editorial-copper px-3 text-[12px] font-semibold text-editorial-cream disabled:opacity-40">
          <UserPlus className="h-3.5 w-3.5" /> Invite
        </button>
      </div>
      {state === 'sent' && <p className="text-[10.5px] text-editorial-gold">Invitation sent.</p>}
      {state === 'error' && <p className="text-[10.5px] text-editorial-gold">That invitation didn't go through.</p>}
    </div>
  );
}