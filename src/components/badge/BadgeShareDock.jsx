import { Check, Copy, ExternalLink, Share2 } from 'lucide-react';

// WHAT THE CODE HANDS ON.
//
// A badge is worn in a room, so the one thing it must be able to say is where a scan
// lands — and the holder sets that at the moment the conversation turns. The drawer of
// destinations is printed under the plate as keys rather than as a form, and the three
// ways of passing the same link on stand beneath it: the address itself, the machine's
// own share sheet, and the page.

const LABEL = 'font-body text-[7.5px] font-bold uppercase tracking-[0.24em]';

const PILL =
  'inline-flex min-h-[32px] flex-1 items-center justify-center gap-1.5 rounded-full font-body text-[7.5px] font-bold uppercase tracking-[0.14em] transition-colors';

const LINE = { background: 'rgba(250,248,245,0.06)', color: '#FAF8F5', border: '1px solid rgba(250,248,245,0.22)' };

const short = (link) => String(link || '').replace(/^https?:\/\//, '').replace(/\/$/, '');

export default function BadgeShareDock({
  destinations = [],
  selectedKey,
  onSelect,
  incoming = null,
  link,
  copied = false,
  onCopy,
  onShare,
  onOpen,
}) {
  return (
    <div className="px-4">
      <div className="flex items-baseline justify-between gap-3 pb-1.5">
        <p className={`${LABEL} text-editorial-gold/75`}>The code opens</p>
        <p className="min-w-0 truncate font-body text-[8px] tabular-nums text-editorial-cream/35">{short(link)}</p>
      </div>

      {/* A program key hands the badge its own address, so the code already points at the
          program the share was pressed on. Choosing a destination replaces it. */}
      {incoming ? (
        <div
          className="mb-1.5 flex items-center gap-2 rounded-[6px] px-2.5 py-1.5"
          style={{ background: 'rgba(201,168,124,0.12)', border: '1px solid rgba(201,168,124,0.42)' }}
        >
          <span className={`${LABEL} shrink-0 text-[6.5px]`} style={{ color: '#C9A87C' }}>
            From the menu
          </span>
          <span className="truncate font-body text-[9.5px] text-editorial-cream/80">
            {incoming.label || 'This program'}
          </span>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-1.5">
        {destinations.map((entry) => {
          const active = !incoming && entry.key === selectedKey;
          return (
            <button
              key={entry.key}
              type="button"
              onClick={() => onSelect(entry.key)}
              aria-pressed={active}
              className="rounded-[6px] px-2.5 py-1.5 text-left transition-colors"
              style={{
                background: active ? 'rgba(201,168,124,0.16)' : 'rgba(250,248,245,0.045)',
                border: `1px solid ${active ? 'rgba(201,168,124,0.75)' : 'rgba(250,248,245,0.16)'}`,
              }}
            >
              <span
                className="block truncate font-body text-[8.5px] font-bold uppercase tracking-[0.12em]"
                style={{ color: active ? '#E8CF9E' : 'rgba(250,248,245,0.78)' }}
              >
                {entry.label}
              </span>
              <span className="mt-0.5 block truncate font-body text-[7.5px] text-editorial-cream/40">
                {entry.note}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <button type="button" onClick={onCopy} aria-live="polite" className={PILL} style={LINE}>
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy link'}
        </button>
        <button
          type="button"
          onClick={onShare}
          className={PILL}
          style={{ background: '#B87333', color: '#FAF8F5' }}
        >
          <Share2 className="h-3 w-3" /> Share
        </button>
        <button type="button" onClick={onOpen} className={PILL} style={LINE}>
          <ExternalLink className="h-3 w-3" /> Open
        </button>
      </div>
    </div>
  );
}