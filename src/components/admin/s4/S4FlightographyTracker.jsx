import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Database, Users, CheckCircle2, AlertTriangle, Shield,
  Link2, Briefcase, GraduationCap, Globe, Award
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', sky: '#4a90b8' };

function HealthBar({ label, value, total, color, icon: Icon }) {
  const pct = Math.round((value / Math.max(total, 1)) * 100);
  return (
    <div>
      <div className="flex justify-between items-center text-sm mb-1">
        <span className="text-gray-600 flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5" />} {label}
        </span>
        <span className="font-semibold tabular-nums">{value}/{total} <span className="text-gray-400 font-normal">({pct}%)</span></span>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-gray-100">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function S4FlightographyTracker({ nominees = [] }) {
  const data = useMemo(() => {
    if (!nominees.length) return null;
    const total = nominees.length;
    return {
      total,
      claimed: nominees.filter(n => n.claimed_by_user_email).length,
      verified: nominees.filter(n => n.verified_status === 'fully_verified' || n.verified_status === 'partially_verified').length,
      selfVerified: nominees.filter(n => n.verified_status === 'self_verified').length,
      withCareer: nominees.filter(n => n.career_history?.length > 0).length,
      withEducation: nominees.filter(n => n.education?.length > 0).length,
      withSkills: nominees.filter(n => n.skills?.length > 0).length,
      withAffiliations: nominees.filter(n => n.affiliations?.length > 0).length,
      withLinkedIn: nominees.filter(n => n.linkedin_profile_url).length,
      withPhotos: nominees.filter(n => n.avatar_url || n.photo_url).length,
      withBios: nominees.filter(n => n.bio && n.bio.length > 50).length,
      withImpact: nominees.filter(n => n.impact_summary).length,
      withEndorsements: nominees.filter(n => (n.endorsement_score || 0) > 0).length,
    };
  }, [nominees]);

  const verificationChart = useMemo(() => {
    if (!nominees.length) return [];
    const counts = { unverified: 0, self_verified: 0, partially_verified: 0, fully_verified: 0 };
    nominees.forEach(n => { counts[n.verified_status || 'unverified']++; });
    return [
      { name: 'Unverified', count: counts.unverified, fill: '#d1d5db' },
      { name: 'Self-Verified', count: counts.self_verified, fill: brand.sky },
      { name: 'Partial', count: counts.partially_verified, fill: brand.gold },
      { name: 'Fully Verified', count: counts.fully_verified, fill: '#10b981' },
    ];
  }, [nominees]);

  if (!data) return <div className="text-center py-16 text-gray-500">No data available.</div>;

  const completenessScore = Math.round(
    ((data.claimed + data.verified + data.withCareer + data.withSkills + data.withPhotos + data.withBios) /
      (data.total * 6)) * 100
  );

  return (
    <div className="space-y-6">
      {/* Flightography Score Banner */}
      <div className="rounded-xl p-5 border-2" style={{ borderColor: `${brand.gold}60`, background: `linear-gradient(135deg, ${brand.navy}08, ${brand.gold}12)` }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" style={{ color: brand.gold }} />
            <span className="font-bold text-lg" style={{ color: brand.navy }}>Flightography Standard Readiness</span>
          </div>
          <span className="text-3xl font-bold tabular-nums" style={{ color: brand.gold }}>{completenessScore}%</span>
        </div>
        <Progress value={completenessScore} className="h-3" />
        <p className="text-xs text-gray-500 mt-2">
          Target: Every honoree converts their award into a structured data asset with verified career, skills, and peer validation.
        </p>
      </div>

      {/* Profile Data Layer Health */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: brand.navy }}>
            <Shield className="w-5 h-5" style={{ color: brand.gold }} />
            Data Layer Health — {data.total} Profiles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <HealthBar label="Claimed Profiles" value={data.claimed} total={data.total} color={brand.navy} icon={Users} />
            <HealthBar label="Photos Uploaded" value={data.withPhotos} total={data.total} color={brand.gold} icon={Award} />
            <HealthBar label="Career History" value={data.withCareer} total={data.total} color={brand.sky} icon={Briefcase} />
            <HealthBar label="Education" value={data.withEducation} total={data.total} color="#8b5cf6" icon={GraduationCap} />
            <HealthBar label="Skills Mapped" value={data.withSkills} total={data.total} color="#10b981" icon={Database} />
            <HealthBar label="Bios (>50 chars)" value={data.withBios} total={data.total} color="#f59e0b" />
            <HealthBar label="LinkedIn Connected" value={data.withLinkedIn} total={data.total} color="#0077b5" icon={Link2} />
            <HealthBar label="Affiliations" value={data.withAffiliations} total={data.total} color="#ec4899" icon={Globe} />
            <HealthBar label="Impact Summary" value={data.withImpact} total={data.total} color="#6366f1" />
            <HealthBar label="Peer Endorsements" value={data.withEndorsements} total={data.total} color={brand.gold} icon={CheckCircle2} />
          </div>
        </CardContent>
      </Card>

      {/* Verification Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: brand.navy }}>
            <CheckCircle2 className="w-5 h-5" style={{ color: brand.gold }} />
            Peer-Verification Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={verificationChart}>
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" allowDecimals={false} />
                <Tooltip formatter={(v) => [v, 'Profiles']} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {verificationChart.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {verificationChart.map(v => (
              <Badge key={v.name} variant="outline" className="text-xs">
                <span className="w-2 h-2 rounded-full inline-block mr-1.5" style={{ background: v.fill }} />
                {v.name}: {v.count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gaps & Actions */}
      <Card className="border-l-4" style={{ borderLeftColor: completenessScore >= 60 ? '#10b981' : '#f59e0b' }}>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: brand.navy }}>
            <AlertTriangle className="w-5 h-5" style={{ color: brand.gold }} />
            Critical Gaps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.claimed < data.total * 0.5 && (
            <GapRow icon={Users} label="Profile Claim Rate Below 50%" detail={`${data.total - data.claimed} unclaimed profiles need outreach`} severity="red" />
          )}
          {data.withCareer < data.total * 0.3 && (
            <GapRow icon={Briefcase} label="Career History Sparse" detail={`Only ${data.withCareer} of ${data.total} have structured career data`} severity="red" />
          )}
          {data.verified < data.total * 0.1 && (
            <GapRow icon={CheckCircle2} label="Peer Verification Not Started" detail={`Only ${data.verified} profiles have peer verification. Deploy validation workflow.`} severity="yellow" />
          )}
          {data.withSkills < data.total * 0.2 && (
            <GapRow icon={Database} label="Skills Layer Incomplete" detail={`${data.withSkills} of ${data.total} have skills mapped. Needed for graph competency matching.`} severity="yellow" />
          )}
          {completenessScore >= 60 && (
            <GapRow icon={CheckCircle2} label="Flightography On Track" detail="Data layers are progressing well toward structured authority." severity="green" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GapRow({ icon: Icon, label, detail, severity }) {
  const colors = { red: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' }, yellow: { bg: '#fffbeb', border: '#fde68a', text: '#92400e' }, green: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' } };
  const c = colors[severity];
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border" style={{ background: c.bg, borderColor: c.border }}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: c.text }} />
      <div>
        <div className="font-semibold text-sm" style={{ color: c.text }}>{label}</div>
        <div className="text-xs" style={{ color: c.text, opacity: 0.8 }}>{detail}</div>
      </div>
    </div>
  );
}