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

const DiscoveryQuestionnaire = lazy(() => import('@/pages/DiscoveryQuestionnaire'));
const OnboardingKickstarter = lazy(() => import('@/pages/OnboardingKickstarter'));
const OnboardingAdmin = lazy(() => import('@/pages/OnboardingAdmin'));
const AgentSkillRegistry     = lazy(() => import('@/pages/AgentSkillRegistry'));
const TermsOfService          = lazy(() => import('@/pages/TermsOfService'));
const Colony                  = lazy(() => import('@/pages/Colony'));
const AnalyticsDashboard      = lazy(() => import('@/pages/AnalyticsDashboard'));
const GlobalIntelligence      = lazy(() => import('@/pages/GlobalIntelligence'));
const ProfileView             = lazy(() => import('@/pages/ProfileView'));
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
const Profile = lazy(() => import('@/pages/Profile'));


const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
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
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    }>
    <Routes>
      <Route path="/" element={<HomeV2 />} />
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
      <Route path="/LaunchParty" element={
        <LayoutWrapper currentPageName="LaunchParty">
          <LaunchParty />
        </LayoutWrapper>
      } />
      <Route path="/AgentSkillRegistry" element={
        <LayoutWrapper currentPageName="AgentSkillRegistry">
          <AgentSkillRegistry />
        </LayoutWrapper>
      } />
      <Route path="/agent-skills" element={
        <LayoutWrapper currentPageName="AgentSkillRegistry">
          <AgentSkillRegistry />
        </LayoutWrapper>
      } />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/art-command-center" element={<ARTCommandCenter />} />
      <Route path="/team-manager" element={<TeamManager />} />
      <Route path="/feature-to-team-mapper" element={<FeatureToTeamMapper />} />
      <Route path="/portal" element={
        <LayoutWrapper currentPageName="AuthorityStackPortal">
          <AuthorityStackPortal />
        </LayoutWrapper>
      } />
      <Route path="/solutions" element={
        <LayoutWrapper currentPageName="Solutions">
          <Solutions />
        </LayoutWrapper>
      } />
      <Route path="/linkedin-manager" element={
        <LayoutWrapper currentPageName="LinkedInManager">
          <LinkedInManager />
        </LayoutWrapper>
      } />
      <Route path="/top100-tv-channels" element={
        <LayoutWrapper currentPageName="Top100AerospaceAviationTV">
          <Top100AerospaceAviationTV />
        </LayoutWrapper>
      } />
      <Route path="/payment-plan" element={<PaymentPlan />} />
      <Route path="/season4" element={<Season4Launch />} />
      <Route path="/artemis-2" element={
        <LayoutWrapper currentPageName="ArtemisArticle">
          <ArtemisArticle />
        </LayoutWrapper>
      } />
      <Route path="/newsletter/may-2026" element={
        <LayoutWrapper currentPageName="MonthlyNewsletterMay2026">
          <MonthlyNewsletterMay2026 />
        </LayoutWrapper>
      } />
      <Route path="/community-round" element={
        <LayoutWrapper currentPageName="CommunityRound">
          <CommunityRound />
        </LayoutWrapper>
      } />
      <Route path="/star-summit" element={
        <LayoutWrapper currentPageName="STARSummit">
          <STARSummit />
        </LayoutWrapper>
      } />
      <Route path="/artemis-mission-brief" element={<ArtemisMissionBrief />} />
      <Route path="/rooms" element={
        <LayoutWrapper currentPageName="MissionRooms">
          <MissionRooms />
        </LayoutWrapper>
      } />
      <Route path="/home-v3" element={<HomeV3 />} />
      {/* Legacy home routes → canonical / */}
      <Route path="/home-v2" element={<Navigate to="/" replace />} />
      <Route path="/Home" element={<Navigate to="/" replace />} />
      <Route path="/Landing" element={<Navigate to="/" replace />} />
      <Route path="/survey" element={<SurveyPage />} />
      <Route path="/email-preview" element={<EmailTemplatePreview />} />
      <Route path="/local-legends" element={<LocalLegends />} />
      <Route path="/local-legends-pro" element={<LocalLegendsPro />} />
      <Route path="/local-legends/apply" element={<LocalLegendsApply />} />
      <Route path="/nominate" element={<NominationForm />} />
      <Route path="/hangouts" element={<Hangouts />} />
      <Route path="/moon-joy" element={<Hangouts />} />
      <Route path="/2030-vision" element={<Vision2030 />} />
      <Route path="/play" element={<FlightSimulator />} />
      <Route path="/common-ground" element={<CommonGround />} />
      <Route path="/common-ground-sim" element={<CommonGroundSimulator />} />
      <Route path="/session-portal/*" element={<SessionPortal />} />
      <Route path="/session-portal/join/:code" element={<SessionJoin />} />
      <Route path="/my-top100" element={<Navigate to="/nominate" replace />} />
      <Route path="/top100-list/:shareCode" element={<PublicTop100List />} />
      <Route path="/archive/:seasonId" element={<SeasonArchive />} />
      <Route path="/events" element={<EventsCalendar />} />
      <Route path="/ground-control" element={<GroundControl />} />
      <Route path="/Shop" element={<Shop />} />
      <Route path="/Profile" element={<Profile />} />
      <Route path="/volume-one" element={<Navigate to="/archive/696aec2d99297cdbe96ee71e" replace />} />
      <Route path="/volume-one-men" element={<Navigate to="/archive/6a6b699d7b16a7017ce0c3c0" replace />} />
      <Route path="/volume-one-top100" element={<Navigate to="/archive/6a6b70136ccb7c358f77dd7f" replace />} />
      <Route path="/volume-two-women" element={<Navigate to="/archive/6a6b756e5c6a4773130e2511" replace />} />
      <Route path="/volume-two-men" element={<Navigate to="/archive/6a6b77cb2f46f1f0cae76d75" replace />} />
      <Route path="/volume-two-top100" element={<Navigate to="/archive/6a6b7954c924445e2599968d" replace />} />
      <Route path="/Nominations" element={<Navigate to="/nominate" replace />} />
      <Route path="/nominations" element={<Navigate to="/nominate" replace />} />
      <Route path="/top100-tv" element={
        <LayoutWrapper currentPageName="Top100TV">
          <Top100TV />
        </LayoutWrapper>
      } />
       <Route path="/Top100Women2025/:nomineeId" element={<DynamicProfilePage />} />
       <Route path="/profiles/:nomineeId" element={<DynamicProfilePage />} />
       <Route path="/profiles/:id" element={
        <LayoutWrapper currentPageName="ProfileView">
          <ProfileView />
        </LayoutWrapper>
       } />

      {/* /Profile is the profile editor — do not redirect */}
      <Route path="/PublicProfile" element={<Navigate to="/ProfileView" replace />} />
      <Route path="/Nominee" element={<Navigate to="/ProfileView" replace />} />
      <Route path="/UserProfile" element={<Navigate to="/ProfileView" replace />} />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
  );
};


// Prevent iOS Safari auto-zoom on input focus by enforcing maximum-scale=1
if (typeof document !== 'undefined') {
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta) {
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  }
}

function App() {
  // Force HMR cache clear
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <NavigationTracker />
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