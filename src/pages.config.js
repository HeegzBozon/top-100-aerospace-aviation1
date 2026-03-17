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
import AcceleratorHub from './pages/AcceleratorHub';
import Admin from './pages/Admin';
import AdminAction from './pages/AdminAction';
import Afterparty from './pages/Afterparty';
import AlumniInResearch from './pages/AlumniInResearch';
import AlumniRadar from './pages/AlumniRadar';
import Arcade from './pages/Arcade';
import ArchiveLanding from './pages/ArchiveLanding';
import Arena from './pages/Arena';
import Article from './pages/Article';
import Articles from './pages/Articles';
import AvailabilitySettings from './pages/AvailabilitySettings';
import BallotBox from './pages/BallotBox';
import BatchNominations from './pages/BatchNominations';
import Biographer from './pages/Biographer';
import BusinessResources from './pages/BusinessResources';
import Calendar from './pages/Calendar';
import CapitalExchange from './pages/CapitalExchange';
import CareerResources from './pages/CareerResources';
import ChessClub from './pages/ChessClub';
import ChessGame from './pages/ChessGame';
import ClaimProfile from './pages/ClaimProfile';
import ClientDashboard from './pages/ClientDashboard';
import Comms from './pages/Comms';
import CompareServices from './pages/CompareServices';
import DemoDayEvent from './pages/DemoDayEvent';
import Demographics from './pages/Demographics';
import EditProfile from './pages/EditProfile';
import EmployerDashboard from './pages/EmployerDashboard';
import EnterpriseResources from './pages/EnterpriseResources';
import EventPage from './pages/EventPage';
import FactoryReset from './pages/FactoryReset';
import Feedback from './pages/Feedback';
import Festival from './pages/Festival';
import FounderApplication from './pages/FounderApplication';
import FounderDashboard from './pages/FounderDashboard';
import FounderResources from './pages/FounderResources';
import FundraisingTracker from './pages/FundraisingTracker';
import GamesLanding from './pages/GamesLanding';
import GatherSpace from './pages/GatherSpace';
import GetStarted from './pages/GetStarted';
import HabitWizard from './pages/HabitWizard';
import HelpCenter from './pages/HelpCenter';
import Home from './pages/Home';
import Home2 from './pages/Home2';
import HonoreeResources from './pages/HonoreeResources';
import HowWePick from './pages/HowWePick';
import Huddle from './pages/Huddle';
import HypeSquad from './pages/HypeSquad';
import HypeSquadWizard from './pages/HypeSquadWizard';
import IntelligenceDashboard from './pages/IntelligenceDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import InvestorOnboarding from './pages/InvestorOnboarding';
import JobDetail from './pages/JobDetail';
import Landing from './pages/Landing';
import LaunchParty from './pages/LaunchParty';
import Membership from './pages/Membership';
import MentorPortal from './pages/MentorPortal';
import MilestoneDetail from './pages/MilestoneDetail';
import MissionControl from './pages/MissionControl';
import MissionVisionValues from './pages/MissionVisionValues';
import MyBookings from './pages/MyBookings';
import MyFavorites from './pages/MyFavorites';
import Nominations from './pages/Nominations';
import Nominee from './pages/Nominee';
import NomineeResources from './pages/NomineeResources';
import NomineesByDomain from './pages/NomineesByDomain';
import NotFound from './pages/NotFound';
import OriginStory from './pages/OriginStory';
import PIPlanner from './pages/PIPlanner';
import Passport from './pages/Passport';
import PaymentCancel from './pages/PaymentCancel';
import PaymentSuccess from './pages/PaymentSuccess';
import PayoutDashboard from './pages/PayoutDashboard';
import PayoutSettings from './pages/PayoutSettings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import ProfileView from './pages/ProfileView';
import ProviderApplication from './pages/ProviderApplication';
import ProviderDashboard from './pages/ProviderDashboard';
import ProviderInbox from './pages/ProviderInbox';
import PublicProfile from './pages/PublicProfile';
import Quests from './pages/Quests';
import RadarDashboard from './pages/RadarDashboard';
import RadarIntelligence from './pages/RadarIntelligence';
import RaisingJupiter from './pages/RaisingJupiter';
import RankedChoice from './pages/RankedChoice';
import RecruitmentRun from './pages/RecruitmentRun';
import ResultsCountdown from './pages/ResultsCountdown';
import SMEPortal from './pages/SMEPortal';
import SWE5TestArchitecture from './pages/SWE5TestArchitecture';
import SWE6QualificationPlan from './pages/SWE6QualificationPlan';
import SYS4IntegrationPlan from './pages/SYS4IntegrationPlan';
import SYS5SystemValidation from './pages/SYS5SystemValidation';
import Season4 from './pages/Season4';
import ServiceCategories from './pages/ServiceCategories';
import ServiceDetail from './pages/ServiceDetail';
import ServicePackagesMarketplace from './pages/ServicePackagesMarketplace';
import ServicesLanding from './pages/ServicesLanding';
import Shop from './pages/Shop';
import SignalAnalytics from './pages/SignalAnalytics';
import SignalEmbed from './pages/SignalEmbed';
import SignalEngineRoadmap from './pages/SignalEngineRoadmap';
import SignalFeed from './pages/SignalFeed';
import SignalReview from './pages/SignalReview';
import SignalSearch from './pages/SignalSearch';
import SignalTimeline from './pages/SignalTimeline';
import SpaceNews from './pages/SpaceNews';
import SponsorPitch from './pages/SponsorPitch';
import SponsorResources from './pages/SponsorResources';
import Sponsors from './pages/Sponsors';
import StartupDirectory from './pages/StartupDirectory';
import StudentResources from './pages/StudentResources';
import TalentExchange from './pages/TalentExchange';
import TalentExchangeLanding from './pages/TalentExchangeLanding';
import TalentLanding from './pages/TalentLanding';
import TheHangar from './pages/TheHangar';
import Tips from './pages/Tips';
import Top100Nominees2025 from './pages/Top100Nominees2025';
import Top100OS from './pages/Top100OS';
import Top100Women2025 from './pages/Top100Women2025';
import TrendingSignals from './pages/TrendingSignals';
import UserProfile from './pages/UserProfile';
import VotingHub from './pages/VotingHub';
import Publisher from './pages/Publisher';
import __Layout from './Layout.jsx';


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
    "AvailabilitySettings": AvailabilitySettings,
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
    "ClientDashboard": ClientDashboard,
    "Comms": Comms,
    "CompareServices": CompareServices,
    "DemoDayEvent": DemoDayEvent,
    "Demographics": Demographics,
    "EditProfile": EditProfile,
    "EmployerDashboard": EmployerDashboard,
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
    "GatherSpace": GatherSpace,
    "GetStarted": GetStarted,
    "HabitWizard": HabitWizard,
    "HelpCenter": HelpCenter,
    "Home": Home,
    "Home2": Home2,
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
    "MyBookings": MyBookings,
    "MyFavorites": MyFavorites,
    "Nominations": Nominations,
    "Nominee": Nominee,
    "NomineeResources": NomineeResources,
    "NomineesByDomain": NomineesByDomain,
    "NotFound": NotFound,
    "OriginStory": OriginStory,
    "PIPlanner": PIPlanner,
    "Passport": Passport,
    "PaymentCancel": PaymentCancel,
    "PaymentSuccess": PaymentSuccess,
    "PayoutDashboard": PayoutDashboard,
    "PayoutSettings": PayoutSettings,
    "PrivacyPolicy": PrivacyPolicy,
    "Profile": Profile,
    "ProfileView": ProfileView,
    "ProviderApplication": ProviderApplication,
    "ProviderDashboard": ProviderDashboard,
    "ProviderInbox": ProviderInbox,
    "PublicProfile": PublicProfile,
    "Quests": Quests,
    "RadarDashboard": RadarDashboard,
    "RadarIntelligence": RadarIntelligence,
    "RaisingJupiter": RaisingJupiter,
    "RankedChoice": RankedChoice,
    "RecruitmentRun": RecruitmentRun,
    "ResultsCountdown": ResultsCountdown,
    "SMEPortal": SMEPortal,
    "SWE5TestArchitecture": SWE5TestArchitecture,
    "SWE6QualificationPlan": SWE6QualificationPlan,
    "SYS4IntegrationPlan": SYS4IntegrationPlan,
    "SYS5SystemValidation": SYS5SystemValidation,
    "Season4": Season4,
    "ServiceCategories": ServiceCategories,
    "ServiceDetail": ServiceDetail,
    "ServicePackagesMarketplace": ServicePackagesMarketplace,
    "ServicesLanding": ServicesLanding,
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
    "TalentExchange": TalentExchange,
    "TalentExchangeLanding": TalentExchangeLanding,
    "TalentLanding": TalentLanding,
    "TheHangar": TheHangar,
    "Tips": Tips,
    "Top100Nominees2025": Top100Nominees2025,
    "Top100OS": Top100OS,
    "Top100Women2025": Top100Women2025,
    "TrendingSignals": TrendingSignals,
    "UserProfile": UserProfile,
    "VotingHub": VotingHub,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};