import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Move } from "@/hooks/useGameRoom";

type Player = "X" | "O";
type CellValue = Player | null;

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const MAX_MARKS = 3;

function getWinningLine(board: CellValue[]): number[] | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
  }
  return null;
}

interface TicTacToeProps {
  moves: Move[];
  currentPlayer: Player;
  winner: string | null;
  myRole: Player | null;
  isMyTurn: boolean;
  onMove: (index: number) => void;
}

export default function TicTacToe({ moves, currentPlayer, winner, myRole, isMyTurn, onMove }: TicTacToeProps) {
  const board: CellValue[] = Array(9).fill(null);
  moves.forEach((m) => (board[m.index] = m.player));

  const winningLine = winner ? getWinningLine(board) : null;

  const xMoves = moves.filter((m) => m.player === "X");
  const oMoves = moves.filter((m) => m.player === "O");
  const fadingIndex =
    !winner && currentPlayer === "X" && xMoves.length >= MAX_MARKS
      ? xMoves[0].index
      : !winner && currentPlayer === "O" && oMoves.length >= MAX_MARKS
      ? oMoves[0].index
      : -1;

  const handleClick = useCallback(
    (index: number) => {
      if (winner || !isMyTurn) return;
      if (board[index] !== null && index !== fadingIndex) return;
      onMove(index);
    },
    [winner, board, isMyTurn, onMove, fadingIndex]
  );

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8">
      {/* Status */}
      <div className="h-10 flex items-center">
        <AnimatePresence mode="wait">
          {winner ? (
            <motion.div
              key="winner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <span className={winner === "X" ? "text-x" : "text-o"}>{winner}</span>
              <span className="text-foreground">
                {myRole === null 
                  ? "wins! 🎉" 
                  : winner === myRole 
                    ? "You win! 🎉" 
                    : "wins! You lose. 😢"}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key={currentPlayer}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
            >
              <span className={currentPlayer === "X" ? "text-x" : "text-o"}>
                {currentPlayer}
              </span>
              <span>{isMyTurn ? "your turn" : "opponent's turn"}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid */}
      <motion.div
        className={`grid grid-cols-3 gap-1 sm:gap-1.5 rounded-xl bg-grid-border p-1 sm:p-1.5 transition-all duration-500 ${
          !isMyTurn && !winner ? "opacity-75" : ""
        }`}
        animate={{
          boxShadow: winner
            ? "none"
            : currentPlayer === "X"
            ? "0 0 40px 8px hsl(var(--x-color) / 0.25), 0 0 80px 16px hsl(var(--x-color) / 0.1)"
            : "0 0 40px 8px hsl(var(--o-color) / 0.25), 0 0 80px 16px hsl(var(--o-color) / 0.1)",
        }}
        transition={{ duration: 0.5 }}
      >
        {board.map((cell, i) => {
          const isFading = fadingIndex === i;
          const isWinCell = winningLine?.includes(i);

          return (
            <motion.button
              key={i}
              onClick={() => handleClick(i)}
              disabled={!!winner || (cell !== null && i !== fadingIndex) || !isMyTurn}
              className={`
                relative w-20 h-20 sm:w-28 sm:h-28 rounded-lg 
                bg-cell-bg transition-colors duration-150
                ${!winner && (cell === null || i === fadingIndex) && isMyTurn ? "hover:bg-cell-hover cursor-pointer" : ""}
                ${winner || !isMyTurn ? "cursor-default" : ""}
                flex items-center justify-center
              `}
              whileTap={!winner && (cell === null || i === fadingIndex) && isMyTurn ? { scale: 0.95 } : {}}
            >
              <AnimatePresence mode="popLayout">
                {cell && (
                  <motion.span
                    key={`${i}-${cell}-${moves.find((m) => m.index === i)?.order}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: isFading ? 0.25 : 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`
                      text-3xl sm:text-5xl font-mono font-bold select-none
                      ${cell === "X" ? "text-x" : "text-o"}
                      ${isWinCell ? "drop-shadow-[0_0_12px_currentColor]" : ""}
                    `}
                  >
                    {cell}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Info */}
      <p className="text-xs text-muted-foreground max-w-[280px] text-center leading-relaxed">
        Each player keeps only 3 marks. Your oldest mark fades and vanishes when you place a 4th.
      </p>
    </div>
  );
}
