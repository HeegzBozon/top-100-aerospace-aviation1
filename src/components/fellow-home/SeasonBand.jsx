import { Link } from 'react-router-dom';
import { ArrowRight, ListOrdered } from 'lucide-react';
import SeasonCountdown from '@/components/fellow-home/season/SeasonCountdown';
import NomineeTally from '@/components/fellow-home/season/NomineeTally';
import YearProgressRule from '@/components/fellow-home/season/YearProgressRule';
import MonthCalendar from '@/components/fellow-home/season/MonthCalendar';
import WeatherWidget from '@/components/fellow-home/season/WeatherWidget';
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
          <div className="mt-5 pt-5 border-t space-y-5" style={{ borderColor: `${B.navy}14` }}>
            <MonthCalendar accent={accent} />
            <WeatherWidget accent={accent} />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-5 flex-wrap">
        <Link
          to="/nominate"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-70"
          style={{ color: B.navy }}
        >
          Enter a nomination <ArrowRight className="w-3.5 h-3.5" style={{ color: accent }} />
        </Link>
        <Link
          to="/nominate"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-70"
          style={{ color: B.navy }}
        >
          Refine my ballot <ListOrdered className="w-3.5 h-3.5" style={{ color: accent }} />
        </Link>
      </div>
    </section>
  );
}