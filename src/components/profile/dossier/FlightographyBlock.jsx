import FlightographyAttendance from '@/components/fellow-home/FlightographyAttendance';
import ResearchStatsCard from '@/components/profile/ResearchStatsCard';
import NomineeContributionsSection from '@/components/profile/NomineeContributionsSection';
import DossierEmpty from '@/components/profile/essentials/DossierEmpty';

// Flightography: the credential, carried over from the home surface. Verified
// attendance, the numbers a Fellow can put their name to, and the contributions on
// record. Reads the canonical record — nothing here is scored, ordered or featured.
export default function FlightographyBlock({ nominee, user, accent }) {
  if (!nominee?.id) {
    return (
      <DossierEmpty>
        Your Flightography opens once your record is established. Everything above is
        already yours to edit.
      </DossierEmpty>
    );
  }

  return (
    <div className="space-y-5">
      <FlightographyAttendance fellowEmail={nominee?.nominee_email || user?.email} accent={accent} />
      <ResearchStatsCard nominee={nominee} user={user} />
      <NomineeContributionsSection nomineeId={nominee.id} />
    </div>
  );
}