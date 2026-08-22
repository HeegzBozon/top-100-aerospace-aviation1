import { Link } from 'react-router-dom';
import { Mail, Send, Inbox, Link2, Check, ExternalLink, Archive } from 'lucide-react';
import { useState } from 'react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

const RailLink = ({ to, icon: Icon, children }) => (
  <Link
    to={to}
    className="flex items-center gap-2 rounded-md px-2 py-1 text-[13px] font-medium transition-colors hover:bg-black/[0.04]"
    style={{ color: B.navy }}
  >
    {Icon && <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: B.gold }} />}
    {children}
  </Link>
);

// Bare tile — nav shortcuts + the public URL. The ModuleGrid card frames it.
export default function ShortcutsTile({ accent, publicPath }) {
  const [copied, setCopied] = useState(false);
  const publicUrl = `${window.location.origin}${publicPath}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-0 flex-1">
        <RailLink to={publicPath} icon={ExternalLink}>Public profile</RailLink>
        <RailLink to="/nominate" icon={Send}>Nominations</RailLink>
        <RailLink to="/Top100Women2025#volumes" icon={Archive}>Archive</RailLink>
        <RailLink to="/events" icon={Inbox}>Events</RailLink>
        <RailLink to="/Comms" icon={Mail}>Messages</RailLink>
      </div>
      <button
        onClick={copyUrl}
        className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-md py-1 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: B.navy }}
      >
        {copied ? <Check className="w-3 h-3" /> : <Link2 className="w-3 h-3" />}
        {copied ? 'Copied' : 'Copy profile link'}
      </button>
    </div>
  );
}