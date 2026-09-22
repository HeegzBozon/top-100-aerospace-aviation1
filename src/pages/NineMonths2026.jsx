import { useEffect } from 'react';
import NineMonthsArticleHero from '@/components/nine-months/NineMonthsArticleHero';
import NineMonthsMilestones from '@/components/nine-months/NineMonthsMilestones';
import NineMonthsAlumni from '@/components/nine-months/NineMonthsAlumni';
import NineMonthsArticleClosing from '@/components/nine-months/NineMonthsArticleClosing';
import HomeDock from '@/components/home-v3/HomeDock';

export default function NineMonths2026() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Nine Months of 2026 | TOP 100 Aerospace & Aviation';
    const previous = [];
    const setTag = (selector, attributes) => {
      let element = document.head.querySelector(selector);
      const original = element?.cloneNode(true);
      if (!element) { element = document.createElement(selector.startsWith('link') ? 'link' : 'meta'); document.head.appendChild(element); }
      Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
      previous.push(() => original ? element.replaceWith(original) : element.remove());
    };
    const url = `${window.location.origin}/articles/nine-months-of-2026`;
    setTag('meta[name="description"]', { name: 'description', content: 'Matthew Higa reflects on the people behind nine months of aerospace and aviation progress in 2026.' });
    setTag('link[rel="canonical"]', { rel: 'canonical', href: url });
    setTag('meta[property="og:title"]', { property: 'og:title', content: 'Nine Months of 2026, and Not One Minute of It Built Itself' });
    setTag('meta[property="og:description"]', { property: 'og:description', content: 'Behind every aerospace headline is a person whose contribution deserves to be seen.' });
    setTag('meta[property="og:type"]', { property: 'og:type', content: 'article' });
    setTag('meta[property="og:url"]', { property: 'og:url', content: url });
    return () => { document.title = previousTitle; previous.forEach(restore => restore()); };
  }, []);
  return (
    <main className="min-h-screen bg-editorial-cream font-body text-editorial-navy">
      <article>
        <NineMonthsArticleHero />
        <div className="mx-auto max-w-3xl px-6 pb-36 pt-10 text-[17px] leading-[1.8] sm:px-10 sm:pt-16 sm:text-lg">
          <div className="space-y-6">
            <p>On April 1, Reid Wiseman, Victor Glover, Christina Koch and Jeremy Hansen lifted off from Launch Complex 39B and flew farther from Earth than any human being ever has. Ten days later they splashed down in the Pacific. It was the first crewed flight around the Moon since 1972, and it produced an image Koch took through the Orion window that will outlive everyone reading this.</p>
            <p>The press called it a NASA mission. It was. It was also thousands of individual decisions made by thousands of individual people over more than a decade, most of whom will never be named in a headline.</p>
          </div>
          <blockquote className="my-10 border-l-2 border-editorial-copper pl-6 font-heading text-3xl leading-snug sm:my-14 sm:text-4xl">That gap is the reason this organization exists.</blockquote>
          <NineMonthsMilestones />
          <section aria-labelledby="nine-months-pattern" className="mt-12 space-y-6">
            <h2 id="nine-months-pattern" className="font-heading text-3xl font-normal sm:text-4xl">The pattern</h2>
            <p>Read those six items again and count the corporate logos. Now count the human beings.</p>
            <p>Every award in this industry goes to an organization. Organizations do not torque fasteners, sequence arrivals, sign off on airworthiness, or sit in a cockpit at Mach 1.4 to find out what happens. People do. The org chart gets the trophy and the person gets a line item.</p>
            <p>We think that is backwards, and we have been running the correction for four seasons.</p>
          </section>
          <NineMonthsAlumni />
          <NineMonthsArticleClosing />
        </div>
      </article>
      <HomeDock />
    </main>
  );
}