const METRICS = [
  ['views', 'Total views'], ['clicks', 'Evaluation clicks'],
  ['submissions', 'Completion conversions'],
];

export default function SelectionCommitteeMetrics({ data, range, loading, error }) {
  return (
    <section className="desk-plate p-4" aria-label="Selection Committee analytics" aria-busy={loading}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-editorial-gold">Selection Committee</p>
      <p className="mt-1 text-[11px] text-editorial-cream/70">
        {range ? `${range.startDate} to ${range.endDate}` : 'Report period not yet available'}
      </p>
      <div className="desk-rule my-3" />
      {error ? <p role="status" className="text-sm text-editorial-cream/80">{error}</p> : (
        <dl className="grid gap-3 sm:grid-cols-3">
          {METRICS.map(([key, label]) => (
            <div key={key} className="desk-face p-3">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-editorial-navy/70">{label}</dt>
              <dd className="mt-2 font-heading text-2xl text-editorial-navy">
                {loading ? 'Loading…' : data ? Number(data[key] || 0).toLocaleString('en-US') : 'Not available'}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {data && !loading && !error && <p className="mt-3 text-[11px] text-editorial-cream/70">
        {data.views || data.clicks || data.submissions ? 'Event totals, not unique people or a person-level funnel.' : 'No committee events reported for this period. New tracking does not backfill earlier visits.'}
        {' '}GA4-designated key events: {Number(data.keyEvents || 0).toLocaleString('en-US')}.
        {' '}Mark selection_committee_submission as a key event in GA4 to enable key-event reporting.
      </p>}
    </section>
  );
}