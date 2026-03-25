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
const Afterparty                 = lazy(() => import('./pages/Afterparty'));
const AlumniInResearch           = lazy(() => import('./pages/AlumniInResearch'));
const AlumniRadar                = lazy(() => import('./pages/AlumniRadar'));
const Arcade                     = lazy(() => import('./pages/Arcade'));
const ArchiveLanding             = lazy(() => import('./pages/ArchiveLanding'));
const Arena                      = lazy(() => import('./pages/Arena'));
const Article                    = lazy(() => import('./pages/Article'));
const Articles                   = lazy(() => import('./pages/Articles'));
const BallotBox                  = lazy(() => import('./pages/BallotBox'));
const BatchNominations           = lazy(() => import('./pages/BatchNominations'));
const Biographer                 = lazy(() => import('./pages/Biographer'));
const BusinessResources          = lazy(() => import('./pages/BusinessResources'));
const Calendar                   = lazy(() => import('./pages/Calendar'));
const CapitalExchange            = lazy(() => import('./pages/CapitalExchange'));
const CareerResources            = lazy(() => import('./pages/CareerResources'));
const ChessClub                  = lazy(() => import('./pages/ChessClub'));
const ChessGame                  = lazy(() => import('./pages/ChessGame'));
const ClaimProfile               = lazy(() => import('./pages/ClaimProfile'));
const Comms                      = lazy(() => import('./pages/Comms'));
const DemoDayEvent               = lazy(() => import('./pages/DemoDayEvent'));
const Demographics               = lazy(() => import('./pages/Demographics'));
const EditProfile                = lazy(() => import('./pages/EditProfile'));
const EnterpriseResources        = lazy(() => import('./pages/EnterpriseResources'));
const EventPage                  = lazy(() => import('./pages/EventPage'));
const FactoryReset               = lazy(() => import('./pages/FactoryReset'));
const Feedback                   = lazy(() => import('./pages/Feedback'));
const Festival                   = lazy(() => import('./pages/Festival'));
const FounderApplication         = lazy(() => import('./pages/FounderApplication'));
const FounderDashboard           = lazy(() => import('./pages/FounderDashboard'));
const FounderResources           = lazy(() => import('./pages/FounderResources'));
const FundraisingTracker         = lazy(() => import('./pages/FundraisingTracker'));
const GamesLanding               = lazy(() => import('./pages/GamesLanding'));
const GetStarted                 = lazy(() => import('./pages/GetStarted'));
const HabitWizard                = lazy(() => import('./pages/HabitWizard'));
const HelpCenter                 = lazy(() => import('./pages/HelpCenter'));
const Home                       = lazy(() => import('./pages/Home'));
const HonoreeResources           = lazy(() => import('./pages/HonoreeResources'));
const HowWePick                  = lazy(() => import('./pages/HowWePick'));
const Huddle                     = lazy(() => import('./pages/Huddle'));
const HypeSquad                  = lazy(() => import('./pages/HypeSquad'));
const HypeSquadWizard            = lazy(() => import('./pages/HypeSquadWizard'));
const IntelligenceDashboard      = lazy(() => import('./pages/IntelligenceDashboard'));
const InvestorDashboard          = lazy(() => import('./pages/InvestorDashboard'));
const InvestorOnboarding         = lazy(() => import('./pages/InvestorOnboarding'));
const JobDetail                  = lazy(() => import('./pages/JobDetail'));
const Landing                    = lazy(() => import('./pages/Landing'));
const LaunchParty                = lazy(() => import('./pages/LaunchParty'));
const Membership                 = lazy(() => import('./pages/Membership'));
const MentorPortal               = lazy(() => import('./pages/MentorPortal'));
const MilestoneDetail            = lazy(() => import('./pages/MilestoneDetail'));
const MissionControl             = lazy(() => import('./pages/MissionControl'));
const MissionVisionValues        = lazy(() => import('./pages/MissionVisionValues'));
const MyFavorites                = lazy(() => import('./pages/MyFavorites'));
const Nominations                = lazy(() => import('./pages/Nominations'));
const Nominee                    = lazy(() => import('./pages/Nominee'));
const NomineeResources           = lazy(() => import('./pages/NomineeResources'));
const NomineesByDomain           = lazy(() => import('./pages/NomineesByDomain'));
const NotFound                   = lazy(() => import('./pages/NotFound'));
const OriginStory                = lazy(() => import('./pages/OriginStory'));
const Passport                   = lazy(() => import('./pages/Passport'));
const PaymentCancel              = lazy(() => import('./pages/PaymentCancel'));
const PaymentSuccess             = lazy(() => import('./pages/PaymentSuccess'));
const PrivacyPolicy              = lazy(() => import('./pages/PrivacyPolicy'));
const Profile                    = lazy(() => import('./pages/Profile'));
const ProfileView                = lazy(() => import('./pages/ProfileView'));
const PublicProfile              = lazy(() => import('./pages/PublicProfile'));
const Quests                     = lazy(() => import('./pages/Quests'));
const RadarDashboard             = lazy(() => import('./pages/RadarDashboard'));
const RadarIntelligence          = lazy(() => import('./pages/RadarIntelligence'));
const RaisingJupiter             = lazy(() => import('./pages/RaisingJupiter'));
const RankedChoice               = lazy(() => import('./pages/RankedChoice'));
const ResultsCountdown           = lazy(() => import('./pages/ResultsCountdown'));
const SMEPortal                  = lazy(() => import('./pages/SMEPortal'));
const Season4                    = lazy(() => import('./pages/Season4'));
const Shop                       = lazy(() => import('./pages/Shop'));
const SignalAnalytics            = lazy(() => import('./pages/SignalAnalytics'));
const SignalEmbed                = lazy(() => import('./pages/SignalEmbed'));
const SignalEngineRoadmap        = lazy(() => import('./pages/SignalEngineRoadmap'));
const SignalFeed                 = lazy(() => import('./pages/SignalFeed'));
const SignalReview               = lazy(() => import('./pages/SignalReview'));
const SignalSearch               = lazy(() => import('./pages/SignalSearch'));
const SignalTimeline             = lazy(() => import('./pages/SignalTimeline'));
const SpaceNews                  = lazy(() => import('./pages/SpaceNews'));
const SponsorPitch               = lazy(() => import('./pages/SponsorPitch'));
const SponsorResources           = lazy(() => import('./pages/SponsorResources'));
const Sponsors                   = lazy(() => import('./pages/Sponsors'));
const StartupDirectory           = lazy(() => import('./pages/StartupDirectory'));
const StudentResources           = lazy(() => import('./pages/StudentResources'));
const TheHangar                  = lazy(() => import('./pages/TheHangar'));
const Tips                       = lazy(() => import('./pages/Tips'));
const Top100Nominees2025         = lazy(() => import('./pages/Top100Nominees2025'));
const Top100OS                   = lazy(() => import('./pages/Top100OS'));
const Top100Women2025            = lazy(() => import('./pages/Top100Women2025'));
const TrendingSignals            = lazy(() => import('./pages/TrendingSignals'));
const UserProfile                = lazy(() => import('./pages/UserProfile'));
const VotingHub                  = lazy(() => import('./pages/VotingHub'));
const Publisher                  = lazy(() => import('./pages/Publisher'));


export const PAGES = {
    "About": About,
    "AcceleratorHub": AcceleratorHub,
    "Admin": Admin,
    "AdminAction": AdminAction,
    "Afterparty": Afterparty,
    "AlumniInResearch": AlumniInResearch,
    "AlumniRadar": AlumniRadar,
    "Arcade": Arcade,
    "ArchiveLanding": ArchiveLanding,
    "Arena": Arena,
    "Article": Article,
    "Articles": Articles,
    "BallotBox": BallotBox,
    "BatchNominations": BatchNominations,
    "Biographer": Biographer,
    "BusinessResources": BusinessResources,
    "Calendar": Calendar,
    "CapitalExchange": CapitalExchange,
    "CareerResources": CareerResources,
    "ChessClub": ChessClub,
    "ChessGame": ChessGame,
    "ClaimProfile": ClaimProfile,
    "Comms": Comms,
    "DemoDayEvent": DemoDayEvent,
    "Demographics": Demographics,
    "EditProfile": EditProfile,
    "EnterpriseResources": EnterpriseResources,
    "EventPage": EventPage,
    "FactoryReset": FactoryReset,
    "Feedback": Feedback,
    "Festival": Festival,
    "FounderApplication": FounderApplication,
    "FounderDashboard": FounderDashboard,
    "FounderResources": FounderResources,
    "FundraisingTracker": FundraisingTracker,
    "GamesLanding": GamesLanding,
    "GetStarted": GetStarted,
    "HabitWizard": HabitWizard,
    "HelpCenter": HelpCenter,
    "Home": Home,
    "HonoreeResources": HonoreeResources,
    "HowWePick": HowWePick,
    "Huddle": Huddle,
    "HypeSquad": HypeSquad,
    "HypeSquadWizard": HypeSquadWizard,
    "IntelligenceDashboard": IntelligenceDashboard,
    "InvestorDashboard": InvestorDashboard,
    "InvestorOnboarding": InvestorOnboarding,
    "JobDetail": JobDetail,
    "Landing": Landing,
    "LaunchParty": LaunchParty,
    "Membership": Membership,
    "MentorPortal": MentorPortal,
    "MilestoneDetail": MilestoneDetail,
    "MissionControl": MissionControl,
    "MissionVisionValues": MissionVisionValues,
    "MyFavorites": MyFavorites,
    "Nominations": Nominations,
    "Nominee": Nominee,
    "NomineeResources": NomineeResources,
    "NomineesByDomain": NomineesByDomain,
    "NotFound": NotFound,
    "OriginStory": OriginStory,
    "Passport": Passport,
    "PaymentCancel": PaymentCancel,
    "PaymentSuccess": PaymentSuccess,
    "PrivacyPolicy": PrivacyPolicy,
    "Profile": Profile,
    "ProfileView": ProfileView,
    "PublicProfile": PublicProfile,
    "Quests": Quests,
    "RadarDashboard": RadarDashboard,
    "RadarIntelligence": RadarIntelligence,
    "RaisingJupiter": RaisingJupiter,
    "RankedChoice": RankedChoice,
    "ResultsCountdown": ResultsCountdown,
    "SMEPortal": SMEPortal,
    "Season4": Season4,
    "Shop": Shop,
    "SignalAnalytics": SignalAnalytics,
    "SignalEmbed": SignalEmbed,
    "SignalEngineRoadmap": SignalEngineRoadmap,
    "SignalFeed": SignalFeed,
    "SignalReview": SignalReview,
    "SignalSearch": SignalSearch,
    "SignalTimeline": SignalTimeline,
    "SpaceNews": SpaceNews,
    "SponsorPitch": SponsorPitch,
    "SponsorResources": SponsorResources,
    "Sponsors": Sponsors,
    "StartupDirectory": StartupDirectory,
    "StudentResources": StudentResources,
    "TheHangar": TheHangar,
    "Tips": Tips,
    "Top100Nominees2025": Top100Nominees2025,
    "Top100OS": Top100OS,
    "Top100Women2025": Top100Women2025,
    "TrendingSignals": TrendingSignals,
    "UserProfile": UserProfile,
    "VotingHub": VotingHub,
    "Publisher": Publisher,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
