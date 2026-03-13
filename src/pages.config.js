/**
 * pages.config.js - Page routing configuration
 *
 * MANUALLY MAINTAINED. The @base44/vite-plugin does not auto-discover pages
 * in subdirectories — only the top-level pages/ folder is scanned.
 * When adding a new page, import it here and add it to the PAGES object.
 *
 * Routing keys (e.g. "Profile") determine the URL path (e.g. /Profile).
 * To change the main/landing page, update mainPage below.
 */
import About from './pages/About';
import AcceleratorHub from './pages/epics/05-rapid-response-cells/AcceleratorHub';
import Admin from './pages/capabilities/admin/Admin';
import AdminAction from './pages/capabilities/admin/AdminAction';
import Afterparty from './pages/epics/03-mission-rooms/Afterparty';
import AlumniInResearch from './pages/epics/01-index-engine/AlumniInResearch';
import AlumniRadar from './pages/epics/01-index-engine/AlumniRadar';
import Arcade from './pages/epics/03-mission-rooms/Arcade';
import ArchiveLanding from './pages/epics/06-nomination-engine/ArchiveLanding';
import Arena from './pages/epics/03-mission-rooms/Arena';
import Article from './pages/epics/02-signal-feed/Article';
import Articles from './pages/epics/02-signal-feed/Articles';
import AvailabilitySettings from './pages/capabilities/onboarding/AvailabilitySettings';
import BallotBox from './pages/epics/06-nomination-engine/BallotBox';
import BatchNominations from './pages/epics/06-nomination-engine/BatchNominations';
import Biographer from './pages/epics/01-index-engine/Biographer';
import BusinessResources from './pages/capabilities/resources/BusinessResources';
import Calendar from './pages/capabilities/calendar/Calendar';
import CapitalExchange from './pages/epics/04-project-containers/CapitalExchange';
import CareerResources from './pages/capabilities/resources/CareerResources';
import ChessClub from './pages/epics/03-mission-rooms/ChessClub';
import ChessGame from './pages/epics/03-mission-rooms/ChessGame';
import ClaimProfile from './pages/epics/01-index-engine/ClaimProfile';
import ClientDashboard from './pages/epics/04-project-containers/ClientDashboard';
import Comms from './pages/capabilities/comms/Comms';
import CompareServices from './pages/capabilities/services/CompareServices';
import DemoDayEvent from './pages/epics/03-mission-rooms/DemoDayEvent';
import Demographics from './pages/epics/01-index-engine/Demographics';
import EditProfile from './pages/epics/01-index-engine/EditProfile';
import EmployerDashboard from './pages/epics/04-project-containers/EmployerDashboard';
import EnterpriseResources from './pages/capabilities/resources/EnterpriseResources';
import Endorse from './pages/epics/07-endorsement-system/Endorse';
import EventPage from './pages/epics/03-mission-rooms/EventPage';
import Events from './pages/epics/03-mission-rooms/Events';
import FactoryReset from './pages/capabilities/admin/FactoryReset';
import Feedback from './pages/capabilities/support/Feedback';
import Festival from './pages/epics/03-mission-rooms/Festival';
import FounderApplication from './pages/capabilities/onboarding/FounderApplication';
import FounderDashboard from './pages/epics/04-project-containers/FounderDashboard';
import FounderResources from './pages/capabilities/resources/FounderResources';
import FundraisingTracker from './pages/epics/04-project-containers/FundraisingTracker';
import GamesHub from './pages/epics/03-mission-rooms/GamesHub';
import GamesLanding from './pages/epics/03-mission-rooms/GamesLanding';
import GatherSpace from './pages/epics/03-mission-rooms/GatherSpace';
import GetStarted from './pages/capabilities/onboarding/GetStarted';
import HabitWizard from './pages/epics/03-mission-rooms/HabitWizard';
import HelpCenter from './pages/capabilities/support/HelpCenter';
import Home from './pages/Home';
import Home2 from './pages/Home2';
import HonoreeResources from './pages/capabilities/resources/HonoreeResources';
import HowWePick from './pages/epics/06-nomination-engine/HowWePick';
import Huddle from './pages/epics/03-mission-rooms/Huddle';
import HypeSquad from './pages/epics/05-rapid-response-cells/HypeSquad';
import HypeSquadWizard from './pages/epics/05-rapid-response-cells/HypeSquadWizard';
import IntelligenceDashboard from './pages/epics/04-project-containers/IntelligenceDashboard';
import InvestorDashboard from './pages/epics/04-project-containers/InvestorDashboard';
import InvestorOnboarding from './pages/capabilities/onboarding/InvestorOnboarding';
import JobDetail from './pages/capabilities/services/JobDetail';
import Landing from './pages/Landing';
import LaunchParty from './pages/epics/02-signal-feed/LaunchParty';
import Membership from './pages/capabilities/membership/Membership';
import MentorPortal from './pages/epics/01-index-engine/MentorPortal';
import MilestoneDetail from './pages/epics/05-rapid-response-cells/MilestoneDetail';
import MissionControl from './pages/epics/03-mission-rooms/MissionControl';
import MissionVisionValues from './pages/MissionVisionValues';
import MyBookings from './pages/capabilities/calendar/MyBookings';
import MyFavorites from './pages/capabilities/calendar/MyFavorites';
import Nominations from './pages/epics/06-nomination-engine/Nominations';
import Nominee from './pages/epics/06-nomination-engine/Nominee';
import NomineeResources from './pages/capabilities/resources/NomineeResources';
import NomineesByDomain from './pages/epics/06-nomination-engine/NomineesByDomain';
import NotFound from './pages/NotFound';
import OriginStory from './pages/OriginStory';
import PIPlanner from './pages/epics/04-project-containers/PIPlanner';
import Passport from './pages/epics/01-index-engine/Passport';
import PaymentCancel from './pages/epics/08-sponsor-commercial/PaymentCancel';
import PaymentSuccess from './pages/epics/08-sponsor-commercial/PaymentSuccess';
import PayoutDashboard from './pages/epics/08-sponsor-commercial/PayoutDashboard';
import PayoutSettings from './pages/epics/08-sponsor-commercial/PayoutSettings';
import Play from './pages/epics/03-mission-rooms/Play';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/epics/01-index-engine/Profile';
import ProfileView from './pages/epics/01-index-engine/ProfileView';
import ProviderApplication from './pages/capabilities/onboarding/ProviderApplication';
import ProviderDashboard from './pages/epics/04-project-containers/ProviderDashboard';
import ProviderInbox from './pages/capabilities/services/ProviderInbox';
import PublicProfile from './pages/epics/01-index-engine/PublicProfile';
import Quests from './pages/epics/03-mission-rooms/Quests';
import RadarDashboard from './pages/epics/01-index-engine/RadarDashboard';
import RadarIntelligence from './pages/epics/01-index-engine/RadarIntelligence';
import RaisingJupiter from './pages/epics/03-mission-rooms/RaisingJupiter';
import RankedChoice from './pages/epics/06-nomination-engine/RankedChoice';
import RecruitmentRun from './pages/epics/05-rapid-response-cells/RecruitmentRun';
import ResultsCountdown from './pages/epics/06-nomination-engine/ResultsCountdown';
import SMEPortal from './pages/epics/01-index-engine/SMEPortal';
import SWE5TestArchitecture from './pages/epics/04-project-containers/SWE5TestArchitecture';
import SWE6QualificationPlan from './pages/epics/04-project-containers/SWE6QualificationPlan';
import SYS4IntegrationPlan from './pages/epics/04-project-containers/SYS4IntegrationPlan';
import SYS5SystemValidation from './pages/epics/04-project-containers/SYS5SystemValidation';
import Season4 from './pages/epics/03-mission-rooms/Season4';
import ServiceCategories from './pages/capabilities/services/ServiceCategories';
import ServiceDetail from './pages/capabilities/services/ServiceDetail';
import ServicePackagesMarketplace from './pages/capabilities/services/ServicePackagesMarketplace';
import ServicesLanding from './pages/capabilities/services/ServicesLanding';
import Shop from './pages/epics/08-sponsor-commercial/Shop';
import SignalAnalytics from './pages/epics/02-signal-feed/SignalAnalytics';
import SignalEmbed from './pages/epics/02-signal-feed/SignalEmbed';
import SignalEngineRoadmap from './pages/epics/02-signal-feed/SignalEngineRoadmap';
import SignalFeed from './pages/epics/02-signal-feed/SignalFeed';
import SignalReview from './pages/epics/02-signal-feed/SignalReview';
import SignalSearch from './pages/epics/02-signal-feed/SignalSearch';
import SignalTimeline from './pages/epics/02-signal-feed/SignalTimeline';
import SpaceNews from './pages/epics/02-signal-feed/SpaceNews';
import SponsorPitch from './pages/epics/08-sponsor-commercial/SponsorPitch';
import SponsorResources from './pages/epics/08-sponsor-commercial/SponsorResources';
import Sponsors from './pages/epics/08-sponsor-commercial/Sponsors';
import StartupDirectory from './pages/epics/01-index-engine/StartupDirectory';
import StudentResources from './pages/capabilities/resources/StudentResources';
import TalentExchange from './pages/epics/01-index-engine/TalentExchange';
import TalentExchangeLanding from './pages/epics/01-index-engine/TalentExchangeLanding';
import TalentLanding from './pages/epics/01-index-engine/TalentLanding';
import TheHangar from './pages/epics/03-mission-rooms/TheHangar';
import Tips from './pages/epics/08-sponsor-commercial/Tips';
import Top100Nominees2025 from './pages/epics/06-nomination-engine/Top100Nominees2025';
import Top100OS from './pages/epics/06-nomination-engine/Top100OS';
import Top100Women2025 from './pages/epics/06-nomination-engine/Top100Women2025';
import TrendingSignals from './pages/epics/02-signal-feed/TrendingSignals';
import UserProfile from './pages/epics/01-index-engine/UserProfile';
import VotingHub from './pages/epics/06-nomination-engine/VotingHub';
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
    "Endorse": Endorse,
    "EventPage": EventPage,
    "Events": Events,
    "FactoryReset": FactoryReset,
    "Feedback": Feedback,
    "Festival": Festival,
    "FounderApplication": FounderApplication,
    "FounderDashboard": FounderDashboard,
    "FounderResources": FounderResources,
    "FundraisingTracker": FundraisingTracker,
    "GamesHub": GamesHub,
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
    "Play": Play,
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