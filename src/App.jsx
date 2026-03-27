import './App.css'
import React, { lazy, Suspense } from 'react';
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

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-white p-4">
    <div className="text-center max-w-md">
      <p className="text-lg font-bold text-red-600 mb-2">Error: No main page configured</p>
      <p className="text-sm text-slate-500 mb-4">Check that a page is set as the home/main page.</p>
      <p className="text-xs text-slate-400">Main page key: {mainPageKey || 'undefined'}</p>
    </div>
  </div>
);

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

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
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
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
      <Route path="/Top100Women2025/:nomineeId" element={<DynamicProfilePage />} />
      <Route path="/profiles/:nomineeId" element={<DynamicProfilePage />} />
      <Route path="/profiles/:id" element={
        <LayoutWrapper currentPageName="ProfileView">
          <ProfileView />
        </LayoutWrapper>
      } />
      <Route path="/Profile" element={<Navigate to="/ProfileView" replace />} />
      <Route path="/PublicProfile" element={<Navigate to="/ProfileView" replace />} />
      <Route path="/Nominee" element={<Navigate to="/ProfileView" replace />} />
      <Route path="/UserProfile" element={<Navigate to="/ProfileView" replace />} />
      {Object.entries(Pages).map(([path, Page]) => {
        const LazyPage = lazy(() => Promise.resolve({ default: Page }));
        return (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>}>
                <LayoutWrapper currentPageName={path}>
                  <LazyPage />
                </LayoutWrapper>
              </Suspense>
            }
          />
        );
      })}
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
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App