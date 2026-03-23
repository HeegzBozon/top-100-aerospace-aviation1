import { motion } from 'framer-motion';
import { Construction, Wrench, Hammer, Sparkles } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
  festiveRed: '#c41e3a',
  festiveGreen: '#165b33',
};

export default function UnderConstruction({ variant = 'overlay' }) {
  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative overflow-hidden py-3 px-6 mb-4 rounded-xl shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${brandColors.festiveRed}, ${brandColors.goldPrestige})`,
        }}
      >
        <div className="flex items-center justify-center gap-3 text-white">
          <motion.div
            animate={{ rotate: [0, 10, 0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Construction className="w-5 h-5" />
          </motion.div>
          <span className="font-semibold">Under Construction</span>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'sticker') {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        className="absolute top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${brandColors.festiveRed}, ${brandColors.goldPrestige})`,
          transform: 'rotate(12deg)',
        }}
      >
        <div className="flex items-center gap-2 text-white text-sm font-bold">
          <Construction className="w-4 h-4" />
          <span>Under Construction</span>
        </div>
      </motion.div>
    );
  }

  // Default: overlay
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white rounded-3xl shadow-2xl p-12 max-w-2xl mx-4 text-center overflow-hidden"
        style={{ border: `3px solid ${brandColors.goldPrestige}` }}
      >
        {/* Animated Background Elements */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl opacity-10"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 2) * 40}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, 0, -10, 0],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            {i % 3 === 0 ? '🔨' : i % 3 === 1 ? '🔧' : '⚙️'}
          </motion.div>
        ))}

        {/* Main Content */}
        <div className="relative z-10">
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
            style={{
              background: `linear-gradient(135deg, ${brandColors.festiveRed}, ${brandColors.goldPrestige})`,
              boxShadow: `0 0 40px ${brandColors.goldPrestige}60`,
            }}
            animate={{
              rotate: [0, 5, 0, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Construction className="w-12 h-12 text-white" />
          </motion.div>

          <h2
            className="text-4xl font-bold mb-4"
            style={{
              color: brandColors.navyDeep,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Under Construction
          </h2>

          <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
            We're crafting something extraordinary. This page is being built to deliver an exceptional experience.
          </p>

          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            >
              <Hammer className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            >
              <Wrench className="w-8 h-8" style={{ color: brandColors.festiveRed }} />
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
            >
              <Sparkles className="w-8 h-8" style={{ color: brandColors.festiveGreen }} />
            </motion.div>
          </div>

          <div className="text-sm text-gray-500">
            Expected completion: Coming Soon
          </div>
        </div>

        {/* Festive Border Lights */}
        <div className="absolute top-0 left-0 right-0 h-2 flex justify-around" style={{ background: `linear-gradient(90deg, ${brandColors.festiveRed}, ${brandColors.festiveGreen}, ${brandColors.festiveRed})` }}>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-white"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.05 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}