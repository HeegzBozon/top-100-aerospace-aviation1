// Glass Morphism Utilities - Reusable styles
export const createLiquidGlassHeader = (isDarkMode) => ({
  background: isDarkMode ? 'rgba(15, 29, 45, 0.8)' : 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(40px) saturate(180%)',
  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
  borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(30, 58, 90, 0.1)'}`,
});

export const createLiquidGlassCard = (cardBg, cardBorder, cardShadow) => ({
  background: cardBg,
  backdropFilter: 'blur(20px) saturate(150%)',
  WebkitBackdropFilter: 'blur(20px) saturate(150%)',
  border: `1px solid ${cardBorder}`,
  boxShadow: cardShadow,
});

export const createLiquidGlassDock = (dockBg, dockBorder, dockShadow) => ({
  background: dockBg,
  backdropFilter: 'blur(40px) saturate(180%)',
  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
  border: `1px solid ${dockBorder}`,
  boxShadow: dockShadow,
});