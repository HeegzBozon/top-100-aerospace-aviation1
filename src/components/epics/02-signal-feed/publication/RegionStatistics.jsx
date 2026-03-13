import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

export default function RegionStatistics({ nominees, regionType, regionName }) {
  const stats = useMemo(() => {
    const filtered = nominees.filter(n => {
      const country = n.country || n.Country || n.region || n.location;
      const continent = n.continent || (typeof window !== 'undefined' && window.__getContinent?.(country)) || 'Unknown';
      
      if (regionType === 'country') return country === regionName;
      if (regionType === 'continent') return continent === regionName;
      return false;
    });

    const count = filtered.length;
    
    // Industry distribution
    const industryMap = {};
    filtered.forEach(n => {
      const industry = n.industry || n.professional_role || 'Unspecified';
      industryMap[industry] = (industryMap[industry] || 0) + 1;
    });
    
    const topIndustries = Object.entries(industryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    return { count, topIndustries };
  }, [nominees, regionType, regionName]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border space-y-4"
      style={{ background: `${brandColors.cream}60`, borderColor: `${brandColors.goldPrestige}30` }}
    >
      <div>
        <p className="text-xs uppercase tracking-wide" style={{ color: brandColors.skyBlue }}>Total Honorees</p>
        <p className="text-3xl font-bold mt-1" style={{ color: brandColors.navyDeep }}>{stats.count}</p>
      </div>

      {stats.topIndustries.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: brandColors.skyBlue }}>Top Industries</p>
          <div className="space-y-2">
            {stats.topIndustries.map((ind, i) => (
              <div key={ind.name} className="flex items-center justify-between text-sm">
                <span style={{ color: brandColors.navyDeep }}>{ind.name}</span>
                <span className="font-semibold" style={{ color: brandColors.goldPrestige }}>{ind.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}