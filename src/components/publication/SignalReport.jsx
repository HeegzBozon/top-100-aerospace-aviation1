import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, TrendingUp, Users, Award, BarChart3, Sparkles, ArrowUpRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import EnhancedGeographicDistribution from './EnhancedGeographicDistribution';
import DisciplineConvergence from './DisciplineConvergence';

const brand = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

const StatCard = ({ icon: Icon, label, value, subtext, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="p-5 rounded-xl border"
    style={{ background: 'white', borderColor: `${brand.goldPrestige}40` }}
  >
    <div className="flex items-start justify-between">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: `${brand.navyDeep}10` }}>
        <Icon className="w-5 h-5" style={{ color: brand.navyDeep }} />
      </div>
      {trend && (
        <span className="text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1"
          style={{ background: `${brand.goldPrestige}20`, color: brand.goldPrestige }}>
          <ArrowUpRight className="w-3 h-3" />
          {trend}
        </span>
      )}
    </div>
    <div className="mt-3">
      <p className="text-3xl font-bold" style={{ color: brand.navyDeep }}>{value}</p>
      <p className="text-sm mt-1" style={{ color: brand.skyBlue }}>{label}</p>
      {subtext && <p className="text-xs mt-1" style={{ color: `${brand.navyDeep}60` }}>{subtext}</p>}
    </div>
  </motion.div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-start gap-3 mb-6">
    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: `${brand.goldPrestige}20` }}>
      <Icon className="w-5 h-5" style={{ color: brand.goldPrestige }} />
    </div>
    <div>
      <h3 className="text-xl font-bold" style={{ color: brand.navyDeep }}>{title}</h3>
      {subtitle && <p className="text-sm mt-1" style={{ color: brand.skyBlue }}>{subtitle}</p>}
    </div>
  </div>
);

const SCORE_BAR_COLORS = [brand.navyDeep, brand.skyBlue, brand.goldPrestige, '#8b5cf6', '#10b981'];

export default function SignalReport({ nominees = [] }) {
  const analytics = useMemo(() => {
    if (!nominees.length) return null;

    const countryMap = {};
    nominees.forEach(n => {
      const country = n.country || n.Country || n.region || n.location;
      if (country && typeof country === 'string' && country.trim()) {
        const c = country.trim();
        countryMap[c] = (countryMap[c] || 0) + 1;
      }
    });
    const allCountries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
    const totalCountries = allCountries.length;

    const scoreRanges = [
      { range: '<1100', min: 0, max: 1100, count: 0 },
      { range: '1100–1200', min: 1100, max: 1200, count: 0 },
      { range: '1200–1300', min: 1200, max: 1300, count: 0 },
      { range: '1300–1400', min: 1300, max: 1400, count: 0 },
      { range: '1400+', min: 1400, max: Infinity, count: 0 },
    ];
    nominees.forEach(n => {
      const score = n.aura_score || n.elo_rating || 1200;
      const range = scoreRanges.find(r => score >= r.min && score < r.max);
      if (range) range.count++;
    });

    const withPhotos = nominees.filter(n => n.avatar_url || n.photo_url).length;
    const withBios = nominees.filter(n => n.bio && n.bio.length > 50).length;
    const claimed = nominees.filter(n => n.claimed_by_user_email).length;
    const completeness = Math.round(((withPhotos + withBios + claimed) / (nominees.length * 3)) * 100);

    const topByScore = [...nominees]
      .sort((a, b) => (b.aura_score || 0) - (a.aura_score || 0))
      .slice(0, 5);

    const avgScore = Math.round(
      nominees.reduce((sum, n) => sum + (n.aura_score || n.elo_rating || 1200), 0) / nominees.length
    );

    return {
      total: nominees.length,
      totalCountries,
      scoreRanges,
      completeness,
      claimed,
      topPerformers: topByScore,
      avgScore,
    };
  }, [nominees]);

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: brand.goldPrestige }} />
        <p style={{ color: brand.navyDeep }}>Signal data will be available once voting concludes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Key Metrics — live data, no overlay */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Honorees"
          value={analytics.total}
          subtext="2025 Edition"
        />
        <StatCard
          icon={Globe}
          label="Countries Represented"
          value={analytics.totalCountries}
          subtext="Global reach"
        />
        <StatCard
          icon={BarChart3}
          label="Avg. Signal Score"
          value={analytics.avgScore.toLocaleString()}
          subtext="Across all nominees"
        />
        <StatCard
          icon={Award}
          label="Profile Completeness"
          value={`${analytics.completeness}%`}
          subtext={`${analytics.claimed} profiles claimed`}
        />
      </div>

      {/* Geographic Distribution */}
      <EnhancedGeographicDistribution nominees={nominees} />

      {/* Discipline Convergence — enhanced with gov funding */}
      <DisciplineConvergence nominees={nominees} />

      {/* Signal Strength Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-6 rounded-2xl border"
        style={{ background: 'white', borderColor: `${brand.goldPrestige}40` }}
      >
        <SectionHeader
          icon={TrendingUp}
          title="Signal Strength Distribution"
          subtitle="How scores cluster across the TOP 100"
        />
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.scoreRanges} margin={{ bottom: 20 }}>
              <XAxis dataKey="range" tick={{ fill: brand.navyDeep, fontSize: 11 }} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {analytics.scoreRanges.map((_, i) => (
                  <Cell key={i} fill={SCORE_BAR_COLORS[i % SCORE_BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Top Performers — live, no Coming Soon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-6 rounded-2xl border"
        style={{
          background: `linear-gradient(135deg, ${brand.navyDeep}05, ${brand.goldPrestige}10)`,
          borderColor: brand.goldPrestige
        }}
      >
        <SectionHeader
          icon={Sparkles}
          title="Highest Signal Strength"
          subtitle="Leading voices of the 2025 cohort"
        />
        <div className="grid gap-3">
          {analytics.topPerformers.map((nominee, i) => (
            <div key={nominee.id}
              className="flex items-center gap-4 p-3 rounded-lg"
              style={{ background: 'white' }}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: brand.goldPrestige, color: 'white' }}>
                {i + 1}
              </span>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0"
                style={{ borderColor: brand.goldLight }}>
                {nominee.avatar_url || nominee.photo_url ? (
                  <img src={nominee.avatar_url || nominee.photo_url} alt={nominee.name}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold"
                    style={{ background: brand.goldLight, color: brand.navyDeep }}>
                    {nominee.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ color: brand.navyDeep }}>{nominee.name}</p>
                <p className="text-sm truncate" style={{ color: brand.skyBlue }}>
                  {nominee.title || nominee.company}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold" style={{ color: brand.goldPrestige }}>
                  {(nominee.aura_score || nominee.elo_rating || 0).toLocaleString()}
                </p>
                <p className="text-xs" style={{ color: brand.navyDeep }}>Signal</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center py-8 border-t"
        style={{ borderColor: `${brand.navyDeep}10` }}
      >
        <p className="text-sm" style={{ color: brand.skyBlue }}>
          Data reflects the 2025 TOP 100 Women in Aerospace & Aviation selection process.
        </p>
        <p className="text-xs mt-2" style={{ color: `${brand.navyDeep}50` }}>
          Federal funding data sourced from USAspending.gov and NASA Tech Transfer APIs.
          © {new Date().getFullYear()} TOP 100 Aerospace & Aviation. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}