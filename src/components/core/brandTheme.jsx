// Brand Theme - Single Source of Truth
export const brandColors = {
  navyDeep: '#1e3a5a',
  navyDark: '#0f1d2d',
  navyMid: '#152a42',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  roseAccent: '#d4a574',
  cream: '#faf8f5',
};

export const themes = {
  brand: {
    bg: brandColors.cream,
    card: 'rgba(255, 255, 255, 0.9)',
    text: brandColors.navyDeep,
    muted: 'rgba(30, 58, 90, 0.6)',
    border: 'rgba(30, 58, 90, 0.1)',
    accent: brandColors.goldPrestige,
    accent2: brandColors.skyBlue,
    scoreAura: brandColors.goldPrestige,
    scoreStarpower: brandColors.navyDeep,
    scoreClout: brandColors.roseAccent,
    scoreStardust: brandColors.skyBlue,
  },
};

export const getAutoTheme = () => 'brand';

export const getCSSVariables = (theme) => `
  :root {
    --bg: ${theme.bg};
    --card: ${theme.card};
    --text: ${theme.text};
    --muted: ${theme.muted};
    --border: ${theme.border};
    --accent: ${theme.accent};
    --accent-2: ${theme.accent2};
    --score-aura: ${theme.scoreAura};
    --score-starpower: ${theme.scoreStarpower};
    --score-clout: ${theme.scoreClout};
    --score-stardust: ${theme.scoreStardust};
    --ok: #2ED573;
    --warn: #FFD32A;
    --danger: #FF4757;
    --glass: ${theme.card.replace(')', ', 0.5)').replace(/rgba?/, 'rgba')};
  }
  body {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
`;