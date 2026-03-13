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
import About from './pages/About';
import Home from './pages/Home';
import Home2 from './pages/Home2';
import Landing from './pages/Landing';
import MissionVisionValues from './pages/MissionVisionValues';
import NotFound from './pages/NotFound';
import OriginStory from './pages/OriginStory';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Comms from './pages/Comms';
import Admin from './pages/Admin';
import AdminAction from './pages/AdminAction';
import FactoryReset from './pages/FactoryReset';
import Calendar from './pages/Calendar';
import MyBookings from './pages/MyBookings';
import MyFavorites from './pages/MyFavorites';
import Comms from './pages/Comms';
import Membership from './pages/Membership';
import AvailabilitySettings from './pages/AvailabilitySettings';
import FounderApplication from './pages/FounderApplication';
import GetStarted from './pages/GetStarted';
import InvestorOnboarding from './pages/InvestorOnboarding';
import ProviderApplication from './pages/ProviderApplication';
import BusinessResources from './pages/BusinessResources';
import CareerResources from './pages/CareerResources';
import EnterpriseResources from './pages/EnterpriseResources';
import FounderResources from './pages/FounderResources';
import HonoreeResources from './pages/HonoreeResources';
import NomineeResources from './pages/NomineeResources';
import StudentResources from './pages/StudentResources';
import CompareServices from './pages/CompareServices';
import JobDetail from './pages/JobDetail';
import ProviderInbox from './pages/ProviderInbox';
import ServiceCategories from './pages/ServiceCategories';
import ServiceDetail from './pages/ServiceDetail';
import ServicePackagesMarketplace from './pages/ServicePackagesMarketplace';
import ServicesLanding from './pages/ServicesLanding';
import Feedback from './pages/Feedback';
import HelpCenter from './pages/HelpCenter';
import AlumniInResearch from './pages/AlumniInResearch';
import AlumniRadar from './pages/AlumniRadar';
import Biographer from './pages/Biographer';
import ClaimProfile from './pages/ClaimProfile';
import Demographics from './pages/Demographics';
import EditProfile from './pages/EditProfile';
import MentorPortal from './pages/MentorPortal';
import Passport from './pages/Passport';
import Profile from './pages/Profile';
import ProfileView from './pages/ProfileView';
import PublicProfile from './pages/PublicProfile';
import RadarDashboard from './pages/RadarDashboard';
import RadarIntelligence from './pages/RadarIntelligence';
import SMEPortal from './pages/SMEPortal';
import StartupDirectory from './pages/StartupDirectory';
import TalentExchange from './pages/TalentExchange';
import TalentExchangeLanding from './pages/TalentExchangeLanding';
import TalentLanding from './pages/TalentLanding';
import UserProfile from './pages/UserProfile';
import Article from './pages/Article';
import Articles from './pages/Articles';
import LaunchParty from './pages/LaunchParty';
import SignalAnalytics from './pages/SignalAnalytics';
import SignalEmbed from './pages/SignalEmbed';
import SignalEngineRoadmap from './pages/SignalEngineRoadmap';
import SignalFeed from './pages/SignalFeed';
import SignalReview from './pages/SignalReview';
import SignalSearch from './pages/SignalSearch';
import SignalTimeline from './pages/SignalTimeline';
import SpaceNews from './pages/SpaceNews';
import TrendingSignals from './pages/TrendingSignals';
import Afterparty from './pages/Afterparty';
import Arcade from './pages/Arcade';
import Arena from './pages/Arena';
import ChessClub from './pages/ChessClub';
import ChessGame from './pages/ChessGame';
import DemoDayEvent from './pages/DemoDayEvent';
import EventPage from './pages/EventPage';
import Events from './pages/Events';
import Festival from './pages/Festival';
import GamesHub from './pages/GamesHub';
import GamesLanding from './pages/GamesLanding';
import GatherSpace from './pages/GatherSpace';
import HabitWizard from './pages/HabitWizard';
import Huddle from './pages/Huddle';
import MissionControl from './pages/MissionControl';
import Play from './pages/Play';
import Quests from './pages/Quests';
import RaisingJupiter from './pages/RaisingJupiter';
import Season4 from './pages/Season4';
import TheHangar from './pages/TheHangar';
import CapitalExchange from './pages/CapitalExchange';
import ClientDashboard from './pages/ClientDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import FounderDashboard from './pages/FounderDashboard';
import FundraisingTracker from './pages/FundraisingTracker';
import IntelligenceDashboard from './pages/IntelligenceDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import PIPlanner from './pages/PIPlanner';
import ProviderDashboard from './pages/ProviderDashboard';
import SWE5TestArchitecture from './pages/SWE5TestArchitecture';
import SWE6QualificationPlan from './pages/SWE6QualificationPlan';
import SYS4IntegrationPlan from './pages/SYS4IntegrationPlan';
import SYS5SystemValidation from './pages/SYS5SystemValidation';
import AcceleratorHub from './pages/AcceleratorHub';
import HypeSquad from './pages/HypeSquad';
import HypeSquadWizard from './pages/HypeSquadWizard';
import MilestoneDetail from './pages/MilestoneDetail';
import RecruitmentRun from './pages/RecruitmentRun';
import ArchiveLanding from './pages/ArchiveLanding';
import BallotBox from './pages/BallotBox';
import BatchNominations from './pages/BatchNominations';
import HowWePick from './pages/HowWePick';
import Nominations from './pages/Nominations';
import Nominee from './pages/Nominee';
import NomineesByDomain from './pages/NomineesByDomain';
import RankedChoice from './pages/RankedChoice';
import ResultsCountdown from './pages/ResultsCountdown';
import Top100Nominees2025 from './pages/Top100Nominees2025';
import Top100OS from './pages/Top100OS';
import Top100Women2025 from './pages/Top100Women2025';
import VotingHub from './pages/VotingHub';
import Endorse from './pages/Endorse';
import PaymentCancel from './pages/PaymentCancel';
import PaymentSuccess from './pages/PaymentSuccess';
import PayoutDashboard from './pages/PayoutDashboard';
import PayoutSettings from './pages/PayoutSettings';
import Shop from './pages/Shop';
import SponsorPitch from './pages/SponsorPitch';
import SponsorResources from './pages/SponsorResources';
import Sponsors from './pages/Sponsors';
import Tips from './pages/Tips';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Home": Home,
    "Home2": Home2,
    "Landing": Landing,
    "MissionVisionValues": MissionVisionValues,
    "NotFound": NotFound,
    "OriginStory": OriginStory,
    "PrivacyPolicy": PrivacyPolicy,
    "Comms": Comms,
    "Admin": Admin,
    "AdminAction": AdminAction,
    "FactoryReset": FactoryReset,
    "Calendar": Calendar,
    "MyBookings": MyBookings,
    "MyFavorites": MyFavorites,
    "Comms": Comms,
    "Membership": Membership,
    "AvailabilitySettings": AvailabilitySettings,
    "FounderApplication": FounderApplication,
    "GetStarted": GetStarted,
    "InvestorOnboarding": InvestorOnboarding,
    "ProviderApplication": ProviderApplication,
    "BusinessResources": BusinessResources,
    "CareerResources": CareerResources,
    "EnterpriseResources": EnterpriseResources,
    "FounderResources": FounderResources,
    "HonoreeResources": HonoreeResources,
    "NomineeResources": NomineeResources,
    "StudentResources": StudentResources,
    "CompareServices": CompareServices,
    "JobDetail": JobDetail,
    "ProviderInbox": ProviderInbox,
    "ServiceCategories": ServiceCategories,
    "ServiceDetail": ServiceDetail,
    "ServicePackagesMarketplace": ServicePackagesMarketplace,
    "ServicesLanding": ServicesLanding,
    "Feedback": Feedback,
    "HelpCenter": HelpCenter,
    "AlumniInResearch": AlumniInResearch,
    "AlumniRadar": AlumniRadar,
    "Biographer": Biographer,
    "ClaimProfile": ClaimProfile,
    "Demographics": Demographics,
    "EditProfile": EditProfile,
    "MentorPortal": MentorPortal,
    "Passport": Passport,
    "Profile": Profile,
    "ProfileView": ProfileView,
    "PublicProfile": PublicProfile,
    "RadarDashboard": RadarDashboard,
    "RadarIntelligence": RadarIntelligence,
    "SMEPortal": SMEPortal,
    "StartupDirectory": StartupDirectory,
    "TalentExchange": TalentExchange,
    "TalentExchangeLanding": TalentExchangeLanding,
    "TalentLanding": TalentLanding,
    "UserProfile": UserProfile,
    "Article": Article,
    "Articles": Articles,
    "LaunchParty": LaunchParty,
    "SignalAnalytics": SignalAnalytics,
    "SignalEmbed": SignalEmbed,
    "SignalEngineRoadmap": SignalEngineRoadmap,
    "SignalFeed": SignalFeed,
    "SignalReview": SignalReview,
    "SignalSearch": SignalSearch,
    "SignalTimeline": SignalTimeline,
    "SpaceNews": SpaceNews,
    "TrendingSignals": TrendingSignals,
    "Afterparty": Afterparty,
    "Arcade": Arcade,
    "Arena": Arena,
    "ChessClub": ChessClub,
    "ChessGame": ChessGame,
    "DemoDayEvent": DemoDayEvent,
    "EventPage": EventPage,
    "Events": Events,
    "Festival": Festival,
    "GamesHub": GamesHub,
    "GamesLanding": GamesLanding,
    "GatherSpace": GatherSpace,
    "HabitWizard": HabitWizard,
    "Huddle": Huddle,
    "MissionControl": MissionControl,
    "Play": Play,
    "Quests": Quests,
    "RaisingJupiter": RaisingJupiter,
    "Season4": Season4,
    "TheHangar": TheHangar,
    "CapitalExchange": CapitalExchange,
    "ClientDashboard": ClientDashboard,
    "EmployerDashboard": EmployerDashboard,
    "FounderDashboard": FounderDashboard,
    "FundraisingTracker": FundraisingTracker,
    "IntelligenceDashboard": IntelligenceDashboard,
    "InvestorDashboard": InvestorDashboard,
    "PIPlanner": PIPlanner,
    "ProviderDashboard": ProviderDashboard,
    "SWE5TestArchitecture": SWE5TestArchitecture,
    "SWE6QualificationPlan": SWE6QualificationPlan,
    "SYS4IntegrationPlan": SYS4IntegrationPlan,
    "SYS5SystemValidation": SYS5SystemValidation,
    "AcceleratorHub": AcceleratorHub,
    "HypeSquad": HypeSquad,
    "HypeSquadWizard": HypeSquadWizard,
    "MilestoneDetail": MilestoneDetail,
    "RecruitmentRun": RecruitmentRun,
    "ArchiveLanding": ArchiveLanding,
    "BallotBox": BallotBox,
    "BatchNominations": BatchNominations,
    "HowWePick": HowWePick,
    "Nominations": Nominations,
    "Nominee": Nominee,
    "NomineesByDomain": NomineesByDomain,
    "RankedChoice": RankedChoice,
    "ResultsCountdown": ResultsCountdown,
    "Top100Nominees2025": Top100Nominees2025,
    "Top100OS": Top100OS,
    "Top100Women2025": Top100Women2025,
    "VotingHub": VotingHub,
    "Endorse": Endorse,
    "PaymentCancel": PaymentCancel,
    "PaymentSuccess": PaymentSuccess,
    "PayoutDashboard": PayoutDashboard,
    "PayoutSettings": PayoutSettings,
    "Shop": Shop,
    "SponsorPitch": SponsorPitch,
    "SponsorResources": SponsorResources,
    "Sponsors": Sponsors,
    "Tips": Tips,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};