import { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { Loader2, RefreshCw, AlertCircle, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { DISPATCH_ENTRY_POINTS } from '@/components/newsletter/dispatchConfig';

const ENTRY_LABELS = {
  subscribe_page: 'Signup page',
  viral_post_2026: 'Viral Posts 2026',
  viral_post_2022: 'Viral Posts 2022',
  profile: 'Record pages',
};

const labelFor = (key) => ENTRY_LABELS[key] || key;

// THE DISPATCH DESK — what the house can actually count, and nothing it cannot.
//
// A row here means GoHighLevel accepted the address. Views, clicks, started forms and
// rejected addresses are analytics events, not rows: they are read on the platform's
// Analytics page under the names listed at the foot of this panel. Submitted is not
// confirmed — the welcome and every issue are sent by the CRM workflow behind the tag,
// so no confirmation number is shown or invented.
export default function DispatchFunnelPanel() {
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [counts, setCounts] = useState({ total: 0, mobile: 0, desktop: 0, byEntry: [] });
  const [recent, setRecent] = useState([]);

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const entryPoints = Object.keys(DISPATCH_ENTRY_POINTS);
      const [total, mobile, desktop, entryCounts, page] = await Promise.all([
        base44.entities.NewsletterSignup.count({}),
        base44.entities.NewsletterSignup.count({ device: 'mobile' }),
        base44.entities.NewsletterSignup.count({ device: 'desktop' }),
        Promise.all(entryPoints.map((key) => base44.entities.NewsletterSignup.count({ entry_point: key }))),
        base44.entities.NewsletterSignup.filter({}, { sort: '-submitted_at', limit: 12 }),
      ]);
      setCounts({
        total,
        mobile,
        desktop,
        byEntry: entryPoints.map((key, index) => ({ key, count: entryCounts[index] })),
      });
      setRecent(page?.items || []);
      setState('ready');
    } catch (loadError) {
      setError(loadError?.message || 'The desk could not read the ledger.');
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const share = (count) => (counts.total > 0 ? Math.round((count / counts.total) * 100) : 0);
  const mobileShare = useMemo(() => share(counts.mobile), [counts]);

  return (
    <div className="space-y-5">
      <div className="desk-plate p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-editorial-gold">
              The Dispatch
            </p>
            <h2 className="mt-1.5 font-heading text-2xl text-editorial-cream">Newsletter growth</h2>
            <p className="mt-1.5 max-w-xl font-body text-xs leading-6 text-[#a3b8c9]">
              Every address GoHighLevel accepted, split by the invitation it came from and the screen it was
              given on. One row per address per entry point — a returning reader is not counted twice.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={state === 'loading'}
            className="desk-key disabled:opacity-50"
          >
            {state === 'loading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </button>
        </div>

        {state === 'error' ? (
          <div role="alert" className="mt-5 flex items-start gap-2.5 rounded-md border border-[#f2a1a1]/40 bg-[#f2a1a1]/10 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-[#f2a1a1]" aria-hidden="true" />
            <div>
              <p className="font-body text-sm text-[#f2a1a1]">The ledger could not be read.</p>
              <p className="mt-0.5 font-body text-xs text-[#a3b8c9]">{error}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="desk-face px-4 py-4">
                <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-label">
                  On the list
                </p>
                <p className="mt-1 font-heading text-3xl text-editorial-navy">
                  {state === 'loading' ? '—' : counts.total.toLocaleString()}
                </p>
              </div>
              <div className="desk-face px-4 py-4">
                <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-label">
                  Joined on a phone
                </p>
                <p className="mt-1 font-heading text-3xl text-editorial-navy">
                  {state === 'loading' ? '—' : `${mobileShare}%`}
                </p>
                <p className="mt-1 font-body text-[10px] text-editorial-navy/60">
                  {state === 'loading' ? '' : `${counts.mobile.toLocaleString()} mobile · ${counts.desktop.toLocaleString()} desktop`}
                </p>
              </div>
              <div className="desk-face px-4 py-4">
                <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-label">
                  Invitations live
                </p>
                <p className="mt-1 font-heading text-3xl text-editorial-navy">
                  {Object.keys(DISPATCH_ENTRY_POINTS).length}
                </p>
                <p className="mt-1 font-body text-[10px] text-editorial-navy/60">Signup page · both viral volumes · record pages</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-editorial-gold">
                By entry point
              </p>
              {state === 'loading' ? (
                <div className="mt-4 flex items-center gap-2 font-body text-xs text-[#a3b8c9]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading the ledger
                </div>
              ) : counts.total === 0 ? (
                <p className="mt-3 rounded-md border border-white/10 bg-white/[0.03] p-4 font-body text-xs leading-6 text-[#a3b8c9]">
                  No address has been filed yet. The invitations are live on the signup page, at the foot of both
                  viral volumes, and below every public record — the first submission appears here the moment
                  GoHighLevel accepts it.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-white/[0.07]">
                  {counts.byEntry.map((row) => (
                    <li key={row.key} className="flex flex-wrap items-center gap-3 py-3">
                      <span className="w-40 flex-none font-body text-xs font-semibold text-editorial-cream">
                        {labelFor(row.key)}
                      </span>
                      <span className="min-w-[120px] flex-1">
                        <span className="desk-meter block">
                          <span style={{ width: `${share(row.count)}%` }} />
                        </span>
                      </span>
                      <span className="w-24 flex-none text-right font-body text-xs tabular-nums text-[#a3b8c9]">
                        {row.count.toLocaleString()} · {share(row.count)}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-7">
              <p className="font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-editorial-gold">
                Most recent
              </p>
              {state === 'loading' ? null : recent.length === 0 ? (
                <p className="mt-3 font-body text-xs text-[#a3b8c9]">Nothing filed yet.</p>
              ) : (
                <ul className="mt-2 divide-y divide-white/[0.07]">
                  {recent.map((row) => (
                    <li key={row.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                      <Mail className="h-3.5 w-3.5 flex-none text-editorial-copper" aria-hidden="true" />
                      <span className="flex-1 truncate font-body text-xs text-editorial-cream">{row.email}</span>
                      <span className="font-body text-[10px] uppercase tracking-[0.14em] text-[#a3b8c9]">
                        {labelFor(row.entry_point)}
                      </span>
                      <span className="font-body text-[10px] uppercase tracking-[0.14em] text-[#a3b8c9]">
                        {row.device || 'unknown'}
                      </span>
                      <span className="w-28 flex-none text-right font-body text-[10px] tabular-nums text-[#a3b8c9]">
                        {row.submitted_at ? moment(row.submitted_at).format('D MMM · HH:mm') : '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-editorial-gold">
          Where the rest of the funnel lives
        </p>
        <p className="mt-2 font-body text-xs leading-6 text-[#a3b8c9]">
          Invitations seen and reached for, forms started, addresses refused and requests that failed are events,
          read on the platform&apos;s Analytics page:
        </p>
        <ul className="mt-2 space-y-1 font-body text-[11px] leading-5 text-[#a3b8c9]">
          <li><span className="text-editorial-cream">newsletter_invite_viewed</span> — the invitation was on the glass</li>
          <li><span className="text-editorial-cream">newsletter_invite_clicked</span> — the reader reached for it</li>
          <li><span className="text-editorial-cream">newsletter_form_started</span> — the first character typed</li>
          <li><span className="text-editorial-cream">newsletter_submit_rejected</span> — empty or malformed address</li>
          <li><span className="text-editorial-cream">newsletter_submit_failed</span> — the request did not get through</li>
          <li><span className="text-editorial-cream">newsletter_submitted</span> — accepted (the rows above)</li>
        </ul>
        <p className="mt-3 font-body text-[11px] leading-6 text-[#a3b8c9]">
          Submitted is not confirmed. The welcome and every issue are sent by the GoHighLevel workflow behind the
          subscriber tag, which this app cannot see, so no confirmation count is reported here.
        </p>
      </div>
    </div>
  );
}