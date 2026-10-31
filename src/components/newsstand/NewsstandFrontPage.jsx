import { ArrowRight } from 'lucide-react';
import { C } from '@/components/crm/crmConfig';

// The front page of the stand's publication tab: a nameplate over a rule, the dateline, and
// the one edition the house is currently printing set as the lead story. Everything is drawn
// from what the rack carries — a plate with no cover prints as type, never as a grey box.
const HAIR = 'rgba(30,58,90,0.25)';

export default function NewsstandFrontPage({ item, empty, focused = false, onOpen }) {
  return (
    <section aria-label="The front page" className="mt-6">
      <div aria-hidden>
        <div className="h-[3px] w-full" style={{ background: C.navy }} />
        <div className="mt-[3px] h-px w-full" style={{ background: C.navy }} />
      </div>

      <div className="mt-2.5 flex items-stretch justify-between gap-2">
        <p
          className="hidden w-[56px] border-r pr-2 pt-1 text-[6px] font-bold uppercase leading-[1.6] tracking-[0.14em] md:block"
          style={{ borderColor: HAIR, color: C.muted }}
        >
          Est. 2021
          <br />
          The house
        </p>

        <div className="flex-1 text-center">
          <p className="text-[7px] font-bold uppercase tracking-[0.4em]" style={{ color: C.copper }}>
            The Newsstand
          </p>
          <p
            className="mt-1 font-heading text-[2rem] font-bold leading-[0.86] tracking-[-0.02em] md:text-[3rem]"
            style={{ color: C.navy }}
          >
            TOP 100
          </p>
          <p className="mt-1.5 text-[6.5px] font-bold uppercase tracking-[0.4em]" style={{ color: C.muted }}>
            Aerospace &amp; Aviation
          </p>
        </div>

        <p
          className="hidden w-[56px] border-l pl-2 pt-1 text-right text-[6px] font-bold uppercase leading-[1.6] tracking-[0.14em] md:block"
          style={{ borderColor: HAIR, color: C.muted }}
        >
          Publications
          <br />
          Desk
        </p>
      </div>

      <div className="mt-2.5 h-px w-full" style={{ background: C.navy }} />
      <div className="flex items-baseline justify-between gap-2 py-1">
        <p className="text-[7px] font-bold uppercase tracking-[0.2em]" style={{ color: C.navy }}>
          The front page
        </p>
        <p className="text-[7px] uppercase tracking-[0.16em]" style={{ color: C.muted }}>
          {item?.meta || 'At the press'}
        </p>
      </div>
      <div className="h-px w-full" style={{ background: C.navy }} />

      {item ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`${item.title} — read the edition`}
          className="group mt-3 flex w-full items-start gap-3 rounded-[2px] pb-3 text-left"
          style={{
            boxShadow: focused ? `0 0 0 2px ${C.copper}` : 'none',
            transition: 'box-shadow 200ms ease',
          }}
        >
          {item.cover ? (
            <img
              src={item.cover}
              alt=""
              loading="lazy"
              className="w-[34%] shrink-0 rounded-[2px] object-cover"
              style={{
                aspectRatio: '3 / 4',
                border: `1px solid ${HAIR}`,
                boxShadow: '0 12px 24px -12px rgba(30,58,90,0.45)',
              }}
            />
          ) : null}

          <span className="block min-w-0 flex-1">
            <span
              className="block text-[7px] font-bold uppercase tracking-[0.22em]"
              style={{ color: C.copper }}
            >
              {item.kicker}
            </span>
            <span
              className="mt-1 block font-heading text-[1.3rem] leading-[1.03] md:text-[1.75rem]"
              style={{ color: C.navy }}
            >
              {item.title}
            </span>
            {item.subtitle ? (
              <span className="mt-1.5 block text-[10.5px] italic leading-snug" style={{ color: C.muted }}>
                {item.subtitle}
              </span>
            ) : null}
            <span
              className="mt-2.5 inline-flex items-center gap-1 text-[7.5px] font-bold uppercase tracking-[0.2em]"
              style={{ color: C.navy }}
            >
              Read the edition
              <ArrowRight className="h-2.5 w-2.5" aria-hidden="true" />
            </span>
          </span>
        </button>
      ) : (
        <p className="py-4 text-[10.5px] italic leading-relaxed" style={{ color: C.muted }}>
          {empty}
        </p>
      )}

      <div aria-hidden>
        <div className="h-px w-full" style={{ background: C.navy }} />
        <div className="mt-[3px] h-[3px] w-full" style={{ background: C.navy }} />
      </div>
    </section>
  );
}