import { useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { sounds } from '@/lib/sounds';

type Player = 'X' | 'O';
type Cell = Player | null;

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(b: Cell[]): { winner: Player; line: number[] } | null {
  for (const line of LINES) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) {
      return { winner: b[a]!, line };
    }
  }
  return null;
}

function bestMove(board: Cell[], ai: Player): number {
  const human: Player = ai === 'X' ? 'O' : 'X';

  function minimax(b: Cell[], isMax: boolean, depth: number): number {
    const result = checkWinner(b);
    if (result?.winner === ai) return 10 - depth;
    if (result?.winner === human) return depth - 10;
    if (b.every(Boolean)) return 0;

    const scores: number[] = [];
    const moves: number[] = [];
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        const nb = [...b];
        nb[i] = isMax ? ai : human;
        scores.push(minimax(nb, !isMax, depth + 1));
        moves.push(i);
      }
    }
    return isMax ? Math.max(...scores) : Math.min(...scores);
  }

  let best = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const nb = [...board];
      nb[i] = ai;
      const s = minimax(nb, false, 0);
      if (s > best) { best = s; move = i; }
    }
  }
  return move;
}

export default function TicTacToeGame() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<Player>('X');
  const [winner, setWinner] = useState<{ winner: Player; line: number[] } | null>(null);
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });

  const reset = useCallback(() => {
    sounds.click();
    setBoard(Array(9).fill(null));
    setTurn('X');
    setWinner(null);
  }, []);

  const handleClick = (i: number) => {
    if (board[i] || winner || turn !== 'X') return;
    sounds.click();
    const nb = [...board];
    nb[i] = 'X';
    setBoard(nb);
    const result = checkWinner(nb);
    if (result) {
      setWinner(result);
      setScores((s) => ({ ...s, X: s.X + 1 }));
      sounds.win();
      return;
    }
    if (nb.every(Boolean)) {
      setScores((s) => ({ ...s, draw: s.draw + 1 }));
      sounds.reveal();
      return;
    }
    setTurn('O');
  };

  // AI move
  if (turn === 'O' && !winner && !board.every(Boolean)) {
    setTimeout(() => {
      const move = bestMove(board, 'O');
      if (move >= 0) {
        const nb = [...board];
        nb[move] = 'O';
        setBoard(nb);
        const result = checkWinner(nb);
        if (result) {
          setWinner(result);
          setScores((s) => ({ ...s, O: s.O + 1 }));
          sounds.error();
        } else if (nb.every(Boolean)) {
          setScores((s) => ({ ...s, draw: s.draw + 1 }));
        }
        setTurn('X');
      }
    }, 400);
  }

  const isDraw = !winner && board.every(Boolean);

  return (
    <div className="flex flex-col gap-3 items-center w-full">
      {/* Scoreboard */}
      <div className="bevel-in bg-[#c0c0c0] flex items-center justify-between px-3 py-1 w-full max-w-[300px] text-[12px]">
        <div className="flex items-center gap-1">
          <span className="font-bold text-[#000080]">Tú (X):</span>
          <span className="font-mono font-bold">{scores.X}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-bold">Empates:</span>
          <span className="font-mono font-bold">{scores.draw}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-bold text-[#ff0000]">PC (O):</span>
          <span className="font-mono font-bold">{scores.O}</span>
        </div>
      </div>

      {/* Board */}
      <div className="bevel-out bg-[#c0c0c0] p-2">
        <div className="grid gap-[2px] bg-[#808080] p-1 bevel-in" style={{ gridTemplateColumns: 'repeat(3, 80px)' }}>
          {board.map((cell, i) => {
            const isWinCell = winner?.line.includes(i);
            return (
              <button
                key={i}
                className="flex items-center justify-center text-[32px] font-bold cursor-pointer select-none bevel-out bg-[#c0c0c0]"
                style={{
                  width: 80,
                  height: 80,
                  color: cell === 'X' ? '#000080' : '#ff0000',
                  background: isWinCell ? '#ffff80' : undefined,
                }}
                onClick={() => handleClick(i)}
              >
                {cell}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status */}
      <div className="bevel-in bg-[#dfdfdf] px-3 py-2 text-[12px] w-full max-w-[300px] flex items-center justify-between">
        <span>
          {winner ? `¡Ganó ${winner.winner}!` : isDraw ? '¡Empate!' : turn === 'X' ? 'Tu turno' : 'Pensando...'}
        </span>
        <button className="w95-btn-sm" onClick={reset}>
          <RefreshCw size={12} /> Nuevo
        </button>
      </div>
    </div>
  );
}
