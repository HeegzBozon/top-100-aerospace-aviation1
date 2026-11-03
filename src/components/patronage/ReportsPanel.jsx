import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Loader2, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { DESK, P, day, money, stageLabel } from './patronConfig';

// WHAT THE BUYER IS OWED AFTERWARDS.
//
// Two reports on every paid send, at 48 hours and at 7 days. The numbers are entered from the
// real sources and every one carries where it came from and how it was counted — a report that
// cannot say how a figure was reached is not a report. Tracked clicks are read from the link
// log rather than typed, because that is the one number the house can prove.
//
// No reader data is ever part of this: it reports an audience, never a person in it.

const METRICS = [
  { key: 'email_sends', label: 'Email sends' },
  { key: 'email_opens', label: 'Email opens' },
  { key: 'article_views', label: 'Article views' },
  { key: 'tracked_clicks', label: 'Tracked clicks' },
  { key: 'linkedin_impressions', label: 'LinkedIn impressions' },
  { key: 'new_opt_ins', label: 'New opt-ins' },
  { key: 'qualified_leads', label: 'Qualified leads' },
];

const WINDOWS = [
  { key: '48h', label: '48-hour report' },
  { key: '7d', label: '7-day report' },
];

const dueFrom = (base, days) => {
  const start = base ? new Date(base) : new Date();
  start.setDate(start.getDate() + days);
  return start.toISOString().slice(0, 10);
};

export default function ReportsPanel({ deals, reports, user, onChanged }) {
  const [dealId, setDealId] = useState('');
  const [clicks, setClicks] = useState({});
  const [busy, setBusy] = useState('');
  const [reading, setReading] = useState(false);

  const reportable = useMemo(
    () => deals.filter((deal) => !deal.is_test && ['committed', 'contracted', 'paid', 'delivered', 'reported', 'renewed'].includes(deal.stage)),
    [deals],
  );

  useEffect(() => {
    if (!dealId && reportable.length) setDealId(reportable[0].id);
  }, [reportable, dealId]);

  // The one figure the house can prove, read from the click log rather than typed in.
  useEffect(() => {
    if (!dealId) return;
    let alive = true;
    setReading(true);
    base44.entities.PatronClick
      .aggregate({ query: { deal_id: dealId }, groupBy: 'channel' })
      .then((result) => {
        if (!alive) return;
        const map = {};
        (result?.rows || []).forEach((row) => {
          map[row.channel] = row.count;
        });
        setClicks(map);
      })
      .catch(() => alive && setClicks({}))
      .finally(() => alive && setReading(false));
    return () => {
      alive = false;
    };
  }, [dealId, reports.length]);

  const deal = reportable.find((item) => item.id === dealId) || null;
  const dealReports = reports.filter((report) => report.deal_id === dealId);
  const totalClicks = Object.values(clicks).reduce((sum, value) => sum + (value || 0), 0);

  const write = async (patch, label) => {
    setBusy(label);
    try {
      await base44.entities.PatronDeal.update(dealId, patch);
      await onChanged?.();
    } finally {
      setBusy('');
    }
  };

  const openReport = async (key) => {
    if (!deal) return;
    setBusy(key);
    try {
      const shipped = (deal.deliverables || []).find((row) => row.key === 'issue' && row.status === 'delivered');
      await base44.entities.PatronReport.create({
        deal_id: deal.id,
        issue_number: deal.issue_number,
        window: key,
        due_date: dueFrom(shipped?.delivered_date, key === '48h' ? 2 : 7),
        metrics: { tracked_clicks: totalClicks || undefined },
        caveats: 'No guaranteed reach. Figures reported as counted, not as promised.',
        no_reader_data: true,
        status: 'draft',
        prepared_by: user?.email || '',
      });
      await onChanged?.();
    } finally {
      setBusy('');
    }
  };

  if (!reportable.length) {
    return (
      <div className={`${DESK.card} p-8 text-center`} style={{ borderColor: P.hair }}>
        <BarChart3 className="mx-auto h-5 w-5" style={{ color: P.copper }} />
        <h2 className="mt-4 font-heading text-xl" style={{ color: P.navy }}>
          No reports owed yet
        </h2>
        <p className="mx-auto mt-2 max-w-[44ch] text-[11.5px] leading-relaxed" style={{ color: P.muted }}>
          Reports begin when a slot is committed. Two are owed on every paid send: at 48 hours, and at seven
          days.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className={`${DESK.card} p-4`} style={{ borderColor: P.hair }}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="block">
            <span className={DESK.label} style={{ color: P.faint }}>Placement</span>
            <select
              className={`${DESK.input} mt-1 min-w-[220px]`}
              style={{ borderColor: P.hair, color: P.navy }}
              value={dealId}
              onChange={(event) => setDealId(event.target.value)}
            >
              {reportable.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.organization_name} · {item.issue_number ? `#${item.issue_number}` : stageLabel(item.stage)}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            {WINDOWS.map((entry) => {
              const existing = dealReports.find((report) => report.window === entry.key);
              return (
                <button
                  key={entry.key}
                  type="button"
                  onClick={() => openReport(entry.key)}
                  disabled={!!existing || busy === entry.key}
                  className={DESK.btn}
                  style={{
                    background: existing ? 'white' : P.navy,
                    color: existing ? P.muted : P.cream,
                    border: existing ? `1px solid ${P.hair}` : 'none',
                  }}
                >
                  {busy === entry.key ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  {existing ? `${entry.label} open` : `Open ${entry.label.toLowerCase()}`}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 border-t pt-3" style={{ borderColor: P.hair }}>
          <p className={DESK.label} style={{ color: P.copper }}>
            Counted clicks
          </p>
          {reading ? (
            <Loader2 className="h-3 w-3 animate-spin" style={{ color: P.copper }} />
          ) : (
            <p className="text-[12px] font-bold" style={{ color: P.navy }}>
              {totalClicks}
            </p>
          )}
          {Object.entries(clicks).map(([channel, count]) => (
            <span key={channel} className="text-[9px] uppercase tracking-[0.14em]" style={{ color: P.faint }}>
              {channel} {count}
            </span>
          ))}
          {!totalClicks && !reading ? (
            <span className="text-[9.5px]" style={{ color: P.muted }}>
              None yet. A link that was not published cannot be counted.
            </span>
          ) : null}
        </div>
      </div>

      {dealReports.length ? (
        dealReports
          .slice()
          .sort((a, b) => (a.window === '48h' ? -1 : 1))
          .map((report) => (
            <div key={report.id} className={`${DESK.card} p-4`} style={{ borderColor: P.hair }}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: P.navy }}>
                  {report.window === '48h' ? '48-hour report' : '7-day report'}
                </p>
                <p className="text-[8.5px] uppercase tracking-[0.14em]" style={{ color: report.status === 'sent' ? P.copper : P.faint }}>
                  {report.status === 'sent' ? `Sent ${day(report.sent_date)}` : `Due ${day(report.due_date)}`}
                </p>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
                {METRICS.map((metric) => (
                  <label key={metric.key} className="block">
                    <span className="text-[7.5px] font-bold uppercase tracking-[0.14em]" style={{ color: P.faint }}>
                      {metric.label}
                    </span>
                    <input
                      type="number"
                      className={`${DESK.input} mt-1`}
                      style={{ borderColor: P.hair, color: P.navy }}
                      defaultValue={report.metrics?.[metric.key] ?? ''}
                      onBlur={(event) =>
                        base44.entities.PatronReport
                          .update(report.id, {
                            metrics: {
                              ...(report.metrics || {}),
                              [metric.key]: event.target.value === '' ? undefined : Number(event.target.value),
                            },
                          })
                          .then(() => onChanged?.())
                      }
                    />
                  </label>
                ))}
              </div>

              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <label className="block">
                  <span className={DESK.label} style={{ color: P.faint }}>Where the numbers came from</span>
                  <textarea
                    className={`${DESK.input} mt-1 min-h-[56px] resize-y`}
                    style={{ borderColor: P.hair, color: P.navy }}
                    defaultValue={report.source_note || ''}
                    placeholder="LinkedIn newsletter stats, pulled Nov 21. Article views from the reader."
                    onBlur={(event) => base44.entities.PatronReport.update(report.id, { source_note: event.target.value }).then(() => onChanged?.())}
                  />
                </label>
                <label className="block">
                  <span className={DESK.label} style={{ color: P.faint }}>How it was counted</span>
                  <textarea
                    className={`${DESK.input} mt-1 min-h-[56px] resize-y`}
                    style={{ borderColor: P.hair, color: P.navy }}
                    defaultValue={report.method_note || ''}
                    placeholder="Clicks counted at the tracked link, deduplicated per reader session."
                    onBlur={(event) => base44.entities.PatronReport.update(report.id, { method_note: event.target.value }).then(() => onChanged?.())}
                  />
                </label>
              </div>

              <label className="mt-2 block">
                <span className={DESK.label} style={{ color: P.faint }}>What this does not prove</span>
                <input
                  className={`${DESK.input} mt-1`}
                  style={{ borderColor: P.hair, color: P.navy }}
                  defaultValue={report.caveats || ''}
                  onBlur={(event) => base44.entities.PatronReport.update(report.id, { caveats: event.target.value }).then(() => onChanged?.())}
                />
              </label>

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    base44.entities.PatronReport
                      .update(report.id, { status: 'sent', sent_date: new Date().toISOString() })
                      .then(() => onChanged?.())
                  }
                  disabled={report.status === 'sent'}
                  className={DESK.btn}
                  style={{ background: P.copper, color: P.cream }}
                >
                  <Send className="h-3 w-3" />
                  {report.status === 'sent' ? 'Sent' : 'Mark sent'}
                </button>
                <p className="text-[9.5px]" style={{ color: P.faint }}>
                  {report.no_reader_data === false
                    ? 'Reader data sharing is switched on. That is never allowed on a sponsor report.'
                    : 'No reader contact data. Audience numbers only.'}
                </p>
              </div>
            </div>
          ))
      ) : (
        <p className={`${DESK.card} p-4 text-[11px]`} style={{ borderColor: P.hair, color: P.muted }}>
          Nothing is owed on this placement yet. Open the report on the day the issue ships.
        </p>
      )}

      {deal && deal.payment?.status === 'paid' ? (
        <p className="px-1 text-[9.5px]" style={{ color: P.faint }}>
          Settled at {money(deal.payment.amount || deal.rate_amount)}. Every figure above is reported as counted,
          never as promised.
        </p>
      ) : null}
    </div>
  );
}