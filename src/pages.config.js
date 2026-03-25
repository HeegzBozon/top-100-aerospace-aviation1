/**
 * pages.config.js - Page routing configuration
 *
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 *
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 *
 * Example file structure:
 *
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 *
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import { lazy } from 'react';
import __Layout from './Layout.jsx';

const About                      = lazy(() => import('./pages/About'));
const AcceleratorHub             = lazy(() => import('./pages/AcceleratorHub'));
const Admin                      = lazy(() => import('./pages/Admin'));
const AdminAction                = lazy(() => import('./pages/AdminAction'));
const Arcade                     = lazy(() => import('./pages/Arcade'));
const ArchiveLanding             = lazy(() => import('./pages/ArchiveLanding'));
const Arena                      = lazy(() => import('./pages/Arena'));
const Article                    = lazy(() => import('./pages/Article'));
const Articles                   = lazy(() => import('./pages/Articles'));
const BallotBox                  = lazy(() => import('./pages/BallotBox'));
const BatchNominations           = lazy(() => import('./pages/BatchNominations'));
const Biographer                 = lazy(() => import('./pages/Biographer'));
const Calendar                   = lazy(() => import('./pages/Calendar'));
const ChessClub                  = lazy(() => import('./pages/ChessClub'));
const ChessGame                  = lazy(() => import('./pages/ChessGame'));
const ClaimProfile               = lazy(() => import('./pages/ClaimProfile'));
const Comms                      = lazy(() => import('./pages/Comms'));
const Demographics               = lazy(() => import('./pages/Demographics'));
const EditProfile                = lazy(() => import('./pages/EditProfile'));
const EventPage                  = lazy(() => import('./pages/EventPage'));
const FactoryReset               = lazy(() => import('./pages/FactoryReset'));
const Feedback                   = lazy(() => import('./pages/Feedback'));
const GamesLanding               = lazy(() => import('./pages/GamesLanding'));
const GetStarted                 = lazy(() => import('./pages/GetStarted'));
const HelpCenter                 = lazy(() => import('./pages/HelpCenter'));
const Home                       = lazy(() => import('./pages/Home'));
const HowWePick                  = lazy(() => import('./pages/HowWePick'));
const Huddle                     = lazy(() => import('./pages/Huddle'));
const IntelligenceDashboard      = lazy(() => import('./pages/IntelligenceDashboard'));
const Landing                    = lazy(() => import('./pages/Landing'));
const Membership                 = lazy(() => import('./pages/Membership'));
const MilestoneDetail            = lazy(() => import('./pages/MilestoneDetail'));
const MissionControl             = lazy(() => import('./pages/MissionControl'));
const MyFavorites                = lazy(() => import('./pages/MyFavorites'));
const Nominations                = lazy(() => import('./pages/Nominations'));
const Nominee                    = lazy(() => import('./pages/Nominee'));
const NomineesByDomain           = lazy(() => import('./pages/NomineesByDomain'));
const NotFound                   = lazy(() => import('./pages/NotFound'));
const Passport                   = lazy(() => import('./pages/Passport'));
const PaymentCancel              = lazy(() => import('./pages/PaymentCancel'));
const PaymentSuccess             = lazy(() => import('./pages/PaymentSuccess'));
const PrivacyPolicy              = lazy(() => import('./pages/PrivacyPolicy'));
const Profile                    = lazy(() => import('./pages/Profile'));
const ProfileView                = lazy(() => import('./pages/ProfileView'));
const RadarDashboard             = lazy(() => import('./pages/RadarDashboard'));
const RadarIntelligence          = lazy(() => import('./pages/RadarIntelligence'));
const RaisingJupiter             = lazy(() => import('./pages/RaisingJupiter'));
const RankedChoice               = lazy(() => import('./pages/RankedChoice'));
const ResultsCountdown           = lazy(() => import('./pages/ResultsCountdown'));
const Season4                    = lazy(() => import('./pages/Season4'));
const Shop                       = lazy(() => import('./pages/Shop'));
const SignalFeed                 = lazy(() => import('./pages/SignalFeed'));
const SpaceNews                  = lazy(() => import('./pages/SpaceNews'));

const SponsorPitch               = lazy(() => import('./pages/SponsorPitch'));
const Sponsors                   = lazy(() => import('./pages/Sponsors'));
const StartupDirectory           = lazy(() => import('./pages/StartupDirectory'));
const TheHangar                  = lazy(() => import('./pages/TheHangar'));
const Tips                       = lazy(() => import('./pages/Tips'));
const Top100Nominees2025         = lazy(() => import('./pages/Top100Nominees2025'));
const Top100OS                   = lazy(() => import('./pages/Top100OS'));
const Top100Women2025            = lazy(() => import('./pages/Top100Women2025'));
const TrendingSignals            = lazy(() => import('./pages/TrendingSignals'));
const UserProfile                = lazy(() => import('./pages/UserProfile'));
const VotingHub                  = lazy(() => import('./pages/VotingHub'));
const Publisher                  = lazy(() => import('./pages/Publisher'));
const Resources                  = lazy(() => import('./pages/Resources'));


export const PAGES = {
    "About": About,
    "AcceleratorHub": AcceleratorHub,
    "Admin": Admin,
    "AdminAction": AdminAction,
    "Arcade": Arcade,
    "ArchiveLanding": ArchiveLanding,
    "Arena": Arena,
    "Article": Article,
    "Articles": Articles,
    "BallotBox": BallotBox,
    "BatchNominations": BatchNominations,
    "Biographer": Biographer,
    "Calendar": Calendar,
    "ChessClub": ChessClub,
    "ChessGame": ChessGame,
    "ClaimProfile": ClaimProfile,
    "Comms": Comms,
    "Demographics": Demographics,
    "EditProfile": EditProfile,
    "EventPage": EventPage,
    "FactoryReset": FactoryReset,
    "Feedback": Feedback,
    "GamesLanding": GamesLanding,
    "GetStarted": GetStarted,
    "HelpCenter": HelpCenter,
    "Home": Home,
    "HowWePick": HowWePick,
    "Huddle": Huddle,
    "IntelligenceDashboard": IntelligenceDashboard,
    "Landing": Landing,
    "Membership": Membership,
    "MilestoneDetail": MilestoneDetail,
    "MissionControl": MissionControl,
    "MyFavorites": MyFavorites,
    "Nominations": Nominations,
    "Nominee": Nominee,
    "NomineesByDomain": NomineesByDomain,
    "NotFound": NotFound,
    "Passport": Passport,
    "PaymentCancel": PaymentCancel,
    "PaymentSuccess": PaymentSuccess,
    "PrivacyPolicy": PrivacyPolicy,
    "Profile": Profile,
    "ProfileView": ProfileView,
    "RadarDashboard": RadarDashboard,
    "RadarIntelligence": RadarIntelligence,
    "RaisingJupiter": RaisingJupiter,
    "RankedChoice": RankedChoice,
    "ResultsCountdown": ResultsCountdown,
    "Season4": Season4,
    "Shop": Shop,
    "SignalFeed": SignalFeed,
    "SpaceNews": SpaceNews,

    "SponsorPitch": SponsorPitch,
    "Sponsors": Sponsors,
    "StartupDirectory": StartupDirectory,
    "TheHangar": TheHangar,
    "Tips": Tips,
    "Top100Nominees2025": Top100Nominees2025,
    "Top100OS": Top100OS,
    "Top100Women2025": Top100Women2025,
    "TrendingSignals": TrendingSignals,
    "UserProfile": UserProfile,
    "VotingHub": VotingHub,
    "Publisher": Publisher,
    "Resources": Resources,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
