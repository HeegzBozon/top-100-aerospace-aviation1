import { Trophy, Star, Rocket, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import NominationHistoryFeed from '@/components/nominations/NominationHistoryFeed';
import InlineNominationForm from '@/components/nominations/InlineNominationForm';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function NominationsInline() {
  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: brandColors.cream }}>
      {/* Hero Header */}
      <div
        className="shrink-0 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #0d2137 50%, ${brandColors.navyDeep} 100%)`,
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${brandColors.goldPrestige} 0%, transparent 70%)` }}
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${brandColors.skyBlue} 0%, transparent 70%)` }}
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="relative px-6 py-8 md:py-10">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(201, 168, 124, 0.2)', border: '1px solid rgba(201, 168, 124, 0.3)' }}
            >
              <Award className="w-3.5 h-3.5" style={{ color: brandColors.goldPrestige }} />
              <span className="text-xs font-medium" style={{ color: brandColors.goldPrestige }}>
                Season 4 Now Open
              </span>
            </motion.div>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1"
              >
                <h1
                  className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Nominate the Next
                  <span
                    className="block mt-1"
                    style={{
                      background: `linear-gradient(90deg, ${brandColors.goldPrestige}, ${brandColors.goldPrestige}cc, ${brandColors.skyBlue})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Aerospace Leaders
                  </span>
                </h1>
                <p className="text-white/70 text-sm md:text-base max-w-xl">
                  Know someone shaping the future of flight? Put their name forward for the TOP 100.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-3"
              >
                <div
                  className="px-4 py-3 rounded-xl backdrop-blur-sm"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Rocket className="w-4 h-4" style={{ color: brandColors.skyBlue }} />
                    <span className="text-white/60 text-xs">Nominees</span>
                  </div>
                  <p className="text-lg md:text-xl font-bold text-white">500+</p>
                </div>
                <div
                  className="px-4 py-3 rounded-xl backdrop-blur-sm"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
                    <span className="text-white/60 text-xs">Countries</span>
                  </div>
                  <p className="text-lg md:text-xl font-bold text-white">45+</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Inline Nomination Form */}
        <div
          className="hidden md:flex md:w-1/2 lg:w-[45%] flex-col border-r"
          style={{ background: 'white', borderColor: `${brandColors.navyDeep}10` }}
        >
          <div
            className="px-4 py-3 border-b"
            style={{ borderColor: `${brandColors.navyDeep}10` }}
          >
            <h2 className="font-semibold" style={{ color: brandColors.navyDeep }}>
              Nominate Someone
            </h2>
            <p className="text-xs" style={{ color: `${brandColors.navyDeep}60` }}>
              Know someone extraordinary? Submit a nomination
            </p>
          </div>
          <div className="flex-1 overflow-hidden">
            <InlineNominationForm />
          </div>
        </div>

        {/* Right: Nomination History Feed */}
        <div
          className="w-full md:w-1/2 lg:w-[55%] overflow-y-auto"
        >
          <div
            className="sticky top-0 z-10 px-4 py-3 border-b"
            style={{
              background: brandColors.cream,
              borderColor: `${brandColors.navyDeep}10`
            }}
          >
            <h2 className="font-semibold" style={{ color: brandColors.navyDeep }}>
              Your Nominations
            </h2>
            <p className="text-xs" style={{ color: `${brandColors.navyDeep}60` }}>
              Track nominations you've submitted and received
            </p>
          </div>
          <NominationHistoryFeed />
        </div>
      </div>
    </div>
  );
}