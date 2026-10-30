import { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// The published kit has one address, minted once and reused, so a link already sent to a
// journalist keeps working through every later revision.
export default function KitSharePanel({ url }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="rounded-xl p-4" style={{ background: B.navy }}>
      <p className="text-[8px] font-bold uppercase tracking-[0.28em]" style={{ color: B.gold }}>
        This kit is live at
      </p>
      <p className="mt-2 break-all text-[11px] leading-relaxed" style={{ color: 'rgba(250,248,245,0.82)' }}>
        {url}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[8.5px] font-bold uppercase tracking-[0.18em]"
          style={{ background: B.gold, color: B.navy }}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy link'}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[8.5px] font-bold uppercase tracking-[0.18em]"
          style={{ background: 'rgba(250,248,245,0.12)', color: B.cream, border: '1px solid rgba(250,248,245,0.26)' }}
        >
          <ExternalLink className="h-3 w-3" />
          Open
        </a>
      </div>
    </section>
  );
}