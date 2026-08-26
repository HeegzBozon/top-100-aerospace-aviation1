import { B } from '@/components/fellow-home/fellowHomeConfig';

// The hard cover. Full-bleed verified asset, name as the cover line,
// domain accent stripe, TOP 100 provenance mark, issue number.
export default function CoverSpread({ edition, nominee, accent, coverUrl }) {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: B.navy }}>
      {coverUrl && (
        <img src={coverUrl} className="absolute inset-0 h-full w-full object-cover" alt="" />
      )}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(7,17,31,0.95) 0%, rgba(7,17,31,0.15) 55%, rgba(7,17,31,0.55) 100%)' }}
      />
      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: accent }} />

      <div className="absolute top-7 left-7 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: B.gold }}>
        TOP 100 Aerospace
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: accent }}>
          {edition?.is_special_issue
            ? edition.special_context || 'Special Issue'
            : `Issue No. ${edition?.issue_number || 1}`}
        </div>
        <h1
          className="text-4xl md:text-5xl font-bold leading-tight mb-4"
          style={{ color: B.cream, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {nominee?.name || 'Fellow'}
        </h1>
        <div className="text-sm" style={{ color: 'rgba(250,248,245,0.7)' }}>
          {edition?.edition_title || 'The Fellow Edition'}
        </div>
      </div>
    </div>
  );
}