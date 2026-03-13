import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
};

const chartColors = [
  brandColors.navyDeep, brandColors.skyBlue, brandColors.goldPrestige,
  '#6b7280', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
];

export default function IndustryDrilldown({ nominees, regionType, regionName }) {
  const industryData = useMemo(() => {
    const filtered = nominees.filter(n => {
      const country = n.country || n.Country || n.region || n.location;
      const continent = n.continent || (typeof window !== 'undefined' && window.__getContinent?.(country)) || 'Unknown';
      
      if (regionType === 'country') return country === regionName;
      if (regionType === 'continent') return continent === regionName;
      return false;
    });

    const industryMap = {};
    filtered.forEach(n => {
      const industry = n.industry || n.professional_role || 'Unspecified';
      industryMap[industry] = (industryMap[industry] || 0) + 1;
    });

    return Object.entries(industryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [nominees, regionType, regionName]);

  if (industryData.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border"
      style={{ background: 'white', borderColor: `${brandColors.goldPrestige}30` }}
    >
      <h4 className="text-sm font-semibold mb-4" style={{ color: brandColors.navyDeep }}>Industry Breakdown</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={industryData} layout="vertical" margin={{ top: 0, right: 20, left: 120, bottom: 0 }}>
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" fill={brandColors.skyBlue} radius={[0, 8, 8, 0]}>
              {industryData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}