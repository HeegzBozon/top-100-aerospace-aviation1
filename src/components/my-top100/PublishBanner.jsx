import { motion } from 'framer-motion';
import { Sparkles, Globe, CheckCircle2, Loader2 } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';

export default function PublishBanner({ rankings, isPublished, saving, onPublish, onSaveDraft }) {
  const isReady = rankings.length >= 3;

  return (
    <div
      className="mx-4 mt-2 mb-4 rounded-3xl overflow-hidden"
      style={{
        background: isPublished
          ? `linear-gradient(135deg, #0a4a1e, #0d6628)`
          : `linear-gradient(135deg, ${brand.navy}, #0b2542)`,
      }}
    >
      <div className="px-4 py-4">
        <div className="flex items-start gap-3">
          <div
            className="h-9 w-9 rounded-full shrink-0 flex items-center justify-center mt-0.5"
            style={{ background: isPublished ? 'rgba(255,255,255,0.15)' : `${brand.gold}20` }}
          >
            {isPublished ? (
              <CheckCircle2 className="w-4 h-4 text-green-300" />
            ) : (
              <Globe className="w-4 h-4" style={{ color: brand.gold }} />
            )}
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-bold">
              {isPublished ? 'List published & submitted as ballot' : 'Ready to make it official?'}
            </p>
            <p className="text-white/60 text-[11px] mt-0.5 leading-relaxed">
              {isPublished
                ? `Your list of ${rankings.length} is live and counting as your ranked choice vote.`
                : isReady
                ? `Publishing your list (${rankings.length} nominees) will make it public and submit it as your ranked choice ballot.`
                : `Add at least 3 nominees to publish your list.`
              }
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          {!isPublished && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onPublish}
              disabled={!isReady || saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold transition-all disabled:opacity-40"
              style={{ background: isReady ? `linear-gradient(135deg, ${brand.gold}, #b8884a)` : `${brand.gold}40`, color: 'white' }}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Publish & Submit Ballot
                </>
              )}
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onSaveDraft}
            disabled={saving}
            className="px-4 py-2.5 rounded-2xl text-xs font-semibold border border-white/20 text-white/70 transition-all"
          >
            {saving && !isPublished ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Draft'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}