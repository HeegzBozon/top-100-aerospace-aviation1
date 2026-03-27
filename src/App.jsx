import './App.css'
import React, { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Lazy-load non-critical modules to reduce initial bundle
const NavigationTracker = lazy(() => import('@/lib/NavigationTracker'));
const PageNotFound = lazy(() => import('./lib/PageNotFound'));

// Explicit routes with custom configurations (excluded from pages.config to avoid circular deps)
const Home = lazy(() => import('@/pages/Home'));
const OnboardingKickstarter = lazy(() => import('@/pages/OnboardingKickstarter'));
const OnboardingAdmin = lazy(() => import('@/pages/OnboardingAdmin'));
const AgentSkillRegistry = lazy(() => import('@/pages/AgentSkillRegistry'));
const ProfileView = lazy(() => import('@/pages/ProfileView'));
const ARTCommandCenter = lazy(() => import('@/pages/ARTCommandCenter'));
const TeamManager = lazy(() => import('@/pages/TeamManager'));
const FeatureToTeamMapper = lazy(() => import('@/pages/FeatureToTeamMapper'));
const DynamicProfilePage = lazy(() => import('@/pages/DynamicProfilePage'));

// Layout disabled temporarily to test for recharts circular dependency
// const { Layout } = pagesConfig;

const LayoutWrapper = ({ children, currentPageName }) => <>{children}</>;

// Lazy load all pages individually
const About                    = lazy(() => import('@/pages/About'));
const AcceleratorHub           = lazy(() => import('@/pages/AcceleratorHub'));
const Admin                    = lazy(() => import('@/pages/Admin'));
const AdminAction              = lazy(() => import('@/pages/AdminAction'));
const AnalyticsDashboard       = lazy(() => import('@/pages/AnalyticsDashboard'));
const Arcade                   = lazy(() => import('@/pages/Arcade'));
const ArchiveLanding           = lazy(() => import('@/pages/ArchiveLanding'));
const Arena                    = lazy(() => import('@/pages/Arena'));
const Article                  = lazy(() => import('@/pages/Article'));
const Articles                 = lazy(() => import('@/pages/Articles'));
const BatchNominations         = lazy(() => import('@/pages/BatchNominations'));
const Biographer               = lazy(() => import('@/pages/Biographer'));
const Calendar                 = lazy(() => import('@/pages/Calendar'));
const ChessClub                = lazy(() => import('@/pages/ChessClub'));
const ChessGame                = lazy(() => import('@/pages/ChessGame'));
const ClaimProfile             = lazy(() => import('@/pages/ClaimProfile'));
const Colony                   = lazy(() => import('@/pages/Colony'));
const Comms                    = lazy(() => import('@/pages/Comms'));
const Demographics             = lazy(() => import('@/pages/Demographics'));
const DiscoveryQuestionnaire   = lazy(() => import('@/pages/DiscoveryQuestionnaire'));
const EditProfile              = lazy(() => import('@/pages/EditProfile'));
const EventPage                = lazy(() => import('@/pages/EventPage'));
const FactoryReset             = lazy(() => import('@/pages/FactoryReset'));
const Feedback                 = lazy(() => import('@/pages/Feedback'));
const GamesLanding             = lazy(() => import('@/pages/GamesLanding'));
const GetStarted               = lazy(() => import('@/pages/GetStarted'));
const GlobalIntelligence       = lazy(() => import('@/pages/GlobalIntelligence'));
const HelpCenter               = lazy(() => import('@/pages/HelpCenter'));
const HowWePick                = lazy(() => import('@/pages/HowWePick'));
const Huddle                   = lazy(() => import('@/pages/Huddle'));
const IntelligenceDashboard    = lazy(() => import('@/pages/IntelligenceDashboard'));
const Landing                  = lazy(() => import('@/pages/Landing'));
const Membership               = lazy(() => import('@/pages/Membership'));
const MilestoneDetail          = lazy(() => import('@/pages/MilestoneDetail'));
const MissionControl           = lazy(() => import('@/pages/MissionControl'));
const MyFavorites              = lazy(() => import('@/pages/MyFavorites'));
const Nominations              = lazy(() => import('@/pages/Nominations'));
const NomineesByDomain         = lazy(() => import('@/pages/NomineesByDomain'));
const NotFound                 = lazy(() => import('@/pages/NotFound'));
const Passport                 = lazy(() => import('@/pages/Passport'));
const PaymentCancel            = lazy(() => import('@/pages/PaymentCancel'));
const PaymentSuccess           = lazy(() => import('@/pages/PaymentSuccess'));
const PrivacyPolicy            = lazy(() => import('@/pages/PrivacyPolicy'));
const Profile                  = lazy(() => import('@/pages/Profile'));
const Publisher                = lazy(() => import('@/pages/Publisher'));
const RaisingJupiter           = lazy(() => import('@/pages/RaisingJupiter'));
const RankedChoice             = lazy(() => import('@/pages/RankedChoice'));
const Resources                = lazy(() => import('@/pages/Resources'));
const ResultsCountdown         = lazy(() => import('@/pages/ResultsCountdown'));
const Season4                  = lazy(() => import('@/pages/Season4'));
const Shop                     = lazy(() => import('@/pages/Shop'));
const SignalFeed               = lazy(() => import('@/pages/SignalFeed'));
const SpaceNews                = lazy(() => import('@/pages/SpaceNews'));
const SponsorPitch             = lazy(() => import('@/pages/SponsorPitch'));
const Sponsors                 = lazy(() => import('@/pages/Sponsors'));
const StartupDirectory         = lazy(() => import('@/pages/StartupDirectory'));
const TermsOfService           = lazy(() => import('@/pages/TermsOfService'));
const TheHangar                = lazy(() => import('@/pages/TheHangar'));
const Tips                     = lazy(() => import('@/pages/Tips'));
const Top100Nominees2025       = lazy(() => import('@/pages/Top100Nominees2025'));
const Top100OS                 = lazy(() => import('@/pages/Top100OS'));
const Top100Women2025          = lazy(() => import('@/pages/Top100Women2025'));
const TrendingSignals          = lazy(() => import('@/pages/TrendingSignals'));
const VotingHub                = lazy(() => import('@/pages/VotingHub'));

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);

  // If loading takes more than 10 seconds, show error message
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoadingPublicSettings || isLoadingAuth) {
        console.warn('[App] Loading timeout - still loading after 10 seconds');
        setLoadingTimeout(true);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [isLoadingPublicSettings, isLoadingAuth]);

  // Show loading spinner while checking app public settings or auth
  if ((isLoadingPublicSettings || isLoadingAuth) && !loadingTimeout) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If loading has timed out, show error
  if (loadingTimeout) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white p-4">
        <div className="text-center max-w-md">
          <p className="text-lg font-bold text-red-600 mb-2">Loading timeout</p>
          <p className="text-sm text-slate-600 mb-4">The page took too long to load. Check your connection and refresh.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-700"
          >
            Refresh Page
          </button>
        </div>
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
  }

  // Render the main app
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    }>
    <Routes>
      <Route path="/" element={<LayoutWrapper currentPageName="Home"><Home /></LayoutWrapper>} />
      <Route path="/About" element={<LayoutWrapper currentPageName="About"><About /></LayoutWrapper>} />
      <Route path="/AcceleratorHub" element={<LayoutWrapper currentPageName="AcceleratorHub"><AcceleratorHub /></LayoutWrapper>} />
      <Route path="/Admin" element={<LayoutWrapper currentPageName="Admin"><Admin /></LayoutWrapper>} />
      <Route path="/AdminAction" element={<LayoutWrapper currentPageName="AdminAction"><AdminAction /></LayoutWrapper>} />
      <Route path="/AnalyticsDashboard" element={<LayoutWrapper currentPageName="AnalyticsDashboard"><AnalyticsDashboard /></LayoutWrapper>} />
      <Route path="/Arcade" element={<LayoutWrapper currentPageName="Arcade"><Arcade /></LayoutWrapper>} />
      <Route path="/ArchiveLanding" element={<LayoutWrapper currentPageName="ArchiveLanding"><ArchiveLanding /></LayoutWrapper>} />
      <Route path="/Arena" element={<LayoutWrapper currentPageName="Arena"><Arena /></LayoutWrapper>} />
      <Route path="/Article" element={<LayoutWrapper currentPageName="Article"><Article /></LayoutWrapper>} />
      <Route path="/Articles" element={<LayoutWrapper currentPageName="Articles"><Articles /></LayoutWrapper>} />
      <Route path="/BatchNominations" element={<LayoutWrapper currentPageName="BatchNominations"><BatchNominations /></LayoutWrapper>} />
      <Route path="/Biographer" element={<LayoutWrapper currentPageName="Biographer"><Biographer /></LayoutWrapper>} />
      <Route path="/Calendar" element={<LayoutWrapper currentPageName="Calendar"><Calendar /></LayoutWrapper>} />
      <Route path="/ChessClub" element={<LayoutWrapper currentPageName="ChessClub"><ChessClub /></LayoutWrapper>} />
      <Route path="/ChessGame" element={<LayoutWrapper currentPageName="ChessGame"><ChessGame /></LayoutWrapper>} />
      <Route path="/ClaimProfile" element={<LayoutWrapper currentPageName="ClaimProfile"><ClaimProfile /></LayoutWrapper>} />
      <Route path="/Colony" element={<LayoutWrapper currentPageName="Colony"><Colony /></LayoutWrapper>} />
      <Route path="/Comms" element={<LayoutWrapper currentPageName="Comms"><Comms /></LayoutWrapper>} />
      <Route path="/Demographics" element={<LayoutWrapper currentPageName="Demographics"><Demographics /></LayoutWrapper>} />
      <Route path="/discovery" element={<LayoutWrapper currentPageName="DiscoveryQuestionnaire"><DiscoveryQuestionnaire /></LayoutWrapper>} />
      <Route path="/DiscoveryQuestionnaire" element={<LayoutWrapper currentPageName="DiscoveryQuestionnaire"><DiscoveryQuestionnaire /></LayoutWrapper>} />
      <Route path="/EditProfile" element={<LayoutWrapper currentPageName="EditProfile"><EditProfile /></LayoutWrapper>} />
      <Route path="/EventPage" element={<LayoutWrapper currentPageName="EventPage"><EventPage /></LayoutWrapper>} />
      <Route path="/FactoryReset" element={<LayoutWrapper currentPageName="FactoryReset"><FactoryReset /></LayoutWrapper>} />
      <Route path="/Feedback" element={<LayoutWrapper currentPageName="Feedback"><Feedback /></LayoutWrapper>} />
      <Route path="/GamesLanding" element={<LayoutWrapper currentPageName="GamesLanding"><GamesLanding /></LayoutWrapper>} />
      <Route path="/GetStarted" element={<LayoutWrapper currentPageName="GetStarted"><GetStarted /></LayoutWrapper>} />
      <Route path="/GlobalIntelligence" element={<LayoutWrapper currentPageName="GlobalIntelligence"><GlobalIntelligence /></LayoutWrapper>} />
      <Route path="/HelpCenter" element={<LayoutWrapper currentPageName="HelpCenter"><HelpCenter /></LayoutWrapper>} />
      <Route path="/HowWePick" element={<LayoutWrapper currentPageName="HowWePick"><HowWePick /></LayoutWrapper>} />
      <Route path="/Huddle" element={<LayoutWrapper currentPageName="Huddle"><Huddle /></LayoutWrapper>} />
      <Route path="/IntelligenceDashboard" element={<LayoutWrapper currentPageName="IntelligenceDashboard"><IntelligenceDashboard /></LayoutWrapper>} />
      <Route path="/Landing" element={<LayoutWrapper currentPageName="Landing"><Landing /></LayoutWrapper>} />
      <Route path="/Membership" element={<LayoutWrapper currentPageName="Membership"><Membership /></LayoutWrapper>} />
      <Route path="/MilestoneDetail" element={<LayoutWrapper currentPageName="MilestoneDetail"><MilestoneDetail /></LayoutWrapper>} />
      <Route path="/MissionControl" element={<LayoutWrapper currentPageName="MissionControl"><MissionControl /></LayoutWrapper>} />
      <Route path="/MyFavorites" element={<LayoutWrapper currentPageName="MyFavorites"><MyFavorites /></LayoutWrapper>} />
      <Route path="/Nominations" element={<LayoutWrapper currentPageName="Nominations"><Nominations /></LayoutWrapper>} />
      <Route path="/NomineesByDomain" element={<LayoutWrapper currentPageName="NomineesByDomain"><NomineesByDomain /></LayoutWrapper>} />
      <Route path="/Passport" element={<LayoutWrapper currentPageName="Passport"><Passport /></LayoutWrapper>} />
      <Route path="/PaymentCancel" element={<LayoutWrapper currentPageName="PaymentCancel"><PaymentCancel /></LayoutWrapper>} />
      <Route path="/PaymentSuccess" element={<LayoutWrapper currentPageName="PaymentSuccess"><PaymentSuccess /></LayoutWrapper>} />
      <Route path="/PrivacyPolicy" element={<LayoutWrapper currentPageName="PrivacyPolicy"><PrivacyPolicy /></LayoutWrapper>} />
      <Route path="/Profile" element={<LayoutWrapper currentPageName="Profile"><Profile /></LayoutWrapper>} />
      <Route path="/profiles/:id" element={<LayoutWrapper currentPageName="ProfileView"><ProfileView /></LayoutWrapper>} />
      <Route path="/Publisher" element={<LayoutWrapper currentPageName="Publisher"><Publisher /></LayoutWrapper>} />
      <Route path="/RaisingJupiter" element={<LayoutWrapper currentPageName="RaisingJupiter"><RaisingJupiter /></LayoutWrapper>} />
      <Route path="/RankedChoice" element={<LayoutWrapper currentPageName="RankedChoice"><RankedChoice /></LayoutWrapper>} />
      <Route path="/Resources" element={<LayoutWrapper currentPageName="Resources"><Resources /></LayoutWrapper>} />
      <Route path="/ResultsCountdown" element={<LayoutWrapper currentPageName="ResultsCountdown"><ResultsCountdown /></LayoutWrapper>} />
      <Route path="/Season4" element={<LayoutWrapper currentPageName="Season4"><Season4 /></LayoutWrapper>} />
      <Route path="/Shop" element={<LayoutWrapper currentPageName="Shop"><Shop /></LayoutWrapper>} />
      <Route path="/SignalFeed" element={<LayoutWrapper currentPageName="SignalFeed"><SignalFeed /></LayoutWrapper>} />
      <Route path="/SpaceNews" element={<LayoutWrapper currentPageName="SpaceNews"><SpaceNews /></LayoutWrapper>} />
      <Route path="/SponsorPitch" element={<LayoutWrapper currentPageName="SponsorPitch"><SponsorPitch /></LayoutWrapper>} />
      <Route path="/Sponsors" element={<LayoutWrapper currentPageName="Sponsors"><Sponsors /></LayoutWrapper>} />
      <Route path="/StartupDirectory" element={<LayoutWrapper currentPageName="StartupDirectory"><StartupDirectory /></LayoutWrapper>} />
      <Route path="/TermsOfService" element={<LayoutWrapper currentPageName="TermsOfService"><TermsOfService /></LayoutWrapper>} />
      <Route path="/TheHangar" element={<LayoutWrapper currentPageName="TheHangar"><TheHangar /></LayoutWrapper>} />
      <Route path="/Tips" element={<LayoutWrapper currentPageName="Tips"><Tips /></LayoutWrapper>} />
      <Route path="/Top100Nominees2025" element={<LayoutWrapper currentPageName="Top100Nominees2025"><Top100Nominees2025 /></LayoutWrapper>} />
      <Route path="/Top100OS" element={<LayoutWrapper currentPageName="Top100OS"><Top100OS /></LayoutWrapper>} />
      <Route path="/Top100Women2025" element={<LayoutWrapper currentPageName="Top100Women2025"><Top100Women2025 /></LayoutWrapper>} />
      <Route path="/Top100Women2025/:nomineeId" element={<DynamicProfilePage />} />
      <Route path="/profiles/:nomineeId" element={<DynamicProfilePage />} />
      <Route path="/TrendingSignals" element={<LayoutWrapper currentPageName="TrendingSignals"><TrendingSignals /></LayoutWrapper>} />
      <Route path="/VotingHub" element={<LayoutWrapper currentPageName="VotingHub"><VotingHub /></LayoutWrapper>} />
      <Route path="/onboarding" element={<OnboardingKickstarter />} />
      <Route path="/onboarding-admin" element={<OnboardingAdmin />} />
      <Route path="/OnboardingKickstarter" element={<OnboardingKickstarter />} />
      <Route path="/AgentSkillRegistry" element={<LayoutWrapper currentPageName="AgentSkillRegistry"><AgentSkillRegistry /></LayoutWrapper>} />
      <Route path="/agent-skills" element={<LayoutWrapper currentPageName="AgentSkillRegistry"><AgentSkillRegistry /></LayoutWrapper>} />
      <Route path="/art-command-center" element={<ARTCommandCenter />} />
      <Route path="/team-manager" element={<TeamManager />} />
      <Route path="/feature-to-team-mapper" element={<FeatureToTeamMapper />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
  );
}


// Prevent iOS Safari auto-zoom on input focus by enforcing maximum-scale=1
if (typeof document !== 'undefined') {
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta) {
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  }
}

// Global error handler for unhandled rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Global Error Handler] Unhandled rejection:', event.reason);
  });
}

function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Suspense fallback={null}><NavigationTracker /></Suspense>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App