// Communications Utilities - Reusable helpers
export const getDisplayName = (email) => {
  const name = email?.split('@')[0] || 'Unknown';
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export const getOtherParticipant = (conversation, userEmail) => {
  return conversation.participants?.find(p => p !== userEmail) || 'Unknown';
};

export const getMobileTheme = (isDarkMode, brandColors) => {
  return isDarkMode
    ? {
        bg: `linear-gradient(180deg, ${brandColors.navyDark} 0%, ${brandColors.navyMid} 100%)`,
        text: '#ffffff',
        textMuted: 'rgba(255, 255, 255, 0.6)',
        cardBg: 'rgba(255, 255, 255, 0.08)',
        cardBorder: 'rgba(255, 255, 255, 0.12)',
        cardShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
        dockBg: 'rgba(30, 40, 55, 0.85)',
        dockBorder: 'rgba(255, 255, 255, 0.1)',
        dockShadow: '0 8px 40px rgba(0, 0, 0, 0.4)',
        activeItemBg: 'rgba(255, 255, 255, 0.15)',
        hoverBg: 'rgba(255, 255, 255, 0.05)',
      }
    : {
        bg: `linear-gradient(180deg, ${brandColors.cream} 0%, #f5f0e8 100%)`,
        text: brandColors.navyDeep,
        textMuted: 'rgba(30, 58, 90, 0.5)',
        cardBg: 'rgba(255, 255, 255, 0.6)',
        cardBorder: 'rgba(255, 255, 255, 0.5)',
        cardShadow: '0 4px 16px rgba(30, 58, 90, 0.08)',
        dockBg: 'rgba(255, 255, 255, 0.75)',
        dockBorder: 'rgba(255, 255, 255, 0.6)',
        dockShadow: '0 8px 40px rgba(30, 58, 90, 0.12)',
        activeItemBg: 'rgba(30, 58, 90, 0.08)',
        hoverBg: 'rgba(255, 255, 255, 0.5)',
      };
};