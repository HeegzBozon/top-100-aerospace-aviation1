import { Share2, Copy, Check, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { goalByKey } from './copilotGoals';

const fmt = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
};

// The approved pitches. Each one is a shareable presentation the Fellow may hand
// on; nothing leaves the app unless they press share.
export default function PitchLibrary({ pitches, accent, publicUrl, onShare, onRemove }) {
  const [copied, setCopied] = useState('');

  if (!pitches?.length) return null;

  const share = async (pitch) => {
    const text = publicUrl
      ? `${pitch.headline}\n\n${pitch.pitch}\n\n${publicUrl}`
      : `${pitch.headline}\n\n${pitch.pitch}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: pitch.headline, text: pitch.pitch, url: publicUrl || undefined });
      } catch {
        return; // The member closed the sheet: nothing is shared, nothing is recorded.
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(pitch.id);
      setTimeout(() => setCopied(''), 1500);
    }
    onShare?.(pitch);
  };

  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.22em] mb-3" style={{ color: B.muted }}>
        Approved presentations
      </p>
      <div className="space-y-3">
        {pitches.map((pitch) => {
          const goal = goalByKey(pitch.goal);
          return (
            <div key={pitch.id} className="rounded-2xl px-4 py-4" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-1" style={{ color: accent }}>
                    {goal?.label || pitch.goal}
                  </p>
                  <p className="text-sm font-semibold leading-snug" style={{ color: B.navy }}>{pitch.headline}</p>
                </div>
                <span className="text-[10px] shrink-0" style={{ color: B.muted }}>{fmt(pitch.approved_at || pitch.created_date)}</span>
              </div>
              <p className="text-[12px] leading-relaxed mt-2 line-clamp-3" style={{ color: B.muted }}>{pitch.pitch}</p>
              <div className="flex items-center gap-4 mt-3">
                <button
                  type="button"
                  onClick={() => share(pitch)}
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] hover:opacity-70"
                  style={{ color: B.navy }}
                >
                  {copied === pitch.id ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                  {copied === pitch.id ? 'Copied' : 'Share'}
                </button>
                {publicUrl && (
                  <a
                    href={publicUrl}
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] hover:opacity-70"
                    style={{ color: B.muted }}
                  >
                    <Copy className="w-3 h-3" /> Public profile
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => onRemove?.(pitch)}
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] hover:opacity-70 ml-auto"
                  style={{ color: B.muted }}
                >
                  <Trash2 className="w-3 h-3" /> Archive
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}