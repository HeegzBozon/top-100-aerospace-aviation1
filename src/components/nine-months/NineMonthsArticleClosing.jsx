import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function NineMonthsArticleClosing() {
  return (
    <section aria-labelledby="nine-months-closing" className="mt-14 border-t border-editorial-copper pt-10 sm:mt-20">
      <p className="font-body text-xs font-semibold uppercase tracking-[0.2em]">The people behind the progress</p>
      <h2 id="nine-months-closing" className="mt-4 font-heading text-3xl font-normal leading-tight sm:text-4xl">The work deserves a name.</h2>
      <div className="mt-6 space-y-6">
        <p>Engineers, mechanics, controllers, technicians, founders, instructors, inspectors. Some of them work on the programs above. Most of them work on things you have never heard of that stop working the moment they stop showing up.</p>
        <p>A nomination starts with someone who sees that contribution clearly. Someone who knows the work, understands its value, and puts a name to it.</p>
        <p>The headlines tell us what the industry accomplished. The people behind them tell us how.</p>
      </div>
      <Link to="/nominate" className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 border border-editorial-copper bg-editorial-copper px-6 py-3 font-body text-xl font-bold text-editorial-cream hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-editorial-navy">Explore nominations <ArrowUpRight className="h-5 w-5" aria-hidden="true" /></Link>
    </section>
  );
}