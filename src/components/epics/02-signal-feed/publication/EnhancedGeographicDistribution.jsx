import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowUpDown, Filter, Share2, Download } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getContinent } from './countryToContinentMap';
import RegionStatistics from './RegionStatistics';
import IndustryDrilldown from './IndustryDrilldown';
import RegionComparison from './RegionComparison';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

const chartColors = [
  brandColors.navyDeep, brandColors.skyBlue, brandColors.goldPrestige,
  '#6b7280', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
];

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-start gap-3 mb-6">
    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${brandColors.goldPrestige}20` }}>
      <Icon className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
    </div>
    <div>
      <h3 className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>{title}</h3>
      {subtitle && <p className="text-sm mt-1" style={{ color: brandColors.skyBlue }}>{subtitle}</p>}
    </div>
  </div>
);

const FilterSortBar = ({ sortBy, setSortBy, filterContinent, setFilterContinent, availableContinents }) => (
  <div className="flex flex-col sm:flex-row gap-3 mb-6">
    <div className="flex items-center gap-2 flex-1">
      <Filter className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
      <select
        value={filterContinent}
        onChange={(e) => setFilterContinent(e.target.value)}
        className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
        style={{
          borderColor: `${brandColors.goldPrestige}40`,
          color: brandColors.navyDeep,
          backgroundColor: 'white'
        }}
      >
        <option value="">All Continents</option>
        {availableContinents.map(cont => (
          <option key={cont} value={cont}>{cont}</option>
        ))}
      </select>
    </div>
    <div className="flex items-center gap-2 flex-1">
      <ArrowUpDown className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
        style={{
          borderColor: `${brandColors.goldPrestige}40`,
          color: brandColors.navyDeep,
          backgroundColor: 'white'
        }}
      >
        <option value="count-desc">Count (High to Low)</option>
        <option value="count-asc">Count (Low to High)</option>
        <option value="alpha">Alphabetical</option>
      </select>
    </div>
  </div>
);

const CountryList = ({ data, chartColors: colors, onSelect, selected }) => (
  <div className="max-h-96 overflow-y-auto pr-2 space-y-1">
    {data.map((item, i) => (
      <button
        key={item.name}
        onClick={() => onSelect(item.name)}
        className="w-full flex items-center justify-between py-1.5 px-2 rounded border-b transition-colors hover:bg-blue-50"
        style={{
          borderColor: `${brandColors.navyDeep}10`,
          background: selected === item.name ? `${colors[i % colors.length]}15` : 'transparent'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: colors[i % colors.length] }} />
          <span className="text-sm truncate" style={{ color: brandColors.navyDeep }}>{item.name}</span>
        </div>
        <span className="font-semibold text-sm flex-shrink-0" style={{ color: brandColors.goldPrestige }}>{item.value}</span>
      </button>
    ))}
  </div>
);

const HonoreeList = ({ nominees, regionType, regionName, onExport }) => {
  const filtered = nominees.filter(n => {
    const country = n.country || n.Country || n.region || n.location;
    if (regionType === 'country') return country === regionName;
    if (regionType === 'continent') {
      const continent = n.continent || getContinent(country) || 'Unknown';
      return continent === regionName;
    }
    return false;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold" style={{ color: brandColors.navyDeep }}>{filtered.length} honorees</p>
        <button
          onClick={() => onExport(regionType, regionName)}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors hover:bg-blue-50"
          style={{ background: `${brandColors.goldPrestige}20`, color: brandColors.goldPrestige }}
        >
          <Download className="w-3 h-3" />
          Export
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto pr-2 space-y-2">
        {filtered.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-2 rounded border text-sm"
            style={{ borderColor: `${brandColors.goldPrestige}30`, background: `${brandColors.cream}60` }}
          >
            <div className="font-semibold flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
              <span>{countryToFlag(n.country)}</span>
              <span>{n.name}</span>
            </div>
            {n.title && <div style={{ color: brandColors.skyBlue }} className="text-xs ml-6">{n.title}</div>}
            {n.company && <div style={{ color: `${brandColors.ink}70` }} className="text-xs ml-6">{n.company}</div>}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const countryToFlag = (countryName) => {
  const flagMap = {
    'USA': '🇺🇸', 'United States': '🇺🇸', 'Canada': '🇨🇦', 'Mexico': '🇲🇽',
    'UK': '🇬🇧', 'United Kingdom': '🇬🇧', 'France': '🇫🇷', 'Germany': '🇩🇪', 'Spain': '🇪🇸', 'Italy': '🇮🇹', 'Netherlands': '🇳🇱', 'Switzerland': '🇨🇭', 'Sweden': '🇸🇪', 'Norway': '🇳🇴',
    'China': '🇨🇳', 'Japan': '🇯🇵', 'India': '🇮🇳', 'South Korea': '🇰🇷', 'Singapore': '🇸🇬', 'Australia': '🇦🇺', 'New Zealand': '🇳🇿',
    'Brazil': '🇧🇷', 'Argentina': '🇦🇷',
  };
  return flagMap[countryName] || '🌐';
};

export default function EnhancedGeographicDistribution({ nominees }) {
  const [sortBy, setSortBy] = useState('count-desc');
  const [filterContinent, setFilterContinent] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [comparisonRegions, setComparisonRegions] = useState([]);
  const sectionRef = useRef(null);

  // Make getContinent available globally for subcomponents
  useEffect(() => {
    window.__getContinent = getContinent;
  }, []);

  useEffect(() => {
    if (window.location.hash === '#geographic-distribution' && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleShareClick = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#geographic-distribution`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = (regionType, regionName) => {
    const filtered = nominees.filter(n => {
      const country = n.country || n.Country || n.region || n.location;
      const continent = n.continent || getContinent(country) || 'Unknown';
      
      if (regionType === 'country') return country === regionName;
      if (regionType === 'continent') return continent === regionName;
      return false;
    });

    const csv = [
      ['Name', 'Title', 'Company', 'Country', 'Industry'].join(','),
      ...filtered.map(h => [
        `"${h.name || ''}"`,
        `"${h.title || ''}"`,
        `"${h.company || ''}"`,
        `"${h.country || ''}"`,
        `"${h.industry || h.professional_role || ''}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${regionName}-honorees.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addToComparison = (region) => {
    if (!comparisonRegions.find(r => r.name === region.name && r.type === region.type)) {
      setComparisonRegions([...comparisonRegions, region]);
    }
  };

  const removeFromComparison = (regionName) => {
    setComparisonRegions(comparisonRegions.filter(r => r.name !== regionName));
  };

  const analytics = useMemo(() => {
    if (!nominees.length) return null;

    // Country distribution with continent mapping
    const countryMap = {};
    nominees.forEach(n => {
      const country = n.country || n.Country || n.region || n.location;
      if (country && typeof country === 'string' && country.trim()) {
        const normalizedCountry = country.trim();
        const continent = n.continent || getContinent(normalizedCountry) || 'Unknown';
        countryMap[normalizedCountry] = {
          count: (countryMap[normalizedCountry]?.count || 0) + 1,
          continent
        };
      }
    });

    // Continent aggregation
    const continentMap = {};
    Object.entries(countryMap).forEach(([country, data]) => {
      const continent = data.continent;
      continentMap[continent] = (continentMap[continent] || 0) + data.count;
    });

    const continents = Object.entries(continentMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    // Countries sorted and filtered
    let countries = Object.entries(countryMap).map(([name, data]) => ({
      name,
      value: data.count,
      continent: data.continent
    }));

    if (filterContinent) {
      countries = countries.filter(c => c.continent === filterContinent);
    }

    // Apply sort
    if (sortBy === 'count-asc') {
      countries.sort((a, b) => a.value - b.value);
    } else if (sortBy === 'alpha') {
      countries.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      countries.sort((a, b) => b.value - a.value);
    }

    return {
      continents,
      countries,
      availableContinents: Object.keys(continentMap).sort()
    };
  }, [nominees, sortBy, filterContinent]);

  if (!analytics) return null;

  return (
    <motion.div
      ref={sectionRef}
      id="geographic-distribution"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 rounded-2xl border scroll-mt-8"
      style={{ background: 'white', borderColor: `${brandColors.goldPrestige}40` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${brandColors.goldPrestige}20` }}>
              <MapPin className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>Geographic Distribution</h3>
              <p className="text-sm mt-1" style={{ color: brandColors.skyBlue }}>Where leadership emerges</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleShareClick}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap"
          style={{
            background: copied ? `${brandColors.skyBlue}20` : `${brandColors.goldPrestige}20`,
            color: copied ? brandColors.skyBlue : brandColors.goldPrestige,
            border: `1px solid ${copied ? brandColors.skyBlue : brandColors.goldPrestige}40`
          }}
          title="Copy share link"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm font-medium">{copied ? 'Copied!' : 'Share'}</span>
        </button>
      </div>

      {comparisonRegions.length > 0 && (
        <RegionComparison
          nominees={nominees}
          selectedRegions={comparisonRegions}
          onRemove={removeFromComparison}
        />
      )}

      <Tabs defaultValue="countries" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6" style={{ background: `${brandColors.navyDeep}05` }}>
          <TabsTrigger value="countries">By Country</TabsTrigger>
          <TabsTrigger value="continents">By Continent</TabsTrigger>
        </TabsList>

        {/* Countries Tab */}
        <TabsContent value="countries" className="space-y-4">
          <FilterSortBar
            sortBy={sortBy}
            setSortBy={setSortBy}
            filterContinent={filterContinent}
            setFilterContinent={setFilterContinent}
            availableContinents={analytics.availableContinents}
          />
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="h-64 cursor-pointer group">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={analytics.countries.slice(0, 12)}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={1}
                      dataKey="value"
                      onClick={(entry) => setSelectedRegion({ type: 'country', name: entry.name })}
                    >
                      {analytics.countries.slice(0, 12).map((_, index) => (
                        <Cell key={index} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <p className="text-xs mt-2 text-center" style={{ color: `${brandColors.ink}60` }}>Click to filter honorees</p>
              {selectedRegion?.type === 'country' && (
                <IndustryDrilldown nominees={nominees} regionType="country" regionName={selectedRegion.name} />
              )}
            </div>
            {selectedRegion?.type === 'country' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg" style={{ color: brandColors.navyDeep }}>
                    <span className="mr-2">{countryToFlag(selectedRegion.name)}</span>
                    {selectedRegion.name}
                  </h4>
                  <button
                    onClick={() => setSelectedRegion(null)}
                    className="text-xs px-2 py-1 rounded transition-colors"
                    style={{ background: `${brandColors.goldPrestige}20`, color: brandColors.goldPrestige }}
                  >
                    Clear
                  </button>
                </div>
                <HonoreeList
                  nominees={nominees}
                  regionType="country"
                  regionName={selectedRegion.name}
                  onExport={handleExportCSV}
                />
                <button
                  onClick={() => addToComparison({ type: 'country', name: selectedRegion.name })}
                  className="w-full text-sm px-3 py-2 rounded transition-colors"
                  style={{ background: brandColors.skyBlue, color: 'white' }}
                >
                  + Add to Comparison
                </button>
              </div>
            ) : (
              <CountryList
                data={analytics.countries}
                chartColors={chartColors}
                onSelect={(name) => setSelectedRegion({ type: 'country', name })}
                selected={selectedRegion?.name}
              />
            )}
          </div>
        </TabsContent>

        {/* Continents Tab */}
        <TabsContent value="continents" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="h-64 cursor-pointer group">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={analytics.continents}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      onClick={(entry) => setSelectedRegion({ type: 'continent', name: entry.name })}
                    >
                      {analytics.continents.map((_, index) => (
                        <Cell key={index} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <p className="text-xs mt-2 text-center" style={{ color: `${brandColors.ink}60` }}>Click to filter honorees</p>
              {selectedRegion?.type === 'continent' && (
                <IndustryDrilldown nominees={nominees} regionType="continent" regionName={selectedRegion.name} />
              )}
            </div>
            {selectedRegion?.type === 'continent' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg" style={{ color: brandColors.navyDeep }}>
                    {selectedRegion.name}
                  </h4>
                  <button
                    onClick={() => setSelectedRegion(null)}
                    className="text-xs px-2 py-1 rounded transition-colors"
                    style={{ background: `${brandColors.goldPrestige}20`, color: brandColors.goldPrestige }}
                  >
                    Clear
                  </button>
                </div>
                <HonoreeList
                  nominees={nominees}
                  regionType="continent"
                  regionName={selectedRegion.name}
                  onExport={handleExportCSV}
                />
                <RegionStatistics nominees={nominees} regionType="continent" regionName={selectedRegion.name} />
                <button
                  onClick={() => addToComparison({ type: 'continent', name: selectedRegion.name })}
                  className="w-full text-sm px-3 py-2 rounded transition-colors"
                  style={{ background: brandColors.skyBlue, color: 'white' }}
                >
                  + Add to Comparison
                </button>
              </div>
            ) : (
              <CountryList
                data={analytics.continents}
                chartColors={chartColors}
                onSelect={(name) => setSelectedRegion({ type: 'continent', name })}
                selected={selectedRegion?.name}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}