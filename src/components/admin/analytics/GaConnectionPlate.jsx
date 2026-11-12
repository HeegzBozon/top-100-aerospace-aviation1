import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

// The link to GA4, read as an instrument: a lamp, the property it is pointed at, and one
// key that asks again. The desk reports nothing until this reads live, so the state is
// never decorative — it says exactly what to fix.
//
// A connection can be live and still enumerate no property (the Admin API only lists the
// ones the connected identity can administer). The property id can then be pinned by hand
// and read straight from the Data API, which answers for anyone allowed to report on it.
export default function GaConnectionPlate({
  state,
  property,
  properties,
  reason,
  stream,
  onSelect,
  onApply,
  onRefresh,
}) {
  const [draft, setDraft] = useState('');
  const pinned = Boolean(property?.name) && !properties?.some((item) => item.name === property.name);

  const lamp =
    state === 'live' ? (
      <span className="desk-lamp" aria-hidden="true" />
    ) : (
      <span
        className={`h-2 w-2 flex-none rounded-full ${
          state === 'loading' ? 'bg-editorial-gold/60' : 'bg-editorial-copper'
        }`}
        aria-hidden="true"
      />
    );

  const line =
    state === 'loading'
      ? 'Checking the connection…'
      : state === 'live'
        ? property?.displayName || 'Connected · no property'
        : 'Not connected';

  return (
    <div className="desk-plate px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {lamp}
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-editorial-gold">
              Google Analytics
            </p>
            <p className="truncate text-[12px] leading-snug text-editorial-cream/85">{line}</p>
            {stream?.measurementId && (
              <p className="truncate text-[10px] leading-relaxed tracking-[0.06em] text-editorial-cream/45">
                {stream.measurementId}
                <span className="text-editorial-cream/25"> · </span>
                stream {stream.streamId}
                <span className="text-editorial-cream/25"> · </span>
                {stream.containerId}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {properties?.length > 1 && (
            <label className="flex items-center gap-2">
              <span className="sr-only">GA4 property</span>
              <select
                value={property?.name || ''}
                onChange={(event) => onSelect?.(event.target.value)}
                className="h-8 border border-editorial-gold/40 bg-transparent px-2 text-[11px] text-editorial-cream focus:outline-none focus-visible:ring-1 focus-visible:ring-editorial-gold"
              >
                {properties.map((item) => (
                  <option key={item.name} value={item.name} className="text-editorial-navy">
                    {item.displayName}
                  </option>
                ))}
              </select>
            </label>
          )}
          {pinned && (
            <button type="button" onClick={() => onApply?.('')} className="desk-key desk-key-quiet">
              Clear pin
            </button>
          )}
          <button type="button" onClick={onRefresh} className="desk-key">
            <RefreshCw className="h-3 w-3" aria-hidden="true" />
            Test link
          </button>
        </div>
      </div>

      {state === 'down' && (
        <p className="mt-2.5 border-t border-editorial-gold/20 pt-2.5 text-[11px] leading-relaxed text-editorial-cream/65">
          Authorize the Google Analytics connector under Integrations, then test the link
          again. The audience and route figures stay blank until the property can be read;
          patron delivery is counted on the house's own ledger and is unaffected.
        </p>
      )}

      {state === 'live' && property && properties?.length > 0 && stream && !stream.matched && (
        <p className="mt-2.5 border-t border-editorial-gold/20 pt-2.5 text-[11px] leading-relaxed text-editorial-cream/65">
          None of the properties this connection can see carries stream {stream.measurementId}.
          The figures above are read from {property.displayName || property.name}, which may be
          another stream in the same account.
        </p>
      )}

      {state === 'live' && !property && (
        <div className="mt-2.5 border-t border-editorial-gold/20 pt-2.5">
          <p className="max-w-2xl text-[11px] leading-relaxed text-editorial-cream/65">
            {reason ||
              'The connection is live but no GA4 property is visible to it. Authorize the connector with the account that owns the property, or pin the numeric property id below.'}
          </p>
          <form
            className="mt-2 flex flex-wrap items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (draft.trim()) onApply?.(draft.trim());
              setDraft('');
            }}
          >
            <label className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-editorial-cream/50">
                Property id
              </span>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                inputMode="numeric"
                placeholder="e.g. 123456789"
                className="h-8 w-36 border border-editorial-gold/40 bg-transparent px-2 text-[11px] text-editorial-cream placeholder:text-editorial-cream/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-editorial-gold"
              />
            </label>
            <button type="submit" className="desk-key desk-key-primary">
              Pin property
            </button>
          </form>
        </div>
      )}
    </div>
  );
}