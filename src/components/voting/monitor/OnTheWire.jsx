import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { brand, ink } from '@/components/nominate/NominateConfig';

// Who is on the wire right now. One reading, taken by the function that already owns it
// (getLivePresence): the accounts that have beaten inside three minutes, and the campus's
// own room presence. Nothing is stored twice and nothing is counted here — this panel only
// prints what that reading returns.
const READ_MS = 45000;

const commas = (value) => Math.round(Number(value) || 0).toLocaleString('en-US');
const clock = (value) =>
  new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

export default function OnTheWire() {
  const [reading, setReading] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;

    const read = async () => {
      try {
        const response = await base44.functions.invoke('getLivePresence', {});
        if (!live) return;
        setReading(response?.data || null);
        setFailed(false);
      } catch (error) {
        if (live) setFailed(true);
      }
    };

    read();
    const timer = setInterval(() => { if (!document.hidden) read(); }, READ_MS);
    return () => { live = false; clearInterval(timer); };
  }, []);

  const online = reading?.people?.online ?? 0;
  const campus = reading?.campus?.total ?? 0;
  const rooms = reading?.campus?.rooms || [];
  const quiet = !online && !campus;

  const line = failed
    ? 'The wire could not be read. It will be asked again shortly.'
    : !reading
      ? 'Asking the building…'
      : quiet
        ? 'The building is quiet: nobody signed in, nobody on the floor.'
        : `${commas(online)} signed in across the last three minutes; ${
            campus ? `${commas(campus)} standing on the floor in ${rooms.length} room${rooms.length === 1 ? '' : 's'}` : 'the floor is empty'
          }.`;

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[8px] font-bold uppercase tracking-[0.24em]" style={{ color: ink.label }}>
          On the wire
        </p>
        <span className="flex shrink-0 items-center gap-1">
          <span
            className={`h-1.5 w-1.5 rounded-full ${failed ? '' : 'animate-pulse'}`}
            style={{ background: failed ? 'rgb(var(--editorial-copper-rgb))' : '#6FBF8B' }}
          />
          <span className="text-[6.5px] font-bold uppercase tracking-[0.12em]" style={{ color: ink.soft }}>
            {failed ? 'Stalled' : 'Live'}
          </span>
          {reading?.readAt && (
            <span className="text-[6.5px] tabular-nums" style={{ color: ink.soft }}>
              · {clock(reading.readAt)}
            </span>
          )}
        </span>
      </div>

      <div className="mt-1.5 grid grid-cols-2">
        <div className="pr-2">
          <p className="text-[6.5px] font-bold uppercase tracking-[0.14em]" style={{ color: ink.soft }}>
            Signed in
          </p>
          <p className="mt-0.5 font-heading text-[22px] leading-none" style={{ color: brand.navy }}>
            {reading ? commas(online) : '—'}
          </p>
          <p className="mt-0.5 text-[7px]" style={{ color: ink.soft }}>
            last 3 min
          </p>
        </div>
        <div className="pl-2" style={{ borderLeft: '1px solid rgb(var(--editorial-sand-rgb))' }}>
          <p className="text-[6.5px] font-bold uppercase tracking-[0.14em]" style={{ color: ink.soft }}>
            On campus
          </p>
          <p className="mt-0.5 font-heading text-[22px] leading-none" style={{ color: brand.navy }}>
            {reading ? commas(campus) : '—'}
          </p>
          <p className="mt-0.5 text-[7px]" style={{ color: ink.soft }}>
            on the floor
          </p>
        </div>
      </div>

      <p className="mt-1.5 text-[7.5px] leading-relaxed" style={{ color: ink.soft }}>
        {line}
      </p>
    </div>
  );
}