import { useState, useMemo, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

// Lichess CDN — reliable piece images for all standard sets
const LICHESS_PIECE_URL = 'https://lichess1.org/assets/piece';

// Maps piece set names to their Lichess CDN folder names
const PIECE_SET_MAP = {
  cburnett: 'cburnett',
  merida: 'merida',
  alpha: 'alpha',
  pirouetti: 'pirouetti',
  chessnut: 'chessnut',
  chess7: 'chess7',
  reillycraig: 'reillycraig',
  fantasy: 'fantasy',
  spatial: 'spatial',
  california: 'california',
  pixel: 'pixel',
  maestro: 'maestro',
  fresca: 'fresca',
  cardinal: 'cardinal',
  gioco: 'gioco',
  tatiana: 'tatiana',
  staunty: 'staunty',
  dubrovny: 'dubrovny',
  icpieces: 'icpieces',
  mpchess: 'mpchess',
};

const PIECE_FILE_NAMES = {
  wK: 'wK', wQ: 'wQ', wR: 'wR', wB: 'wB', wN: 'wN', wP: 'wP',
  bK: 'bK', bQ: 'bQ', bR: 'bR', bB: 'bB', bN: 'bN', bP: 'bP',
};

function getLichessPieceUrl(color, type, pieceSet) {
  const folder = PIECE_SET_MAP[pieceSet] || 'cburnett';
  const colorChar = color === 'w' ? 'w' : 'b';
  const typeChar = type.toUpperCase();
  return `${LICHESS_PIECE_URL}/${folder}/${colorChar}${typeChar}.svg`;
}

export default function ChessBoard({ fen, playerColor = 'white', onMove, disabled = false, pieceSet = 'cburnett' }) {
  const [selected, setSelected] = useState(null);

  const chess = useMemo(() => {
    const c = new Chess();
    if (fen) {
      try {
        c.load(fen);
      } catch {}
    }
    return c;
  }, [fen]);

  const isMyTurn = useMemo(() => {
    if (disabled) return false;
    return chess.turn() === (playerColor === 'white' ? 'w' : 'b');
  }, [chess, playerColor, disabled]);

  const getLegalMoves = useCallback(
    (square) => {
      return chess.moves({ square, verbose: true }).map((m) => m.to);
    },
    [chess]
  );

  const handleSquareClick = useCallback(
    (square) => {
      if (!isMyTurn) return;

      const piece = chess.get(square);

      if (selected === square) {
        setSelected(null);
        return;
      }

      if (selected) {
        const legalMoves = getLegalMoves(selected);
        if (legalMoves.includes(square)) {
          const movingPiece = chess.get(selected);
          const isPromotion =
            movingPiece?.type === 'p' &&
            (square[1] === '8' || square[1] === '1');

          onMove({
            from: selected,
            to: square,
            promotion: isPromotion ? 'q' : undefined,
          });

          setSelected(null);
          return;
        }
      }

      if (piece && piece.color === chess.turn()) {
        setSelected(square);
      } else {
        setSelected(null);
      }
    },
    [chess, selected, isMyTurn, getLegalMoves, onMove]
  );

  const customSquareStyles = useMemo(() => {
    const styles = {};

    if (selected) {
      styles[selected] = {
        backgroundColor: 'rgba(212, 165, 116, 0.5)',
      };

      const legalMoves = getLegalMoves(selected);
      legalMoves.forEach((square) => {
        styles[square] = {
          backgroundColor: 'rgba(212, 165, 116, 0.3)',
          borderRadius: '50%',
        };
      });
    }

    if (chess.inCheck()) {
      const kingSquare = chess.board().flat().find((piece) => piece?.type === 'k' && piece?.color === chess.turn());
      if (kingSquare) {
        const square = Object.entries(chess.board()).find(
          ([, row]) => row.includes(kingSquare)
        );
        if (square) {
          styles[square] = {
            backgroundColor: 'rgba(220, 38, 38, 0.6)',
          };
        }
      }
    }

    return styles;
  }, [selected, chess, getLegalMoves]);

  const customPieces = useMemo(() => {
    const pieces = {};
    const pieceTypes = ['K', 'Q', 'R', 'B', 'N', 'P'];

    pieceTypes.forEach((type) => {
      ['w', 'b'].forEach((color) => {
        const key = `${color}${type}`;
        pieces[key] = ({ squareWidth }) => (
          <img
            src={`${PIECE_PACKAGER_URL}/${pieceSet}.svg#${color}${type.toLowerCase()}`}
            alt={key}
            style={{ width: squareWidth, height: squareWidth }}
          />
        );
      });
    });

    return pieces;
  }, [pieceSet]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Chessboard
        position={fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'}
        onSquareClick={handleSquareClick}
        boardWidth={Math.min(window.innerWidth - 32, 600)}
        boardOrientation={playerColor}
        customSquareStyles={customSquareStyles}
        customPieces={customPieces}
        arePiecesDraggable={false}
      />
    </div>
  );
}