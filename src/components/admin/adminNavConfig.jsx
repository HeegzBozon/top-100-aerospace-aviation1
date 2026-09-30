import {
    LayoutDashboard,
    Users,
    FileText,
    Trophy,
    Camera,
    Briefcase,
    Rocket,
    CalendarDays,
    DollarSign,
    Settings,
    UserCog,
    Shield,
    Award,
    BarChart3,
    BookOpen,
    Sparkles,
    Calendar,
    Clock,
    MessageSquare,
    GraduationCap,
    GitMerge,
    Columns,
    ClipboardCheck,
    ClipboardList,
    MapPin,
    TrendingUp,
} from 'lucide-react';

/**
 * ADMIN_SECTIONS — the single source of truth for admin navigation.
 * Organized by season lifecycle phase (Nominations, Selection, Editorial)
 * plus cross-cutting sections (People, Programs, Platform) that keep their own nav.
 *
 * The phase sections are cohort-scoped via the Cohort Workspace; the cross-cutting
 * sections are global. The sidebar, command palette, breadcrumbs, and URL routing
 * all consume this config.
 */
export const ADMIN_SECTIONS = [
    {
        id: 'nominations',
        label: 'Nominations',
        icon: Trophy,
        tabs: [
            { id: 'seasons', label: 'Season Manager', icon: Calendar, component: 'SeasonManager' },
            { id: 'workspace-nominate', label: 'Cohort Workspace', icon: LayoutDashboard, component: 'CohortWorkspace' },
            { id: 'surveys', label: 'Nomination Forms', icon: ClipboardCheck, component: 'SurveyManager' },
            { id: 'local-legends', label: 'Local Legends', icon: MapPin, component: 'LocalLegendsManager' },
        ],
    },
    {
        id: 'selection',
        label: 'Selection',
        icon: BarChart3,
        tabs: [
            { id: 'workspace-selection', label: 'Cohort Workspace', icon: LayoutDashboard, component: 'CohortWorkspace' },
        ],
    },
    {
        id: 'editorial',
        label: 'Editorial',
        icon: FileText,
        tabs: [
            { id: 'workspace-editorial', label: 'Cohort Workspace', icon: LayoutDashboard, component: 'CohortWorkspace' },
            { id: 'publications', label: 'Publications', icon: BookOpen, component: 'Publications' },
            { id: 'content', label: 'Knowledge Base', icon: FileText, component: 'KBArticleManager' },
            { id: 'viral-posts', label: 'Top Viral Posts', icon: TrendingUp, component: 'TopViralPostsManager' },
            { id: 'testimonials', label: 'Testimonials', icon: Sparkles, component: 'TestimonialModeration' },
            { id: 'community-notes', label: 'Community Notes', icon: MessageSquare, component: 'CommunityNotesModeration' },
            { id: 'discovery-responses', label: 'Discovery Responses', icon: ClipboardList, component: 'DiscoveryResponsesManager' },
            { id: 'media', label: 'Media & Photos', icon: Camera, component: 'MediaSurface' },
        ],
    },
    {
        id: 'people',
        label: 'People',
        icon: Users,
        tabs: [
            { id: 'user-management', label: 'User Management', icon: UserCog, component: 'UserManagement' },
            { id: 'merge-users', label: 'Merge Users', icon: GitMerge, component: 'UserMergeManager' },
            { id: 'claims', label: 'Profile Claims', icon: Shield, component: 'ClaimsReviewManager' },
            { id: 'sme', label: 'SME Management', icon: Award, component: 'SMEAssignmentPanel' },
            { id: 'bio-submissions', label: 'Bio Submissions', icon: FileText, component: 'BioSubmissionManager' },
        ],
    },
    {
        id: 'programs',
        label: 'Programs',
        icon: Rocket,
        tabs: [
            { id: 'startups', label: 'Startup Review', icon: Rocket, component: 'StartupReviewPanel' },
            { id: 'cohorts', label: 'Accelerator', icon: GraduationCap, component: 'AcceleratorManagement' },
            { id: 'enrollments', label: 'Enrollments', icon: Users, component: 'EnrollmentManagement' },
            { id: 'milestone-review', label: 'Milestone Review', icon: Award, component: 'MilestoneReview' },
            { id: 'services', label: 'Availability', icon: Sparkles, component: 'ServiceManager' },
            { id: 'providers', label: 'Provider Requests', icon: Briefcase, component: 'ProviderReviewManager' },
            { id: 'availability', label: 'Availability Calendar', icon: Clock, component: 'AvailabilityManager' },
            { id: 'events', label: 'Events', icon: CalendarDays, component: 'EventManagement' },
            { id: 'sponsors', label: 'Partners', icon: Award, component: 'SponsorManagement' },
        ],
    },
    {
        id: 'platform',
        label: 'Platform',
        icon: Settings,
        tabs: [
            { id: 'dashboard', label: 'Mission Control', icon: LayoutDashboard, component: 'AdminCommandCenter' },
            { id: 'seasonal-planning', label: 'Seasonal Planning', icon: ClipboardList, component: 'SeasonalPlanningDashboard' },
            { id: 'settings', label: 'Platform Settings', icon: Settings, component: 'PlatformSettings' },
            { id: 'rail-items', label: 'Icon Rail', icon: Columns, component: 'RailItemManager' },
            { id: 'sales', label: 'Sales Analytics', icon: DollarSign, component: 'SalesAnalytics' },
        ],
    },
];

/**
 * Legacy admin tab ids that no longer have their own surface — redirect these
 * to the matching workspace phase tab or merged surface so existing bookmarks
 * and command-palette history resolve cleanly.
 */
export const LEGACY_TAB_REDIRECTS = {
    nominees: 'workspace-nominate',
    'nomination-intake': 'workspace-nominate',
    'assign-nominees': 'workspace-nominate',
    'season-command-center': 'workspace-selection',
    scoring: 'workspace-selection',
    holistic: 'workspace-selection',
    analytics: 'workspace-selection',
    verification: 'workspace-selection',
    'photo-diagnostics': 'media',
    'photo-upload': 'media',
    'headshot-wizard': 'media',
    assets: 'media',
};

/**
 * Flat list of all tabs for search/lookup.
 */
export const ALL_ADMIN_TABS = ADMIN_SECTIONS.flatMap((section) =>
    section.tabs.map((tab) => ({
        ...tab,
        sectionId: section.id,
        sectionLabel: section.label,
    }))
);

/**
 * Lookup a tab by its id. Returns { tab, section } or null.
 */
export function findTabById(tabId) {
    for (const section of ADMIN_SECTIONS) {
        const tab = section.tabs.find((t) => t.id === tabId);
        if (tab) return { tab, section };
    }
    return null;
}

/**
 * Resolve a possibly-legacy tab id to its current canonical id.
 */
export function resolveTabId(tabId) {
    return LEGACY_TAB_REDIRECTS[tabId] || tabId;
}

/**
 * Get the section that contains a given tab id.
 */
export function getSectionForTab(tabId) {
    return ADMIN_SECTIONS.find((s) => s.tabs.some((t) => t.id === tabId)) || null;
}