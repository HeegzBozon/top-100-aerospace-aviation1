import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SeasonCountdown from '@/components/fellow-home/season/SeasonCountdown';
import NomineeTally from '@/components/fellow-home/season/NomineeTally';
import YearProgressRule from '@/components/fellow-home/season/YearProgressRule';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Season state, staged as an editorial masthead band rather than the
// navy-glass treatment the home surface uses.
export default function SeasonBand({ accent }) {
  return (
    <section className="px-5 sm:px-8 pt-6 pb-7" style={{ background: B.sand }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0">
        <div className="md:pr-7">
          <SeasonCountdown accent={accent} />
        </div>
        <div
          className="md:px-7 md:border-l"
          style={{ borderColor: `${B.navy}14` }}
        >
          <NomineeTally accent={accent} />
        </div>
        <div
          className="md:pl-7 md:border-l"
          style={{ borderColor: `${B.navy}14` }}
        >
          <YearProgressRule accent={accent} />
        </div>
      </div>

      <Link
        to="/nominate"
        className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-70"
        style={{ color: B.navy }}
      >
        Enter a nomination <ArrowRight className="w-3.5 h-3.5" style={{ color: accent }} />
      </Link>
    </section>
  );
}