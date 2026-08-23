import FlightographyModule from '@/components/fellow-home/FlightographyModule';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Flightography slide — career history, verified attendance, research
// contributions. Renders below the fold in the scroll profile; here it gets
// its own full-bleed canvas. Reuses the existing module to preserve its
// internal data-fetching and rendering logic.
export default function FlightographySlide({ nominee, user, accent, onNomineeUpdate, onUserUpdate }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-y-auto" style={{ background: B.cream }}>
      <div className="w-full max-w-4xl px-6 py-20">
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: B.muted }}>
            Flightography
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
            The record
          </h2>
        </div>

        <FlightographyModule
          nominee={nominee}
          user={user}
          accent={accent}
          onNomineeUpdate={onNomineeUpdate}
          onUserUpdate={onUserUpdate}
        />
      </div>
    </section>
  );
}