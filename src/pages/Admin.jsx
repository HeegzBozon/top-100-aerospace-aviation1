import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Season } from '@/entities/Season';
import { KBArticle } from '@/entities/KBArticle';
import { User } from '@/entities/User';
import { useToast } from "@/components/ui/use-toast";
import { Settings, X, Menu } from 'lucide-react';

// Admin shell components
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import AdminCommandPalette, { addRecentTab } from '@/components/admin/AdminCommandPalette';
import { findTabById } from '@/components/admin/adminNavConfig';

// Admin content components — lazy-loaded per tab (only the active tab downloads its chunk)
const AdminCommandCenter       = lazy(() => import('@/components/admin/AdminCommandCenter'));
const SeasonCommandCenter      = lazy(() => import('@/components/admin/SeasonCommandCenter'));
const SeasonManager            = lazy(() => import('@/components/admin/SeasonManager'));
const SeasonViewModal          = lazy(() => import('@/components/admin/SeasonViewModal'));
const ProviderReviewManager    = lazy(() => import('@/components/admin/ProviderReviewManager'));
const ServiceManager           = lazy(() => import('@/components/admin/ServiceManager'));
const NomineeManager           = lazy(() => import('@/components/admin/NomineeManager'));
const KBArticleManager         = lazy(() => import('@/components/admin/KBArticleManager'));
const PlatformSettings         = lazy(() => import('@/components/admin/PlatformSettings'));
const UserViewModal            = lazy(() => import('@/components/admin/UserViewModal'));
const RankedVoteManager        = lazy(() => import('@/components/admin/RankedVoteManager'));
const UniversalDataWizard      = lazy(() => import('@/components/admin/UniversalDataWizard'));
const ProfilePhotoDiagnostics  = lazy(() => import('@/components/admin/ProfilePhotoDiagnostics'));
const NomineePhotoUploadWizard = lazy(() => import('@/components/admin/NomineePhotoUploadWizard'));
const HeadshotUploadWizard     = lazy(() => import('@/components/admin/HeadshotUploadWizard'));
const AssetManager             = lazy(() => import('@/components/admin/AssetManager'));
const EventManagement          = lazy(() => import('@/components/admin/EventManagement'));
const SponsorManagement        = lazy(() => import('@/components/admin/SponsorManagement'));
const AvailabilityManager      = lazy(() => import('@/components/admin/AvailabilityManager'));
const ClaimsReviewManager      = lazy(() => import('@/components/admin/ClaimsReviewManager'));
const UserMergeManager         = lazy(() => import('@/components/admin/UserMergeManager'));
const NomineeAssignmentManager = lazy(() => import('@/components/admin/NomineeAssignmentManager'));
const HolisticScoringPanel     = lazy(() => import('@/components/admin/HolisticScoringPanel'));
const VerificationDashboard    = lazy(() => import('@/components/admin/VerificationDashboard'));
const ScoringAnalytics         = lazy(() => import('@/components/admin/ScoringAnalytics'));
const SalesAnalytics           = lazy(() => import('@/components/admin/SalesAnalytics'));
const SMEAssignmentPanel       = lazy(() => import('@/components/admin/SMEAssignmentPanel'));
const StartupReviewPanel       = lazy(() => import('@/components/admin/StartupReviewPanel'));
const AcceleratorManagement    = lazy(() => import('@/components/admin/AcceleratorManagement'));
const EnrollmentManagement     = lazy(() => import('@/components/admin/EnrollmentManagement'));
const MilestoneReview          = lazy(() => import('@/components/admin/MilestoneReview'));
const CommunityNotesModeration = lazy(() => import('@/components/admin/CommunityNotesModeration'));
const TestimonialModeration    = lazy(() => import('@/components/admin/TestimonialModeration'));
const UserManagement           = lazy(() => import('@/components/admin/UserManagement'));
const RailItemManager          = lazy(() => import('@/components/admin/RailItemManager'));
const DiscoveryResponsesManager = lazy(() => import('@/components/admin/DiscoveryResponsesManager'));
import { Award } from 'lucide-react';

const SIDEBAR_COLLAPSED_KEY = 'adminSidebarCollapsed';

export default function Admin() {
  // ── State ──
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      // Support URL params: ?tab=nominees
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tab');
      if (urlTab) return urlTab;
      return localStorage.getItem('adminActiveTab') || 'dashboard';
    }
    return 'dashboard';
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState([]);
  const [kbArticles, setKbArticles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [viewingSeason, setViewingSeason] = useState(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) || 'false'); } catch { return false; }
  });

  const { toast } = useToast();

  // ── Persist state ──
  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
    // Update URL without reloading
    const url = new URL(window.location);
    url.searchParams.set('tab', activeTab);
    window.history.replaceState({}, '', url);
    addRecentTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // ── Global ⌘K shortcut ──
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Auth & Data ──
  useEffect(() => {
    const init = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        if (user.role === 'admin' || user.email.includes('admin') || user.email.includes('owner')) {
          await loadAllData();
        }
      } catch (error) {
        console.error('Error checking authorization:', error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);



  const loadAllData = async (retries = 3) => {
    try {
      const [allSeasons, allKbArticles] = await Promise.all([
        Season.list('-created_date'),
        KBArticle.list('-created_date'),
      ]);
      setSeasons(allSeasons);
      setKbArticles(allKbArticles);
    } catch (error) {
      console.error('Error loading admin data:', error);
      if (retries > 0 && (error.message.includes('Network Error') || error.message.includes('timeout'))) {
        toast({ title: "Connection Issue", description: `Retrying... (${retries} left)` });
        setTimeout(() => loadAllData(retries - 1), 2000);
      } else {
        toast({ variant: "destructive", title: "Loading Failed", description: "Unable to load admin data. Please refresh." });
      }
    }
  };

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setMobileSidebarOpen(false);
  }, []);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c9a87c] to-[#4a90b8] flex items-center justify-center animate-pulse shadow-lg shadow-[#c9a87c]/20">
            <span className="text-white font-black text-lg">T</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--accent)] border-t-transparent" />
            Loading Mission Control...
          </div>
        </div>
      </div>
    );
  }

  // ── Auth gate ──
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Settings className="w-8 h-8 text-slate-400" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] mb-2">Access Denied</h1>
          <p className="text-[var(--muted)] text-sm">You need admin privileges to access Mission Control.</p>
        </div>
      </div>
    );
  }

  // ── Content renderer ──
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminCommandCenter onNavigate={setActiveTab} currentUser={currentUser} />;
      case 'season-command-center':
        return <SeasonCommandCenter onNavigate={setActiveTab} />;
      case 'testimonials':
        return <TestimonialModeration />;
      case 'community-notes':
        return <CommunityNotesModeration />;
      case 'photo-diagnostics':
        return <ProfilePhotoDiagnostics />;
      case 'photo-upload':
        return <NomineePhotoUploadWizard />;
      case 'headshot-wizard':
        return <HeadshotUploadWizard />;
      case 'startups':
        return <StartupReviewPanel />;
      case 'cohorts':
        return <AcceleratorManagement />;
      case 'enrollments':
        return <EnrollmentManagement />;
      case 'milestone-review':
        return <MilestoneReview />;
      case 'services':
        return <ServiceManager />;
      case 'providers':
        return <ProviderReviewManager />;
      case 'nominees':
        return <NomineeManager seasons={seasons} />;
      case 'claims':
        return <ClaimsReviewManager />;
      case 'assign-nominees':
        return <NomineeAssignmentManager />;
      case 'user-management':
        return <UserManagement />;
      case 'merge-users':
        return <UserMergeManager />;
      case 'events':
        return <EventManagement />;
      case 'sponsors':
        return <SponsorManagement />;
      case 'availability':
        return <AvailabilityManager />;
      case 'holistic':
        return <HolisticScoringPanel />;
      case 'verification':
        return <VerificationDashboard />;
      case 'analytics':
        return <ScoringAnalytics />;
      case 'sales':
        return <SalesAnalytics />;
      case 'sme':
        return <SMEAssignmentPanel />;
      case 'seasons':
        return (
          <SeasonManager
            seasons={seasons}
            onSeasonsUpdate={loadAllData}
            onViewSeason={(season) => setViewingSeason(season)}
          />
        );
      case 'scoring':
        return <RankedVoteManager />;
      case 'content':
        return <KBArticleManager articles={kbArticles} onArticlesUpdate={loadAllData} />;
      case 'assets':
        return <AssetManager />;
      case 'publications':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--text)]">Publications</h2>
            <p className="text-[var(--muted)]">Manage official TOP 100 publications and editions.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <a
                href="/Top100Women2025"
                target="_blank"
                className="block p-6 rounded-xl border border-[var(--border)] bg-gradient-to-br from-[#1e3a5a]/5 to-[#c9a87c]/10 hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1e3a5a] to-[#4a90b8] flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text)]">TOP 100 Women 2025</h3>
                    <p className="text-xs text-[var(--muted)]">Official Edition</p>
                  </div>
                </div>
                <p className="text-sm text-[var(--muted)]">The Orbital Edition — Cinematic scroll publication featuring the TOP 100 Women in Aerospace & Aviation.</p>
              </a>
            </div>
          </div>
        );
      case 'settings':
        return <PlatformSettings />;
      case 'rail-items':
        return <RailItemManager />;
      case 'discovery-responses':
        return <DiscoveryResponsesManager />;
      default:
        return (
          <div className="py-16 text-center text-[var(--muted)]">
            <Settings className="mx-auto mb-4 h-12 w-12 opacity-30" />
            <p className="text-sm">Select a section to get started.</p>
          </div>
        );
    }
  };

  const tabInfo = findTabById(activeTab);

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--bg)]">
      {/* ── Mobile sidebar backdrop ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <div className={`
        fixed inset-y-0 left-0 z-50 md:relative md:z-0
        transform transition-transform duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onCommandPaletteOpen={() => setCommandPaletteOpen(true)}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-14 flex items-center gap-3 px-4 md:px-6 border-b border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-sm">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden text-[var(--muted)] hover:text-[var(--text)] transition-colors p-1"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <div className="flex-1 min-w-0">
            <AdminBreadcrumbs activeTab={activeTab} />
          </div>

          {/* Right side: user info */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--border)]/50 hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] transition-all text-xs"
            >
              <span>Search</span>
              <kbd className="px-1 py-0.5 bg-[var(--card)] rounded text-[10px] border border-[var(--border)]">⌘K</kbd>
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c9a87c] to-[#4a90b8] flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {currentUser?.full_name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent)] border-t-transparent" />
              </div>
            }>
              {renderContent()}
            </Suspense>
          </div>
        </main>
      </div>

      {/* ── Command Palette ── */}
      <AdminCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onTabChange={handleTabChange}
      />

      {/* ── Modals ── */}
      <Suspense fallback={null}>
        {selectedUser && <UserViewModal user={selectedUser} onClose={() => setSelectedUser(null)} />}

        {viewingSeason && (
          <SeasonViewModal
            season={viewingSeason}
            onClose={() => setViewingSeason(null)}
            onDelete={async () => {
              if (confirm(`Delete "${viewingSeason.name}"?`)) {
                await Season.delete(viewingSeason.id);
                setViewingSeason(null);
                loadAllData();
              }
            }}
          />
        )}

        {showImportWizard && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Universal Data Import Wizard</h2>
                <button
                  onClick={() => setShowImportWizard(false)}
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <UniversalDataWizard
                onClose={() => setShowImportWizard(false)}
                onSuccess={() => {
                  loadAllData();
                  toast({ title: "Import Successful!", description: "Your data has been imported successfully." });
                  setShowImportWizard(false);
                }}
              />
            </div>
          </div>
        )}
      </Suspense>
    </div>
  );
}