import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Award, Star, Handshake } from "lucide-react";

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  roseAccent: '#d4a574',
};

const BANNERS = [
  {
    label: "NOMINATE",
    sub: "Submit for TOP 100 2026",
    icon: Award,
    iconColor: brandColors.goldPrestige,
    bg: `linear-gradient(135deg, ${brandColors.goldPrestige}40, ${brandColors.roseAccent}40)`,
    border: `${brandColors.goldPrestige}40`,
    iconBg: `${brandColors.goldPrestige}40`,
    to: "Nominations",
  },
  {
    label: "ENDORSE",
    sub: "Back a nominee you believe in",
    icon: Star,
    iconColor: brandColors.skyBlue,
    bg: `linear-gradient(135deg, ${brandColors.skyBlue}30, ${brandColors.navyDeep}50)`,
    border: `${brandColors.skyBlue}40`,
    iconBg: `${brandColors.skyBlue}30`,
    to: "VotingHub",
  },
  {
    label: "SPONSOR",
    sub: "Partner with TOP 100",
    icon: Handshake,
    iconColor: brandColors.roseAccent,
    bg: `linear-gradient(135deg, ${brandColors.roseAccent}40, ${brandColors.goldPrestige}40)`,
    border: `${brandColors.roseAccent}40`,
    iconBg: `${brandColors.roseAccent}40`,
    to: "Sponsors",
  },
];

export default function Landing2PromoBanner() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 px-3 md:px-4 py-3 md:py-4">
      {BANNERS.map(({ label, sub, icon: Icon, iconColor, bg, border, iconBg, to }) => (
        <Link
          key={label}
          to={createPageUrl(to)}
          className="rounded-lg md:rounded-xl p-3 md:p-4 flex items-center gap-3 md:gap-4 transition-opacity hover:opacity-90 min-h-[56px]"
          style={{ background: bg, border: `1px solid ${border}` }}
        >
          <div
            className="w-9 h-9 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: iconBg }}
          >
            <Icon className="w-4 h-4 md:w-6 md:h-6" style={{ color: iconColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs md:text-sm" style={{ color: iconColor, fontFamily: "'Montserrat', sans-serif" }}>
              {label}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 md:w-5 md:h-5 shrink-0" style={{ color: iconColor }} />
        </Link>
      ))}
    </div>
  );
}