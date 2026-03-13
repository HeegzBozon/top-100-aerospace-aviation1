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
    UserPlus,
    Shield,
    Award,
    Calculator,
    BarChart3,
    FolderOpen,
    BookOpen,
    Sparkles,
    Calendar,
    Database,
    Zap,
    MessageSquare,
    Vote,
    ClipboardCheck,
    GraduationCap,
    Milestone,
    Search,
    GitMerge,
    Clock,
    Tag,
    Bell,
    Columns,
} from 'lucide-react';

/**
 * ADMIN_SECTIONS — the single source of truth for admin navigation.
 * Each section has an id, label, icon, and an array of tabs.
 * The sidebar, command palette, breadcrumbs, and URL routing all consume this config.
 */
export const ADMIN_SECTIONS = [
    {
        id: 'command-center',
        label: 'Command Center',
        icon: LayoutDashboard,
        tabs: [
            { id: 'dashboard', label: 'Mission Control', icon: LayoutDashboard, component: 'AdminCommandCenter' },
        ],
    },
    {
        id: 'crm',
        label: 'CRM — People',
        icon: Users,
        tabs: [
            { id: 'user-management', label: 'User Management', icon: UserCog, component: 'UserManagement' },
            { id: 'merge-users', label: 'Merge Users', icon: GitMerge, component: 'UserMergeManager' },
            { id: 'nominees', label: 'Nominees', icon: Trophy, component: 'NomineeManager' },
            { id: 'assign-nominees', label: 'Assign Nominees', icon: UserPlus, component: 'NomineeAssignmentManager' },
            { id: 'claims', label: 'Profile Claims', icon: Shield, component: 'ClaimsReviewManager' },
            { id: 'sme', label: 'SME Management', icon: Award, component: 'SMEAssignmentPanel' },
        ],
    },
    {
        id: 'cms',
        label: 'CMS — Content',
        icon: FileText,
        tabs: [
            { id: 'content', label: 'Knowledge Base', icon: FileText, component: 'KBArticleManager' },
            { id: 'publications', label: 'Publications', icon: BookOpen, component: 'Publications' },
            { id: 'testimonials', label: 'Testimonials', icon: Sparkles, component: 'TestimonialModeration' },
            { id: 'community-notes', label: 'Community Notes', icon: MessageSquare, component: 'CommunityNotesModeration' },
        ],
    },
    {
        id: 'season-ops',
        label: 'Season Ops',
        icon: Trophy,
        tabs: [
            { id: 'season-command-center', label: 'Season Command Center', icon: Zap, component: 'SeasonCommandCenter' },
            { id: 'seasons', label: 'Season Manager', icon: Calendar, component: 'SeasonManager' },
            { id: 'scoring', label: 'Scoring & RCV', icon: Calculator, component: 'RankedVoteManager' },
            { id: 'holistic', label: 'v3.0 Scoring', icon: Calculator, component: 'HolisticScoringPanel' },
            { id: 'analytics', label: 'Scoring Analytics', icon: BarChart3, component: 'ScoringAnalytics' },
            { id: 'verification', label: 'Verification', icon: Shield, component: 'VerificationDashboard' },
        ],
    },
    {
        id: 'media',
        label: 'Media & Assets',
        icon: Camera,
        tabs: [
            { id: 'assets', label: 'Asset Manager', icon: FolderOpen, component: 'AssetManager' },
            { id: 'photo-diagnostics', label: 'Photo Diagnostics', icon: Camera, component: 'ProfilePhotoDiagnostics' },
            { id: 'photo-upload', label: 'Bulk Upload', icon: Camera, component: 'NomineePhotoUploadWizard' },
            { id: 'headshot-wizard', label: 'Individual Upload', icon: Camera, component: 'HeadshotUploadWizard' },
        ],
    },
    {
        id: 'marketplace',
        label: 'Marketplace',
        icon: Briefcase,
        tabs: [
            { id: 'services', label: 'Services', icon: Sparkles, component: 'ServiceManager' },
            { id: 'providers', label: 'Provider Requests', icon: Briefcase, component: 'ProviderReviewManager' },
            { id: 'availability', label: 'Availability', icon: Clock, component: 'AvailabilityManager' },
        ],
    },
    {
        id: 'raising-jupiter',
        label: 'Raising Jupiter',
        icon: Rocket,
        tabs: [
            { id: 'startups', label: 'Startup Review', icon: Rocket, component: 'StartupReviewPanel' },
            { id: 'cohorts', label: 'Accelerator', icon: GraduationCap, component: 'AcceleratorManagement' },
            { id: 'enrollments', label: 'Enrollments', icon: Users, component: 'EnrollmentManagement' },
            { id: 'milestone-review', label: 'Milestone Review', icon: Award, component: 'MilestoneReview' },
        ],
    },
    {
        id: 'events-partners',
        label: 'Events & Partners',
        icon: CalendarDays,
        tabs: [
            { id: 'events', label: 'Events', icon: CalendarDays, component: 'EventManagement' },
            { id: 'sponsors', label: 'Partners', icon: Award, component: 'SponsorManagement' },
        ],
    },
    {
        id: 'revenue',
        label: 'Revenue',
        icon: DollarSign,
        tabs: [
            { id: 'sales', label: 'Sales Analytics', icon: DollarSign, component: 'SalesAnalytics' },
        ],
    },
    {
        id: 'devops',
        label: 'DevOps & Tools',
        icon: Settings,
        tabs: [
            { id: 'settings', label: 'Platform Settings', icon: Settings, component: 'PlatformSettings' },
            { id: 'rail-items', label: 'Icon Rail', icon: Columns, component: 'RailItemManager' },
        ],
    },
];

/**
 * Flat list of all tabs for search/lookup.
 */
export const ALL_ADMIN_TABS = ADMIN_SECTIONS.flatMap(section =>
    section.tabs.map(tab => ({
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
        const tab = section.tabs.find(t => t.id === tabId);
        if (tab) return { tab, section };
    }
    return null;
}

/**
 * Get the section that contains a given tab id.
 */
export function getSectionForTab(tabId) {
    return ADMIN_SECTIONS.find(s => s.tabs.some(t => t.id === tabId)) || null;
}
