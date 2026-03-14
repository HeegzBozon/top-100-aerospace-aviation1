import { BOARD_THEMES, getLichessPieceUrl } from './chessBoardThemes';

export default function ChessPiece({ piece, boardTheme = 'classic', pieceSet = 'cburnett' }) {
  if (!piece) return null;
  
  const isWhite = piece.color === 'w';
  const type = piece.type.toLowerCase();
  const theme = BOARD_THEMES[boardTheme] || BOARD_THEMES.classic;
  
  // Use Lichess pieces if theme has useLichessPieces flag
  if (theme.useLichessPieces) {
    return (
      <img
        src={getLichessPieceUrl(type, isWhite ? 'w' : 'b', pieceSet)}
        alt={`${isWhite ? 'White' : 'Black'} ${type}`}
        className="w-[85%] h-[85%] select-none pointer-events-none"
        draggable={false}
      />
    );
  }
  
  // Use theme's piece generator if available, otherwise use classic pieces
  if (theme.pieceGenerator) {
    return (
      <div
        className="w-[85%] h-[85%] select-none pointer-events-none"
        aria-label={`${isWhite ? 'White' : 'Black'} ${type}`}
        dangerouslySetInnerHTML={{ __html: theme.pieceGenerator(type, isWhite ? 'w' : 'b') }}
      />
    );
  }
  
  // Classic pieces as fallback
  const PIECE_SVG = {
    p: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4" />
          </filter>
        </defs>
        <circle cx="50" cy="70" r="8" fill={isWhite ? '#e8dcc8' : '#2c3e50'} stroke={isWhite ? '#1a3a52' : '#e8dcc8'} strokeWidth="2" filter="url(#shadow)" />
        <path d="M 50 30 Q 35 40 35 55 Q 35 65 50 72 Q 65 65 65 55 Q 65 40 50 30 Z" fill={isWhite ? '#e8dcc8' : '#2c3e50'} stroke={isWhite ? '#1a3a52' : '#e8dcc8'} strokeWidth="2.5" />
      </svg>
    ),
    n: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4" />
          </filter>
        </defs>
        <path d="M 25 55 Q 25 30 45 25 Q 60 28 68 40 Q 72 50 68 65 Q 50 75 25 70 Z" fill={isWhite ? '#e8dcc8' : '#2c3e50'} stroke={isWhite ? '#1a3a52' : '#e8dcc8'} strokeWidth="2.5" filter="url(#shadow)" />
        <path d="M 45 48 L 45 70" stroke={isWhite ? '#1a3a52' : '#e8dcc8'} strokeWidth="2.5" fill="none" />
      </svg>
    ),
    b: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4" />
          </filter>
        </defs>
        <circle cx="50" cy="32" r="8" fill={isWhite ? '#e8dcc8' : '#2c3e50'} stroke={isWhite ? '#1a3a52' : '#e8dcc8'} strokeWidth="2" filter="url(#shadow)" />
        <path d="M 50 40 Q 32 50 32 68 Q 32 75 50 80 Q 68 75 68 68 Q 68 50 50 40 Z" fill={isWhite ? '#e8dcc8' : '#2c3e50'} stroke={isWhite ? '#1a3a52' : '#e8dcc8'} strokeWidth="2.5" />
      </svg>
    ),
    r: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4" />
          </filter>
        </defs>
        <path d="M 25 25 L 25 50 Q 25 65 50 72 Q 75 65 75 50 L 75 25 L 65 35 L 65 50 Q 65 58 50 62 Q 35 58 35 50 L 35 35 Z" fill={isWhite ? '#e8dcc8' : '#2c3e50'} stroke={isWhite ? '#1a3a52' : '#e8dcc8'} strokeWidth="2.5" filter="url(#shadow)" />
        <rect x="25" y="20" width="50" height="8" fill="none" stroke={isWhite ? '#1a3a52' : '#e8dcc8'} strokeWidth="2" />
      </svg>
    ),
    q: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4" />
          </filter>
        </defs>
        <circle cx="50" cy="28" r="6" fill={isWhite ? '#e8dcc8' : '#2c3e50'} stroke={isWhite ? '#1a3a52' : '#e8dcc8'} strokeWidth="2" filter="url(#shadow)" />
        <path d="M 20 38 L 25 30 L 33 38 L 40 30 L 50 25 L 60 30 L 67 38 L 75 30 L 80 38 Q 80 48 50 60 Q 20 48 20 38 Z" fill={isWhite ? '#e8dcc8' : '#2c3e50'} stroke={isWhite ? '#1a3a52' : '#e8dcc8'} strokeWidth="2.5" />
        <path d="M 32 60 Q 32 70 50 76 Q 68 70 68 60" fill="none" stroke={isWhite ? '#1a3a52' : '#e8dcc8'} strokeWidth="2.5" />
      </svg>
    ),
    k: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4" />
          </filter>
        </defs>
        <path d="M 50 15 L 42 28 L 42 35 L 50 30 L 58 35 L 58 28 Z" fill={isWhite ? '#e8dcc8' : '#2c3e50'} stroke={isWhite ? '#1a3a52' : '#e8dcc8'} strokeWidth="2.5" filter="url(#shadow)" />
        <path d="M 25 42 Q 25 48 32 55 L 32 68 Q 32 78 50 82 Q 68 78 68 68 L 68 55 Q 75 48 75 42 Q 75 35 50 32 Q 25 32 25 42 Z" fill={isWhite ? '#e8dcc8' : '#2c3e50'} stroke={isWhite ? '#1a3a52' : '#e8dcc8'} strokeWidth="2.5" />
      </svg>
    )
  };

  return (
    <div
      className="w-[85%] h-[85%] select-none pointer-events-none"
      aria-label={`${isWhite ? 'White' : 'Black'} ${type}`}
    >
      {PIECE_SVG[type] || null}
    </div>
  );
}