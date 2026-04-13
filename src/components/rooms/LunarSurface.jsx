import { motion } from 'framer-motion';

// A reusable SVG lunar surface horizon with craters and modules
export default function LunarSurface({ className = '' }) {
  return (
    <div className={`absolute bottom-0 left-0 right-0 pointer-events-none ${className}`}>
      <svg viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
        {/* Lunar terrain */}
        <path
          d="M0 180 Q120 140 240 160 Q360 120 480 150 Q540 130 600 145 Q720 110 840 140 Q960 125 1080 155 Q1200 130 1320 148 Q1380 140 1440 160 L1440 200 L0 200 Z"
          fill="#1a1a2e"
          opacity="0.8"
        />
        <path
          d="M0 185 Q180 155 360 170 Q480 145 600 165 Q720 140 840 158 Q1020 135 1200 160 Q1320 150 1440 170 L1440 200 L0 200 Z"
          fill="#12122a"
        />

        {/* Crater details */}
        <ellipse cx="300" cy="178" rx="40" ry="8" fill="#0f0f25" opacity="0.6" />
        <ellipse cx="800" cy="165" rx="55" ry="10" fill="#0f0f25" opacity="0.5" />
        <ellipse cx="1100" cy="172" rx="35" ry="7" fill="#0f0f25" opacity="0.6" />

        {/* Habitat module silhouettes */}
        <rect x="580" y="148" width="40" height="20" rx="4" fill="#1e3a5a" opacity="0.7" />
        <rect x="625" y="142" width="30" height="26" rx="3" fill="#1e3a5a" opacity="0.6" />
        <rect x="660" y="150" width="25" height="18" rx="3" fill="#1e3a5a" opacity="0.5" />
        {/* Connecting tunnel */}
        <rect x="618" y="156" width="10" height="6" rx="2" fill="#1e3a5a" opacity="0.4" />
        <rect x="653" y="156" width="10" height="6" rx="2" fill="#1e3a5a" opacity="0.4" />
        {/* Antenna */}
        <line x1="640" y1="142" x2="640" y2="128" stroke="#c9a87c" strokeWidth="1" opacity="0.4" />
        <circle cx="640" cy="126" r="3" fill="none" stroke="#c9a87c" strokeWidth="0.5" opacity="0.5" />

        {/* Solar array */}
        <motion.g
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <rect x="560" y="146" width="18" height="2" fill="#c9a87c" opacity="0.5" />
          <rect x="556" y="143" width="26" height="1" fill="#c9a87c" opacity="0.3" />
        </motion.g>
      </svg>
    </div>
  );
}