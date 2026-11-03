import React from 'react';
import { AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import usePromotionCopy from '@/components/magazine/promotion/usePromotionCopy';
import { PROMOTION_ASSETS } from '@/components/magazine/promotion/promotionChannels';
import SharedBriefEditor from '@/components/magazine/promotion/SharedBriefEditor';
import PromotionAssetCard from '@/components/magazine/promotion/PromotionAssetCard';
import PrCoachPanel from '@/components/magazine/promotion/PrCoachPanel';

// The promotion set for one issue: one brief, six assets, written to agree with each other
// and editable one field at a time.
export default function PromotionCopyStudio({ issue, articles = [], pages = [] }) {
  const { brief, setBrief, rebuildBrief, drafts, status, error, generate, updateField, notes, setNotes } =
    usePromotionCopy({ issue, articles, pages });

  const generating = status === 'generating';

  return (
    <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(30,58,90,0.1)' }}>
      <div className="mb-1 flex items-center gap-2">
        <Sparkles className="h-4 w-4" style={{ color: P.copper }} />
        <h3 className="font-serif text-sm" style={{ color: P.navy }}>Promotion copy</h3>
      </div>
      <p className="mb-4 text-xs leading-relaxed" style={{ color: 'rgba(30,58,90,0.55)' }}>
        One brief, six assets: a LinkedIn Article, a post from your home page, a post from the TOP 100
        page, an email, a Reel caption and a Shorts caption. Nothing is posted from here, this writes the
        copy for you to paste.
      </p>
      <SharedBriefEditor brief={brief} onChange={setBrief} onRebuild={rebuildBrief} disabled={generating} />

      <PrCoachPanel notes={notes} onChange={setNotes} issueTitle={issue?.title} disabled={generating} />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={generate}
          disabled={generating || !brief.trim()}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ background: P.navy, color: P.cream }}
        >
          {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {generating ? 'Writing the set' : drafts ? 'Write the set again' : 'Generate all six'}
        </button>
        <p className="text-[11px]" style={{ color: 'rgba(30,58,90,0.45)' }}>
          {generating
            ? 'Holding all six to the same brief. This takes a moment.'
            : drafts
              ? 'Writing again replaces all six assets with a new draft of the set.'
              : 'Nothing is written until you generate, then every field is yours to edit.'}
        </p>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl p-3" style={{ background: 'rgba(184,115,51,0.1)' }}>
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: P.copper }} />
          <p className="text-xs leading-relaxed" style={{ color: '#8F5C2C' }}>{error}</p>
        </div>
      )}

      {!drafts && !generating && !error && (
        <div
          className="mt-5 rounded-xl px-5 py-8 text-center"
          style={{ border: '1px dashed rgba(30,58,90,0.18)', background: P.cream }}
        >
          <p className="font-serif text-sm" style={{ color: P.navy }}>No copy yet</p>
          <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed" style={{ color: 'rgba(30,58,90,0.5)' }}>
            The brief above is the source. Generate to write the six assets, then edit any line
            that should sound more like you.
          </p>
        </div>
      )}

      {drafts && (
        <div className="mt-5 space-y-3">
          {PROMOTION_ASSETS.map((asset) => (
            <PromotionAssetCard
              key={asset.key}
              asset={asset}
              values={drafts[asset.key]}
              disabled={generating}
              onChange={(fieldKey, value) => updateField(asset.key, fieldKey, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}