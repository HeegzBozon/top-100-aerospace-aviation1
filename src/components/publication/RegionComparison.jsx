import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function RegionComparison({ nominees, selectedRegions, onRemove }) {
  const comparisonData = useMemo(() => {
    return selectedRegions.map(region => {
      const filtered = nominees.filter(n => {
        const country = n.country || n.Country || n.region || n.location;
        const continent = n.continent || (typeof window !== 'undefined' && window.__getContinent?.(country)) || 'Unknown';
        
        if (region.type === 'country') return country === region.name;
        if (region.type === 'continent') return continent === region.name;
        return false;
      });

      return {
        ...region,
        honorees: filtered.slice(0, 5),
        count: filtered.length
      };
    });
  }, [nominees, selectedRegions]);

  if (selectedRegions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border"
      style={{ background: 'white', borderColor: `${brandColors.goldPrestige}30` }}
    >
      <div className="mb-4">
        <h4 className="text-sm font-semibold" style={{ color: brandColors.navyDeep }}>Regional Comparison</h4>
        <p className="text-xs mt-1" style={{ color: `${brandColors.navyDeep}70` }}>Top 5 from each region</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {comparisonData.map((region, idx) => (
          <div
            key={`${region.type}-${region.name}`}
            className="p-3 rounded-lg border relative"
            style={{ background: `${brandColors.cream}80`, borderColor: `${brandColors.goldPrestige}20` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-sm" style={{ color: brandColors.navyDeep }}>{region.name}</p>
                <p className="text-xs" style={{ color: brandColors.skyBlue }}>{region.count} honorees</p>
              </div>
              <button
                onClick={() => onRemove(region.name)}
                className="p-1 rounded transition-colors hover:bg-red-100"
                aria-label="Remove region"
              >
                <X className="w-4 h-4" style={{ color: brandColors.navyDeep }} />
              </button>
            </div>

            <div className="space-y-1.5">
              {region.honorees.map(h => (
                <div key={h.id} className="text-xs">
                  <p className="font-medium" style={{ color: brandColors.navyDeep }}>{h.name}</p>
                  {h.title && <p style={{ color: `${brandColors.navyDeep}60` }}>{h.title}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}