import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Award, Briefcase, Users } from "lucide-react";

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  roseAccent: '#d4a574',
};

export default function Landing2PromoBanner() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 px-3 md:px-4 py-3 md:py-4">
      {/* Banner 1 - Nominations */}
      <Link to={createPageUrl("Nominations")} className="rounded-lg md:rounded-xl p-3 md:p-4 flex items-center gap-3 md:gap-4" style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}40, ${brandColors.roseAccent}40)`, border: `1px solid ${brandColors.goldPrestige}40` }}>
        <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${brandColors.goldPrestige}40` }}>
          <Award className="w-4 h-4 md:w-6 md:h-6" style={{ color: brandColors.goldPrestige }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs md:text-sm" style={{ color: brandColors.goldPrestige, fontFamily: "'Montserrat', sans-serif" }}>NOMINATIONS OPEN</p>
          <p className="text-xs mt-0.5 truncate" style={{ color: brandColors.navyDeep, fontFamily: "'Montserrat', sans-serif" }}>Submit for TOP 100 2025</p>
        </div>
        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 shrink-0" style={{ color: brandColors.goldPrestige }} />
      </Link>

      {/* Banner 2 - Review Council (Coming Soon) */}
      <div className="relative rounded-lg md:rounded-xl p-3 md:p-4 flex items-center gap-3 md:gap-4 cursor-not-allowed opacity-60" style={{ background: `linear-gradient(135deg, ${brandColors.skyBlue}40, ${brandColors.navyDeep}60)`, border: `1px solid ${brandColors.skyBlue}40` }}>
        <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${brandColors.skyBlue}40` }}>
          <Users className="w-4 h-4 md:w-6 md:h-6" style={{ color: brandColors.skyBlue }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs md:text-sm" style={{ color: brandColors.skyBlue, fontFamily: "'Montserrat', sans-serif" }}>REVIEW COUNCIL</p>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'white', fontFamily: "'Montserrat', sans-serif" }}>Join the Season 4 Review Council</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white text-slate-700 shrink-0">COMING SOON</span>
      </div>

      {/* Banner 3 - Sponsorships (Coming Soon) */}
      <div className="relative rounded-lg md:rounded-xl p-3 md:p-4 flex items-center gap-3 md:gap-4 cursor-not-allowed opacity-60" style={{ background: `linear-gradient(135deg, ${brandColors.roseAccent}40, ${brandColors.goldPrestige}40)`, border: `1px solid ${brandColors.roseAccent}40` }}>
        <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${brandColors.roseAccent}40` }}>
          <Briefcase className="w-4 h-4 md:w-6 md:h-6" style={{ color: brandColors.roseAccent }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs md:text-sm" style={{ color: brandColors.roseAccent, fontFamily: "'Montserrat', sans-serif" }}>SPONSORSHIP OPPORTUNITIES</p>
          <p className="text-xs mt-0.5 truncate" style={{ color: brandColors.navyDeep, fontFamily: "'Montserrat', sans-serif" }}>Partner with TOP 100</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white text-slate-700 shrink-0">COMING SOON</span>
      </div>
    </div>
  );
}