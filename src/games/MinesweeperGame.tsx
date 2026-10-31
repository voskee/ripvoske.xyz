import { useState, useEffect, useCallback } from 'react';
import { Bomb, Flag, RefreshCw, Timer, Grid3x3 } from 'lucide-react';
import { sounds } from '@/lib/sounds';

type Cell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
};

const ROWS = 9;
const COLS = 9;
const MINES = 10;

type Status = 'ready' | 'playing' | 'won' | 'lost';

function buildBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false, revealed: false, flagged: false, adjacent: 0,
    }))
  );
}

function placeMines(board: Cell[][], safeR: number, safeC: number): Cell[][] {
  const b = board.map((r) => r.map((c) => ({ ...c })));
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (b[r][c].mine) continue;
    if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
    b[r][c].mine = true;
    placed++;
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (b[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
          if (b[nr][nc].mine) count++;
        }
      }
      b[r][c].adjacent = count;
    }
  }
  return b;
}

function floodReveal(board: Cell[][], r: number, c: number): Cell[][] {
  const b = board.map((row) => row.map((cell) => ({ ...cell })));
  const stack: [number, number][] = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop()!;
    const cell = b[cr][cc];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.adjacent === 0 && !cell.mine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
          if (!b[nr][nc].revealed) stack.push([nr, nc]);
        }
      }
    }
  }
  return b;
}

function checkWin(board: Cell[][]): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r][c].mine && !board[r][c].revealed) return false;
    }
  }
  return true;
}

const NUM_COLORS = [
  '', '#0000ff', '#008000', '#ff0000', '#000080',
  '#800000', '#008080', '#000000', '#808080',
];

export default function MinesweeperGame() {
  const [board, setBoard] = useState<Cell[][]>(buildBoard);
  const [status, setStatus] = useState<Status>('ready');
  const [flags, setFlags] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (status !== 'playing') return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const reset = useCallback(() => {
    sounds.click();
    setBoard(buildBoard());
    setStatus('ready');
    setFlags(0);
    setSeconds(0);
  }, []);

  const handleReveal = (r: number, c: number) => {
    if (status === 'won' || status === 'lost') return;
    if (board[r][c].revealed || board[r][c].flagged) return;

    let b = board;
    let st = status;

    if (status === 'ready') {
      b = placeMines(board, r, c);
      st = 'playing';
      setStatus('playing');
    }

    if (b[r][c].mine) {
      const revealed = b.map((row) => row.map((cell) => ({ ...cell })));
      revealed.forEach((row) => row.forEach((cell) => { if (cell.mine) cell.revealed = true; }));
      revealed[r][c].revealed = true;
      setBoard(revealed);
      setStatus('lost');
      sounds.error();
      return;
    }

    const newBoard = floodReveal(b, r, c);
    setBoard(newBoard);
    sounds.reveal();

    if (checkWin(newBoard)) {
      setStatus('won');
      sounds.win();
    }
  };

  const handleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (status === 'won' || status === 'lost' || board[r][c].revealed) return;
    sounds.click();
    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
    newBoard[r][c].flagged = !newBoard[r][c].flagged;
    setBoard(newBoard);
    sounds.flag();
    setFlags(newBoard.flat().filter((cell) => cell.flagged).length);
  };

  const minesLeft = MINES - flags;

  return (
    <div className="flex flex-col gap-3 items-center w-full">
      {/* Game panel */}
      <div className="bevel-out bg-[#c0c0c0] p-2">
        {/* HUD */}
        <div className="bevel-in bg-[#c0c0c0] flex items-center justify-between px-2 py-1 mb-2">
          <div className="flex items-center gap-1">
            <Bomb size={12} />
            <span className="text-[14px] font-mono font-bold text-[#ff0000] bg-[#000] px-1">
              {String(Math.max(minesLeft, 0)).padStart(3, '0')}
            </span>
          </div>
          <button
            className="w95-btn-sm"
            onClick={reset}
            style={{ minWidth: 40, minHeight: 32, fontSize: 18 }}
            title="Reiniciar"
          >
            {status === 'lost' ? '😵' : status === 'won' ? '😎' : '🙂'}
          </button>
          <div className="flex items-center gap-1">
            <Timer size={12} />
            <span className="text-[14px] font-mono font-bold text-[#ff0000] bg-[#000] px-1">
              {String(seconds).padStart(3, '0')}
            </span>
          </div>
        </div>

        {/* Grid */}
        <div
          className="inline-grid gap-[1px] bg-[#808080] p-1 bevel-in"
          style={{ gridTemplateColumns: `repeat(${COLS}, 28px)` }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const base = 'flex items-center justify-center text-[13px] font-bold cursor-pointer select-none';
              const size = { width: 28, height: 28 };

              if (cell.revealed) {
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`${base} bevel-in-thin bg-[#c0c0c0]`}
                    style={size}
                  >
                    {cell.mine ? (
                      <Bomb size={14} className="text-[#000]" />
                    ) : cell.adjacent > 0 ? (
                      <span style={{ color: NUM_COLORS[cell.adjacent] }}>{cell.adjacent}</span>
                    ) : null}
                  </div>
                );
              }

              return (
                <button
                  key={`${r}-${c}`}
                  className={`${base} bevel-out bg-[#c0c0c0]`}
                  style={size}
                  onClick={() => handleReveal(r, c)}
                  onContextMenu={(e) => handleFlag(e, r, c)}
                >
                  {cell.flagged ? <Flag size={13} className="text-[#ff0000]" /> : null}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Status / instructions */}
      <div className="bevel-in bg-[#dfdfdf] px-3 py-2 text-[12px] w-full max-w-[340px]">
        {status === 'won' && <p className="font-bold text-[#008000]">¡Ganaste!</p>}
        {status === 'lost' && <p className="font-bold text-[#ff0000]">¡Boom! Intenta de nuevo.</p>}
        {(status === 'ready' || status === 'playing') && (
          <p>
            Click izq: descubrir casilla &nbsp;|&nbsp; Click der: poner bandera.
            <br />
            {MINES} minas en un tablero de {ROWS}×{COLS}.
          </p>
        )}
      </div>
    </div>
  );
}
