import { useEffect, useState } from 'react';
import { Clock, ExternalLink, MapPin, Radio, Rocket } from 'lucide-react';
import { THEATRE, countdownTo, pad, stampOf } from './theatreConfig';

function Segment({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-heading text-2xl leading-none tabular-nums" style={{ color: THEATRE.ink }}>
        {pad(value)}
      </span>
      <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: THEATRE.gold }}>
        {label}
      </span>
    </div>
  );
}

// The bill for the mission on the pad: what is flying, from where, and how long there is.
export default function TheatreBill({ launch }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!launch) return null;

  const count = countdownTo(launch.net, now);
  const live = count?.past;
  const go = launch.status?.abbrev === 'Go';
  const provider = launch.launch_service_provider?.name || null;
  const rocket = launch.rocket?.configuration?.name || null;
  const place = launch.pad?.location?.name || launch.pad?.name || null;
  const extra = (launch.vidURLs || []).filter((v) => v?.url && !/youtu/.test(v.url));

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em]"
          style={{ background: 'rgba(201,168,124,0.16)', color: THEATRE.gold, border: `1px solid ${THEATRE.line}` }}
        >
          {live ? 'On the air' : 'On the pad'}
        </span>
        <span
          className="rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em]"
          style={{
            background: go ? 'rgba(143,211,168,0.14)' : 'rgba(255,255,255,0.06)',
            color: go ? THEATRE.live : THEATRE.body,
            border: `1px solid ${go ? 'rgba(143,211,168,0.4)' : THEATRE.line}`,
          }}
        >
          {launch.status?.name || 'Status to be set'}
        </span>
        {live && (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: THEATRE.live }}>
            <Radio className="h-3 w-3" /> Live
          </span>
        )}
      </div>

      <h2 className="mt-2.5 font-heading text-2xl leading-tight sm:text-[28px]" style={{ color: THEATRE.ink }}>
        {launch.name}
      </h2>

      <div className="mt-3 space-y-1.5">
        {provider && (
          <p className="flex items-center gap-2 text-[13px]" style={{ color: THEATRE.body }}>
            <Rocket className="h-3.5 w-3.5 flex-shrink-0" style={{ color: THEATRE.gold }} />
            <span>{provider}{rocket ? ` · ${rocket}` : ''}</span>
          </p>
        )}
        {place && (
          <p className="flex items-center gap-2 text-[13px]" style={{ color: THEATRE.body }}>
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" style={{ color: THEATRE.gold }} />
            <span>{place}</span>
          </p>
        )}
        <p className="flex items-center gap-2 text-[13px]" style={{ color: THEATRE.body }}>
          <Clock className="h-3.5 w-3.5 flex-shrink-0" style={{ color: THEATRE.gold }} />
          <span>{stampOf(launch.net)} · your local time</span>
        </p>
      </div>

      {count && (
        <div className="mt-4">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.28em]" style={{ color: THEATRE.gold }}>
            {live ? `T+ since the pad` : 'T- to the pad'}
          </p>
          <div className="flex items-end gap-2.5">
            {count.days > 0 && (
              <>
                <Segment value={count.days} label="days" />
                <span className="pb-3 text-lg" style={{ color: THEATRE.gold }}>:</span>
              </>
            )}
            <Segment value={count.hours} label="hrs" />
            <span className="pb-3 text-lg" style={{ color: THEATRE.gold }}>:</span>
            <Segment value={count.minutes} label="min" />
            <span className="pb-3 text-lg" style={{ color: THEATRE.gold }}>:</span>
            <Segment value={count.seconds} label="sec" />
          </div>
        </div>
      )}

      {launch.mission?.description && (
        <p className="mt-4 max-w-prose text-[13px] leading-relaxed" style={{ color: THEATRE.soft }}>
          {launch.mission.description}
        </p>
      )}

      {extra.length > 0 && (
        <div className="mt-3 flex flex-col gap-1">
          {extra.map((v) => (
            <a
              key={v.url}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: THEATRE.gold }}
            >
              <Radio className="h-3 w-3" /> {v.title || 'Watch the broadcast'}
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}