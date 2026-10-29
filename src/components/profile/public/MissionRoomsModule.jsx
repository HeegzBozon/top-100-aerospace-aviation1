import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { AlertCircle, ArrowRight, Compass, Flag, Loader2, MapPin, ShieldCheck } from 'lucide-react';
import useConferenceCircle from '@/components/conference-room/useConferenceCircle';
import { disciplineLabel } from '@/components/conference-room/conferenceRoomConfig';

const range = (start, end) => {
  if (!start) return '';
  try {
    return end && end !== start
      ? `${format(parseISO(start), 'MMM d')}–${format(parseISO(end), 'MMM d, yyyy')}`
      : format(parseISO(start), 'MMM d, yyyy');
  } catch {
    return start;
  }
};

// Declared attendance and verified attendance are never stated as the same
// claim: a room the Fellow RSVP'd to reads as declared; only an independently
// verified attendance carries the mark.
function Row({ item, viewer }) {
  const place = [item.city, item.country].filter(Boolean).join(', ');
  const dates = range(item.start_date, item.end_date);

  const body = (
    <div className="grid gap-2 py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6">
      <div className="font-body text-[11px] uppercase leading-relaxed tracking-[0.12em] text-editorial-navy/55">
        {dates || 'Dates to be set'}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h4 className="font-heading text-[17px] leading-tight text-editorial-navy">{item.conference_name}</h4>
          {item.verified ? (
            <span className="inline-flex items-center gap-1 font-body text-[9px] font-bold uppercase tracking-[0.14em] text-editorial-copper">
              <ShieldCheck className="h-3 w-3" /> Verified attendance
            </span>
          ) : (
            <span className="font-body text-[9px] uppercase tracking-[0.14em] text-editorial-navy/40">
              Declared
            </span>
          )}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-[11px] text-editorial-navy/50">
          {item.conference_series && <span>{item.conference_series}</span>}
          {place && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {place}
            </span>
          )}
          {item.domain_focus && <span>{disciplineLabel(item.domain_focus)}</span>}
          {item.focus_area && <span>{item.focus_area}</span>}
          {item.volunteer && (
            <span className="inline-flex items-center gap-1 text-editorial-copper">
              <Flag className="h-3 w-3" /> Hosting
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <li className="border-b border-editorial-copper/15 last:border-0">
      {viewer?.email ? (
        <Link to={`/?board=conference&room=${item.id}`} className="block transition-colors hover:bg-editorial-sand/50">
          {body}
        </Link>
      ) : (
        body
      )}
    </li>
  );
}

function Band({ label, items, viewer, live }) {
  if (!items.length) return null;
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${live ? 'animate-pulse bg-editorial-copper' : 'bg-editorial-navy/30'}`} />
        <p className="pd-label">{label}</p>
        <span className="font-body text-[10px] text-editorial-navy/40">{items.length}</span>
      </div>
      <ul className="mt-2 border-t border-editorial-copper/20">
        {items.map((item) => (
          <Row key={`${item.id}-${item.phase}`} item={item} viewer={viewer} />
        ))}
      </ul>
    </div>
  );
}

// The Fellow's conference record across the full cycle: what they are preparing
// for, what is happening now, and what is on the record. Coordination only —
// nothing here is ever read by discovery, measurement, or scoring.
export default function MissionRoomsModule({ user, nominee, viewer }) {
  const email = user?.email || nominee?.nominee_email || nominee?.secondary_emails?.[0] || '';
  const { next, live, past, loading, error, reload } = useConferenceCircle(email);
  const empty = !loading && !error && next.length === 0 && live.length === 0 && past.length === 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-12">
        <Loader2 className="h-5 w-5 animate-spin text-editorial-navy/40" />
        <span className="font-body text-[12px] tracking-[0.08em] text-editorial-navy/50">Reading the conference record…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-editorial-copper/30 px-6 py-10 text-center">
        <AlertCircle className="mx-auto h-6 w-6 text-editorial-copper/70" strokeWidth={1.6} />
        <p className="mt-4 font-heading text-[19px] text-editorial-navy">The conference record could not be read.</p>
        <button
          type="button"
          onClick={reload}
          className="mt-3 font-body text-[10px] font-bold uppercase tracking-[0.18em] text-editorial-copper hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="border border-dashed border-editorial-copper/40 px-6 py-10 text-center">
        <Compass className="mx-auto h-6 w-6 text-editorial-copper/60" strokeWidth={1.6} />
        <p className="mt-4 font-heading text-[19px] text-editorial-navy">No mission rooms yet.</p>
        <p className="mx-auto mt-2 max-w-md font-body text-[12px] leading-relaxed text-editorial-navy/55">
          Mission Rooms sit alongside named industry events. Fellows declare attendance, organise by focus area, and
          the record outlasts the show.
        </p>
        {viewer?.email && (
          <Link
            to="/?board=conference"
            className="mt-5 inline-flex items-center gap-1.5 border border-editorial-copper/40 px-3 py-2 font-body text-[10px] font-bold uppercase tracking-[0.16em] text-editorial-copper"
          >
            Open Mission Rooms <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-9">
      <Band label="In progress" items={live} viewer={viewer} live />
      <Band label="Next" items={next} viewer={viewer} />
      <Band label="On the record" items={past} viewer={viewer} />

      {viewer?.email && (
        <Link
          to="/?board=conference"
          className="inline-flex items-center gap-1.5 self-start border border-editorial-copper/40 px-3 py-2 font-body text-[10px] font-bold uppercase tracking-[0.16em] text-editorial-copper"
        >
          Open Mission Rooms <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}