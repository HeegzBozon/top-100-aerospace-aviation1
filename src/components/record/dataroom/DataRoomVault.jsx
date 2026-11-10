import { useEffect, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { ROOM_AUDIENCES, filedCount, kindLabel, roomAudience } from './dataRoomConfig';
import DataRoomComposer from './DataRoomComposer';
import DataRoomFile from './DataRoomFile';

// The data room: four directories, one record.
//
// A room is opened by a reader with a question, so it is filed by reader rather than by
// file type — the founder's folder, the investor's, the employer's, the employee's. Each
// tab is one reader's index: what is filed for them, and what is still missing.
export default function DataRoomVault({ email }) {
  const [audienceKey, setAudienceKey] = useState(ROOM_AUDIENCES[0].key);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [composing, setComposing] = useState(false);

  useEffect(() => {
    if (!email) {
      setStatus('ready');
      return undefined;
    }
    let active = true;
    (async () => {
      try {
        const page = await base44.entities.DataRoomItem.filter(
          { fellow_email: email },
          { sort: '-created_date', limit: 200 },
        );
        if (!active) return;
        setItems(page?.items || []);
        setStatus('ready');
      } catch (err) {
        if (!active) return;
        setError(err?.message || '');
        setStatus('error');
      }
    })();
    return () => {
      active = false;
    };
  }, [email]);

  const audience = roomAudience(audienceKey);
  const filed = items.filter((item) => item.audience === audienceKey);

  const filed_row = (row) => {
    setItems((current) => [row, ...current]);
    setStatus('ready');
  };

  const remove = async (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
    await base44.entities.DataRoomItem.delete(id).catch(() => {});
  };

  return (
    <div className="mt-8">
      <p className="pd-label">The data room</p>
      <p className="mt-2 max-w-xl font-body text-[12px] leading-relaxed text-editorial-navy/65">
        Four directories, one record. Each is filed for the reader who opens it — what they
        ask for, answered before they ask.
      </p>

      <div
        role="tablist"
        aria-label="Data room directories"
        className="mt-4 flex items-stretch gap-1 border border-editorial-copper/30 bg-editorial-cream p-1"
      >
        {ROOM_AUDIENCES.map((entry) => {
          const on = entry.key === audienceKey;
          const count = filedCount(items, entry.key);
          return (
            <button
              key={entry.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => {
                setAudienceKey(entry.key);
                setComposing(false);
              }}
              className={`min-h-9 flex-1 px-1 font-body text-[9.5px] font-bold uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper ${
                on
                  ? 'bg-editorial-navy text-editorial-cream'
                  : 'text-editorial-navy/60 hover:bg-editorial-sand/70 hover:text-editorial-navy'
              }`}
            >
              {entry.label}
              <span className={`ml-1 tabular-nums ${on ? 'text-editorial-cream/60' : 'text-editorial-navy/40'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 max-w-xl font-body text-[11.5px] leading-relaxed text-editorial-navy/60">
        {audience.hint}
      </p>

      {status === 'loading' && (
        <div className="mt-4 flex items-center gap-2 font-body text-[11.5px] text-editorial-navy/50">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading the room
        </div>
      )}

      {status === 'error' && (
        <p className="mt-4 font-body text-[11.5px] leading-relaxed text-editorial-navy/60">
          The room could not be read just now. Nothing filed has been lost.
          {error ? ` (${error})` : ''}
        </p>
      )}

      {status === 'ready' && filed.length === 0 && (
        <div className="mt-4 border border-dashed border-editorial-navy/20 px-4 py-5">
          <p className="font-heading text-[16px] leading-snug text-editorial-navy">
            The {audience.label.toLowerCase()} folder is empty.
          </p>
          <p className="mt-1.5 max-w-md font-body text-[11.5px] leading-relaxed text-editorial-navy/55">
            A {audience.label.toLowerCase()} opens it for{' '}
            {audience.kinds.map((kind) => kindLabel(kind).toLowerCase()).join(', ')}. File the
            first and the room has its opening page.
          </p>
        </div>
      )}

      {filed.length > 0 && (
        <ul className="mt-3 border-t border-editorial-navy/10">
          {filed.map((item) => (
            <DataRoomFile key={item.id} item={item} onRemove={remove} />
          ))}
        </ul>
      )}

      {composing ? (
        <DataRoomComposer
          email={email}
          audienceKey={audienceKey}
          onFiled={filed_row}
          onClose={() => setComposing(false)}
        />
      ) : (
        <button type="button" onClick={() => setComposing(true)} className="desk-key mt-4">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          File a document
        </button>
      )}

      <p className="mt-4 max-w-lg font-body text-[11px] leading-relaxed text-editorial-navy/45">
        Filed privately on your record. Nothing here is published to your public profile, and
        nothing here is read by discovery, ordering, influence tier or measurement.
      </p>
    </div>
  );
}