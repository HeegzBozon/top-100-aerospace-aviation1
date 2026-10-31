import { ExternalLink, TrendingUp } from 'lucide-react';

// The Top Viral Posts Series, set as the one navy breakaway spread inside the
// cream record. It renders only when an editorial post has been staged for this
// Fellow, and it is display only — never read by discovery or measurement.
export default function ViralPostSpread({ spread }) {
  const link = spread?.viral_post_link || '';
  const screenshot = spread?.viral_post_screenshot_url || '';
  const impressions = (spread?.viral_post_impressions || '').trim();
  const takeaway = spread?.viral_post_takeaway || '';
  const wisdom = spread?.viral_post_wisdom || '';

  return (
    <section className="relative overflow-hidden bg-editorial-navy">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(120% 90% at 20% 0%, rgba(201,168,124,0.16) 0%, rgba(22,41,63,0) 62%)' }}
      />
      <div className="relative mx-auto grid w-full max-w-5xl gap-10 px-6 py-14 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-center lg:gap-14 lg:px-14 lg:py-20">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-editorial-copper" />
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.26em] text-editorial-gold/90">
              Top Viral Posts Series
            </p>
          </div>

          <h2 className="mt-5 font-heading text-[28px] leading-[1.08] text-editorial-cream sm:text-[36px]">
            The post that travelled.
          </h2>

          {impressions && (
            <p className="mt-7 font-heading text-[clamp(40px,7vw,64px)] leading-none text-editorial-cream">
              {impressions}
            </p>
          )}
          {impressions && (
            <p className="mt-2 font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-editorial-cream/55">
              impressions
            </p>
          )}

          {takeaway && (
            <p className="mt-7 max-w-xl font-body text-[14px] leading-[1.8] text-editorial-cream/75">{takeaway}</p>
          )}

          {wisdom && (
            <blockquote className="mt-7 border-l-2 border-editorial-copper pl-5">
              <p className="font-heading text-[18px] italic leading-snug text-editorial-gold sm:text-[21px]">
                &ldquo;{wisdom}&rdquo;
              </p>
            </blockquote>
          )}

          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 border border-editorial-gold/50 px-5 py-3 font-body text-[10px] font-bold uppercase tracking-[0.18em] text-editorial-gold transition-colors hover:bg-editorial-gold/10"
            >
              <TrendingUp className="h-3.5 w-3.5" /> Read the post <ExternalLink className="h-3 w-3 opacity-70" />
            </a>
          )}
        </div>

        {screenshot && (
          <div className="justify-self-center lg:justify-self-end">
            <img
              src={screenshot}
              alt="The Fellow's top performing post"
              className="max-h-[52vh] w-auto max-w-full object-contain"
              style={{ border: '1px solid rgba(201,168,124,0.35)', boxShadow: '0 24px 60px -28px rgba(4,9,18,0.9)' }}
            />
          </div>
        )}
      </div>
    </section>
  );
}