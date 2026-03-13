import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Users, 
  Vote, 
  Award, 
  Scale, 
  Target, 
  Shield, 
  CheckCircle2,
  BarChart3,
  UserCheck,
  Layers,
  Eye,
  TrendingUp,
  Cpu,
  Database,
  GitBranch,
  Clock,
  Sparkles,
  FileText,
  ArrowRight,
  Construction,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

const LAST_RELEASE = {
  version: "4.0.1",
  date: "January 16, 2026",
  summary: "O-Index / S-Index architecture documentation"
};

// Status types: 'existing' (from S3), 'new' (S4), 'wip' (in progress)
const STATUS_STYLES = {
  existing: { 
    bg: `${brandColors.skyBlue}15`, 
    text: brandColors.skyBlue, 
    label: "Season 3",
    icon: CheckCircle2
  },
  new: { 
    bg: `${brandColors.goldPrestige}20`, 
    text: brandColors.goldPrestige, 
    label: "New in S4",
    icon: Sparkles
  },
  wip: { 
    bg: `#f59e0b20`, 
    text: '#d97706', 
    label: "In Progress",
    icon: Construction
  }
};

// OKRs for Season 4
const objectives = [
  {
    id: 'obj1',
    title: "O-Index: Establish Verified Achievement Layer",
    description: "Anchor credibility through demonstrable, verifiable contributions",
    keyResults: [
      { kr: "Objective Achievement Layer — patents, publications, missions, leadership", status: "existing" },
      { kr: "SME Validation Layer — expert credential validation and peer confirmation", status: "existing" },
      { kr: "Ecosystem Building Layer — mentorship, advocacy, and contributions to building a female aerospace ecosystem", status: "new" },
      { kr: "Normalization & Fairness Layer — discipline/career/geography bias adjustment", status: "new" },
      { kr: "Career-stage adjusted scoring coefficients", status: "wip" },
    ]
  },
  {
    id: 'obj2',
    title: "S-Index: Capture Perceived Influence",
    description: "Measure how the community perceives leadership and relevance",
    keyResults: [
      { kr: "Pairwise Voting (ELO) — head-to-head matchups for relative standing", status: "existing" },
      { kr: "Ranked Choice Voting (Borda) — ballot-based ranking for reputational breadth", status: "existing" },
      { kr: "Influence Proxies — professional visibility signals treated as signals, not proof", status: "new" },
      { kr: "Voter diversity weighting and consistency scoring", status: "wip" },
    ]
  },
  {
    id: 'obj3',
    title: "Index Engine: Computational Core",
    description: "Aggregate, normalize, and produce defensible final placement",
    keyResults: [
      { kr: "Weighting Logic — configurable O-Index / S-Index blend (default 50/50)", status: "existing" },
      { kr: "Confidence Multipliers — based on vote volume and diversity", status: "new" },
      { kr: "Normalization Functions — category and cohort calibration", status: "new" },
      { kr: "Final Score Output — tiers, confidence bands, historical trajectory", status: "wip" },
    ]
  },
  {
    id: 'obj4',
    title: "Institutional Infrastructure",
    description: "Build for long-term authority, archive, and index of impact",
    keyResults: [
      { kr: "Anti-Gaming Protection — multi-layered scoring prevents manipulation", status: "existing" },
      { kr: "Community-Driven Nominations — peers identify who deserves recognition", status: "existing" },
      { kr: "Transparent Process — O/S-Index concepts publicly visible", status: "new" },
      { kr: "Historical Archive — recognition as beginning of institutional placement", status: "wip" },
    ]
  }
];

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status];
  const Icon = style.icon;
  return (
    <span 
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: style.bg, color: style.text }}
    >
      <Icon className="w-3 h-3" />
      {style.label}
    </span>
  );
};

export default function Season4ScoringFramework() {
  const existingCount = objectives.flatMap(o => o.keyResults).filter(kr => kr.status === 'existing').length;
  const newCount = objectives.flatMap(o => o.keyResults).filter(kr => kr.status === 'new').length;
  const wipCount = objectives.flatMap(o => o.keyResults).filter(kr => kr.status === 'wip').length;
  const totalKRs = existingCount + newCount + wipCount;
  const completedKRs = existingCount + newCount;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full" style={{ background: brandColors.goldPrestige }} />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full" style={{ background: brandColors.skyBlue }} />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div 
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: `${brandColors.navyDeep}10`, color: brandColors.navyDeep }}
            >
              <Cpu className="w-3.5 h-3.5" />
              SEASON 4 OKRs
            </div>
            <h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3"
              style={{ color: brandColors.navyDeep }}
            >
              TOP 100 OS & Index Engine
            </h1>
            <p 
              className="text-base md:text-lg mb-6 leading-relaxed max-w-2xl mx-auto"
              style={{ color: `${brandColors.navyDeep}80` }}
            >
              Objectives and Key Results for the operating system that powers all recognition, ranking, and historical record-keeping.
            </p>

            {/* Last Release Info */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                style={{ background: 'white', border: `1px solid ${brandColors.navyDeep}15` }}
              >
                <Clock className="w-4 h-4" style={{ color: brandColors.skyBlue }} />
                <span style={{ color: `${brandColors.navyDeep}70` }}>Last Release:</span>
                <span className="font-semibold" style={{ color: brandColors.navyDeep }}>
                  v{LAST_RELEASE.version}
                </span>
                <span style={{ color: `${brandColors.navyDeep}50` }}>•</span>
                <span style={{ color: `${brandColors.navyDeep}60` }}>{LAST_RELEASE.date}</span>
              </div>
              <Link to={createPageUrl('Calendar') + '?tab=roadmap'}>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-1.5"
                  style={{ borderColor: brandColors.goldPrestige, color: brandColors.navyDeep }}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Release Notes
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>

            {/* Progress Summary */}
            <div 
              className="inline-flex flex-wrap items-center justify-center gap-4 px-5 py-3 rounded-xl"
              style={{ background: 'white', border: `1px solid ${brandColors.navyDeep}10` }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: brandColors.skyBlue }} />
                <span className="text-sm" style={{ color: brandColors.navyDeep }}>
                  <strong>{existingCount}</strong> Season 3
                </span>
              </div>
              <div className="w-px h-4" style={{ background: `${brandColors.navyDeep}20` }} />
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
                <span className="text-sm" style={{ color: brandColors.navyDeep }}>
                  <strong>{newCount}</strong> New in S4
                </span>
              </div>
              <div className="w-px h-4" style={{ background: `${brandColors.navyDeep}20` }} />
              <div className="flex items-center gap-2">
                <Construction className="w-4 h-4" style={{ color: '#d97706' }} />
                <span className="text-sm" style={{ color: brandColors.navyDeep }}>
                  <strong>{wipCount}</strong> In Progress
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Thesis */}
      <section className="py-12 px-6" style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}08, ${brandColors.goldPrestige}05)` }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 md:p-8 border shadow-sm"
            style={{ borderColor: `${brandColors.navyDeep}15` }}
          >
            <div className="text-center mb-6">
              <div 
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-3"
                style={{ background: `${brandColors.navyDeep}10`, color: brandColors.navyDeep }}
              >
                <FileText className="w-3.5 h-3.5" />
                OUR THESIS
              </div>
              <h2 
                className="text-xl md:text-2xl font-bold"
                style={{ color: brandColors.navyDeep }}
              >
                Why Recognition Matters
              </h2>
            </div>
            <div className="space-y-4 text-sm md:text-base leading-relaxed" style={{ color: `${brandColors.navyDeep}85` }}>
              <p>
                <strong style={{ color: brandColors.navyDeep }}>Representation shapes perception. Perception shapes opportunity.</strong>
              </p>
              <p>
                In aerospace and aviation, women remain underrepresented at every level — in engineering, operations, leadership, and entrepreneurship. This is not a pipeline problem alone. It is a visibility problem. A credentialing problem. A recognition problem.
              </p>
              <p>
                When the default image of "aerospace leader" does not include women, the path to leadership becomes harder to see — and harder to walk. Recognition is not vanity. It is infrastructure.
              </p>
              <p>
                <strong style={{ color: brandColors.navyDeep }}>The TOP 100 exists to make impact visible.</strong> To create a durable, defensible record of who is shaping this industry — not through popularity contests or pay-to-play schemes, but through a rigorous, transparent, and evolving system that values real contribution over personal branding.
              </p>
              <p>
                We believe that when you name excellence clearly, you make it easier to find, fund, hire, mentor, and follow. You create reference points. You build institutional memory. You accelerate the future by making it easier to see.
              </p>
              <p className="font-medium" style={{ color: brandColors.goldPrestige }}>
                That is the work. That is why this system exists.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission, Vision & Values */}
      <section className="py-16 px-6" style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}05, ${brandColors.skyBlue}05)` }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div 
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: `${brandColors.goldPrestige}20`, color: brandColors.goldPrestige }}
            >
              <Heart className="w-3.5 h-3.5" />
              WHY WE EXIST
            </div>
            <h2 
              className="text-2xl md:text-3xl font-bold"
              style={{ color: brandColors.navyDeep }}
            >
              Mission, Vision & Values
            </h2>
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 md:p-8 mb-6 border shadow-sm"
            style={{ borderColor: `${brandColors.navyDeep}10` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: brandColors.navyDeep }}
              >
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>Mission</h3>
            </div>
            <p className="text-base leading-relaxed mb-4" style={{ color: `${brandColors.navyDeep}90` }}>
              To identify, recognize, and materially support professionals and organizations who are <strong>advancing women in aerospace and aviation</strong> — strengthening the talent, leadership, and ecosystems required for a resilient and inclusive New Space Economy.
            </p>
            <p className="text-sm" style={{ color: `${brandColors.navyDeep}60` }}>
              This includes those building pathways, opening access, mentoring at scale, and doing the structural work that enables long-term industry transformation.
            </p>
          </motion.div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 md:p-8 mb-6 border shadow-sm"
            style={{ borderColor: `${brandColors.goldPrestige}30` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: brandColors.goldPrestige }}
              >
                <Eye className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>Vision</h3>
            </div>
            <p className="text-base leading-relaxed mb-4" style={{ color: `${brandColors.navyDeep}90` }}>
              A global aerospace, aviation, and space ecosystem where <strong>women are not exceptions or edge cases</strong>, but essential leaders shaping the New Space Economy across engineering, operations, policy, education, entrepreneurship, and exploration.
            </p>
            <p 
              className="text-sm font-medium italic"
              style={{ color: brandColors.goldPrestige }}
            >
              The TOP 100 exists to accelerate that future by making impact visible, connected, and harder to ignore.
            </p>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 md:p-8 border shadow-sm"
            style={{ borderColor: `${brandColors.skyBlue}20` }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: brandColors.skyBlue }}
              >
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>Values</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Impact over visibility", desc: "We value real contribution over personal branding. Outcomes matter more than optics." },
                { title: "Ecosystem-first leadership", desc: "Mentorship, access, workforce development, and community-building are foundational — not optional extras." },
                { title: "Integrity of recognition", desc: "Recognition is earned, not bought. The platform is not pay-to-play, popularity-only, or influence-for-influence." },
                { title: "Inclusive advancement", desc: "We recognize individuals, allies, and organizations whose work materially advances women in aerospace, aviation, and space." },
                { title: "Future-facing responsibility", desc: "The New Space Economy demands long-term thinking. We prioritize leadership that builds durable systems, not short-term hype." },
                { title: "Transparency and evolution", desc: "This is a living system. We iterate in public, listen closely, and improve continuously." },
                { title: "Stewardship over status", desc: "The TOP 100 exists to serve the ecosystem and the future of the industry — not the ego of the list or its operators." },
              ].map((value, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-xl"
                  style={{ background: `${brandColors.navyDeep}03` }}
                >
                  <h4 className="font-semibold text-sm mb-1" style={{ color: brandColors.navyDeep }}>
                    {value.title}
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ color: `${brandColors.navyDeep}60` }}>
                    {value.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Philosophy Quick Summary */}
      <section className="py-8 px-6" style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}05, ${brandColors.skyBlue}05)` }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className="bg-white rounded-xl p-5 border shadow-sm"
              style={{ borderColor: `${brandColors.skyBlue}30` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${brandColors.skyBlue}15` }}
                >
                  <Target className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: brandColors.navyDeep }}>O-Index</h3>
                  <p className="text-xs" style={{ color: brandColors.skyBlue }}>Objective Index</p>
                </div>
              </div>
              <p className="text-sm" style={{ color: `${brandColors.navyDeep}70` }}>
                Verified impact — what can be <strong>proven</strong>
              </p>
            </div>
            <div 
              className="bg-white rounded-xl p-5 border shadow-sm"
              style={{ borderColor: `${brandColors.goldPrestige}30` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${brandColors.goldPrestige}15` }}
                >
                  <Users className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: brandColors.navyDeep }}>S-Index</h3>
                  <p className="text-xs" style={{ color: brandColors.goldPrestige }}>Subjective Index</p>
                </div>
              </div>
              <p className="text-sm" style={{ color: `${brandColors.navyDeep}70` }}>
                Perceived influence — what is <strong>recognized</strong>
              </p>
            </div>
          </div>
          <p 
            className="text-center text-sm mt-4 italic"
            style={{ color: `${brandColors.navyDeep}60` }}
          >
            Neither is sufficient alone. Authority emerges at the intersection.
          </p>
        </div>
      </section>

      {/* OKRs Section */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 
              className="text-2xl md:text-3xl font-bold mb-2"
              style={{ color: brandColors.navyDeep }}
            >
              Season 4 Objectives & Key Results
            </h2>
            <p style={{ color: `${brandColors.navyDeep}60` }}>
              {completedKRs} of {totalKRs} Key Results shipped or in development
            </p>
          </motion.div>

          <div className="space-y-6">
            {objectives.map((obj, objIndex) => (
              <motion.div
                key={obj.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: objIndex * 0.1 }}
                className="bg-white rounded-2xl border overflow-hidden"
                style={{ borderColor: `${brandColors.navyDeep}10` }}
              >
                {/* Objective Header */}
                <div 
                  className="px-5 py-4 border-b"
                  style={{ 
                    background: `linear-gradient(135deg, ${brandColors.navyDeep}03, ${brandColors.goldPrestige}03)`,
                    borderColor: `${brandColors.navyDeep}08`
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm"
                      style={{ background: brandColors.navyDeep, color: 'white' }}
                    >
                      O{objIndex + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-base" style={{ color: brandColors.navyDeep }}>
                        {obj.title}
                      </h3>
                      <p className="text-sm" style={{ color: `${brandColors.navyDeep}60` }}>
                        {obj.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Results */}
                <div className="divide-y" style={{ borderColor: `${brandColors.navyDeep}06` }}>
                  {obj.keyResults.map((kr, krIndex) => (
                    <div 
                      key={krIndex}
                      className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span 
                          className="text-xs font-mono"
                          style={{ color: `${brandColors.navyDeep}40` }}
                        >
                          KR{krIndex + 1}
                        </span>
                        <p className="text-sm" style={{ color: brandColors.navyDeep }}>
                          {kr.kr}
                        </p>
                      </div>
                      <StatusBadge status={kr.status} />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Formula */}
      <section className="py-12 px-6" style={{ background: `${brandColors.navyDeep}05` }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-lg border text-center"
            style={{ borderColor: `${brandColors.goldPrestige}30` }}
          >
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: `${brandColors.navyDeep}10`, color: brandColors.navyDeep }}
            >
              <GitBranch className="w-3.5 h-3.5" />
              INDEX ENGINE CORE
            </div>
            <h3 
              className="text-lg font-bold mb-4"
              style={{ color: brandColors.navyDeep }}
            >
              Scoring Formula
            </h3>
            <div 
              className="font-mono text-base md:text-lg p-4 rounded-xl mb-4"
              style={{ background: `${brandColors.navyDeep}05`, color: brandColors.navyDeep }}
            >
              <span style={{ color: brandColors.skyBlue }}>TOP Score</span> = 
              (<span className="text-emerald-600">O-Index</span> × β) + 
              (<span className="text-amber-600">S-Index</span> × α)
              <div className="mt-3 text-sm" style={{ color: `${brandColors.navyDeep}60` }}>
                Where α + β = 1 | Default: 50/50
              </div>
            </div>
            <p className="text-xs" style={{ color: `${brandColors.navyDeep}60` }}>
              Weights may vary by category or season
            </p>
          </motion.div>
        </div>
      </section>

      {/* Governing Principle */}
      <section className="py-12 px-6" style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}05, ${brandColors.goldPrestige}05)` }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 
              className="text-xl md:text-2xl font-bold mb-4"
              style={{ color: brandColors.navyDeep }}
            >
              Governing Principle
            </h2>
            <p 
              className="text-base md:text-lg italic mb-4"
              style={{ color: `${brandColors.navyDeep}80` }}
            >
              The TOP 100 OS exists to answer one question fairly and durably:
            </p>
            <p 
              className="text-xl md:text-2xl font-bold"
              style={{ color: brandColors.goldPrestige }}
            >
              "Who truly shapes the future of Aerospace & Aviation — and why?"
            </p>
            <p 
              className="text-sm mt-4"
              style={{ color: `${brandColors.navyDeep}50` }}
            >
              Everything else is implementation detail.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}