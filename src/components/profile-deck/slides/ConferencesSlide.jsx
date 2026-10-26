import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { AlertCircle, ArrowRight, CalendarDays, Compass, Flag, Loader2, MapPin, Radio, ShieldCheck } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { disciplineLabel, domainAccent } from '@/components/conference-room/conferenceRoomConfig';
import useConferenceCircle from '@/components/conference-room/useConferenceCircle';

// Mission Rooms — the Fellow's conference participation across the full cycle.
// The record is the point: what they are preparing for, what is happening now,
// and what they verified attending. Declared attendance and verified attendance
// are never rendered as the same claim.
const range = (start, end) => {
  if (!start) return '';
  try {
    return end && end !== start
      ? `${format(parseISO(start), 'MMM d')}–${format(parseISO(end), 'MMM d, yyyy')}`
      : format(parseISO(start), 'MMM d, yyyy');
  } catch { return start; }
};

function Row({ item, accent, viewer }) {
  const color = domainAccent(item.domain_focus);
  const place = [item.city, item.country].filter(Boolean).join(', ');
  const dates = range(item.start_date, item.end_date);

  const body = (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: color }}>
          {item.conference_series || 'Industry event'}
        </span>
        {item.verified && (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: B.gold }}>
            <ShieldCheck className="w-3 h-3" /> Verified attendance
          </span>
        )}
        {!item.verified && item.phase === 'done' && (
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em]" style={{ color: B.muted }}>Declared</span>
        )}
      </div>
      <h4 className="text-sm font-bold leading-snug mt-0.5" style={{ color: B.navy }}>{item.conference_name}</h4>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[10px]" style={{ color: B.muted }}>
        {dates && <span className="inline-flex items-center gap-1"><CalendarDays className="w-3 h-3" />{dates}</span>}
        {place && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{place}</span>}
        {item.domain_focus && <span>{disciplineLabel(item.domain_focus)}</span>}
      </div>
      {(item.focus_area || item.volunteer) && (
        <div className="flex items-center gap-2 mt-1.5">
          {item.focus_area && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${color}12`, color: color }}>{item.focus_area}</span>
          )}
          {item.volunteer && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: accent }}>
              <Flag className="w-3 h-3" /> Hosting
            </span>
          )}
        </div>
      )}
    </>
  );

  return (
    <li className="rounded-xl overflow-hidden" style={{ background: '#fff', border: `1px solid ${B.border}`, borderLeft: `3px solid ${color}` }}>
      {viewer?.email ? (
        <Link to={`/?board=conference&room=${item.id}`} className="block p-3 hover:opacity-90 transition-opacity">{body}</Link>
      ) : (
        <div className="p-3">{body}</div>
      )}
    </li>
  );
}

function Band({ label, dot, items, accent, viewer, pulse }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${pulse ? 'animate-pulse' : ''}`} style={{ background: dot }} />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: B.navy }}>{label}</p>
        <span className="text-[10px]" style={{ color: B.muted }}>{items.length}</span>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((item) => <Row key={`${item.id}-${item.phase}`} item={item} accent={accent} viewer={viewer} />)}
      </ul>
    </div>
  );
}

export default function ConferencesSlide({ user, nominee, viewer, accent }) {
  const email = user?.email || nominee?.nominee_email || nominee?.secondary_emails?.[0] || '';
  const { next, live, past, loading, error, reload } = useConferenceCircle(email);
  const empty = !loading && !error && next.length === 0 && live.length === 0 && past.length === 0;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-y-auto" style={{ background: B.cream }}>
      <div className="w-full max-w-3xl px-6 pt-20 pb-36">
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: B.muted }}>
            Mission Rooms
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
            Where the work meets
          </h2>
          <p className="text-xs mt-3 max-w-md mx-auto leading-relaxed" style={{ color: B.muted }}>
            Industry events this Fellow is preparing for, attending now, and on the record for.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: B.muted }} />
            <p className="text-xs" style={{ color: B.muted }}>Loading conference record…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
            <AlertCircle className="w-6 h-6" style={{ color: B.muted }} />
            <p className="text-sm font-semibold" style={{ color: B.navy }}>Couldn't load the conference record.</p>
            <button onClick={reload} className="text-xs font-semibold" style={{ color: accent }}>Try again</button>
          </div>
        ) : empty ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <Compass className="w-8 h-8" style={{ color: accent }} />
            <p className="text-sm font-bold" style={{ color: B.navy }}>No conference rooms yet.</p>
            <p className="text-xs max-w-sm leading-relaxed" style={{ color: B.muted }}>
              Conference Rooms sit alongside named industry events. Fellows declare attendance, self-organize by focus area, and the record outlasts the show.
            </p>
            {viewer?.email && (
              <Link
                to="/?board=conference"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{ background: accent, color: '#fff' }}
              >
                Open Mission Rooms <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-7">
            <Band label="In progress" dot={B.gold} items={live} accent={accent} viewer={viewer} pulse />
            <Band label="Next" dot={accent} items={next} accent={accent} viewer={viewer} />
            <Band label="On the record" dot={B.muted} items={past} accent={accent} viewer={viewer} />

            {viewer?.email && (
              <Link
                to="/?board=conference"
                className="self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{ background: `${accent}10`, color: accent, border: `1px solid ${accent}33` }}
              >
                Open Mission Rooms <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}