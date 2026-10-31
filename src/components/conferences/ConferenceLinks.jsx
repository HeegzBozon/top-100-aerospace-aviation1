import { ExternalLink, Ticket } from 'lucide-react';
import { B } from './conferenceConfig';

const isWeb = (value) => typeof value === 'string' && /^https?:\/\//i.test(value.trim());

// The way off the page and onto the show. TOP 100 does not stage these conferences, so the
// two doors that matter belong to the organizer: their own site, and where a Fellow registers.
// Held as plain links out — the platform never sits between a host and their own ticket desk.
export default function ConferenceLinks({ room, accent }) {
  const official = isWeb(room?.official_url) ? room.official_url.trim() : '';
  const registration = isWeb(room?.registration_url) ? room.registration_url.trim() : '';
  if (!official && !registration) return null;

  return (
    <section className="rounded-sm p-3.5" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: B.copper }}>
        From the organizer
      </p>
      <div className="mt-2 flex flex-col gap-1.5 sm:flex-row">
        {registration && (
          <a
            href={registration}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ background: accent, color: '#fff' }}
          >
            <Ticket className="h-3 w-3" /> Register for the show
          </a>
        )}
        {official && (
          <a
            href={official}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ background: '#fff', color: B.navy, border: `1px solid ${B.border}` }}
          >
            <ExternalLink className="h-3 w-3" /> Official site
          </a>
        )}
      </div>
      <p className="mt-2 text-[10px] italic leading-relaxed" style={{ color: B.muted }}>
        Registration is handled by the organizer. Attendance declared here is your standing in
        the AeroSync rooms, it is not a ticket.
      </p>
    </section>
  );
}