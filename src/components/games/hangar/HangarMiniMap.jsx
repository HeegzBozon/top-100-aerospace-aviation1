import { motion } from 'framer-motion';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#b8860b',
  skyBlue: '#4a90b8',
};

const areaPositions = {
  main_hall: { x: 50, y: 50 },
  heritage_wing: { x: 20, y: 30 },
  rd_lab: { x: 80, y: 30 },
  innovator_hall: { x: 20, y: 70 },
  runway_deck: { x: 80, y: 70 },
  orbital_tower: { x: 50, y: 15 },
};

const areaLabels = {
  main_hall: 'Main',
  heritage_wing: 'Heritage',
  rd_lab: 'R&D',
  innovator_hall: 'Innovators',
  runway_deck: 'Runway',
  orbital_tower: 'Orbital',
};

export default function HangarMiniMap({ currentArea, unlockedAreas = [], playerPosition }) {
  return (
    <div 
      className="w-36 h-36 bg-black/70 backdrop-blur-sm rounded-xl overflow-hidden relative"
      style={{ border: `1px solid ${brandColors.goldPrestige}40` }}
    >
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(${brandColors.skyBlue}20 1px, transparent 1px),
            linear-gradient(90deg, ${brandColors.skyBlue}20 1px, transparent 1px)
          `,
          backgroundSize: '12px 12px'
        }}
      />

      {/* Area nodes */}
      {Object.entries(areaPositions).map(([area, pos]) => {
        const isUnlocked = unlockedAreas.includes(area) || area === 'main_hall';
        const isCurrent = currentArea === area;
        
        return (
          <div
            key={area}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            {isCurrent ? (
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-3 h-3 rounded-full"
                style={{ 
                  background: brandColors.goldPrestige,
                  boxShadow: `0 0 8px ${brandColors.goldPrestige}`
                }}
              />
            ) : (
              <div 
                className="w-2 h-2 rounded-full"
                style={{ 
                  background: isUnlocked ? brandColors.skyBlue : '#444',
                  opacity: isUnlocked ? 1 : 0.4
                }}
              />
            )}
            <span 
              className="absolute top-3 left-1/2 transform -translate-x-1/2 text-[8px] whitespace-nowrap"
              style={{ 
                color: isCurrent ? brandColors.goldPrestige : isUnlocked ? 'white' : '#666',
                fontFamily: "'Montserrat', sans-serif"
              }}
            >
              {areaLabels[area]}
            </span>
          </div>
        );
      })}

      {/* Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <line x1="50%" y1="50%" x2="20%" y2="30%" stroke={brandColors.skyBlue} strokeOpacity="0.3" strokeWidth="1" />
        <line x1="50%" y1="50%" x2="80%" y2="30%" stroke={brandColors.skyBlue} strokeOpacity="0.3" strokeWidth="1" />
        <line x1="50%" y1="50%" x2="20%" y2="70%" stroke={brandColors.skyBlue} strokeOpacity="0.3" strokeWidth="1" />
        <line x1="50%" y1="50%" x2="80%" y2="70%" stroke={brandColors.skyBlue} strokeOpacity="0.3" strokeWidth="1" />
        <line x1="50%" y1="50%" x2="50%" y2="15%" stroke={brandColors.skyBlue} strokeOpacity="0.3" strokeWidth="1" />
      </svg>

      {/* Label */}
      <div className="absolute bottom-1 right-2 text-[9px] text-white/40 uppercase tracking-wider">
        Map
      </div>
    </div>
  );
}