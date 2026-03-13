import React from "react";
import { cn } from "@/lib/utils";

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "news", label: "News" },
  { id: "trending", label: "Trending" },
  { id: "roadmap", label: "Roadmap" },
  { id: "getstarted", label: "Get Started" },
];

export default function Landing2FilterBar({ activeFilter, onFilterChange }) {
  return (
    <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-3 overflow-x-auto scrollbar-hide">
      {FILTERS.map(filter => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className="px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all"
          style={{ 
            background: activeFilter === filter.id ? `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.goldLight})` : `${brandColors.skyBlue}15`,
            color: activeFilter === filter.id ? 'white' : brandColors.navyDeep,
            fontFamily: "'Montserrat', sans-serif"
          }}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}