import { motion } from 'framer-motion';
import { 
  Users, 
  Vote, 
  Award, 
  Scale, 
  Target, 
  Shield, 
  Sparkles,
  CheckCircle2,
  BarChart3,
  UserCheck,
  Brain,
  Layers
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

const scoringLayers = [
  {
    name: "Pairwise Voting",
    weight: "33%",
    icon: Vote,
    color: "from-blue-500 to-cyan-500",
    description: "Head-to-head matchups where you choose between two nominees. ELO ratings determine relative standing.",
    details: [
      "ELO rating system",
      "Head-to-head comparisons",
      "Community-driven rankings"
    ]
  },
  {
    name: "Ranked Choice Voting",
    weight: "33%",
    icon: Award,
    color: "from-amber-500 to-orange-500",
    description: "Rank your top nominees in order of preference. Borda scoring rewards consistent high placements.",
    details: [
      "Borda count methodology",
      "Top 5 ballot submissions",
      "Weighted position scoring"
    ]
  },
  {
    name: "LinkedIn Influence",
    weight: "33%",
    icon: Users,
    color: "from-purple-500 to-indigo-500",
    description: "Professional network reach as a proxy for industry influence. Scored via Borda method (230 pts max).",
    details: [
      "Follower count ranking",
      "Borda scoring (230 to 1 points)",
      "Professional reach indicator"
    ]
  },
  {
    name: "Objective Achievement Layer",
    weight: "Planned",
    icon: Target,
    color: "from-gray-400 to-gray-500",
    description: "Quantifiable impact metrics—patents, publications, missions, leadership roles.",
    details: [
      "Patents filed and citations",
      "Missions flown or programs led",
      "Team size and budget responsibility"
    ],
    comingSoon: true
  },
  {
    name: "SME Evaluation Layer",
    weight: "Planned",
    icon: UserCheck,
    color: "from-gray-400 to-gray-500",
    description: "Subject Matter Experts validate achievements and assess domain expertise.",
    details: [
      "Expert panel review",
      "Credential verification",
      "Industry contribution assessment"
    ],
    comingSoon: true
  },
  {
    name: "Narrative & Influence Layer",
    weight: "Planned",
    icon: Brain,
    color: "from-gray-400 to-gray-500",
    description: "AI-analyzed storytelling strength, clarity, and persuasive impact.",
    details: [
      "Story arc coherence",
      "Communication clarity",
      "Thought leadership indicators"
    ],
    comingSoon: true
  },
  {
    name: "Normalization Layer",
    weight: "Planned",
    icon: Scale,
    color: "from-gray-400 to-gray-500",
    description: "Fair representation across disciplines, career stages, and demographics.",
    details: [
      "Discipline-specific benchmarking",
      "Career stage calibration",
      "Diversity and inclusion factors"
    ],
    comingSoon: true
  }
];

const principles = [
  {
    icon: Shield,
    title: "Anti-Gaming Protection",
    description: "Multi-layered scoring prevents manipulation. No single factor dominates the outcome."
  },
  {
    icon: Users,
    title: "Community-Driven",
    description: "Nominations come from peers. The community identifies who deserves recognition."
  },
  {
    icon: BarChart3,
    title: "Data-Backed",
    description: "Objective metrics complement subjective voting for a balanced, defensible result."
  },
  {
    icon: Sparkles,
    title: "Transparent Process",
    description: "Every nominee can see their scores. Every voter understands how their input counts."
  }
];

export default function Season3ScoringFramework() {
  return (
    <div>
      {/* Archive Banner */}
      <div 
        className="py-3 px-6 text-center text-sm"
        style={{ background: `${brandColors.navyDeep}10`, color: brandColors.navyDeep }}
      >
        📁 <strong>Archived:</strong> This is the Season 3 (2025) Scoring Framework
      </div>

      {/* Hero Section */}
      <section className="relative py-16 px-6 overflow-hidden">
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
            <h1 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: brandColors.navyDeep }}
            >
              Season 3 Scoring Framework
            </h1>
            <p 
              className="text-lg md:text-xl mb-6 leading-relaxed"
              style={{ color: `${brandColors.navyDeep}99` }}
            >
              The holistic, multi-dimensional scoring system used for TOP 100 Women 2025.
            </p>
            <div 
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold"
              style={{ background: `${brandColors.goldPrestige}20`, color: brandColors.navyDeep }}
            >
              <Award className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
              Version 3.0 — Archived
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Scoring Layers */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 
              className="text-2xl font-bold mb-3"
              style={{ color: brandColors.navyDeep }}
            >
              The Scoring Layers
            </h2>
            <p style={{ color: `${brandColors.navyDeep}80` }}>
              Each layer contributed to the final Holistic Score (0-100)
            </p>
          </motion.div>

          <div className="space-y-5">
            {scoringLayers.map((layer, index) => {
              const Icon = layer.icon;
              return (
                <motion.div
                  key={layer.name}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border"
                  style={{ borderColor: `${brandColors.navyDeep}10` }}
                >
                  <div className="flex flex-col md:flex-row gap-5">
                    <div className="flex-shrink-0">
                      <div 
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${layer.color} flex items-center justify-center`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 
                          className="text-lg font-bold"
                          style={{ color: layer.comingSoon ? '#9ca3af' : brandColors.navyDeep }}
                        >
                          {layer.name}
                        </h3>
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ 
                            background: layer.comingSoon ? '#f3f4f6' : `${brandColors.goldPrestige}20`, 
                            color: layer.comingSoon ? '#6b7280' : brandColors.navyDeep 
                          }}
                        >
                          {layer.weight}
                        </span>
                        {layer.comingSoon && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                            Not Active in S3
                          </span>
                        )}
                      </div>
                      <p 
                        className="mb-3 text-sm"
                        style={{ color: `${brandColors.navyDeep}80` }}
                      >
                        {layer.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {layer.details.map((detail, i) => (
                          <span 
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                            style={{ 
                              background: `${brandColors.skyBlue}15`, 
                              color: brandColors.navyDeep 
                            }}
                          >
                            <CheckCircle2 className="w-3 h-3" style={{ color: brandColors.skyBlue }} />
                            {detail}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visual Formula */}
      <section className="py-12 px-6" style={{ background: `${brandColors.navyDeep}05` }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-lg border text-center"
            style={{ borderColor: `${brandColors.goldPrestige}30` }}
          >
            <Layers className="w-10 h-10 mx-auto mb-3" style={{ color: brandColors.goldPrestige }} />
            <h3 
              className="text-xl font-bold mb-4"
              style={{ color: brandColors.navyDeep }}
            >
              Season 3 Final Score Formula
            </h3>
            <div 
              className="font-mono text-sm md:text-base p-4 rounded-xl mb-4"
              style={{ background: `${brandColors.navyDeep}05`, color: brandColors.navyDeep }}
            >
              <span className="text-blue-600">Pairwise ELO (33%)</span> + 
              <span className="text-orange-600"> Ranked Choice Borda (33%)</span> + 
              <span className="text-purple-600"> LinkedIn Borda (33%)</span>
              <div className="mt-3 text-xl font-bold" style={{ color: brandColors.goldPrestige }}>
                = Final Score
              </div>
            </div>
            <p className="text-sm" style={{ color: `${brandColors.navyDeep}70` }}>
              The top 100 nominees with the highest holistic scores were recognized in Season 3.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 
              className="text-2xl font-bold mb-3"
              style={{ color: brandColors.navyDeep }}
            >
              Guiding Principles
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {principles.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <motion.div
                  key={principle.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-5 border"
                  style={{ borderColor: `${brandColors.navyDeep}10` }}
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: `${brandColors.goldPrestige}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                  </div>
                  <h3 
                    className="text-base font-bold mb-2"
                    style={{ color: brandColors.navyDeep }}
                  >
                    {principle.title}
                  </h3>
                  <p className="text-sm" style={{ color: `${brandColors.navyDeep}70` }}>
                    {principle.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}