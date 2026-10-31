import './App.css'
import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ErrorBoundary from '@/components/core/ErrorBoundary';
import HandheldShell from '@/components/handheld/HandheldShell';
import DesktopShell from '@/components/desktop/DesktopShell';
import AppSplash from '@/components/core/AppSplash';
import ConsoleLoading from '@/components/core/ConsoleLoading';
import PageTurn from '@/components/core/PageTurn';
import SurfaceLoader from '@/components/core/SurfaceLoader';
import MachineProviders from '@/components/core/MachineProviders';

const DiscoveryQuestionnaire = lazy(() => import('@/pages/DiscoveryQuestionnaire'));
const OnboardingKickstarter = lazy(() => import('@/pages/OnboardingKickstarter'));
const OnboardingAdmin = lazy(() => import('@/pages/OnboardingAdmin'));
const AgentSkillRegistry     = lazy(() => import('@/pages/AgentSkillRegistry'));
const TermsOfService          = lazy(() => import('@/pages/TermsOfService'));
const Colony                  = lazy(() => import('@/pages/Colony'));
const AnalyticsDashboard      = lazy(() => import('@/pages/AnalyticsDashboard'));
const GlobalIntelligence      = lazy(() => import('@/pages/GlobalIntelligence'));
const ProfileView             = lazy(() => import('@/pages/ProfileView'));
const ScannedCard             = lazy(() => import('@/pages/ScannedCard'));
const ConferenceBadge         = lazy(() => import('@/pages/ConferenceBadge'));
const ARTCommandCenter        = lazy(() => import('@/pages/ARTCommandCenter'));
const TeamManager             = lazy(() => import('@/pages/TeamManager'));
const FeatureToTeamMapper     = lazy(() => import('@/pages/FeatureToTeamMapper'));
const DynamicProfilePage      = lazy(() => import('@/pages/DynamicProfilePage'));
const AuthorityStackPortal    = lazy(() => import('@/pages/AuthorityStackPortal'));
const Solutions               = lazy(() => import('@/pages/Solutions'));
const LinkedInManager         = lazy(() => import('@/pages/LinkedInManager'));
const LaunchParty             = lazy(() => import('@/pages/LaunchParty'));
const Top100AerospaceAviationTV = lazy(() => import('@/pages/Top100AerospaceAviationTV'));
const Top100TV = lazy(() => import('@/pages/Top100TV'));
const PaymentPlan = lazy(() => import('@/pages/PaymentPlan'));
const Season4Launch = lazy(() => import('@/pages/Season4Launch'));
const ArtemisArticle = lazy(() => import('@/pages/ArtemisArticle'));
const MonthlyNewsletterMay2026 = lazy(() => import('@/pages/MonthlyNewsletterMay2026'));
const CommunityRound = lazy(() => import('@/pages/CommunityRound'));
const STARSummit = lazy(() => import('@/pages/STARSummit'));
const ArtemisMissionBrief = lazy(() => import('@/pages/ArtemisMissionBrief'));
const MissionRooms = lazy(() => import('@/pages/MissionRooms'));
const HomeV2 = lazy(() => import('@/pages/HomeV2'));
const HomeV3 = lazy(() => import('@/pages/HomeV3'));
const SurveyPage = lazy(() => import('@/pages/SurveyPage'));
const EmailTemplatePreview = lazy(() => import('@/pages/EmailTemplatePreview'));
const LocalLegends = lazy(() => import('@/pages/LocalLegends'));
const LocalLegendsPro = lazy(() => import('@/pages/LocalLegendsPro'));
const LocalLegendsApply = lazy(() => import('@/pages/LocalLegendsApply'));
const NominationForm = lazy(() => import('@/pages/NominationForm'));
const Hangouts = lazy(() => import('@/pages/Hangouts'));
const Vision2030 = lazy(() => import('@/pages/Vision2030'));
const FlightSimulator = lazy(() => import('@/pages/FlightSimulator'));
const AeroFrontier = lazy(() => import('@/pages/AeroFrontier'));
const CommonGround = lazy(() => import('@/pages/CommonGround'));
const CommonGroundSimulator = lazy(() => import('@/pages/CommonGroundSimulator'));
const SessionPortal = lazy(() => import('@/pages/SessionPortal'));
const SessionJoin = lazy(() => import('@/pages/SessionJoin'));
const MyTop100 = lazy(() => import('@/pages/MyTop100'));
const PublicTop100List = lazy(() => import('@/pages/PublicTop100List'));
const SeasonArchive = lazy(() => import('@/pages/SeasonArchive'));
const EventsCalendar = lazy(() => import('@/pages/EventsCalendar'));
const GroundControl = lazy(() => import('@/pages/GroundControl'));
const Shop = lazy(() => import('@/pages/Shop'));
const Membership = lazy(() => import('@/pages/Membership'));
const Subscribe = lazy(() => import('@/pages/Subscribe'));
const RecordWorkspace = lazy(() => import('@/pages/RecordWorkspace'));
const Rsvp = lazy(() => import('@/pages/Rsvp'));
const PlatformDevelopmentBoard = lazy(() => import('@/pages/PlatformDevelopmentBoard'));
const Meetups = lazy(() => import('@/pages/Meetups'));
const MeetupInvite = lazy(() => import('@/pages/MeetupInvite'));
const FellowEdition = lazy(() => import('@/pages/FellowEdition'));
const ViralPost2022 = lazy(() => import('@/pages/ViralPost2022'));
const ViralPost2022Featured = lazy(() => import('@/pages/ViralPost2022Featured'));
const ViralPost2026Featured = lazy(() => import('@/pages/ViralPost2026Featured'));
const ViralPost2026 = lazy(() => import('@/pages/ViralPost2026'));
const NineMonths2026 = lazy(() => import('@/pages/NineMonths2026'));
const HonoreePublication = lazy(() => import('@/pages/HonoreePublication'));
const IntelligenceGlobe = lazy(() => import('@/pages/IntelligenceGlobe'));
const MagazineStudio = lazy(() => import('@/pages/MagazineStudio'));
const MagazineReader = lazy(() => import('@/pages/MagazineReader'));
const Women2025Edition = lazy(() => import('@/pages/Women2025Edition'));
const Top100Women2025Edition = lazy(() => import('@/pages/Top100Women2025'));
const OgCardTest = lazy(() => import('@/pages/OgCardTest'));
const OgCardGenerator = lazy(() => import('@/pages/OgCardGenerator'));
const WomenCollageGenerator = lazy(() => import('@/pages/WomenCollageGenerator'));
const Top100Women2025DeepLink = lazy(() => import('@/pages/Top100Women2025DeepLink'));
const TheBoard = lazy(() => import('@/pages/TheBoard'));
const StartScreen = lazy(() => import('@/pages/StartScreen'));
const AeroSyncPeople = lazy(() => import('@/pages/AeroSyncPeople'));
const AeroSyncScan = lazy(() => import('@/pages/AeroSyncScan'));
const AeroSyncRooms = lazy(() => import('@/pages/AeroSyncRooms'));
const AeroSyncFollowing = lazy(() => import('@/pages/AeroSyncFollowing'));
const AeroSyncTitle = lazy(() => import('@/pages/AeroSyncTitle'));
const MissionBriefing = lazy(() => import('@/pages/MissionBriefing'));
const Chamber = lazy(() => import('@/pages/Chamber'));
const ChamberPractice = lazy(() => import('@/pages/ChamberPractice'));
const AppStore = lazy(() => import('@/pages/AppStore'));
const AppStoreShelf = lazy(() => import('@/pages/AppStoreShelf'));
const PressKitStudio = lazy(() => import('@/pages/PressKitStudio'));
const PressKitPublic = lazy(() => import('@/pages/PressKitPublic'));
const Classifieds = lazy(() => import('@/pages/Classifieds'));
const Review = lazy(() => import('@/pages/Review'));


// Every surface is an application the machine runs: the shell draws the chrome and
// MachineProviders mounts the services, so a route renders its own content and nothing
// else. The legacy per-page layout (and the second chrome it drew) is retired.
const { Pages } = pagesConfig;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    // Console first: the device is painted, and the wait happens in its glass.
    return <ConsoleLoading label="Powering up" />;
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
    // For unknown/network errors, fall through and render the app anyway
  }

  // Render the main app
  return (
    <MachineProviders>
    <PageTurn>
    <Suspense fallback={<ConsoleLoading label="Loading surface" />}>
    <Routes>
      {/* Everything renders inside the device on phones; desktop is untouched. */}
      <Route element={<HandheldShell />}>
      {/* A desk is housed in the desk machine: everything below renders inside its tube */}
      <Route element={<DesktopShell />}>
      {/* Everyone opens on the start screen: the surfaces a Fellow is entitled to, and
          the way in for whoever is not one yet — the same machine either way. */}
      <Route path="/" element={<StartScreen />} />
      <Route path="/start" element={<StartScreen />} />
      {/* Review: the orientation, a Fellow's own record and the archive, read as one
          surface with three tabs rather than three keys on the title screen. */}
      <Route path="/review" element={<Review />} />
      <Route path="/DiscoveryQuestionnaire" element={<DiscoveryQuestionnaire />} />
      <Route path="/onboarding" element={<OnboardingKickstarter />} />
      <Route path="/onboarding-admin" element={<OnboardingAdmin />} />
      <Route path="/OnboardingKickstarter" element={<OnboardingKickstarter />} />
      <Route path="/discovery" element={<DiscoveryQuestionnaire />} />
      <Route path="/Colony" element={<Colony />} />
      <Route path="/colony" element={<Colony />} />
      <Route path="/AnalyticsDashboard" element={<AnalyticsDashboard />} />
      <Route path="/analytics" element={<AnalyticsDashboard />} />
      <Route path="/GlobalIntelligence" element={<GlobalIntelligence />} />
      <Route path="/global-intelligence" element={<GlobalIntelligence />} />
      <Route path="/TermsOfService" element={<TermsOfService />} />
      <Route path="/LaunchParty" element={<LaunchParty />} />
      <Route path="/AgentSkillRegistry" element={<AgentSkillRegistry />} />
      <Route path="/agent-skills" element={<AgentSkillRegistry />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/art-command-center" element={<ARTCommandCenter />} />
      <Route path="/team-manager" element={<TeamManager />} />
      <Route path="/feature-to-team-mapper" element={<FeatureToTeamMapper />} />
      <Route path="/portal" element={<AuthorityStackPortal />} />
      <Route path="/solutions" element={<Solutions />} />
      <Route path="/linkedin-manager" element={<LinkedInManager />} />
      <Route path="/top100-tv-channels" element={<Top100AerospaceAviationTV />} />
      <Route path="/payment-plan" element={<PaymentPlan />} />
      <Route path="/season4" element={<Season4Launch />} />
      <Route path="/artemis-2" element={<ArtemisArticle />} />
      <Route path="/newsletter/may-2026" element={<MonthlyNewsletterMay2026 />} />
      <Route path="/community-round" element={<CommunityRound />} />
      <Route path="/star-summit" element={<STARSummit />} />
      <Route path="/artemis-mission-brief" element={<ArtemisMissionBrief />} />
      <Route path="/rooms" element={<MissionRooms />} />
      <Route path="/home-v3" element={<HomeV3 />} />
      {/* The member's map of the platform: four columns across, depth inside each */}
      <Route path="/board" element={<TheBoard />} />
      <Route path="/dashboard" element={<TheBoard />} />
      {/* AeroSync opens on its own title screen, the way the platform does, and the
          surfaces it lists live beneath it */}
      <Route path="/aerosync" element={<AeroSyncTitle />} />
      <Route path="/aerosync/scan" element={<AeroSyncScan />} />
      <Route path="/aerosync/people" element={<AeroSyncPeople />} />
      {/* The rolodex and the following ledger are one surface now, and the capture is
          the Scan surface: the old addresses land on the People they belong to. */}
      <Route path="/aerosync/contacts" element={<Navigate to="/aerosync/people" replace />} />
      <Route path="/aerosync/rooms" element={<AeroSyncRooms />} />
      <Route path="/aerosync/following" element={<AeroSyncFollowing />} />
      {/* The networking page is retired: its work lives on AeroSync's surfaces now */}
      <Route path="/networking" element={<Navigate to="/aerosync" replace />} />
      {/* The onboarding sequence: why, who, what, when, where, how — then the record */}
      <Route path="/mission-briefing" element={<MissionBriefing />} />
      {/* The Chamber of Commerce: the house's trading floor, with the App Store and the
          Gift Shop as its two counters */}
      <Route path="/chamber" element={<Chamber />} />
      {/* The house's own practices — consulting, the creative agency, the incubator */}
      <Route path="/chamber/:practice" element={<ChamberPractice />} />
      {/* The App Store: micro-tools, each doing one job and handing back an artifact */}
      <Route path="/app-store" element={<AppStore />} />
      <Route path="/app-store/shelf" element={<AppStoreShelf />} />
      {/* The Gift Shop: the house's own objects, under the name the Chamber gives it */}
      <Route path="/gift-shop" element={<Shop />} />
      <Route path="/press-kit" element={<PressKitStudio />} />
      <Route path="/press-kit/:shareCode" element={<PressKitPublic />} />
      {/* The board: positions, mandates and the open desk, put up by Fellows. Read as a
          classified page — the old desk's address lands on it. */}
      <Route path="/classifieds" element={<Classifieds />} />
      <Route path="/talent-desk" element={<Navigate to="/classifieds" replace />} />
      <Route path="/the-board" element={<TheBoard />} />
      {/* Legacy home routes → canonical / */}
      <Route path="/home-v2" element={<Navigate to="/" replace />} />
      <Route path="/Home" element={<Navigate to="/" replace />} />
      <Route path="/Landing" element={<Navigate to="/" replace />} />
      <Route path="/survey" element={<SurveyPage />} />
      <Route path="/email-preview" element={<EmailTemplatePreview />} />
      <Route path="/local-legends" element={<LocalLegends />} />
      <Route path="/local-legends-pro" element={<LocalLegendsPro />} />
      <Route path="/local-legends/apply" element={<LocalLegendsApply />} />
      <Route path="/selection-committee" element={<NominationForm />} />
      <Route path="/nominate" element={<Navigate to="/selection-committee" replace />} />
      <Route path="/hangouts" element={<Hangouts />} />
      <Route path="/moon-joy" element={<Hangouts />} />
      <Route path="/2030-vision" element={<Vision2030 />} />
      {/* The two instrument surfaces carry the 3D and charting chunks. Each waits in
          place, inside the frame already standing, rather than handing the glass back
          to the boot console. */}
      <Route path="/play" element={
        <Suspense fallback={<SurfaceLoader label="Preparing the simulator" />}>
          <FlightSimulator />
        </Suspense>
      } />
      {/* Aero-Frontier: the inherited airfield, the airframe, and the first circuit */}
      <Route path="/aero-frontier" element={<AeroFrontier />} />
      <Route path="/common-ground" element={<CommonGround />} />
      <Route path="/common-ground-sim" element={<CommonGroundSimulator />} />
      <Route path="/session-portal/*" element={<SessionPortal />} />
      <Route path="/session-portal/join/:code" element={<SessionJoin />} />
      <Route path="/my-top100" element={<Navigate to="/selection-committee" replace />} />
      <Route path="/top100-list/:shareCode" element={<PublicTop100List />} />
      <Route path="/archive/:seasonId" element={<SeasonArchive />} />
      <Route path="/events" element={<EventsCalendar />} />
      <Route path="/ground-control" element={<GroundControl />} />
      <Route path="/Shop" element={<Shop />} />
      <Route path="/Membership" element={<Membership />} />
      <Route path="/subscribe" element={<Subscribe />} />
      {/* The profile page IS the record as six checklists: View, Business Card, Data
          Room, Availability, Inbox, Account. The surface is the deep link, and both
          addresses open the same workspace. */}
      <Route path="/Profile" element={<RecordWorkspace />} />
      <Route path="/record" element={<RecordWorkspace />} />
      <Route path="/rsvp" element={<Rsvp />} />
      <Route path="/volume-one" element={<Navigate to="/archive/696aec2d99297cdbe96ee71e" replace />} />
      <Route path="/volume-one-men" element={<Navigate to="/archive/6a6b699d7b16a7017ce0c3c0" replace />} />
      <Route path="/volume-one-top100" element={<Navigate to="/archive/6a6b70136ccb7c358f77dd7f" replace />} />
      <Route path="/volume-two-women" element={<Navigate to="/archive/6a6b756e5c6a4773130e2511" replace />} />
      <Route path="/volume-two-men" element={<Navigate to="/archive/6a6b77cb2f46f1f0cae76d75" replace />} />
      <Route path="/volume-two-top100" element={<Navigate to="/archive/6a6b7954c924445e2599968d" replace />} />
      <Route path="/Nominations" element={<Navigate to="/selection-committee" replace />} />
      <Route path="/nominations" element={<Navigate to="/selection-committee" replace />} />
      <Route path="/top100-tv" element={<Top100TV />} />
      <Route path="/articles/nine-months-of-2026" element={<NineMonths2026 />} />
      <Route path="/viralpost2022" element={<ViralPost2022 />} />
      <Route path="/viralpost2022/featured/:slug" element={<ViralPost2022Featured />} />
      <Route path="/viralpost2026" element={<ViralPost2026 />} />
      <Route path="/viralpost2026/featured/:slug" element={<ViralPost2026Featured />} />
      <Route path="/honoree/2021/:slugId" element={<HonoreePublication />} />
      <Route path="/intelligence-globe" element={
        <Suspense fallback={<SurfaceLoader label="Assembling the globe" />}>
          <IntelligenceGlobe />
        </Suspense>
      } />
      <Route path="/magazine-studio" element={<MagazineStudio />} />
      <Route path="/magazine/:issueId" element={<MagazineReader />} />
      {/* The title screen's TOP 100 Women 2025 key: the edition itself, resolved to the
          issue bound for it, rather than a page about the edition */}
      <Route path="/women-2025" element={<Women2025Edition />} />
      <Route path="/og-card-test" element={<OgCardTest />} />
      <Route path="/og-card-generator" element={<OgCardGenerator />} />
      <Route path="/women-collage-generator" element={<WomenCollageGenerator />} />
       {/* The edition's own entry point. Declared here, ahead of the pages loop, so it
           mounts straight into the device shells like the rest of the publication
           surfaces rather than inside the legacy comms layout. */}
       <Route path="/Top100Women2025" element={<Top100Women2025Edition />} />
       <Route path="/Top100Women2025/:year/:month/:slug" element={<Top100Women2025DeepLink />} />
       <Route path="/Top100Women2025/:year/:month/:slug/index.html" element={<Top100Women2025DeepLink />} />
       <Route path="/Top100Women2025/:nomineeId" element={<DynamicProfilePage />} />
       <Route path="/profiles/:id" element={<ProfileView />} />
       {/* The handover face of a record: where a scanned card code lands. Public, and
           answered without an account — the canonical reading stays /profiles/:id. */}
       <Route path="/card/:id" element={<ScannedCard />} />
       {/* The badge itself: worn full screen, turned over into the card it hands on */}
       <Route path="/badge" element={<ConferenceBadge />} />
       <Route path="/editions/:id" element={<FellowEdition />} />
       <Route path="/platform-board" element={<PlatformDevelopmentBoard />} />
      <Route path="/meetups" element={<Meetups />} />
      <Route path="/meetups/:eventId" element={<MeetupInvite />} />

      {/* /Profile is the profile editor — do not redirect */}
      <Route path="/PublicProfile" element={<Navigate to="/ProfileView" replace />} />
      <Route path="/Nominee" element={<Navigate to="/ProfileView" replace />} />
      <Route path="/UserProfile" element={<Navigate to="/ProfileView" replace />} />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route key={path} path={`/${path}`} element={<Page />} />
      ))}
      <Route path="*" element={<PageNotFound />} />
      </Route>
      </Route>
    </Routes>
    </Suspense>
    </PageTurn>
    </MachineProviders>
  );
};


/* iOS Safari no longer needs maximum-scale to keep from zooming into a field: every
   input, textarea and contenteditable is pinned to 16px in globals.css, which is the
   size below which Safari auto-zooms. Locking the scale also took pinch-zoom away from
   every reader, so the lock is gone and the viewport stays as the document declares it
   — a low-vision reader can magnify the page again (WCAG 1.4.4). */

function App() {
  // Force HMR cache clear
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <NavigationTracker />
            {/* The title card plays once per session, over everything */}
            <AppSplash />
            <AuthenticatedApp />
          </Router>
          <Toaster />
          <VisualEditAgent />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App