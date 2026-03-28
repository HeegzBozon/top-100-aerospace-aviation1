import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users, CheckCircle2, AlertTriangle, Globe, Award,
  Network, ShieldCheck, Star, TrendingUp, MapPin
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', sky: '#4a90b8' };
const PIE_COLORS = [brand.navy, brand.gold, brand.sky, '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1'];

export default function S4SeedNetwork({ nominees = [] }) {
  // The Seed Network = Top 100 honorees by aura_score
  const { honorees, stats, continentData, roleData } = useMemo(() => {
    if (!nominees.length) return { honorees: [], stats: null, continentData: [], roleData: [] };
    const sorted = [...nominees].sort((a, b) => (b.aura_score || 0) - (a.aura_score || 0));
    const top100 = sorted.slice(0, 100);

    const claimed = top100.filter(n => n.claimed_by_user_email).length;
    const verified = top100.filter(n => n.verified_status === 'fully_verified' || n.verified_status === 'partially_verified').length;
    const withCareer = top100.filter(n => n.career_history?.length > 0).length;
    const withEndorsements = top100.filter(n => (n.endorsement_score || 0) > 0).length;
    const withLinkedIn = top100.filter(n => n.linkedin_profile_url).length;
    const withPhotos = top100.filter(n => n.avatar_url || n.photo_url).length;

    // Companies and programs linked
    const allCompanies = new Set(top100.map(n => n.company).filter(Boolean));
    const allOrgs = new Set(top100.flatMap(n => n.organization_history || []).filter(Boolean));
    const totalPrograms = allCompanies.size + allOrgs.size;

    // Continent distribution
    const continents = {};
    top100.forEach(n => { const c = n.continent || 'Unknown'; continents[c] = (continents[c] || 0) + 1; });
    const cData = Object.entries(continents).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));

    // Industry/role distribution
    const roles = {};
    top100.forEach(n => { const r = n.industry || n.professional_role || 'Other'; roles[r] = (roles[r] || 0) + 1; });
    const rData = Object.entries(roles).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 20) + '…' : name, value }));

    return {
      honorees: top100,
      stats: {
        claimed, verified, withCareer, withEndorsements, withLinkedIn, withPhotos,
        totalPrograms,
        activationRate: Math.round((claimed / 100) * 100),
        stewardRate: Math.round((verified / 100) * 100),
        graphRelationships: totalPrograms * 3 + top100.length * 2,
      },
      continentData: cData,
      roleData: rData,
    };
  }, [nominees]);

  if (!stats) return <div className="text-center py-16 text-gray-500">No honoree data available.</div>;

  return (
    <div className="space-y-6">
      {/* Cornerstone Asset Banner */}
      <div className="rounded-xl p-5 border-2" style={{ borderColor: `${brand.gold}60`, background: `linear-gradient(135deg, ${brand.navy}08, ${brand.gold}12)` }}>
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-5 h-5" style={{ color: brand.gold }} />
          <span className="font-bold text-lg" style={{ color: brand.navy }}>Cornerstone Asset: 100 Women in Aerospace</span>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          These 100 honorees are the initial governance layer — Verified Aerospace Stewards responsible for validating graph integrity.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Stewards Activated" value={stats.claimed} target={100} color={brand.gold} />
          <StatBox label="Peer-Verified" value={stats.verified} target={100} color="#10b981" />
          <StatBox label="Graph Relationships" value={stats.graphRelationships} color={brand.sky} />
          <StatBox label="Programs Mapped" value={stats.totalPrograms} color={brand.navy} />
        </div>
      </div>

      {/* Activation & Verification Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: brand.navy }}>
              <Users className="w-5 h-5" style={{ color: brand.gold }} />
              Steward Activation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-5xl font-bold tabular-nums" style={{ color: brand.gold }}>{stats.activationRate}%</div>
              <div className="text-sm text-gray-500 mt-1">{stats.claimed} of 100 honorees claimed</div>
            </div>
            <div className="space-y-3">
              <BarItem label="Claimed" value={stats.claimed} total={100} color={brand.navy} />
              <BarItem label="With Photos" value={stats.withPhotos} total={100} color={brand.gold} />
              <BarItem label="LinkedIn Connected" value={stats.withLinkedIn} total={100} color="#0077b5" />
              <BarItem label="Career History" value={stats.withCareer} total={100} color={brand.sky} />
              <BarItem label="Endorsed" value={stats.withEndorsements} total={100} color="#8b5cf6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: brand.navy }}>
              <ShieldCheck className="w-5 h-5" style={{ color: brand.gold }} />
              Verification Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-5xl font-bold tabular-nums" style={{ color: '#10b981' }}>{stats.stewardRate}%</div>
              <div className="text-sm text-gray-500 mt-1">{stats.verified} of 100 peer-verified</div>
            </div>
            <div className="space-y-2">
              {[
                { stage: 'Unverified', count: 100 - stats.verified - (honorees.filter(n => n.verified_status === 'self_verified').length), color: '#d1d5db' },
                { stage: 'Self-Verified', count: honorees.filter(n => n.verified_status === 'self_verified').length, color: brand.sky },
                { stage: 'Partially Verified', count: honorees.filter(n => n.verified_status === 'partially_verified').length, color: brand.gold },
                { stage: 'Fully Verified', count: honorees.filter(n => n.verified_status === 'fully_verified').length, color: '#10b981' },
              ].map(s => (
                <div key={s.stage} className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-sm text-gray-600 flex-1">{s.stage}</span>
                  <span className="text-sm font-semibold tabular-nums">{Math.max(s.count, 0)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic & Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: brand.navy }}>
              <Globe className="w-5 h-5" style={{ color: brand.gold }} />
              Continent Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={continentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {continentData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: brand.navy }}>
              <Award className="w-5 h-5" style={{ color: brand.gold }} />
              Industry Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleData} layout="vertical">
                  <XAxis type="number" className="text-xs" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" className="text-xs" width={130} />
                  <Tooltip formatter={(v) => [v, 'Honorees']} />
                  <Bar dataKey="value" fill={brand.gold} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatBox({ label, value, target, color }) {
  return (
    <div className="p-3 rounded-lg bg-white border border-gray-100">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-0.5" style={{ color }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {target && (
        <div className="mt-1">
          <Progress value={Math.round((value / target) * 100)} className="h-1" />
          <div className="text-[10px] text-gray-400 mt-0.5">{Math.round((value / target) * 100)}% of {target}</div>
        </div>
      )}
    </div>
  );
}

function BarItem({ label, value, total, color }) {
  const pct = Math.round((value / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium tabular-nums">{value}/100 ({pct}%)</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-gray-100">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}