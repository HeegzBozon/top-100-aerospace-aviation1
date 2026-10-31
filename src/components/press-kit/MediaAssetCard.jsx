import { useState } from 'react';
import { ArrowUpRight, Check, Copy, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { copyText } from '@/lib/clipboard';

const LABEL = 'text-[8px] font-bold uppercase tracking-[0.22em]';

// One item in the room. Nothing here edits the thing it points at — the record, the kit,
// the card and the episode are edited on their own surfaces, and the room holds the door.
export default function MediaAssetCard({ asset, listed, onToggle, busy }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const ok = await copyText(asset.url);
    setCopied(ok);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const status = listed ? 'Listed publicly' : asset.ready ? 'Private' : 'Not ready';

  return (
    <article
      className="flex h-full flex-col rounded-xl p-4"
      style={{ background: '#fffdf9', border: `1px solid ${B.border}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={LABEL} style={{ color: B.copper }}>
          {asset.label}
        </p>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.16em]"
          style={
            listed
              ? { background: 'rgba(30,58,90,0.08)', color: B.navy }
              : asset.ready
                ? { background: 'rgba(184,115,51,0.10)', color: B.copper }
                : { background: 'rgba(30,58,90,0.05)', color: B.muted }
          }
        >
          {status}
        </span>
      </div>

      <p className="mt-2 text-[11.5px] leading-relaxed" style={{ color: B.muted }}>
        {asset.note}
      </p>

      {!asset.ready && asset.blocked ? (
        <p className="mt-2 text-[10.5px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.45)' }}>
          {asset.blocked}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
        {asset.tool ? (
          <Link
            to={asset.to}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em]"
            style={{ background: B.navy, color: B.cream }}
          >
            Open badge
            <ArrowUpRight className="h-2.5 w-2.5" />
          </Link>
        ) : (
          <>
            {asset.ready ? (
              <>
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em]"
                  style={{ background: 'rgba(30,58,90,0.06)', color: B.navy, border: `1px solid ${B.border}` }}
                >
                  {copied ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                  {copied ? 'Copied' : 'Copy link'}
                </button>
                <button
                  type="button"
                  onClick={() => onToggle(asset)}
                  disabled={busy}
                  aria-pressed={listed}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em] disabled:opacity-50"
                  style={
                    listed
                      ? { background: B.copper, color: B.cream }
                      : { background: '#fff', color: B.navy, border: `1px solid ${B.border}` }
                  }
                >
                  <Globe className="h-2.5 w-2.5" />
                  {listed ? 'Remove' : 'List publicly'}
                </button>
              </>
            ) : null}
          </>
        )}
      </div>
    </article>
  );
}