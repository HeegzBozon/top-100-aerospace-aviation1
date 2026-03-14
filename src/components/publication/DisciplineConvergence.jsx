import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { fetchAerospaceGovFunding } from '@/functions/fetchAerospaceGovFunding';
import { Briefcase, TrendingUp, DollarSign, Atom, ChevronDown, ChevronUp, ExternalLink, Zap, FlaskConical, Layers } from 'lucide-react';

const brand = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

const DISCIPLINE_COLORS = {
  Space: '#1e3a5a',
  Aviation: '#4a90b8',
  Defense: '#374151',
  Engineering: '#7c3aed',
  Manufacturing: '#059669',
  Operations: '#d97706',
  Policy: '#dc2626',
  Entrepreneurship: '#c9a87c',
};

const VIEW_MODES = [
  { id: 'cohort', label: 'Cohort', icon: Layers },
  { id: 'funding', label: 'Federal Funding', icon: DollarSign },
  { id: 'radar', label: 'Convergence Map', icon: Atom },
];

const formatUSD = (val) => {
  if (!val) return '$0';
  if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(0)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(0)}K`;
  return `$${val}`;
};

const CustomTooltip = ({ active, payload, label, fundingData }) => {
  if (!active || !payload?.length) return null;
  const disc = label;
  const fund = fundingData?.[disc];
  return (
    <div className="bg-white border rounded-xl shadow-lg p-4 max-w-xs text-sm"
      style={{ borderColor: `${brand.goldPrestige}40` }}>
      <p className="font-bold mb-1" style={{ color: brand.navyDeep }}>{disc}</p>
      <p style={{ color: brand.skyBlue }}>Cohort members: <strong>{payload[0]?.value}</strong></p>
      {fund?.usFederalFunding > 0 && (
        <p style={{ color: brand.goldPrestige }}>
          Fed. contracts: <strong>{formatUSD(fund.usFederalFunding)}</strong>
        </p>
      )}
      {fund?.nasaPatents > 0 && (
        <p style={{ color: brand.navyDeep }}>NASA patents: <strong>{fund.nasaPatents}</strong></p>
      )}
      {fund?.topAwardees?.[0] && (
        <p className="text-xs mt-2 opacity-70">Top awardee: {fund.topAwardees[0].name}</p>
      )}
    </div>
  );
};

const AwardeeChip = ({ awardee }) => (
  <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs"
    style={{ background: `${brand.navyDeep}08`, borderLeft: `3px solid ${brand.goldPrestige}` }}>
    <span className="font-medium truncate" style={{ color: brand.navyDeep }}>{awardee.name}</span>
    <span className="font-bold flex-shrink-0" style={{ color: brand.goldPrestige }}>
      {formatUSD(awardee.amount)}
    </span>
  </div>
);

const ExpandedDisciplinePanel = ({ disc, cohortCount, fundingData }) => {
  const fund = fundingData?.[disc];
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden mt-2"
    >
      <div className="p-4 rounded-xl grid sm:grid-cols-3 gap-4"
        style={{ background: `${brand.navyDeep}05`, border: `1px solid ${brand.goldPrestige}20` }}>
        {/* Cohort stat */}
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: brand.skyBlue }}>Cohort Members</p>
          <p className="text-3xl font-bold" style={{ color: brand.navyDeep }}>{cohortCount}</p>
          <p className="text-xs mt-1" style={{ color: `${brand.navyDeep}60` }}>In TOP 100 2025</p>
        </div>
        {/* Federal Funding */}
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: brand.skyBlue }}>US Federal Awards</p>
          <p className="text-3xl font-bold" style={{ color: brand.goldPrestige }}>
            {fund?.usFederalFunding ? formatUSD(fund.usFederalFunding) : '—'}
          </p>
          <p className="text-xs mt-1" style={{ color: `${brand.navyDeep}60` }}>
            {fund?.contractCount > 0 ? `${fund.contractCount.toLocaleString()} contracts` : 'via USAspending.gov 2023–2024'}
          </p>
        </div>
        {/* NASA Patents */}
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: brand.skyBlue }}>NASA Tech Patents</p>
          <p className="text-3xl font-bold" style={{ color: '#7c3aed' }}>
            {fund?.nasaPatents ?? '—'}
          </p>
          <p className="text-xs mt-1" style={{ color: `${brand.navyDeep}60` }}>Active innovations</p>
        </div>
        {/* Top Awardees */}
        {fund?.topAwardees?.length > 0 && (
          <div className="sm:col-span-3">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: brand.skyBlue }}>Top Federal Awardees</p>
            <div className="space-y-1.5">
              {fund.topAwardees.map((a, i) => <AwardeeChip key={i} awardee={a} />)}
            </div>
            <a
              href="https://www.usaspending.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs mt-3"
              style={{ color: brand.skyBlue }}
            >
              Source: USAspending.gov <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
        {/* NASA Innovations */}
        {fund?.nasaInnovations?.length > 0 && (
          <div className="sm:col-span-3">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#7c3aed' }}>Featured NASA Innovations</p>
            <ul className="space-y-1">
              {fund.nasaInnovations.map((inv, i) => (
                <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: brand.navyDeep }}>
                  <FlaskConical className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: '#7c3aed' }} />
                  {inv}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function DisciplineConvergence({ nominees }) {
  const [viewMode, setViewMode] = useState('cohort');
  const [expandedDisc, setExpandedDisc] = useState(null);
  const [fundingData, setFundingData] = useState(null);
  const [fundingLoading, setFundingLoading] = useState(false);
  const [fundingError, setFundingError] = useState(null);

  // Compute cohort distribution
  const disciplineData = useMemo(() => {
    const map = {};
    nominees.forEach(n => {
      const disc = n.industry || n.professional_role || 'Other';
      map[disc] = (map[disc] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [nominees]);

  // Radar data — normalize cohort + funding together
  const radarData = useMemo(() => {
    return disciplineData.slice(0, 6).map(({ name, value }) => {
      const fund = fundingData?.[name];
      const maxFund = Math.max(...Object.values(fundingData || {}).map(f => f.usFederalFunding || 0), 1);
      const fundNorm = fund ? Math.round((fund.usFederalFunding / maxFund) * 100) : 0;
      const maxCount = Math.max(...disciplineData.map(d => d.value), 1);
      const cohortNorm = Math.round((value / maxCount) * 100);
      return {
        subject: name,
        Cohort: cohortNorm,
        Funding: fundNorm,
        Patents: Math.min((fund?.nasaPatents || 0) * 10, 100),
      };
    });
  }, [disciplineData, fundingData]);

  useEffect(() => {
    if (viewMode !== 'funding' && viewMode !== 'radar') return;
    if (fundingData || fundingLoading) return;
    setFundingLoading(true);
    fetchAerospaceGovFunding({})
      .then(res => {
        if (res?.data?.data) setFundingData(res.data.data);
        else if (res?.data) setFundingData(res.data);
      })
      .catch(e => setFundingError(e.message))
      .finally(() => setFundingLoading(false));
  }, [viewMode]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 rounded-2xl border"
      style={{ background: 'white', borderColor: `${brand.goldPrestige}40` }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${brand.goldPrestige}20` }}>
            <Briefcase className="w-5 h-5" style={{ color: brand.goldPrestige }} />
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: brand.navyDeep }}>Discipline Convergence</h3>
            <p className="text-sm mt-1" style={{ color: brand.skyBlue }}>
              Expertise, federal investment & innovation density
            </p>
          </div>
        </div>

        {/* View mode tabs */}
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: `${brand.navyDeep}08` }}>
          {VIEW_MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{
                background: viewMode === id ? 'white' : 'transparent',
                color: viewMode === id ? brand.navyDeep : `${brand.navyDeep}60`,
                boxShadow: viewMode === id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cohort Bar Chart */}
      {viewMode === 'cohort' && (
        <div>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={disciplineData} layout="vertical" margin={{ left: 110, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: brand.navyDeep, fontSize: 12 }}
                  width={110}
                />
                <Tooltip content={<CustomTooltip fundingData={fundingData} />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {disciplineData.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={DISCIPLINE_COLORS[entry.name] || brand.skyBlue}
                      opacity={expandedDisc === entry.name ? 1 : 0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Expandable rows */}
          <div className="space-y-1 mt-2">
            {disciplineData.map(({ name, value }) => (
              <div key={name}>
                <button
                  onClick={() => setExpandedDisc(expandedDisc === name ? null : name)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full"
                      style={{ background: DISCIPLINE_COLORS[name] || brand.skyBlue }} />
                    <span style={{ color: brand.navyDeep }}>{name}</span>
                    {fundingData?.[name]?.usFederalFunding > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: `${brand.goldPrestige}20`, color: brand.goldPrestige }}>
                        <DollarSign className="w-2.5 h-2.5 inline-block" />
                        {formatUSD(fundingData[name].usFederalFunding)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ color: brand.goldPrestige }}>{value}</span>
                    {expandedDisc === name
                      ? <ChevronUp className="w-3.5 h-3.5" style={{ color: `${brand.navyDeep}50` }} />
                      : <ChevronDown className="w-3.5 h-3.5" style={{ color: `${brand.navyDeep}50` }} />
                    }
                  </div>
                </button>
                <AnimatePresence>
                  {expandedDisc === name && (
                    <ExpandedDisciplinePanel
                      disc={name}
                      cohortCount={value}
                      fundingData={fundingData}
                    />
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Federal Funding View */}
      {viewMode === 'funding' && (
        <div>
          {fundingLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <Zap className="w-8 h-8 animate-pulse" style={{ color: brand.goldPrestige }} />
              <p className="text-sm" style={{ color: brand.skyBlue }}>Pulling USAspending.gov + NASA data…</p>
            </div>
          ) : fundingError ? (
            <div className="h-40 flex items-center justify-center">
              <p className="text-sm text-red-500">Could not load funding data: {fundingError}</p>
            </div>
          ) : (
            <div>
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={disciplineData.map(d => ({
                      name: d.name,
                      funding: fundingData?.[d.name]?.usFederalFunding || 0,
                      patents: (fundingData?.[d.name]?.nasaPatents || 0) * 1e6,
                    }))}
                    layout="vertical"
                    margin={{ left: 110, right: 20 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name"
                      tick={{ fill: brand.navyDeep, fontSize: 12 }} width={110} />
                    <Tooltip
                      formatter={(val, name) => [
                        name === 'funding' ? formatUSD(val) : `${Math.round(val / 1e6)} patents`,
                        name === 'funding' ? 'Federal Contracts' : 'NASA Patents (×$1M scale)',
                      ]}
                    />
                    <Bar dataKey="funding" fill={brand.goldPrestige} radius={[0, 6, 6, 0]} name="funding" />
                    <Bar dataKey="patents" fill="#7c3aed" radius={[0, 6, 6, 0]} name="patents" opacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: `${brand.navyDeep}60` }}>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-2 rounded-sm inline-block" style={{ background: brand.goldPrestige }} />
                  US Federal Contracts (USAspending.gov)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-2 rounded-sm inline-block" style={{ background: '#7c3aed' }} />
                  NASA Tech Transfer Patents
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Radar / Convergence Map */}
      {viewMode === 'radar' && (
        <div>
          {fundingLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <Atom className="w-8 h-8 animate-spin" style={{ color: brand.goldPrestige }} />
              <p className="text-sm" style={{ color: brand.skyBlue }}>Building convergence map…</p>
            </div>
          ) : (
            <div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke={`${brand.navyDeep}15`} />
                    <PolarAngleAxis dataKey="subject"
                      tick={{ fill: brand.navyDeep, fontSize: 11 }} />
                    <Radar name="Cohort Density" dataKey="Cohort"
                      stroke={brand.navyDeep} fill={brand.navyDeep} fillOpacity={0.25} />
                    <Radar name="Federal Funding" dataKey="Funding"
                      stroke={brand.goldPrestige} fill={brand.goldPrestige} fillOpacity={0.2} />
                    <Radar name="NASA Patents" dataKey="Patents"
                      stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.15} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs">
                {[
                  { label: 'Cohort Density', color: brand.navyDeep },
                  { label: 'Federal Funding', color: brand.goldPrestige },
                  { label: 'NASA Patents', color: '#7c3aed' },
                ].map(({ label, color }) => (
                  <span key={label} className="flex items-center gap-1.5" style={{ color: `${brand.navyDeep}80` }}>
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: color }} />
                    {label}
                  </span>
                ))}
              </div>
              <p className="text-center text-xs mt-3" style={{ color: `${brand.navyDeep}50` }}>
                Normalized 0–100 index. Sources: USAspending.gov, NASA Tech Transfer.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Insight callout */}
      <div className="mt-6 p-4 rounded-xl flex items-start gap-3"
        style={{ background: `${brand.navyDeep}06`, border: `1px dashed ${brand.goldPrestige}60` }}>
        <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: brand.goldPrestige }} />
        <p className="text-xs leading-relaxed" style={{ color: brand.navyDeep }}>
          <strong>Insight:</strong> Space & Aviation disciplines dominate both cohort representation and federal contract value, 
          while Engineering and Defense show the highest density of NASA technology transfer activity — 
          signaling where investment and talent most strongly converge.
        </p>
      </div>
    </motion.div>
  );
}