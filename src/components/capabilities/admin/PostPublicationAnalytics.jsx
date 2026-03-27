import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { useRecharts } from '@/lib/recharts-lazy';
import { Download, Users, Globe, TrendingUp, Loader2, FileText, ExternalLink } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
  cream: '#faf8f5',
};

const chartColors = [brandColors.navyDeep, brandColors.skyBlue, brandColors.goldPrestige, '#6b7280', '#10b981'];

export default function PostPublicationAnalytics() {
  // Fetch nominees for publication stats
  const { data: nominees, isLoading: nomineesLoading } = useQuery({
    queryKey: ['publication-nominees'],
    queryFn: () => base44.entities.Nominee.filter({ status: 'active' }),
    initialData: []
  });

  // Fetch users for engagement data
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['publication-users'],
    queryFn: () => base44.entities.User.list(),
    initialData: []
  });

  const isLoading = nomineesLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brandColors.goldPrestige }} />
      </div>
    );
  }

  // Calculate publication metrics
  const top100 = nominees
    .filter(n => n.aura_score > 0 || n.holistic_score > 0)
    .sort((a, b) => (b.aura_score || 0) - (a.aura_score || 0))
    .slice(0, 100);

  // Profile completeness for published honorees
  const withPhotos = top100.filter(n => n.avatar_url || n.photo_url).length;
  const withBios = top100.filter(n => n.bio && n.bio.length > 50).length;
  const withLinkedIn = top100.filter(n => n.linkedin_profile_url).length;
  const claimed = top100.filter(n => n.claimed_by_user_email).length;

  // Geographic distribution
  const countryMap = {};
  top100.forEach(n => {
    if (n.country) {
      countryMap[n.country] = (countryMap[n.country] || 0) + 1;
    }
  });
  const topCountries = Object.entries(countryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([country, count]) => ({ country, count }));

  // Industry distribution
  const industryMap = {};
  top100.forEach(n => {
    if (n.industry) {
      industryMap[n.industry] = (industryMap[n.industry] || 0) + 1;
    }
  });
  const industries = Object.entries(industryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([industry, count]) => ({ industry, count }));

  // Export/Archive purchase tracking (users with archive_export_purchased)
  const archivePurchases = users.filter(u => u.archive_export_purchased).length;

  // Simulated engagement data (in production, you'd track this via analytics)
  const engagementData = [
    { date: 'Jan 1', views: 0, shares: 0 },
    { date: 'Jan 2', views: 150, shares: 12 },
    { date: 'Jan 3', views: 420, shares: 35 },
    { date: 'Jan 4', views: 680, shares: 52 },
    { date: 'Jan 5', views: 890, shares: 71 },
    { date: 'Jan 6', views: 1120, shares: 94 },
    { date: 'Jan 7', views: 1350, shares: 118 },
  ];

  const completenessData = [
    { name: 'Photo', value: withPhotos },
    { name: 'Bio', value: withBios },
    { name: 'LinkedIn', value: withLinkedIn },
    { name: 'Claimed', value: claimed },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>
            Post-Publication Analytics
          </h3>
          <p className="text-sm text-gray-600">TOP 100 Women 2025 — The Orbital Edition</p>
        </div>
        <a 
          href="/Top100Women2025" 
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ background: `${brandColors.goldPrestige}20`, color: brandColors.navyDeep }}
        >
          <ExternalLink className="w-4 h-4" />
          View Publication
        </a>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${brandColors.navyDeep}15` }}>
              <Users className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Honorees Published</p>
              <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>{top100.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${brandColors.skyBlue}15` }}>
              <Globe className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Countries</p>
              <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>{Object.keys(countryMap).length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${brandColors.goldPrestige}15` }}>
              <Download className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Archive Purchases</p>
              <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>{archivePurchases}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-50">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Profiles Claimed</p>
              <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>{claimed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Engagement Over Time (placeholder) */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold" style={{ color: brandColors.navyDeep }}>Engagement Trend</h4>
          <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700">Sample Data</span>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={engagementData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="views" stroke={brandColors.navyDeep} strokeWidth={2} dot={{ r: 4 }} name="Page Views" />
            <Line type="monotone" dataKey="shares" stroke={brandColors.goldPrestige} strokeWidth={2} dot={{ r: 4 }} name="Social Shares" />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 mt-2">
          Note: Integrate with analytics platform for real-time data
        </p>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Completeness */}
        <Card className="p-6">
          <h4 className="font-bold mb-4" style={{ color: brandColors.navyDeep }}>Profile Completeness (TOP 100)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={completenessData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={70} />
              <Tooltip formatter={(val) => [`${val} / 100`, 'Count']} />
              <Bar dataKey="value" fill={brandColors.skyBlue} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm">
            <p className="text-gray-600">
              Overall completeness: <span className="font-bold" style={{ color: brandColors.goldPrestige }}>
                {Math.round(((withPhotos + withBios + withLinkedIn + claimed) / 400) * 100)}%
              </span>
            </p>
          </div>
        </Card>

        {/* Geographic Distribution */}
        <Card className="p-6">
          <h4 className="font-bold mb-4" style={{ color: brandColors.navyDeep }}>Top Countries</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topCountries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill={brandColors.goldPrestige} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Industry Breakdown */}
      <Card className="p-6">
        <h4 className="font-bold mb-4" style={{ color: brandColors.navyDeep }}>Industry Distribution</h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={industries}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="count"
              nameKey="industry"
              label={({ industry, count }) => `${industry}: ${count}`}
              labelLine={false}
            >
              {industries.map((_, idx) => (
                <Cell key={idx} fill={chartColors[idx % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <a 
          href="/Top100Women2025" 
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-gray-50"
          style={{ borderColor: brandColors.navyDeep, color: brandColors.navyDeep }}
        >
          <FileText className="w-4 h-4" />
          Preview Publication
        </a>
        <button 
          onClick={() => window.open('/Top100Women2025#honorees', '_blank')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-gray-50"
          style={{ borderColor: brandColors.goldPrestige, color: brandColors.goldPrestige }}
        >
          <Users className="w-4 h-4" />
          View Honoree Index
        </button>
      </div>
    </div>
  );
}