import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Gamepad2, Trophy, Star, Rocket, Package, ArrowRight, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
  cream: '#faf8f5',
};

const games = [
  { 
    title: 'The Hangar', 
    description: 'Explore aerospace heritage, collect artifacts, and unlock your prestige rank.',
    icon: '🛩️',
    color: brandColors.skyBlue
  },
  { 
    title: 'Recruitment Run', 
    description: 'Solve puzzles to recruit the next generation of aerospace leaders.',
    icon: '🔍',
    color: brandColors.goldPrestige
  },
];

export default function GamesLanding() {
  const handlePlay = () => {
    base44.auth.redirectToLogin('/GamesHub');
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0B1220, #121A2E)' }}>
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-20" style={{ background: brandColors.skyBlue }} />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: brandColors.goldPrestige }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Gamepad2 className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
              <span 
                className="text-sm uppercase tracking-widest"
                style={{ color: brandColors.goldPrestige, fontFamily: "'Montserrat', sans-serif" }}
              >
                TOP 100 Games
              </span>
            </div>

            <h1 
              className="text-4xl md:text-6xl text-white mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
            >
              Play. Explore.
              <span 
                className="block text-transparent bg-clip-text"
                style={{ backgroundImage: `linear-gradient(90deg, ${brandColors.skyBlue}, ${brandColors.goldPrestige})` }}
              >
                Earn Prestige.
              </span>
            </h1>

            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Immerse yourself in aerospace adventures, collect rare artifacts, and climb the prestige ranks.
            </p>

            <Button
              onClick={handlePlay}
              size="lg"
              className="text-lg px-10 py-6 rounded-full font-semibold"
              style={{ 
                background: `linear-gradient(135deg, ${brandColors.goldPrestige}, #e8d4b8)`,
                color: 'white',
                fontFamily: "'Montserrat', sans-serif"
              }}
            >
              <Rocket className="w-5 h-5 mr-2" />
              Start Playing
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 
            className="text-2xl text-white text-center mb-12"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Featured Experiences
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={game.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                onClick={handlePlay}
              >
                <div className="text-5xl mb-4">{game.icon}</div>
                <h3 
                  className="text-2xl text-white font-bold mb-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {game.title}
                </h3>
                <p className="text-white/60 mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {game.description}
                </p>
                <div 
                  className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all"
                  style={{ color: game.color }}
                >
                  Play Now <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-sm rounded-3xl p-10 border border-white/10">
          <div className="text-center mb-10">
            <Sparkles className="w-10 h-10 mx-auto mb-4" style={{ color: brandColors.goldPrestige }} />
            <h2 
              className="text-2xl text-white"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Earn Rewards
            </h2>
          </div>
          
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { icon: Package, label: 'Artifacts', desc: 'Collect rare items' },
              { icon: Trophy, label: 'Badges', desc: 'Unlock achievements' },
              { icon: Star, label: 'Prestige', desc: 'Climb the ranks' },
            ].map((reward) => (
              <div key={reward.label}>
                <div 
                  className="w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: `${brandColors.goldPrestige}20` }}
                >
                  <reward.icon className="w-7 h-7" style={{ color: brandColors.goldPrestige }} />
                </div>
                <div className="text-white font-medium">{reward.label}</div>
                <div className="text-white/40 text-sm">{reward.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <Button
          onClick={handlePlay}
          size="lg"
          className="px-12 py-6 rounded-full font-semibold text-lg"
          style={{ 
            background: brandColors.skyBlue,
            color: 'white',
            fontFamily: "'Montserrat', sans-serif"
          }}
        >
          <Gamepad2 className="w-5 h-5 mr-2" />
          Enter the Games Hub
        </Button>
      </section>
    </div>
  );
}