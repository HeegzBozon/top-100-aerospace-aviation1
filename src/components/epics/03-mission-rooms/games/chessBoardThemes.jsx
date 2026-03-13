// Chess board themes with colors and piece SVG generators

export const LICHESS_PIECE_SETS = [
  { id: 'cburnett', name: 'Cburnett' },
  { id: 'staunty', name: 'Staunty' },
  { id: 'merida', name: 'Merida' },
  { id: 'spatial', name: 'Spatial' },
  { id: 'governors', name: 'Governors' },
  { id: 'fresca', name: 'Fresca' },
  { id: 'cardinal', name: 'Cardinal' },
  { id: 'mono', name: 'Mono' },
  { id: 'alpha', name: 'Alpha' },
  { id: 'california', name: 'California' },
];

export const BOARD_THEMES = {
  classic: {
    name: 'Classic',
    sqLight: '#e8dcc8',
    sqDark: '#1a3a52',
    label: 'CLASSIC',
  },
  deepSpace: {
    name: 'Deep Space',
    sqLight: '#1E3A5A',
    sqDark: '#0A1628',
    label: 'DEEP SPACE',
    background: 'linear-gradient(135deg, #070A0F 0%, #0D1117 50%, #070A0F 100%)',
    pieceGenerator: generateDeepSpacePiece,
  },
  lichess: {
    name: 'Lichess',
    sqLight: '#F0D9B5',
    sqDark: '#B58863',
    label: 'LICHESS',
    useLichessPieces: true,
  }
};

export const DEFAULT_THEME = 'classic';
export const DEFAULT_PIECE_SET = 'cburnett';

export function getLichessPieceUrl(type, color, pieceSet = 'cburnett') {
  const pieces = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
  const colorCode = color === 'w' ? 'w' : 'b';
  const base = `https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/${pieceSet}`;
  return `${base}/${colorCode}${pieces[type.toLowerCase()]}.svg`;
}

function generateDeepSpacePiece(type, color) {
  const isWhite = color === 'w';
  const fill = isWhite ? '#E8F0F7' : '#0D1117';
  const stroke = isWhite ? '#C8A96E' : '#4A6FA5';
  const accent = isWhite ? '#C8A96E' : '#7EB8D4';
  const inner = isWhite ? '#B8D4E8' : '#1E2D3D';

  const pieces = {
    p: `<circle cx="32" cy="70" r="8" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <path d="M 32 30 Q 17 40 17 55 Q 17 65 32 72 Q 47 65 47 55 Q 47 40 32 30 Z" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>`,
    
    n: `<path d="M 10 55 Q 10 30 30 25 Q 45 28 53 40 Q 57 50 53 65 Q 35 75 10 70 Z" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>
        <path d="M 30 48 L 30 70" stroke="${stroke}" stroke-width="2.5" fill="none"/>`,
    
    b: `<circle cx="32" cy="32" r="8" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <path d="M 32 40 Q 16 50 16 68 Q 16 75 32 80 Q 48 75 48 68 Q 48 50 32 40 Z" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>`,
    
    r: `<rect x="12" y="56" width="40" height="5" rx="1" fill="${stroke}" opacity="0.9"/>
        <rect x="16" y="51" width="32" height="7" rx="1" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
        <rect x="14" y="30" width="4" height="22" rx="1" fill="${inner}" stroke="${stroke}" stroke-width="1"/>
        <rect x="46" y="30" width="4" height="22" rx="1" fill="${inner}" stroke="${stroke}" stroke-width="1"/>
        <rect x="14" y="30" width="36" height="3" rx="1" fill="${inner}" stroke="${stroke}" stroke-width="1"/>
        <rect x="28" y="18" width="8" height="34" rx="2" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
        <path d="M 28 18 Q 28 6 32 4 Q 36 6 36 18 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`,
    
    q: `<rect x="10" y="56" width="44" height="5" rx="2" fill="${stroke}" opacity="0.8"/>
        <rect x="14" y="51" width="36" height="6" rx="1" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
        <path d="M 18 51 L 16 33 Q 16 26 32 24 Q 48 26 48 33 L 46 51 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
        <ellipse cx="32" cy="16" rx="12" ry="4" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.7"/>
        <circle cx="32" cy="18" r="5" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
        <polygon points="32,11 33.2,14.6 37,14.6 34,16.8 35.2,20.4 32,18.2 28.8,20.4 30,16.8 27,14.6 30.8,14.6" fill="${accent}" opacity="0.9"/>`,
    
    k: `<rect x="12" y="56" width="40" height="5" rx="2" fill="${stroke}" opacity="0.9"/>
        <rect x="16" y="51" width="32" height="7" rx="1" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
        <path d="M 20 51 L 18 36 Q 18 30 32 28 L 46 28 Q 50 30 48 36 L 46 51 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
        <ellipse cx="32" cy="22" rx="11" ry="12" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
        <path d="M 22 20 Q 22 14 32 13 Q 42 14 42 20 Q 42 26 32 27 Q 22 26 22 20 Z" fill="${inner}" stroke="${accent}" stroke-width="1" opacity="0.9"/>
        <line x1="32" y1="8" x2="32" y2="12" stroke="${accent}" stroke-width="1.5"/>
        <circle cx="32" cy="7" r="2" fill="${accent}"/>`
  };

  const svg = pieces[type.toLowerCase()] || '';
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;
}