import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// DELIVERY, COUNTED BY THE HOUSE.
//
// Every patron link the media kit publishes resolves through the house's own redirect, so
// the click is written to the PatronClick ledger before the reader is forwarded. That
// ledger is the report: it cannot be blocked by an ad-blocker, it does not depend on a
// consent decision, and it is the same record for 48 hours as for seven days.
const SECTIONS = [
  { key: 'gold', label: 'Section 04 · Gold' },
  { key: 'silver1', label: 'Section 06 · Silver I' },
  { key: 'silver2', label: 'Section 06 · Silver II' },
  { key: 'bronze', label: 'Section 10 · Bronze' },
  { key: 'footer_door', label: 'Section 12 · Footer door' },
];

const hoursAgo = (hours) => new Date(Date.now() - hours * 3600 * 1000).toISOString();

// mediaKitViews is the same seven days as the clicks it is set against.
export default function SponsorDelivery({ mediaKitViews = 0 }) {
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [delivery, setDelivery] = useState(null);

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const since7 = hoursAgo(168);
      const [last48, last7, bySection, byChannel] = await Promise.all([
        base44.entities.PatronClick.count({ clicked_at: { $gte: hoursAgo(48) } }),
        base44.entities.PatronClick.count({ clicked_at: { $gte: since7 } }),
        base44.entities.PatronClick.aggregate({
          query: { clicked_at: { $gte: since7 } },
          groupBy: 'section',
        }),
        base44.entities.PatronClick.aggregate({
          query: { clicked_at: { $gte: since7 } },
          groupBy: 'channel',
        }),
      ]);

      const sections = SECTIONS.map((section) => {
        const row = (bySection?.rows || []).find((entry) => entry.section === section.key);
        return { ...section, clicks: Number(row?.count || 0) };
      });

      setDelivery({
        last48,
        last7,
        sections,
        channels: (byChannel?.rows || []).map((row) => ({
          channel: row.channel || 'untracked',
          clicks: Number(row.count || 0),
        })),
      });
      setState('ready');
    } catch (caught) {
      setError(caught?.message || 'The click ledger could not be read.');
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const peak = Math.max(1, ...(delivery?.sections || []).map((section) => section.clicks));
  const perView =
    delivery && mediaKitViews > 0
      ? ((delivery.last7 / mediaKitViews) * 100).toFixed(1)
      : null;

  return (
    <div className="desk-plate px-4 py-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-editorial-gold">
          Patron delivery
        </p>
        <button
          type="button"
          onClick={load}
          className="text-[9px] uppercase tracking-[0.16em] text-editorial-cream/50 hover:text-editorial-cream"
        >
          Refresh
        </button>
      </div>
      <div className="desk-rule mt-2" />

      {state === 'loading' && (
        <div className="mt-3 space-y-2">
          {[0, 1, 2].map((row) => (
            <div key={row} className="h-4 animate-pulse rounded bg-editorial-cream/10" />
          ))}
        </div>
      )}

      {state === 'error' && (
        <p className="mt-3 text-[11px] leading-relaxed text-[#f2a1a1]">{error}</p>
      )}

      {state === 'ready' && delivery && (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            <div>
              <p className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-editorial-cream/50">
                Last 48h
              </p>
              <p className="mt-1 font-heading text-[24px] leading-none text-editorial-cream">
                {delivery.last48.toLocaleString('en-US')}
              </p>
            </div>
            <div>
              <p className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-editorial-cream/50">
                Last 7 days
              </p>
              <p className="mt-1 font-heading text-[24px] leading-none text-editorial-cream">
                {delivery.last7.toLocaleString('en-US')}
              </p>
            </div>
            <div>
              <p className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-editorial-cream/50">
                Per media-kit view
              </p>
              <p className="mt-1 font-heading text-[24px] leading-none text-editorial-cream">
                {perView ? `${perView}%` : '—'}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            {delivery.sections.map((section) => (
              <div key={section.key} className="flex items-center gap-2.5">
                <span className="w-[132px] flex-none truncate text-[10.5px] text-editorial-cream/70">
                  {section.label}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="desk-meter block">
                    <span style={{ width: `${(section.clicks / peak) * 100}%` }} />
                  </span>
                </span>
                <span className="w-8 flex-none text-right text-[11px] tabular-nums text-editorial-cream/60">
                  {section.clicks}
                </span>
              </div>
            ))}
          </div>

          {delivery.channels.length > 0 && (
            <p className="mt-3 border-t border-editorial-gold/15 pt-2.5 text-[10.5px] text-editorial-cream/55">
              By deliverable ·{' '}
              {delivery.channels
                .map((row) => `${row.channel} ${row.clicks}`)
                .join(' · ')}
            </p>
          )}

          {delivery.last7 === 0 && (
            <p className="mt-3 border-t border-editorial-gold/15 pt-2.5 text-[11px] leading-relaxed text-editorial-cream/55">
              No patron link has been followed in the last seven days. Every link the media
              kit publishes is countable, so the first click will be recorded here the
              moment it lands.
            </p>
          )}
        </>
      )}
    </div>
  );
}