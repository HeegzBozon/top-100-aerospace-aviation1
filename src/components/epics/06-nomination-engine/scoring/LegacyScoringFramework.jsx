import { motion } from 'framer-motion';
import { 
  Linkedin, 
  AlertTriangle, 
  Heart, 
  MessageCircle, 
  Share2,
  TrendingUp,
  ArrowRight,
  History,
  Lightbulb
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

const flaws = [
  {
    title: "Popularity ≠ Impact",
    description: "Engagement metrics favored content creators over operational leaders, engineers, and behind-the-scenes contributors."
  },
  {
    title: "Algorithm Dependency",
    description: "LinkedIn's algorithm determined visibility. Great work posted at the wrong time simply disappeared."
  },
  {
    title: "No Verification Layer",
    description: "Claims were taken at face value. No SME validation, no credential checks, no peer confirmation."
  },
  {
    title: "Gaming Vulnerability",
    description: "Engagement pods, comment exchanges, and viral hooks could artificially inflate scores."
  },
  {
    title: "Career Stage Blindness",
    description: "Early-career professionals with social media savvy outranked senior leaders with decades of impact."
  },
  {
    title: "Discipline Bias",
    description: "Public-facing roles dominated. Engineers, researchers, and operators were structurally disadvantaged."
  }
];

export default function LegacyScoringFramework({ season = 1 }) {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-gray-400" />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-gray-300" />
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
              <History className="w-3.5 h-3.5" />
              ARCHIVED METHODOLOGY
            </div>
            <h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3"
              style={{ color: brandColors.navyDeep }}
            >
              Season {season} Scoring
            </h1>
            <p 
              className="text-base md:text-lg mb-6 leading-relaxed max-w-2xl mx-auto"
              style={{ color: `${brandColors.navyDeep}80` }}
            >
              {season === 1 ? "2021" : "2022"} • The original methodology that started it all—and taught us what not to do.
            </p>

            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
              style={{ background: `#f59e0b15`, border: '1px solid #f59e0b30' }}
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-amber-700 font-medium">Deprecated</span>
              <span className="text-amber-600/70">— replaced by Season 3 framework</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Formula */}
      <section className="py-10 px-6" style={{ background: `${brandColors.navyDeep}05` }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-lg border text-center"
            style={{ borderColor: `${brandColors.navyDeep}15` }}
          >
            <Linkedin className="w-12 h-12 mx-auto mb-4 text-[#0A66C2]" />
            <h2 
              className="text-xl font-bold mb-2"
              style={{ color: brandColors.navyDeep }}
            >
              The Original Formula
            </h2>
            <p className="text-sm mb-6" style={{ color: `${brandColors.navyDeep}60` }}>
              Simple. Measurable. Fundamentally flawed.
            </p>

            <div 
              className="font-mono text-base md:text-lg p-5 rounded-xl mb-6"
              style={{ background: `${brandColors.navyDeep}05`, color: brandColors.navyDeep }}
            >
              <span className="text-[#0A66C2] font-bold">Score</span> = Σ (Engagement on Last 10 LinkedIn Posts)
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center p-3 rounded-lg" style={{ background: `${brandColors.navyDeep}05` }}>
                <Heart className="w-5 h-5 mx-auto mb-1 text-red-500" />
                <p className="text-xs font-medium" style={{ color: brandColors.navyDeep }}>Likes</p>
              </div>
              <div className="text-center p-3 rounded-lg" style={{ background: `${brandColors.navyDeep}05` }}>
                <MessageCircle className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-xs font-medium" style={{ color: brandColors.navyDeep }}>Comments</p>
              </div>
              <div className="text-center p-3 rounded-lg" style={{ background: `${brandColors.navyDeep}05` }}>
                <Share2 className="w-5 h-5 mx-auto mb-1 text-green-500" />
                <p className="text-xs font-medium" style={{ color: brandColors.navyDeep }}>Shares</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Honest Assessment */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{ color: brandColors.navyDeep }}
            >
              An Honest Assessment
            </h2>
            <p 
              className="text-base max-w-2xl mx-auto"
              style={{ color: `${brandColors.navyDeep}70` }}
            >
              This wasn't a great starting point. It wasn't even a good one. 
              <strong> It was just a starting point.</strong>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flaws.map((flaw, index) => (
              <motion.div
                key={flaw.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-5 border"
                style={{ borderColor: '#fca5a530' }}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: '#fef2f210' }}
                  >
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1" style={{ color: brandColors.navyDeep }}>
                      {flaw.title}
                    </h3>
                    <p className="text-xs" style={{ color: `${brandColors.navyDeep}60` }}>
                      {flaw.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Silver Lining */}
      <section className="py-12 px-6" style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}05, ${brandColors.goldPrestige}05)` }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Lightbulb className="w-10 h-10 mx-auto mb-4" style={{ color: brandColors.goldPrestige }} />
            <h2 
              className="text-xl md:text-2xl font-bold mb-4"
              style={{ color: brandColors.navyDeep }}
            >
              What We Learned
            </h2>
            <p 
              className="text-base mb-6 leading-relaxed"
              style={{ color: `${brandColors.navyDeep}80` }}
            >
              These seasons proved that the aerospace community <em>wanted</em> recognition systems. 
              The enthusiasm was real. The methodology just needed to catch up.
            </p>
            <p 
              className="text-base mb-8 leading-relaxed"
              style={{ color: `${brandColors.navyDeep}80` }}
            >
              The flaws weren't failures—they were lessons. Each one became a design requirement 
              for the <strong>Season 3 framework</strong>, which introduced multi-dimensional scoring, 
              SME validation, and anti-gaming protections.
            </p>

            <div 
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
              style={{ background: brandColors.navyDeep, color: 'white' }}
            >
              <TrendingUp className="w-4 h-4" />
              Season 3 rebuilt everything from first principles
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}