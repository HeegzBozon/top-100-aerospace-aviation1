import { useEffect } from 'react';
import { LogIn } from 'lucide-react';
import PublicationSectionKey from './PublicationSectionKey';
import { publicationBrand as brandColors } from './publicationConfig';
import { useNavHint } from '@/components/handheld/faceHint';

// The publication's own title card, in the console's idiom: the masthead, the edition's
// line, the discovery readout — which is what the floating tracker used to say, now printed
// where the reader is standing — and the contents as keys the ring walks. Anything below
// the fold is brought up, so the key under the cursor is never off the glass.
export default function PublicationIndex({ items, cursorKey, onOpen, discovered, total, signedIn, onSignIn }) {
  const keyHint = useNavHint();
  useEffect(() => {
    if (!cursorKey) return;
    document.querySelector(`[data-hh-key="${cursorKey}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [cursorKey]);

  const pct = total ? Math.min(100, Math.round((discovered / total) * 100)) : 0;

  return (
    <div className="px-4 pb-8 pt-5">
      <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: brandColors.goldPrestige }}>
        The 2025 Edition
      </p>
      <h1 className="mt-1.5 font-heading text-[30px] leading-none" style={{ color: brandColors.navyDeep }}>
        TOP 100
      </h1>
      <p className="mt-1 text-[10.5px] font-bold uppercase tracking-[0.2em]" style={{ color: `${brandColors.ink}70` }}>
        Women in Aerospace &amp; Aviation
      </p>
      <p className="mt-2 max-w-xs text-[12px] leading-relaxed" style={{ color: `${brandColors.ink}75` }}>
        One hundred names. Thousands of nominations. Measured, not ranked.
      </p>

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: `${brandColors.ink}55` }}>
            Names opened
          </p>
          <p className="font-heading text-[11px]" style={{ color: brandColors.navyDeep }}>
            {discovered} of {total}
          </p>
        </div>
        <div className="mt-1.5 h-[3px] overflow-hidden rounded-full" style={{ background: `${brandColors.ink}12` }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${brandColors.goldPrestige}, #b87333)` }}
          />
        </div>
      </div>

      {!signedIn ? (
        <button
          type="button"
          onClick={onSignIn}
          className="mt-4 flex w-full items-center gap-2.5 rounded-xl px-3 py-3 text-left"
          style={{ background: brandColors.navyDeep }}
        >
          <LogIn className="h-4 w-4 shrink-0" style={{ color: brandColors.goldPrestige }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: brandColors.cream }}>
            Sign in to vote and nominate
          </span>
        </button>
      ) : null}

      <div className="mt-5 flex items-baseline justify-between gap-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: '#b87333' }}>
          Contents
        </p>
        <p className="text-[8px] font-bold uppercase tracking-[0.16em]" style={{ color: `${brandColors.ink}45` }}>
          {keyHint({ walk: 'Walk' })}
        </p>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2">
        {items.map((item) => (
          <PublicationSectionKey
            key={item.key}
            item={item}
            selected={item.key === cursorKey}
            onOpen={() => onOpen(item.key)}
          />
        ))}
      </div>
    </div>
  );
}