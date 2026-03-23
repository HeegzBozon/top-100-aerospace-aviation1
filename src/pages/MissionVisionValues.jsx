import { motion } from 'framer-motion';
import { Award, Target, Compass, Shield, Users, Globe } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
  cream: '#faf8f5',
};

export default function MissionVisionValues() {
  const values = [
    {
      icon: Shield,
      title: 'Integrity',
      description: 'Doing what holds up under scrutiny—even when no one is watching.',
    },
    {
      icon: Users,
      title: 'Stewardship',
      description: 'Leaving the system stronger than we found it.',
    },
    {
      icon: Target,
      title: 'Substance Over Visibility',
      description: 'Contribution over clout. Credibility over reach.',
    },
    {
      icon: Compass,
      title: 'Collective Judgment',
      description: 'No single voice decides the outcome. Meaning emerges through convergence.',
    },
    {
      icon: Users,
      title: 'Citizenship in the Community',
      description: 'Mentorship, collaboration, ethical conduct, and service.',
    },
    {
      icon: Globe,
      title: 'Citizenship in the Nation',
      description: 'Responsibility to safety, trust, and the public good.',
    },
    {
      icon: Globe,
      title: 'Citizenship in the World',
      description: 'Awareness of global impact, cultural respect, and long-term consequences.',
    },
    {
      icon: Award,
      title: 'Longevity',
      description: 'Recognition should age well—or not exist at all.',
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: brandColors.cream }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: brandColors.navyDeep }}
          >
            Mission · Vision · Values
          </h1>
          <h2 
            className="text-2xl md:text-3xl font-semibold mb-6"
            style={{ color: brandColors.goldPrestige }}
          >
            TOP 100 in Aerospace & Aviation
          </h2>
          <p 
            className="text-xl md:text-2xl leading-relaxed font-medium"
            style={{ color: brandColors.navyDeep }}
          >
            The TOP 100 exists to protect the meaning of excellence in aerospace and aviation.
          </p>
          <div className="mt-6 space-y-2 text-lg" style={{ color: brandColors.navyDeep }}>
            <p>Not for a moment.</p>
            <p>Not for a season.</p>
            <p className="font-semibold">But for the long arc of the industry.</p>
          </div>
        </motion.div>

        {/* Mission Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
            <h3 className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
              Our Mission
            </h3>
          </div>
          <div className="space-y-4 text-lg leading-relaxed" style={{ color: brandColors.navyDeep }}>
            <p className="font-semibold">
              To recognize and elevate excellence in aerospace and aviation through a credible, community-led process.
            </p>
            <p>Our mission is not to reward popularity, visibility, or momentum for their own sake.</p>
            <p>It is to:</p>
            <ul className="space-y-2 ml-6">
              <li className="list-disc">Surface real contribution</li>
              <li className="list-disc">Reflect peer-earned respect</li>
              <li className="list-disc">Preserve the integrity of recognition</li>
            </ul>
            <div className="mt-6 pt-6 border-t" style={{ borderColor: brandColors.goldPrestige }}>
              <p className="italic">Recognition shapes incentives.</p>
              <p className="italic">Incentives shape behavior.</p>
              <p className="italic font-semibold">Behavior shapes the future of the industry.</p>
            </div>
          </div>
        </motion.section>

        {/* Vision Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <Compass className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
            <h3 className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
              Our Vision
            </h3>
          </div>
          <div className="space-y-4 text-lg leading-relaxed" style={{ color: brandColors.navyDeep }}>
            <p className="font-semibold">
              A future where excellence in aerospace and aviation is defined by substance, integrity, and long-term impact—not noise.
            </p>
            <p>We envision an industry where:</p>
            <ul className="space-y-2 ml-6">
              <li className="list-disc">Recognition compounds over time</li>
              <li className="list-disc">Leadership is trusted, not assumed</li>
              <li className="list-disc">Diverse forms of contribution are visible and valued</li>
              <li className="list-disc">The people who hold the system together are seen</li>
            </ul>
            <div className="mt-6 pt-6 border-t" style={{ borderColor: brandColors.goldPrestige }}>
              <p className="italic">The TOP 100 is not just a list for today.</p>
              <p className="italic font-semibold">It is a historical signal.</p>
            </div>
          </div>
        </motion.section>

        {/* Values Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
            <h3 className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
              Our Values
            </h3>
          </div>
          <div className="space-y-4 text-lg leading-relaxed mb-8" style={{ color: brandColors.navyDeep }}>
            <p className="italic">Values are not what we say.</p>
            <p className="font-semibold">They are what we protect—especially when it would be easier not to.</p>
            <p className="text-base">
              These values are informed by the Eagle Scout ethos of citizenship in the community, the nation, and the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="bg-white rounded-lg p-6 shadow-sm border"
                  style={{ borderColor: `${brandColors.navyDeep}20` }}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: brandColors.goldPrestige }} />
                    <div>
                      <h4 className="font-bold text-lg mb-2" style={{ color: brandColors.navyDeep }}>
                        {value.title}
                      </h4>
                      <p className="text-base leading-relaxed" style={{ color: brandColors.navyDeep }}>
                        {value.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Closing Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <div 
            className="p-8 rounded-lg border-2"
            style={{ 
              borderColor: brandColors.goldPrestige,
              background: `linear-gradient(135deg, ${brandColors.navyDeep}05, ${brandColors.goldPrestige}10)`
            }}
          >
            <h3 className="text-2xl font-bold mb-4" style={{ color: brandColors.navyDeep }}>
              Carrying the Standard
            </h3>
            <p className="text-lg mb-6" style={{ color: brandColors.navyDeep }}>
              Mission, vision, and values only matter if they are lived.
            </p>
            <div className="space-y-2 text-lg" style={{ color: brandColors.navyDeep }}>
              <p>If you believe excellence should be:</p>
              <p className="font-semibold">Earned, not traded</p>
              <p className="font-semibold">Seen, not assumed</p>
              <p className="font-semibold">Defined by substance, not noise</p>
              <p className="mt-6 text-xl font-bold" style={{ color: brandColors.goldPrestige }}>
                You are already part of this mission.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}