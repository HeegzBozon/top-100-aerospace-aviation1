import { motion } from 'framer-motion';
import { Rocket, Share2, Eye, Lock } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';

export default function ListBuilderHeader({ listName, count, isPublished, onShare, onPreview }) {
  return (
    <div
      className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 backdrop-blur-md border-b"
      style={{ background: 'rgba(250,248,245,0.92)', borderColor: `${brand.navy}12` }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
        >
          <Rocket className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: `${brand.navy}60` }}>
            TOP 100 · My List
          </p>
          <p className="text-xs font-semibold leading-none truncate max-w-[140px]" style={{ color: brand.navy }}>
            {listName || 'My Top 100'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Count badge */}
        <div
          className="h-7 min-w-[28px] px-2 rounded-full flex items-center justify-center text-[11px] font-bold"
          style={{ background: `${brand.navy}10`, color: brand.navy }}
        >
          {count}/100
        </div>

        {/* Visibility badge */}
        <div
          className="flex items-center gap-1 h-7 px-2 rounded-full text-[10px] font-semibold"
          style={{
            background: isPublished ? `${brand.gold}20` : `${brand.navy}08`,
            color: isPublished ? brand.gold : `${brand.navy}50`,
          }}
        >
          {isPublished ? <Eye className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          {isPublished ? 'Public' : 'Draft'}
        </div>

        {/* Share CTA */}
        {count > 0 && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onShare}
            className="h-8 w-8 rounded-full flex items-center justify-center shadow-sm active:shadow-none"
            style={{ background: `linear-gradient(135deg, ${brand.gold}, #b8884a)` }}
          >
            <Share2 className="w-3.5 h-3.5 text-white" />
          </motion.button>
        )}
      </div>
    </div>
  );
}