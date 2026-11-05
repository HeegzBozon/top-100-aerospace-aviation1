import { useState } from 'react';
import { Flag } from 'lucide-react';
import ReportSheet from '@/components/moderation/ReportSheet';

// The key that sits on a piece of content, wherever it is read. One tap opens the
// report; nothing is filed until the reason is chosen. Kept as a plain, always-visible
// text key so it survives a phone — no hover, no long press, no context menu.
export default function ReportContent({ content, viewerEmail, onBlocked, label = 'Report' }) {
  const [open, setOpen] = useState(false);
  if (!content?.id) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Report this content"
        className="inline-flex shrink-0 items-center gap-1 font-body text-[9.5px] font-bold uppercase tracking-[0.14em] text-editorial-navy/40 transition-colors hover:text-editorial-copper focus-visible:text-editorial-copper"
      >
        <Flag className="h-3 w-3" />
        {label}
      </button>

      {open && (
        <ReportSheet
          content={{ ...content, viewerEmail }}
          onClose={() => setOpen(false)}
          onBlocked={onBlocked}
        />
      )}
    </>
  );
}