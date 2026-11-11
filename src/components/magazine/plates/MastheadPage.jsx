import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import { PAGE_SCROLL_ATTR } from '@/components/magazine/pageTeleprompter';

// The masthead: the issue's own front matter — what this book is, who made it, and the line
// it opens on. It is printed on the paper rather than on a plate: the house line and the
// issue ruled across the head, the title set as a title, the preface beneath it, and the
// people who made the book listed against their parts.
export default function MastheadPage({ issue, scrollRef, pageNumber, totalPages }) {
  const contributors = issue.contributors || [];
  const parts = (issue.sections || []).length;
  const foot = [
    issue.issue_number ? `Issue ${issue.issue_number}` : null,
    parts ? `${parts} parts` : null,
    `${totalPages} pages`,
  ].filter(Boolean).join(' · ');

  return (
    <div className="w-full h-full overflow-hidden flex flex-col" style={{ background: P.cream }}>
      <div className="page-scroll flex-1 overflow-y-auto" {...{ [PAGE_SCROLL_ATTR]: '' }} ref={scrollRef}>
        <div className="px-6 pb-7 pt-7 sm:px-8">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]" style={{ color: P.navy }}>
              TOP 100 · Aerospace &amp; Aviation
            </p>
            {issue.cover_kicker && (
              <p className="text-[8px] font-bold uppercase tracking-[0.18em]" style={{ color: P.copper }}>
                {issue.cover_kicker}
              </p>
            )}
          </div>
          <div className="mt-2 h-[2px] w-full" style={{ background: P.copper }} />

          <h2 className="mt-5 font-serif text-[26px] leading-[1.06]" style={{ color: P.navy }}>
            {issue.title}
          </h2>
          {issue.subtitle && (
            <p className="mt-2 font-serif text-[13px] italic leading-snug" style={{ color: 'rgba(30,58,90,0.62)' }}>
              {issue.subtitle}
            </p>
          )}
          {issue.preface && (
            <p className="mt-5 text-[12px] leading-[1.78]" style={{ color: 'rgba(30,58,90,0.8)' }}>
              {issue.preface}
            </p>
          )}

          {contributors.length > 0 && (
            <section className="mt-6" style={{ borderTop: '1px solid rgba(30,58,90,0.18)', paddingTop: 10 }}>
              <p className="text-[8.5px] font-bold uppercase tracking-[0.24em]" style={{ color: 'rgb(var(--editorial-label-rgb))' }}>
                Contributors
              </p>
              <dl className="mt-2.5 space-y-1.5">
                {contributors.map((person, i) => (
                  <div key={person.name || i} className="flex items-baseline gap-2">
                    <dt className="min-w-0 text-[11px] font-medium" style={{ color: P.navy }}>{person.name}</dt>
                    <span
                      className="h-px flex-1 self-center"
                      style={{ background: 'repeating-linear-gradient(90deg, rgba(30,58,90,0.26) 0 1px, transparent 1px 4px)' }}
                      aria-hidden="true"
                    />
                    {person.role && (
                      <dd className="flex-none text-[8.5px] font-bold uppercase tracking-[0.14em]" style={{ color: 'rgba(30,58,90,0.5)' }}>
                        {person.role}
                      </dd>
                    )}
                  </div>
                ))}
              </dl>
            </section>
          )}

          <p className="mt-6 text-[8px] font-bold uppercase tracking-[0.22em]" style={{ color: 'rgba(30,58,90,0.4)' }}>
            {foot}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0 px-6 py-1 text-center" style={{ borderTop: `1px solid ${P.gold}20` }}>
        <span className="text-[10px] font-mono" style={{ color: 'rgba(30,58,90,0.3)' }}>
          {String(pageNumber).padStart(2, '0')} <span style={{ opacity: 0.5 }}>/ {String(totalPages).padStart(2, '0')}</span>
        </span>
      </div>
    </div>
  );
}