import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const STATE = {
  mine: { label: 'Yours', cls: 'bg-editorial-navy text-editorial-cream' },
  pending: { label: 'In review', cls: 'bg-editorial-gold/30 text-editorial-navy' },
  match: { label: 'Email match · claim now', cls: 'bg-editorial-copper text-editorial-cream' },
  taken: { label: 'Already claimed', cls: 'bg-editorial-sand text-editorial-navy/60' },
  open: { label: 'Claim', cls: 'border border-editorial-copper text-editorial-copper' },
};

// One record in the list, opening the profile where the claim banner does the work.
export default function ClaimProfileRow({ nominee, state }) {
  const s = STATE[state];
  const photo = nominee.avatar_url || nominee.photo_url;
  return (
    <Link to={`/profiles/${nominee.id}`} className="flex items-center gap-3 border-b border-editorial-copper/20 bg-white p-3 hover:bg-editorial-cream">
      {photo
        ? <img src={photo} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
        : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-editorial-sand font-heading text-editorial-navy">{nominee.name?.[0]}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-editorial-navy">{nominee.name}</span>
        <span className="block truncate text-xs text-editorial-navy/60">{[nominee.title, nominee.company].filter(Boolean).join(' · ')}</span>
      </span>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${s.cls}`}>{s.label}</span>
      <ChevronRight className="h-4 w-4 shrink-0 text-editorial-navy/40" />
    </Link>
  );
}