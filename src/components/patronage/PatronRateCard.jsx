import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { P, SLOT_CALENDAR, TIER_LABELS, day, money } from './patronConfig';

// The published calendar. Live inventory comes from the slot records; when none have been
// opened yet, the published calendar is drawn instead, so the page is never a blank table.
// A slot marked sold is named, not hidden: a buyer should see that the good dates go.

const STATUS_COPY = {
  open: { label: 'Open', color: P.copper },
  sold: { label: 'Sponsor in place', color: 'rgba(30,58,90,0.45)' },
  delivered: { label: 'Sponsor in place', color: 'rgba(30,58,90,0.45)' },
  house: { label: 'House placement', color: 'rgba(30,58,90,0.45)' },
  held: { label: 'On hold', color: 'rgba(30,58,90,0.45)' },
  unpriced: { label: 'Rate under review', color: 'rgba(30,58,90,0.45)' },
  released: { label: 'Open', color: P.copper },
};

const byDate = (a, b) => {
  const first = a.issue_date ? new Date(a.issue_date).getTime() : Number.MAX_SAFE_INTEGER;
  const second = b.issue_date ? new Date(b.issue_date).getTime() : Number.MAX_SAFE_INTEGER;
  return first - second;
};

export default function PatronRateCard() {
  const [rows, setRows] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    base44.entities.SponsorSlot
      .list('issue_date', 100)
      .then((list) => alive && setRows(list || []))
      .catch(() => {
        if (!alive) return;
        setFailed(true);
        setRows([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const slots = (rows && rows.length ? rows : SLOT_CALENDAR).slice().sort(byDate);

  return (
    <section id="calendar" className="border-t" style={{ borderColor: P.hair }}>
      <div className="mx-auto w-full max-w-5xl px-5 py-10 md:px-10 md:py-14">
        <p className="text-[8.5px] font-bold uppercase tracking-[0.32em] md:text-[9.5px]" style={{ color: P.copper }}>
          Inventory
        </p>
        <h2 className="mt-3 font-heading text-2xl leading-tight md:text-[2.1rem]" style={{ color: P.navy }}>
          The calendar and the rate card
        </h2>
        <p className="mt-2 max-w-[52ch] text-[11.5px] leading-relaxed" style={{ color: P.muted }}>
          Dates and public issue numbers only. A slot is yours when the agreement is signed, and the rate card
          is reviewed after every three placements.
        </p>

        {rows === null && (
          <div className="mt-7 space-y-2 md:mt-9" aria-live="polite">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-[62px] animate-pulse border" style={{ borderColor: P.hair, background: 'white' }} />
            ))}
          </div>
        )}

        {rows !== null && (
          <div className="mt-7 border md:mt-9" style={{ borderColor: P.hair, background: 'white' }}>
            <div
              className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)] gap-3 border-b px-4 py-2.5 md:grid"
              style={{ borderColor: P.hair }}
            >
              {['Issue', 'Sends', 'Ad close', 'Rate'].map((head) => (
                <span key={head} className="text-[8px] font-bold uppercase tracking-[0.22em]" style={{ color: P.faint }}>
                  {head}
                </span>
              ))}
            </div>

            <ul>
              {slots.map((slot, index) => {
                const status = STATUS_COPY[slot.status] || STATUS_COPY.open;
                const tier = TIER_LABELS[slot.tier] || slot.tier || '';
                return (
                  <li
                    key={slot.id || `${slot.issue_number || slot.tier}-${index}`}
                    className="grid gap-1 border-b px-4 py-3.5 last:border-b-0 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)] md:items-baseline md:gap-3 md:py-3"
                    style={{ borderColor: P.hair }}
                  >
                    <div className="flex items-baseline justify-between gap-3 md:block">
                      <span className="text-[12px] font-bold" style={{ color: P.navy }}>
                        {slot.issue_number ? `#${slot.issue_number}` : tier}
                        <span className="ml-2 text-[10px] font-normal uppercase tracking-[0.14em]" style={{ color: P.faint }}>
                          {slot.issue_number ? tier : '2027 inventory'}
                        </span>
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-[0.16em] md:hidden" style={{ color: status.color }}>
                        {status.label}
                      </span>
                    </div>

                    <span className="text-[11px]" style={{ color: P.ink }}>
                      {slot.issue_date ? day(slot.issue_date) : slot.rate_note}
                    </span>

                    {/* The note already carries the inventory row in the column before this
                        one when the slot has no date of its own; printing it again here
                        made every 2027 row read as the same sentence twice. */}
                    <span className="text-[11px]" style={{ color: P.muted }}>
                      {slot.ad_close_date
                        ? `Closes ${day(slot.ad_close_date)}`
                        : slot.issue_date
                          ? slot.rate_note || '—'
                          : '—'}
                    </span>

                    <div className="flex items-baseline justify-between gap-3 md:block">
                      <span className="text-[12px] font-bold" style={{ color: P.navy }}>
                        {slot.rate_amount ? money(slot.rate_amount) : 'On request'}
                      </span>
                      <span
                        className="hidden text-[8.5px] font-bold uppercase tracking-[0.16em] md:block"
                        style={{ color: status.color }}
                      >
                        {status.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {failed && (
          <p className="mt-3 text-[10.5px]" style={{ color: P.copper }}>
            Live inventory could not be read just now, so the published calendar is shown. Dates and rates above
            are the published ones.
          </p>
        )}

        <p className="mt-5 text-[10.5px] leading-relaxed" style={{ color: P.muted }}>
          Any placement carrying a sponsor's own words or link is printed with a{' '}
          <span className="font-bold uppercase tracking-[0.14em]" style={{ color: P.navy }}>
            paid placement
          </span>{' '}
          label, and the credit itself always reads <span className="font-bold" style={{ color: P.navy }}>Sponsor of Record</span>.
          Both lines stay visible, never in fine print.
        </p>
      </div>
    </section>
  );
}