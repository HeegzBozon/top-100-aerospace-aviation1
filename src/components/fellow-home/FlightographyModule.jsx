import { B } from './fellowHomeConfig';
import NomineeCareerHistorySection from '@/components/profile/NomineeCareerHistorySection';
import NomineeContributionsSection from '@/components/profile/NomineeContributionsSection';
import ResearchStatsCard from '@/components/profile/ResearchStatsCard';
import FlightographyAttendance from './FlightographyAttendance';

// The credential. Foundation, not headline — renders below the fold.
export default function FlightographyModule({ nominee, user, accent, onNomineeUpdate, onUserUpdate }) {
  return (
    <section className="space-y-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>
        Flightography
      </p>

      {!nominee ? (
        <div className="rounded-2xl px-5 py-6" style={{ background: '#fff', border: `1px dashed ${B.border}` }}>
          <p className="text-sm font-semibold" style={{ color: B.navy }}>
            Your Flightography has not been opened yet.
          </p>
          <p className="text-xs mt-1" style={{ color: B.muted }}>
            Once your record is established, career history and verified contributions render here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <FlightographyAttendance fellowEmail={nominee?.nominee_email || user?.email} accent={accent} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <NomineeCareerHistorySection nominee={nominee} />
            <div className="space-y-4">
              <ResearchStatsCard
                nominee={nominee}
                user={user}
                onNomineeUpdate={onNomineeUpdate}
                onUserUpdate={onUserUpdate}
              />
              <NomineeContributionsSection nomineeId={nominee.id} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}