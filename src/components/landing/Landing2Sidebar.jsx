import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { 
  Home, Search, Link2, Trophy, Award, Shield, IdCard
} from "lucide-react";
import { User } from '@/entities/User';
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  roseAccent: '#d4a574',
  cream: '#faf8f5',
};

const NAV_ITEMS = [
  { icon: Home, label: "Home", href: "Landing", matchPages: ["Landing"] },
  { icon: IdCard, label: "Passport", href: "Passport", matchPages: ["Passport"] },
  { icon: Award, label: "Season 4", href: "Season4", matchPages: ["Season4"] },
  { icon: Search, label: "Explore", href: "TalentExchange", matchPages: ["TalentExchange"] },
  { icon: Link2, label: "Connect", href: "Comms", matchPages: ["Comms"] },
];

const RESOURCES = [
  { label: "Nominee Resources",   href: "Resources", tab: "nominee",    emoji: "🏅" },
  { label: "Honoree Resources",   href: "Resources", tab: "honoree",    emoji: "🏆" },
  { label: "Student Resources",   href: "Resources", tab: "student",    emoji: "🎓" },
  { label: "Career Resources",    href: "Resources", tab: "career",     emoji: "💼" },
  { label: "Founder Resources",   href: "Resources", tab: "founder",    emoji: "🚀" },
  { label: "Business Resources",  href: "Resources", tab: "business",   emoji: "🏢" },
  { label: "Enterprise Resources",href: "Resources", tab: "enterprise", emoji: "🏛️" },
  { label: "Sponsor Resources",   href: "Resources", tab: "sponsor",    emoji: "⭐" },
];

export default function Landing2Sidebar({ activeItem = "Landing" }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        setIsLoggedIn(true);
        setIsAdmin(currentUser?.role === 'admin');
      } catch (e) {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUser(null);
      }
    };
    checkUser();
  }, []);

  return (
    <aside className="w-60 h-screen sticky top-0 flex flex-col overflow-y-auto hidden lg:flex" style={{ background: brandColors.cream, borderRight: `1px solid ${brandColors.navyDeep}10` }}>
      {/* Main Nav */}
      <nav className="p-2 pt-4 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const isActive = item.matchPages?.includes(activeItem) || activeItem === item.href;
          return (
            <Link
              key={item.label}
              to={item.href.startsWith("#") ? item.href : createPageUrl(item.href)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm",
                isActive 
                  ? "text-white" 
                  : "hover:bg-white/50"
              )}
              style={isActive ? { background: brandColors.navyDeep, color: 'white' } : { color: brandColors.navyDeep }}
            >
              <item.icon className="w-5 h-5" style={{ color: isActive ? brandColors.goldLight : brandColors.goldPrestige }} />
              <span style={{ fontFamily: "'Montserrat', sans-serif" }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* CTA Module - Different for logged in vs logged out */}
      {isLoggedIn ? (
        <div className="mx-3 mt-4 p-3 rounded-xl" style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}10, ${brandColors.skyBlue}10)`, border: `1px solid ${brandColors.navyDeep}20` }}>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
            <span className="font-medium text-sm" style={{ color: brandColors.navyDeep, fontFamily: "'Montserrat', sans-serif" }}>Season 4 Open</span>
          </div>
          <p className="text-xs mb-3" style={{ color: brandColors.navyDeep, opacity: 0.7, fontFamily: "'Montserrat', sans-serif" }}>Nominate outstanding leaders in aerospace & aviation</p>
          <Link to={createPageUrl('Season4')}>
            <Button 
              className="w-full text-white text-sm h-9"
              style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}, ${brandColors.skyBlue})`, fontFamily: "'Montserrat', sans-serif" }}
            >
              Submit Nomination
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mx-3 mt-4 p-3 rounded-xl" style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}20, ${brandColors.roseAccent}20)`, border: `1px solid ${brandColors.goldPrestige}40` }}>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
            <span className="font-medium text-sm" style={{ color: brandColors.navyDeep, fontFamily: "'Montserrat', sans-serif" }}>Join the Network</span>
          </div>
          <p className="text-xs mb-3" style={{ color: brandColors.navyDeep, opacity: 0.7, fontFamily: "'Montserrat', sans-serif" }}>Connect with aerospace & aviation leaders</p>
          <Button 
            onClick={() => base44.auth.redirectToLogin()}
            className="w-full text-white text-sm h-9"
            style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})`, fontFamily: "'Montserrat', sans-serif" }}
          >
            Get Started
          </Button>
        </div>
      )}

      {/* Resources */}
      <div className="mt-6 px-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: brandColors.goldPrestige, fontFamily: "'Montserrat', sans-serif" }}>
          Resources
        </h3>
        <div className="space-y-0.5">
          {RESOURCES.map(resource => (
            <Link
              key={resource.label}
              to={`${createPageUrl(resource.href)}?tab=${resource.tab}`}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/50 transition-all text-sm"
              style={{ color: brandColors.navyDeep, fontFamily: "'Montserrat', sans-serif" }}
            >
              <span className="text-base">{resource.emoji}</span>
              <span>{resource.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-auto p-4" style={{ borderTop: `1px solid ${brandColors.navyDeep}10` }}>
        {/* Admin Link */}
        {isAdmin && (
          <Link
            to={createPageUrl('Admin')}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm mb-3",
              activeItem === "Admin" 
                ? "text-white" 
                : "hover:bg-white/50"
            )}
            style={activeItem === "Admin" ? { background: brandColors.navyDeep, color: 'white' } : { color: brandColors.navyDeep }}
          >
            <Shield className="w-5 h-5" style={{ color: activeItem === "Admin" ? brandColors.goldLight : brandColors.goldPrestige }} />
            <span style={{ fontFamily: "'Montserrat', sans-serif" }}>Admin Panel</span>
          </Link>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs" style={{ color: brandColors.navyDeep, fontFamily: "'Montserrat', sans-serif" }}>
          <Link to={createPageUrl('About')} className="hover:opacity-70">About</Link>
          <a href="#" className="hover:opacity-70">Contact</a>
          <Link to={createPageUrl('PrivacyPolicy')} className="hover:opacity-70">Privacy</Link>
          <a href="#" className="hover:opacity-70">Terms</a>
        </div>
        <p className="text-[10px] mt-2" style={{ color: brandColors.navyDeep, opacity: 0.5, fontFamily: "'Montserrat', sans-serif" }}>
          © 2025 TOP 100 Aerospace & Aviation
        </p>
      </div>
    </aside>
  );
}