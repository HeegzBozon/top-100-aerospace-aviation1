import { useState, useMemo, useCallback, useContext } from 'react';
import { Chess } from 'chess.js';
import ChessPiece from './ChessPiece';
import { ThemeContext } from '@/components/core/ThemeContext';
import { BOARD_THEMES } from './chessBoardThemes';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export default function ChessBoard({ fen, playerColor, onMove, disabled, boardTheme = 'classic', pieceSet = 'cburnett' }) {
  const { mode } = useContext(ThemeContext) || { mode: 'dark' };
  const theme = BOARD_THEMES[boardTheme] || BOARD_THEMES.classic;
  const isDark = mode === 'dark';
  const [selected, setSelected] = useState(null);
  const [legalTargets, setLegalTargets] = useState([]);

  const chess = useMemo(() => {
    const c = new Chess();
    if (fen) { try { c.load(fen); } catch {} }
    return c;
  }, [fen]);

  const isMyTurn = useMemo(() => {
    if (disabled) return false;
    return chess.turn() === (playerColor === 'white' ? 'w' : 'b');
  }, [chess, playerColor, disabled]);

  const getBoardArray = useCallback(() => {
    const board = chess.board();
    if (playerColor === 'black') {
      return board.slice().reverse().map(row => row.slice().reverse());
    }
    return board;
  }, [chess, playerColor]);

  const squareFromCoords = useCallback((rowIdx, colIdx) => {
    const file = playerColor === 'black' ? FILES[7 - colIdx] : FILES[colIdx];
    const rank = playerColor === 'black' ? rowIdx + 1 : 8 - rowIdx;
    return `${file}${rank}`;
  }, [playerColor]);

  const handleSquareClick = useCallback((rowIdx, colIdx) => {
    if (!isMyTurn) return;
    const square = squareFromCoords(rowIdx, colIdx);
    const piece = chess.get(square);

    if (selected) {
      if (legalTargets.includes(square)) {
        // Handle promotion
        const movingPiece = chess.get(selected);
        const isPromotion = movingPiece?.type === 'p' && (square[1] === '8' || square[1] === '1');
        onMove({ from: selected, to: square, promotion: isPromotion ? 'q' : undefined });
        setSelected(null);
        setLegalTargets([]);
      } else if (piece && piece.color === chess.turn()) {
        setSelected(square);
        const moves = chess.moves({ square, verbose: true });
        setLegalTargets(moves.map(m => m.to));
      } else {
        setSelected(null);
        setLegalTargets([]);
      }
    } else {
      if (piece && piece.color === chess.turn()) {
        setSelected(square);
        const moves = chess.moves({ square, verbose: true });
        setLegalTargets(moves.map(m => m.to));
      }
    }
  }, [chess, selected, legalTargets, isMyTurn, squareFromCoords, onMove]);

  const boardArray = getBoardArray();

  return (
    <div className="w-full aspect-square" role="grid" aria-label="Chess board">
      {boardArray.map((row, rowIdx) => (
        <div key={rowIdx} className="flex w-full" style={{ height: '12.5%' }}>
          {row.map((cell, colIdx) => {
            const square = squareFromCoords(rowIdx, colIdx);
            const isLightSquare = (rowIdx + colIdx) % 2 === 0;
            const isSelected = selected === square;
            const isTarget = legalTargets.includes(square);
            const isInCheck = chess.inCheck() && cell?.type === 'k' && cell?.color === chess.turn();

            let bgColor;
            if (isLightSquare) {
              bgColor = isSelected ? '#d4a574' : isInCheck ? 'rgba(244, 63, 94, 0.6)' : theme.sqLight;
            } else {
              bgColor = isSelected ? '#d4a574' : isInCheck ? 'rgba(220, 38, 38, 0.6)' : theme.sqDark;
            }

            return (
              <button
                key={colIdx}
                className="relative flex items-center justify-center w-[12.5%] h-full transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a574] focus-visible:ring-inset"
                style={{ backgroundColor: bgColor }}
                onClick={() => handleSquareClick(rowIdx, colIdx)}
                aria-label={`${square}${cell ? ` ${cell.color === 'w' ? 'white' : 'black'} ${cell.type}` : ''}`}
                aria-pressed={isSelected}
              >
                {/* Legal move indicator */}
                {isTarget && (
                  <span className={`absolute pointer-events-none z-10 ${
                    cell
                      ? 'inset-0 border-4 border-white/30'
                      : 'w-2.5 h-2.5 rounded-full bg-white/40'
                  }`} />
                )}
                {cell && <ChessPiece piece={cell} boardTheme={boardTheme} pieceSet={pieceSet} />}
                {/* Rank labels */}
                {colIdx === 0 && (
                  <span className={`absolute top-1 left-1 text-[9px] font-bold leading-none tracking-tight ${
                    isLightSquare ? 'text-[#1a3a52]/50' : 'text-[#e8dcc8]/50'
                  }`}>
                    {squareFromCoords(rowIdx, colIdx)[1]}
                  </span>
                )}
                {/* File labels */}
                {rowIdx === 7 && (
                  <span className={`absolute bottom-1 right-1 text-[9px] font-bold leading-none tracking-tight ${
                    isLightSquare ? 'text-[#1a3a52]/50' : 'text-[#e8dcc8]/50'
                  }`}>
                    {squareFromCoords(rowIdx, colIdx)[0]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}