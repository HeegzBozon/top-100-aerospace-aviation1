/**
 * pages.config.js
 * 
 * Page metadata for the Base44 platform preview dropdown.
 * Actual route rendering and lazy-loading is handled by App.jsx.
 * 
 * NOTE: We intentionally do NOT import components here to avoid
 * circular dependency issues with recharts in the production bundle.
 */

import Layout from '@/components/layout/AppLayout';

export const pagesConfig = {
    mainPage: "Home",
    Layout: Layout,
    Pages: {
        Home: { path: "/" },
        About: { path: "/About" },
        Admin: { path: "/Admin" },
        Arena: { path: "/Arena" },
        Articles: { path: "/Articles" },
        Calendar: { path: "/Calendar" },
        Comms: { path: "/Comms" },
        Feedback: { path: "/Feedback" },
        HelpCenter: { path: "/HelpCenter" },
        Nominations: { path: "/Nominations" },
        Profile: { path: "/Profile" },
        VotingHub: { path: "/VotingHub" },
        Top100Women2025: { path: "/Top100Women2025" },
        MissionControl: { path: "/MissionControl" },
        Landing: { path: "/Landing" },
        Resources: { path: "/Resources" },
        Shop: { path: "/Shop" },
        Sponsors: { path: "/Sponsors" },
        Tips: { path: "/Tips" },
        Membership: { path: "/Membership" },
        SignalFeed: { path: "/SignalFeed" },
        AnalyticsDashboard: { path: "/AnalyticsDashboard" },
        Passport: { path: "/Passport" },
        EditProfile: { path: "/EditProfile" },
        GetStarted: { path: "/GetStarted" },
        Huddle: { path: "/Huddle" },
        AcceleratorHub: { path: "/AcceleratorHub" },
        BatchNominations: { path: "/BatchNominations" },
        Biographer: { path: "/Biographer" },
        ClaimProfile: { path: "/ClaimProfile" },
        Demographics: { path: "/Demographics" },
        EventPage: { path: "/EventPage" },
        GamesLanding: { path: "/GamesLanding" },
        GlobalIntelligence: { path: "/GlobalIntelligence" },
        HowWePick: { path: "/HowWePick" },
        IntelligenceDashboard: { path: "/IntelligenceDashboard" },
        MyFavorites: { path: "/MyFavorites" },
        NomineesByDomain: { path: "/NomineesByDomain" },
        Publisher: { path: "/Publisher" },
        RaisingJupiter: { path: "/RaisingJupiter" },
        RankedChoice: { path: "/RankedChoice" },
        ResultsCountdown: { path: "/ResultsCountdown" },
        Season4: { path: "/Season4" },
        SpaceNews: { path: "/SpaceNews" },
        SponsorPitch: { path: "/SponsorPitch" },
        StartupDirectory: { path: "/StartupDirectory" },
        TheHangar: { path: "/TheHangar" },
        Top100Nominees2025: { path: "/Top100Nominees2025" },
        Top100OS: { path: "/Top100OS" },
        TrendingSignals: { path: "/TrendingSignals" },
        Arcade: { path: "/Arcade" },
        ChessClub: { path: "/ChessClub" },
        Colony: { path: "/Colony" },
    },
};