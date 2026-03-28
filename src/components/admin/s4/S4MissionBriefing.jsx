import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target, Shield, Users, Building2, Rocket, CheckCircle2,
  AlertTriangle, Flame, Clock, Globe, Database, TrendingUp,
  Award, Zap, Lock
} from 'lucide-react';

const brand = {
  navy: '#1e3a5a',
  gold: '#c9a87c',
  sky: '#4a90b8',
  cream: '#faf8f5',
};

// ASPICE V-Model phases
const ASPICE_PHASES = [
  { id: 'phase01', label: 'Phase 01: Foundation & MVP', status: 'active' },
  { id: 'phase02', label: 'Phase 02: Recognition Engine', status: 'upcoming' },
  { id: 'phase03', label: 'Phase 03: Graph Intelligence', status: 'planned' },
  { id: 'phase04', label: 'Phase 04: Enterprise Platform', status: 'planned' },
];

function MetricCard({ icon: Icon, label, value, target, sublabel, color, alertBelow }) {
  const pct = target ? Math.round((value / target) * 100) : null;
  const isAlert = alertBelow && pct !== null && pct < alertBelow;
  return (
    <Card className="border-t-4" style={{ borderTopColor: color }}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Icon className="w-4 h-4" /> {label}
        </div>
        <div className="text-3xl font-bold" style={{ color }}>{value.toLocaleString()}</div>
        {target && (
          <>
            <Progress value={pct} className="h-1.5 mt-2" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{pct}% of {target.toLocaleString()}</span>
              {isAlert && <span className="text-red-500 font-medium">Below target</span>}
            </div>
          </>
        )}
        {sublabel && !target && <div className="text-xs text-gray-400 mt-1">{sublabel}</div>}
      </CardContent>
    </Card>
  );
}

function LineOfEffort({ number, title, icon: Icon, objective, metrics, status, children }) {
  const statusColors = {
    green: { bg: '#10b981', text: 'On Track' },
    yellow: { bg: '#f59e0b', text: 'Needs Attention' },
    red: { bg: '#ef4444', text: 'At Risk' },
  };
  const s = statusColors[status] || statusColors.yellow;
  return (
    <Card className="border-l-4 overflow-hidden" style={{ borderLeftColor: s.bg }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ background: brand.navy }}>
              {number}
            </div>
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: brand.navy }}>
                <Icon className="w-4 h-4" style={{ color: brand.gold }} />
                {title}
              </CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">{objective}</p>
            </div>
          </div>
          <Badge className="text-xs" style={{ background: s.bg, color: 'white' }}>{s.text}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {metrics.map((m, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-xs text-gray-500">{m.label}</div>
                <div className="text-lg font-bold mt-0.5" style={{ color: m.color || brand.navy }}>
                  {m.value}
                </div>
                {m.sublabel && <div className="text-[10px] text-gray-400">{m.sublabel}</div>}
              </div>
            ))}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

export default function S4MissionBriefing({ nominees = [], season }) {
  const loe = useMemo(() => {
    if (!nominees.length) return null;
    const total = nominees.length;
    const claimed = nominees.filter(n => n.claimed_by_user_email).length;
    const verified = nominees.filter(n => n.verified_status === 'fully_verified' || n.verified_status === 'partially_verified').length;
    const withCareer = nominees.filter(n => n.career_history?.length > 0).length;
    const withSkills = nominees.filter(n => n.skills?.length > 0).length;
    const withPhotos = nominees.filter(n => n.avatar_url || n.photo_url).length;
    const withBios = nominees.filter(n => n.bio && n.bio.length > 50).length;
    const withLinkedIn = nominees.filter(n => n.linkedin_profile_url).length;
    const withEndorsements = nominees.filter(n => (n.endorsement_score || 0) > 0).length;

    // Seed Network metrics (the 100 honorees)
    const honorees = [...nominees].sort((a, b) => (b.aura_score || 0) - (a.aura_score || 0)).slice(0, 100);
    const honoreesClaimed = honorees.filter(n => n.claimed_by_user_email).length;
    const honoreesVerified = honorees.filter(n => n.verified_status === 'fully_verified' || n.verified_status === 'partially_verified').length;
    const honoreesWithCareer = honorees.filter(n => n.career_history?.length > 0).length;

    // Countries & organizations for graph density
    const countries = new Set(nominees.map(n => n.country).filter(Boolean));
    const orgs = new Set(nominees.flatMap(n => n.organization_history || []).filter(Boolean));
    const companies = new Set(nominees.map(n => n.company).filter(Boolean));
    const uniquePrograms = orgs.size + companies.size;

    // Estimated graph relationships: Person → Program → Company
    const estimatedRelationships = total * 3 + uniquePrograms * 2;

    // Flightography completeness = claimed + career + verified + skills
    const flightographyScore = Math.round(((claimed + withCareer + verified + withSkills) / (total * 4)) * 100);

    // Seed network activation rate
    const seedActivationRate = Math.round((honoreesClaimed / 100) * 100);

    // Line of Effort statuses
    const loe1Status = flightographyScore >= 50 ? 'green' : flightographyScore >= 25 ? 'yellow' : 'red';
    const loe2Status = seedActivationRate >= 60 ? 'green' : seedActivationRate >= 30 ? 'yellow' : 'red';

    return {
      total, claimed, verified, withCareer, withSkills, withPhotos, withBios,
      withLinkedIn, withEndorsements, honoreesClaimed, honoreesVerified,
      honoreesWithCareer, countries: countries.size, uniquePrograms,
      estimatedRelationships, flightographyScore, seedActivationRate,
      loe1Status, loe2Status,
    };
  }, [nominees]);

  if (!loe) return null;

  return (
    <div className="space-y-6">
      {/* Strategic Objective Banner */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${brand.navy} 0%, #0f2440 50%, #1a3355 100%)` }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: brand.gold }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="text-xs font-bold px-3 py-1" style={{ background: brand.gold, color: 'white' }}>
              <Rocket className="w-3 h-3 mr-1" /> SEASON 4 MANDATE
            </Badge>
            <Badge variant="outline" className="text-xs border-white/30 text-white/70">
              Recognition → Authoritative Institution
            </Badge>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            The Aerospace Talent Graph
          </h2>
          <p className="text-white/60 text-sm max-w-2xl">
            Building the industry's IMDb, Wikipedia, and LinkedIn simultaneously. 
            Moving from Attention Arbitrage to Structured Authority.
          </p>

          {/* ASPICE Phase Indicator */}
          <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1">
            {ASPICE_PHASES.map((phase, i) => (
              <div key={phase.id} className="flex items-center gap-2 shrink-0">
                <div className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  phase.status === 'active' 
                    ? 'bg-white/15 border-white/30 text-white' 
                    : 'bg-white/5 border-white/10 text-white/40'
                }`}>
                  {phase.status === 'active' && <Zap className="w-3 h-3 inline mr-1" style={{ color: brand.gold }} />}
                  {phase.label}
                </div>
                {i < ASPICE_PHASES.length - 1 && <span className="text-white/20">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Three Lines of Effort */}
      <LineOfEffort
        number="1"
        title="Hardening the Flightography Standard"
        icon={Database}
        objective="Establish the Flightography career record as the industry's permanent ledger (SYS.1-3)"
        status={loe.loe1Status}
        metrics={[
          { label: 'Profiles Claimed', value: `${loe.claimed}/${loe.total}`, sublabel: `${Math.round((loe.claimed / Math.max(loe.total, 1)) * 100)}% conversion`, color: brand.navy },
          { label: 'Peer-Verified', value: `${loe.verified}`, sublabel: 'Defensive moat ✓', color: brand.gold },
          { label: 'Career Records', value: `${loe.withCareer}`, sublabel: 'Structured data assets', color: brand.sky },
          { label: 'Skills Mapped', value: `${loe.withSkills}`, sublabel: 'Competency layer', color: '#10b981' },
        ]}
      >
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500 font-medium">Flightography Completeness Score</span>
            <span className="font-bold" style={{ color: brand.navy }}>{loe.flightographyScore}%</span>
          </div>
          <Progress value={loe.flightographyScore} className="h-2" />
        </div>
      </LineOfEffort>

      <LineOfEffort
        number="2"
        title="Activating the Seed Network"
        icon={Users}
        objective="Transform 100 honorees into Verified Aerospace Stewards — the initial governance layer (MAN.3)"
        status={loe.loe2Status}
        metrics={[
          { label: 'Stewards Activated', value: `${loe.honoreesClaimed}/100`, sublabel: `${loe.seedActivationRate}% activation`, color: brand.gold },
          { label: 'Stewards Verified', value: `${loe.honoreesVerified}/100`, sublabel: 'Graph validators', color: '#10b981' },
          { label: 'Graph Relationships', value: loe.estimatedRelationships.toLocaleString(), sublabel: `Person→Program→Company`, color: brand.sky },
          { label: 'Programs Mapped', value: `${loe.uniquePrograms}`, sublabel: `Across ${loe.countries} countries`, color: brand.navy },
        ]}
      >
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500 font-medium">Seed Network Activation Rate</span>
            <span className="font-bold" style={{ color: brand.gold }}>{loe.seedActivationRate}%</span>
          </div>
          <Progress value={loe.seedActivationRate} className="h-2" />
        </div>
      </LineOfEffort>

      <LineOfEffort
        number="3"
        title="Revenue Architecture & Enterprise Transformation"
        icon={Building2}
        objective="Shift revenue mix toward High-Authority Tiers — $150K Platinum, $20K-$75K/mo Residencies"
        status="yellow"
        metrics={[
          { label: 'LinkedIn Profiles', value: `${loe.withLinkedIn}`, sublabel: `${Math.round((loe.withLinkedIn / Math.max(loe.total, 1)) * 100)}% connected`, color: brand.navy },
          { label: 'Photo Coverage', value: `${loe.withPhotos}/${loe.total}`, sublabel: 'Publication ready', color: brand.gold },
          { label: 'Bio Coverage', value: `${loe.withBios}/${loe.total}`, sublabel: 'Content assets', color: brand.sky },
          { label: 'Endorsements', value: `${loe.withEndorsements}`, sublabel: 'Social proof layer', color: '#8b5cf6' },
        ]}
      >
        <div className="mt-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2 text-xs text-amber-800">
            <Lock className="w-3.5 h-3.5" />
            <span className="font-medium">Enterprise revenue tracking requires Stripe + CRM integration. Pipeline data not yet connected.</span>
          </div>
        </div>
      </LineOfEffort>

      {/* Tactical Requirements Table (ASPICE SWE.1-4) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: brand.navy }}>
            <Shield className="w-5 h-5" style={{ color: brand.gold }} />
            Phase 01 → Phase 02 Gate Requirements (SWE.1-4)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                component: 'Data Intake',
                requirement: 'Streamline nomination-to-profile workflow',
                metric: `${loe.claimed} of ${loe.total} claimed (${Math.round((loe.claimed / Math.max(loe.total, 1)) * 100)}%)`,
                status: (loe.claimed / Math.max(loe.total, 1)) >= 0.5 ? 'pass' : 'fail',
              },
              {
                component: 'Graph Logic',
                requirement: 'Map "contributed to" relationships (Falcon 9, Artemis, F-35…)',
                metric: `${loe.estimatedRelationships.toLocaleString()} relationships · ${loe.uniquePrograms} programs`,
                status: loe.uniquePrograms >= 20 ? 'pass' : 'fail',
              },
              {
                component: 'Validation',
                requirement: 'Deploy peer-verification status check (✓)',
                metric: `${loe.verified} verified profiles`,
                status: loe.verified >= 10 ? 'pass' : 'fail',
              },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 bg-gray-50">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: row.status === 'pass' ? '#dcfce7' : '#fef2f2' }}>
                  {row.status === 'pass'
                    ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                    : <AlertTriangle className="w-4 h-4 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: brand.navy }}>{row.component}</div>
                  <div className="text-xs text-gray-500">{row.requirement}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-medium" style={{ color: row.status === 'pass' ? '#10b981' : '#ef4444' }}>
                    {row.metric}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}