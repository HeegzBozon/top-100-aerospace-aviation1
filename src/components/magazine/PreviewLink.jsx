import React, { useState } from 'react';
import { Check, Copy, Link2 } from 'lucide-react';
import { copyText } from '@/lib/clipboard';
import { issueReaderPath } from '@/components/magazine/magazineDownloads';

// The address the issue can be shown at before it is published.
//
// An editor reads the book as a reader would, and then wants to put that same reading in
// front of someone else: the writer, a patron, the masthead. The address is the reader's own
// — one issue, one link — built on the institution's printed address rather than on whatever
// machine the editor happens to be working from, so a link composed in the studio opens in
// the reviewer's hand.
const PREVIEW_HOST = 'https://top100aero.space';

export default function PreviewLink({ issue }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const url = `${PREVIEW_HOST}${issueReaderPath(issue.id)}`;

  const copy = async () => {
    const ok = await copyText(url);
    setCopied(ok);
    setFailed(!ok);
    if (ok) setTimeout(() => setCopied(false), 2600);
  };

  return (
    <div className="rounded-2xl p-5" style={{ background: 'hsl(var(--card))', border: '1px solid rgb(var(--editorial-navy-rgb) / 0.1)' }}>
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4" style={{ color: 'rgb(var(--editorial-copper-rgb))' }} />
        <h3 className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: 'rgb(var(--editorial-label-rgb))' }}>
          Preview link
        </h3>
      </div>

      <p className="text-sm mb-4" style={{ color: 'rgb(var(--editorial-navy-rgb) / 0.65)' }}>
        Hand the issue on as it stands — cover, contents and every composed page — before it goes
        live. The link opens the reader; while the issue is a draft it reads for signed-in editors only.
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Preview link"
          className="flex-1 min-w-0 rounded-full px-4 py-2.5 text-xs bg-transparent outline-none"
          style={{ border: '1px solid rgb(var(--editorial-navy-rgb) / 0.2)', color: 'rgb(var(--editorial-navy-rgb))' }}
        />
        <button
          onClick={copy}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-opacity hover:opacity-90"
          style={{ background: 'rgb(var(--editorial-copper-rgb))', color: 'rgb(var(--editorial-cream-rgb))', border: 0 }}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Link copied' : 'Copy link'}
        </button>
      </div>

      {failed && (
        <p className="text-xs mt-2" style={{ color: 'rgb(var(--editorial-copper-rgb))' }}>
          The clipboard refused the link. Select the address above and copy it by hand.
        </p>
      )}
    </div>
  );
}