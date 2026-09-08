import { ExternalLink, TrendingUp } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// "Most Liked Posts Series" — a cinematic editorial hero spread featuring the
// Fellow's top viral post. Renders only when the sitting has been completed
// (viral_post_link present). Navy ground, Playfair display type, gold rule,
// copper section label. Vogue meets NASA.
export default function ViralPostSlide({ user, accent }) {
  const link = user?.viral_post_link || '';
  // The field is a free-text string (e.g. "1.7M views" or "2400000"); render as-is.
  const impressions = (user?.viral_post_impressions || '').trim();
  const takeaway = user?.viral_post_takeaway || '';
  const wisdom = user?.viral_post_wisdom || '';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: B.navyDeep }}>
      {/* Subtle radial wash — cinematic, never animated */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(120% 80% at 50% 18%, ${accent}14, transparent 60%)` }}
      />

      <div className="relative z-10 w-full max-w-2xl px-6 py-20 text-center">
        {/* Section label */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <span className="h-px w-8" style={{ background: B.copper }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
            Most Liked Posts Series
          </span>
          <span className="h-px w-8" style={{ background: B.copper }} />
        </div>

        {/* Impressions — the display figure */}
        {impressions && (
          <div className="mb-10">
            <p
              className="font-bold leading-none"
              style={{
                color: '#fff',
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(44px, 10vw, 76px)',
              }}
            >
              {impressions}
            </p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: `${B.cream}99` }}>
              impressions
            </p>
          </div>
        )}

        {/* The takeaway — editorial body */}
        {takeaway && (
          <p
            className="text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto"
            style={{ color: `${B.cream}EE` }}
          >
            {takeaway}
          </p>
        )}

        {/* The wisdom — pull-quote */}
        {wisdom && (
          <blockquote className="relative max-w-lg mx-auto mb-10">
            <span
              className="block text-5xl leading-none mb-2"
              style={{ color: accent, fontFamily: "'Playfair Display', Georgia, serif" }}
              aria-hidden
            >
              &ldquo;
            </span>
            <p
              className="italic leading-snug"
              style={{
                color: B.gold,
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(18px, 2.6vw, 24px)',
              }}
            >
              {wisdom}
            </p>
          </blockquote>
        )}

        {/* Link to the original post */}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:shadow-lg"
            style={{ background: accent, color: B.navyDeep }}
          >
            <TrendingUp className="w-4 h-4" /> Read the post
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        )}
      </div>
    </section>
  );
}