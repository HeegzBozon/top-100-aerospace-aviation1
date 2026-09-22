import { Link } from 'react-router-dom';

export default function NineMonthsArticleHero() {
  return (
    <header className="border-b border-editorial-copper bg-editorial-navy text-editorial-cream">
      <div className="mx-auto max-w-6xl px-6 pb-12 pt-7 sm:px-10 sm:pb-20">
        <Link to="/" className="inline-flex min-h-11 items-center font-body text-xs font-semibold uppercase tracking-[0.2em] text-editorial-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">TOP 100 Aerospace &amp; Aviation</Link>
        <nav aria-label="Breadcrumb" className="mt-7 flex flex-wrap items-center gap-3 font-body text-xs sm:mt-12">
          <Link to="/" className="inline-flex min-h-11 items-center underline underline-offset-4">Home</Link>
          <span aria-hidden="true">/</span><span aria-current="page">Nine Months of 2026</span>
        </nav>
        <p className="mt-6 font-body text-xs font-semibold uppercase tracking-[0.22em] text-editorial-gold">An industry reflection · 2026</p>
        <h1 className="mt-6 max-w-5xl text-balance font-heading text-4xl font-normal leading-[1.12] sm:text-6xl lg:text-7xl">Nine Months of 2026, and Not One Minute of It Built Itself</h1>
        <p className="mt-7 max-w-3xl font-body text-lg leading-relaxed sm:text-xl">Four people flew around the Moon. A test pilot broke the sound barrier without making a sound. A booster came home to the arms that launched it. Behind every one of those headlines is a name most of the industry will never learn.</p>
        <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 font-body text-sm">
          <span>By Matthew Higa</span><span aria-hidden="true" className="text-editorial-gold">/</span><time dateTime="2026-09-21">September 21, 2026</time>
        </div>
      </div>
    </header>
  );
}