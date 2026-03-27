import { useState, useCallback, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';

// Module-level cache so chess.js is only loaded once
let ChessClass = null;
function loadChess() {
  if (ChessClass) return Promise.resolve(ChessClass);
  return import('chess.js').then((mod) => {
    ChessClass = mod.Chess;
    return ChessClass;
  });
}

const LICHESS_PIECE_URL = 'https://lichess1.org/assets/piece';

const PIECE_SET_MAP = {
  cburnett: 'cburnett', merida: 'merida', alpha: 'alpha', pirouetti: 'pirouetti',
  chessnut: 'chessnut', chess7: 'chess7', reillycraig: 'reillycraig', fantasy: 'fantasy',
  spatial: 'spatial', california: 'california', pixel: 'pixel', maestro: 'maestro',
  fresca: 'fresca', cardinal: 'cardinal', gioco: 'gioco', tatiana: 'tatiana',
  staunty: 'staunty', dubrovny: 'dubrovny', icpieces: 'icpieces', mpchess: 'mpchess',
};

function getLichessPieceUrl(color, type, pieceSet) {
  const folder = PIECE_SET_MAP[pieceSet] || 'cburnett';
  return `${LICHESS_PIECE_URL}/${folder}/${color}${type.toUpperCase()}.svg`;
}

const BOARD_THEMES = {
  classic:  { lightSquare: { backgroundColor: '#f0d9b5' }, darkSquare: { backgroundColor: '#b58863' } },
  deepSpace:{ lightSquare: { backgroundColor: '#1e3a5a' }, darkSquare: { backgroundColor: '#0a1628' } },
  lichess:  { lightSquare: { backgroundColor: '#f0d9b5' }, darkSquare: { backgroundColor: '#b58863' } },
  green:    { lightSquare: { backgroundColor: '#ffffdd' }, darkSquare: { backgroundColor: '#86a666' } },
  blue:     { lightSquare: { backgroundColor: '#dee3e6' }, darkSquare: { backgroundColor: '#8ca2ad' } },
  top100:   { lightSquare: { backgroundColor: '#e8d4b8' }, darkSquare: { backgroundColor: '#1e3a5a' } },
};

// Lightweight FEN-based shim until chess.js loads
function makeShim(fen) {
  return {
    turn: () => fen?.split(' ')[1] || 'w',
    moves: () => [],
    get: () => null,
    inCheck: () => false,
    board: () => [],
  };
}

export default function ChessBoard({ fen, playerColor = 'white', onMove, disabled = false, pieceSet = 'cburnett', boardTheme = 'classic' }) {
  const [selected, setSelected] = useState(null);
  const [, forceUpdate] = useState(0);
  const chessRef = useRef(null);

  // Load chess.js once, then rebuild whenever fen changes
  useEffect(() => {
    loadChess().then((Chess) => {
      const c = new Chess();
      try { if (fen) c.load(fen); } catch {}
      chessRef.current = c;
      forceUpdate(n => n + 1);
    });
  }, [fen]); // eslint-disable-line react-hooks/exhaustive-deps

  const chess = chessRef.current || makeShim(fen);
  const isMyTurn = !disabled && chess.turn() === (playerColor === 'white' ? 'w' : 'b');

  const getLegalMoves = useCallback((square) => {
    return chess.moves({ square, verbose: true }).map((m) => m.to);
  }, [chess]);

  const handleSquareClick = useCallback((square) => {
    if (!isMyTurn) return;
    const piece = chess.get(square);

    if (selected === square) { setSelected(null); return; }

    if (selected) {
      const legal = getLegalMoves(selected);
      if (legal.includes(square)) {
        const movingPiece = chess.get(selected);
        const isPromotion = movingPiece?.type === 'p' && (square[1] === '8' || square[1] === '1');
        onMove({ from: selected, to: square, promotion: isPromotion ? 'q' : undefined });
        setSelected(null);
        return;
      }
    }

    if (piece && piece.color === chess.turn()) {
      setSelected(square);
    } else {
      setSelected(null);
    }
  }, [chess, selected, isMyTurn, getLegalMoves, onMove]);

  const customSquareStyles = (() => {
    const styles = {};
    if (selected) {
      styles[selected] = { backgroundColor: 'rgba(212, 165, 116, 0.5)' };
      getLegalMoves(selected).forEach(sq => {
        styles[sq] = { backgroundColor: 'rgba(212, 165, 116, 0.3)', borderRadius: '50%' };
      });
    }
    if (chess.inCheck()) {
      const flat = chess.board().flat();
      const king = flat.find(p => p?.type === 'k' && p?.color === chess.turn());
      if (king?.square) styles[king.square] = { backgroundColor: 'rgba(220, 38, 38, 0.6)' };
    }
    return styles;
  })();

  const customPieces = {};
  ['K','Q','R','B','N','P'].forEach(type => {
    ['w','b'].forEach(color => {
      const key = `${color}${type}`;
      const src = getLichessPieceUrl(color, type, pieceSet);
      customPieces[key] = ({ squareWidth }) => (
        <img src={src} alt={key} width={squareWidth} height={squareWidth} draggable={false} className="select-none pointer-events-none" />
      );
    });
  });

  const theme = BOARD_THEMES[boardTheme] || BOARD_THEMES.classic;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Chessboard
        position={fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'}
        onSquareClick={handleSquareClick}
        boardWidth={Math.min(window.innerWidth - 32, 600)}
        boardOrientation={playerColor}
        customSquareStyles={customSquareStyles}
        customPieces={customPieces}
        customLightSquareStyle={theme.lightSquare}
        customDarkSquareStyle={theme.darkSquare}
        arePiecesDraggable={false}
      />
    </div>
  );
}