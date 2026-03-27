/**
 * pages.config.js
 * 
 * Provides page metadata for the Base44 platform preview dropdown.
 * Actual route rendering is handled by App.jsx with lazy-loaded imports.
 * 
 * IMPORTANT: This file is read by the platform to populate the page navigator.
 * The lazy() imports here are only used by the platform's page picker, 
 * NOT for route rendering (that's in App.jsx).
 */

import { lazy } from 'react';
import Layout from '@/components/layout/AppLayout';

export const pagesConfig = {
    mainPage: "Home",
    Layout: Layout,
    Pages: {
        Home: { component: lazy(() => import("@/pages/Home")), path: "/" },
        About: { component: lazy(() => import("@/pages/About")), path: "/About" },
        Admin: { component: lazy(() => import("@/pages/Admin")), path: "/Admin" },
        Arena: { component: lazy(() => import("@/pages/Arena")), path: "/Arena" },
        Articles: { component: lazy(() => import("@/pages/Articles")), path: "/Articles" },
        Calendar: { component: lazy(() => import("@/pages/Calendar")), path: "/Calendar" },
        Comms: { component: lazy(() => import("@/pages/Comms")), path: "/Comms" },
        Feedback: { component: lazy(() => import("@/pages/Feedback")), path: "/Feedback" },
        HelpCenter: { component: lazy(() => import("@/pages/HelpCenter")), path: "/HelpCenter" },
        Nominations: { component: lazy(() => import("@/pages/Nominations")), path: "/Nominations" },
        Profile: { component: lazy(() => import("@/pages/Profile")), path: "/Profile" },
        VotingHub: { component: lazy(() => import("@/pages/VotingHub")), path: "/VotingHub" },
        Top100Women2025: { component: lazy(() => import("@/pages/Top100Women2025")), path: "/Top100Women2025" },
        MissionControl: { component: lazy(() => import("@/pages/MissionControl")), path: "/MissionControl" },
        Landing: { component: lazy(() => import("@/pages/Landing")), path: "/Landing" },
        Resources: { component: lazy(() => import("@/pages/Resources")), path: "/Resources" },
        Shop: { component: lazy(() => import("@/pages/Shop")), path: "/Shop" },
        Sponsors: { component: lazy(() => import("@/pages/Sponsors")), path: "/Sponsors" },
        Tips: { component: lazy(() => import("@/pages/Tips")), path: "/Tips" },
        Membership: { component: lazy(() => import("@/pages/Membership")), path: "/Membership" },
        SignalFeed: { component: lazy(() => import("@/pages/SignalFeed")), path: "/SignalFeed" },
        AnalyticsDashboard: { component: lazy(() => import("@/pages/AnalyticsDashboard")), path: "/AnalyticsDashboard" },
        Passport: { component: lazy(() => import("@/pages/Passport")), path: "/Passport" },
        EditProfile: { component: lazy(() => import("@/pages/EditProfile")), path: "/EditProfile" },
        GetStarted: { component: lazy(() => import("@/pages/GetStarted")), path: "/GetStarted" },
    },
};