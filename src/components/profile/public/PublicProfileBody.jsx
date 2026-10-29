import { resolveSlideOrder } from '@/components/profile-deck/slideDeckConfig';
import { hasIntent } from '@/components/profile/intent/intentConfig';
import ProfileSection from './ProfileSection';
import EditorialModule from './EditorialModule';
import DocumentsModule from './DocumentsModule';
import EightModule from './EightModule';
import MissionRoomsModule from './MissionRoomsModule';
import ViralPostSpread from './ViralPostSpread';
import OpportunitySection from './OpportunitySection';
import FlightographyModule from '@/components/fellow-home/FlightographyModule';

const numeral = (i) => String(i + 1).padStart(2, '0');

// The record below the credential. Identity and verification are structural and
// always hold positions one and two, so they are drawn above this and never
// appear in the Fellow's order. Everything after them follows the Fellow's own
// ordering — availability sits directly behind the credential, and Flightography
// falls below the fold because the credential is the foundation, not the headline.
export default function PublicProfileBody({
  profiles,
  settings,
  accent,
  viewer,
  top100,
  featuredViral,
  onEnquire,
  onDossier,
}) {
  const { user, nominee } = profiles;
  const eightPublic = !!settings && settings.eight_public !== false;

  const keys = [];
  if (hasIntent(settings)) keys.push('opportunity');
  for (const key of resolveSlideOrder(settings)) {
    if (key === 'identity' || key === 'verification') continue;
    if (key === 'eight' && !eightPublic) continue;
    if (key === 'viral_post' && !featuredViral) continue;
    keys.push(key);
  }

  const render = {
    opportunity: (index) => (
      <OpportunitySection
        key="opportunity"
        index={index}
        nominee={nominee}
        settings={settings}
        onEnquire={onEnquire}
        onDossier={onDossier}
      />
    ),
    blurb: (index) => (
      <ProfileSection
        key="blurb"
        index={index}
        label="Editorial"
        title="In their own words"
        note="The Fellow's own account, set in their own phrasing."
      >
        <EditorialModule user={user} settings={settings} />
      </ProfileSection>
    ),
    documents: (index) => (
      <ProfileSection
        key="documents"
        index={index}
        label="Materials"
        title="What they have on file"
        note="Placed by the Fellow themselves, and reused across every enquiry."
      >
        <DocumentsModule user={user} />
      </ProfileSection>
    ),
    eight: (index) => (
      <ProfileSection
        key="eight"
        index={index}
        label="Affiliation"
        title="The Eight"
        note="Eight names, in order. Position one reads as position one."
      >
        <EightModule rankings={top100.rankings} loading={top100.loading} />
      </ProfileSection>
    ),
    flightography: (index) => (
      <ProfileSection
        key="flightography"
        index={index}
        label="Flightography"
        title="The record"
        note="Career, contributions, and verified attendance."
      >
        <FlightographyModule nominee={nominee} user={user} accent={accent} hideLabel />
      </ProfileSection>
    ),
    conferences: (index) => (
      <ProfileSection
        key="conferences"
        index={index}
        label="Mission Rooms"
        title="Where the work meets"
        note="Industry events this Fellow is preparing for, attending now, and on the record for."
      >
        <MissionRoomsModule user={user} nominee={nominee} viewer={viewer} />
      </ProfileSection>
    ),
    viral_post: () => <ViralPostSpread key="viral_post" spread={featuredViral} />,
  };

  if (!keys.length) return null;

  return (
    <div className="bg-editorial-cream">{keys.map((key, i) => render[key]?.(numeral(i)))}</div>
  );
}