import { B } from '@/components/fellow-home/fellowHomeConfig';

// The institutional close. Verification seal reference, provenance,
// issue metadata. Reads as the back cover of a real magazine.
export default function ColophonSpread({ edition, nominee, settings, accent }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-10 text-center" style={{ background: B.navy }}>
      <div className="h-1 w-16 mb-8" style={{ background: accent }} />

      <div className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4" style={{ color: B.gold }}>
        Colophon
      </div>

      <h3 className="text-2xl mb-6" style={{ color: B.cream, fontFamily: "'Playfair Display', Georgia, serif" }}>
        {nominee?.name || 'Fellow'}
      </h3>

      <p className="text-xs leading-relaxed max-w-xs mb-8" style={{ color: 'rgba(250,248,245,0.55)' }}>
        This edition was published by TOP 100 Aerospace &amp; Aviation as part of the
        verified reputation graph. Verification state and influence tier are
        institutionally maintained.
      </p>

      <div className="h-px w-24 mb-6" style={{ background: 'rgba(201,168,124,0.3)' }} />

      <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(250,248,245,0.4)' }}>
        {edition?.edition_title || 'The Fellow Edition'} · Issue {edition?.issue_number || 1}
      </div>
      {edition?.published_date && (
        <div className="text-[10px] mt-2" style={{ color: 'rgba(250,248,245,0.3)' }}>
          {new Date(edition.published_date).getFullYear()}
        </div>
      )}
    </div>
  );
}