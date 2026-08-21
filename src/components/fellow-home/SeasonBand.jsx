import SeasonCountdown from '@/components/fellow-home/season/SeasonCountdown';
import NomineeTally from '@/components/fellow-home/season/NomineeTally';
import YearProgressRule from '@/components/fellow-home/season/YearProgressRule';
import MonthCalendar from '@/components/fellow-home/season/MonthCalendar';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Season state, staged as an editorial masthead band rather than the
// navy-glass treatment the home surface uses.
export default function SeasonBand({ accent, underCountdown }) {
  return (
    <section className="px-5 sm:px-8 pt-5 pb-5" style={{ background: B.sand }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-0">
        <div className="md:pr-7">
          <SeasonCountdown accent={accent} />
          {underCountdown}
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
          <div className="mt-3 pt-3 border-t" style={{ borderColor: `${B.navy}14` }}>
            <MonthCalendar accent={accent} />
          </div>
        </div>
      </div>
    </section>
  );
}