import { useEffect, useState } from 'react';
import { Check, Loader2, Link2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { DEFAULT_FIREWALL, DELIVERABLES, DESK, P, PAID_LABEL, TRACKED_CHANNELS, trackedLink } from './patronConfig';

// What the Patron supplied, what the house will publish, and the one instrument that makes a
// report possible: the tracked link. Every promised surface is a row here, so a slot is only
// delivered when all three have actually shipped.

const DELIVERY_STATES = [
  { key: 'pending', label: 'Pending' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'missed', label: 'Missed' },
];

const EMPTY_ASSETS = {
  logo_url: '',
  headline: '',
  body: '',
  destination_url: '',
  utm_campaign: '',
};

export default function DealPlacement({ deal, user, onChanged }) {
  const [assets, setAssets] = useState({ ...EMPTY_ASSETS, ...(deal.assets || {}) });
  const [label, setLabel] = useState(deal.placement?.label_text || PAID_LABEL);
  const [firewall, setFirewall] = useState(deal.placement?.firewall_line || DEFAULT_FIREWALL);
  const [busy, setBusy] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    setAssets({ ...EMPTY_ASSETS, ...(deal.assets || {}) });
    setLabel(deal.placement?.label_text || PAID_LABEL);
    setFirewall(deal.placement?.firewall_line || DEFAULT_FIREWALL);
  }, [deal.id]);

  const placement = deal.placement || {};
  const rows = DELIVERABLES.map((deliverable) => {
    const saved = (deal.deliverables || []).find((row) => row.key === deliverable.key);
    return { ...deliverable, ...(saved || {}) };
  });

  const write = async (patch, labelText) => {
    setBusy(labelText);
    try {
      await base44.entities.PatronDeal.update(deal.id, patch);
      await onChanged?.();
    } finally {
      setBusy('');
    }
  };

  const saveDeliverables = (key, patch) =>
    write(
      {
        deliverables: rows.map((row) => (row.key === key ? { ...row, ...patch } : row)),
      },
      `deliverable-${key}`,
    );

  const copy = async (channel) => {
    const link = trackedLink(window.location.origin, deal.id, channel);
    try {
      await navigator.clipboard.writeText(link);
      setCopied(channel);
      window.setTimeout(() => setCopied(''), 1600);
    } catch {
      setCopied('');
    }
  };

  return (
    <>
      <div className={`${DESK.card} p-4`} style={{ borderColor: P.hair }}>
        <p className={DESK.label} style={{ color: P.copper }}>
          The Patron's material
        </p>
        <p className="mt-1 text-[10px] leading-relaxed" style={{ color: P.muted }}>
          Only the Patron's own placement is built from this. Nothing here reaches an editorial page.
        </p>

        <div className="mt-2.5 grid gap-2 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className={DESK.label} style={{ color: P.faint }}>Destination</span>
            <input
              className={`${DESK.input} mt-1`}
              style={{ borderColor: P.hair, color: P.navy }}
              value={assets.destination_url}
              onChange={(event) => setAssets((prev) => ({ ...prev, destination_url: event.target.value }))}
              placeholder="https://…"
            />
          </label>
          <label className="block md:col-span-2">
            <span className={DESK.label} style={{ color: P.faint }}>Logo URL</span>
            <input
              className={`${DESK.input} mt-1`}
              style={{ borderColor: P.hair, color: P.navy }}
              value={assets.logo_url}
              onChange={(event) => setAssets((prev) => ({ ...prev, logo_url: event.target.value }))}
              placeholder="https://…"
            />
          </label>
          <label className="block">
            <span className={DESK.label} style={{ color: P.faint }}>Headline</span>
            <input
              className={`${DESK.input} mt-1`}
              style={{ borderColor: P.hair, color: P.navy }}
              value={assets.headline}
              onChange={(event) => setAssets((prev) => ({ ...prev, headline: event.target.value }))}
            />
          </label>
          <label className="block">
            <span className={DESK.label} style={{ color: P.faint }}>UTM campaign</span>
            <input
              className={`${DESK.input} mt-1`}
              style={{ borderColor: P.hair, color: P.navy }}
              value={assets.utm_campaign}
              onChange={(event) => setAssets((prev) => ({ ...prev, utm_campaign: event.target.value }))}
              placeholder={deal.issue_number ? `issue-${deal.issue_number}` : 'issue-patron'}
            />
          </label>
          <label className="block md:col-span-2">
            <span className={DESK.label} style={{ color: P.faint }}>Copy, up to 60 words</span>
            <textarea
              className={`${DESK.input} mt-1 min-h-[70px] resize-y`}
              style={{ borderColor: P.hair, color: P.navy }}
              value={assets.body}
              onChange={(event) => setAssets((prev) => ({ ...prev, body: event.target.value }))}
            />
          </label>
        </div>

        <button
          type="button"
          onClick={() => write({ assets }, 'assets')}
          disabled={busy === 'assets'}
          className={`${DESK.btn} mt-2.5`}
          style={{ background: P.navy, color: P.cream }}
        >
          {busy === 'assets' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          Save the material
        </button>

        {/* The tracked links */}
        <div className="mt-4 border-t pt-3" style={{ borderColor: P.hair }}>
          <div className="flex items-center gap-1.5">
            <Link2 className="h-3 w-3" style={{ color: P.copper }} />
            <p className={DESK.label} style={{ color: P.copper }}>
              Tracked links
            </p>
          </div>
          <p className="mt-1 text-[10px] leading-relaxed" style={{ color: P.muted }}>
            One per surface. Every click is counted, and the reader is forwarded to the destination above —
            never to an address a reader supplies.
          </p>
          <ul className="mt-1.5 space-y-1">
            {TRACKED_CHANNELS.filter((channel) => channel !== 'media_kit').map((channel) => {
              const link = trackedLink(window.location.origin, deal.id, channel);
              return (
                <li key={channel} className="flex items-center gap-2 border px-2 py-1.5" style={{ borderColor: P.hair }}>
                  <span className="w-14 shrink-0 text-[8px] font-bold uppercase tracking-[0.14em]" style={{ color: P.faint }}>
                    {channel}
                  </span>
                  <code className="min-w-0 flex-1 truncate text-[9px]" style={{ color: P.ink }}>
                    {assets.destination_url ? link : 'Set a destination first'}
                  </code>
                  <button
                    type="button"
                    onClick={() => copy(channel)}
                    disabled={!assets.destination_url}
                    className="shrink-0 rounded px-1.5 py-1 text-[7.5px] font-bold uppercase tracking-[0.12em] disabled:opacity-40"
                    style={{ border: `1px solid ${P.hair}`, color: P.navy }}
                  >
                    {copied === channel ? 'Copied' : 'Copy'}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* The proof */}
      <div className={`${DESK.card} p-4`} style={{ borderColor: P.hair }}>
        <p className={DESK.label} style={{ color: P.copper }}>
          The placement
        </p>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <label className="block">
            <span className={DESK.label} style={{ color: P.faint }}>Paid label</span>
            <input
              className={`${DESK.input} mt-1`}
              style={{ borderColor: P.hair, color: P.navy }}
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
          </label>
          <label className="block">
            <span className={DESK.label} style={{ color: P.faint }}>Firewall line</span>
            <input
              className={`${DESK.input} mt-1`}
              style={{ borderColor: P.hair, color: P.navy }}
              value={firewall}
              onChange={(event) => setFirewall(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              write({ placement: { ...placement, label_text: label, firewall_line: firewall } }, 'placement')
            }
            disabled={busy === 'placement'}
            className={DESK.btn}
            style={{ border: `1px solid ${P.hair}`, background: 'white', color: P.navy }}
          >
            Save the wording
          </button>
          <button
            type="button"
            onClick={() =>
              write(
                {
                  placement: {
                    ...placement,
                    label_text: label,
                    firewall_line: firewall,
                    approved_by: user?.email || deal.placement?.approved_by || '',
                    approved_date: new Date().toISOString().slice(0, 10),
                  },
                },
                'approve',
              )
            }
            disabled={busy === 'approve'}
            className={DESK.btn}
            style={{ background: P.copper, color: P.cream }}
          >
            <Check className="h-3 w-3" />
            Approve
          </button>
          <button
            type="button"
            onClick={() => write({ placement: { ...placement, links_tested: !placement.links_tested } }, 'tested')}
            className="rounded-full px-2.5 py-1 text-[7.5px] font-bold uppercase tracking-[0.12em]"
            style={{
              background: placement.links_tested ? P.navy : 'white',
              color: placement.links_tested ? P.cream : P.muted,
              border: `1px solid ${placement.links_tested ? P.navy : P.hair}`,
            }}
          >
            {placement.links_tested ? 'Links tested' : 'Links untested'}
          </button>
          {placement.approved_date ? (
            <span className="text-[8.5px] uppercase tracking-[0.14em]" style={{ color: P.faint }}>
              Approved {placement.approved_date}
            </span>
          ) : null}
        </div>
      </div>

      {/* Every promised surface */}
      <div className={`${DESK.card} p-4`} style={{ borderColor: P.hair }}>
        <p className={DESK.label} style={{ color: P.copper }}>
          Deliverables
        </p>
        <ul className="mt-2 space-y-2.5">
          {rows.map((row) => (
            <li key={row.key} className="border-t pt-2 first:border-t-0 first:pt-0" style={{ borderColor: P.hair }}>
              <div className="flex flex-wrap items-baseline justify-between gap-1.5">
                <p className="text-[11px] font-bold" style={{ color: P.navy }}>
                  {row.label}
                </p>
                <div className="flex gap-1">
                  {DELIVERY_STATES.map((state) => {
                    const active = (row.status || 'pending') === state.key;
                    return (
                      <button
                        key={state.key}
                        type="button"
                        onClick={() =>
                          saveDeliverables(row.key, {
                            status: state.key,
                            delivered_date:
                              state.key === 'delivered'
                                ? new Date().toISOString().slice(0, 10)
                                : row.delivered_date,
                          })
                        }
                        className="rounded-full px-2 py-1 text-[7.5px] font-bold uppercase tracking-[0.12em]"
                        style={{
                          background: active ? P.navy : 'white',
                          color: active ? P.cream : P.muted,
                          border: `1px solid ${active ? P.navy : P.hair}`,
                        }}
                      >
                        {state.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="mt-0.5 text-[10px] leading-relaxed" style={{ color: P.muted }}>
                {row.note}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  className="border bg-white px-2 py-1 text-[9.5px]"
                  style={{ borderColor: P.hair, color: P.navy }}
                  value={row.due_date || ''}
                  onChange={(event) => saveDeliverables(row.key, { due_date: event.target.value })}
                />
                <span className="text-[8.5px] uppercase tracking-[0.14em]" style={{ color: P.faint }}>
                  {row.delivered_date ? `Shipped ${row.delivered_date}` : 'Not shipped'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}