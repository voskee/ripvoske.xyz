import { useState } from 'react';
import { Grid3x3, Gamepad2, Trophy, Zap, Brain } from 'lucide-react';
import { sounds } from '@/lib/sounds';
import MinesweeperGame from '@/games/MinesweeperGame';
import SnakeGame from '@/games/SnakeGame';
import TicTacToeGame from '@/games/TicTacToeGame';
import MemoryGame from '@/games/MemoryGame';

type GameId = 'minesweeper' | 'snake' | 'tictactoe' | 'memory';

type GameInfo = {
  id: GameId;
  name: string;
  icon: typeof Grid3x3;
  desc: string;
};

const GAMES: GameInfo[] = [
  { id: 'minesweeper', name: 'Buscaminas', icon: Grid3x3, desc: '9×9 · 10 minas' },
  { id: 'snake', name: 'Serpiente', icon: Zap, desc: 'Clásico · Flechas/WASD' },
  { id: 'tictactoe', name: '3 en Raya', icon: Gamepad2, desc: 'VS computadora' },
  { id: 'memory', name: 'Memoria', icon: Brain, desc: 'Encuentra parejas' },
];

export default function MinesweeperSection() {
  const [game, setGame] = useState<GameId>('minesweeper');

  const switchGame = (id: GameId) => {
    sounds.tab();
    setGame(id);
  };

  return (
    <div className="p-3 sm:p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="w-full flex items-center gap-2 text-[14px] font-bold">
        <Trophy size={16} /> Minijuegos
      </div>

      {/* Game selector tabs */}
      <div className="flex items-end gap-1 flex-wrap">
        {GAMES.map((g) => {
          const Icon = g.icon;
          const active = game === g.id;
          return (
            <button
              key={g.id}
              onClick={() => switchGame(g.id)}
              className="flex flex-col items-center justify-center gap-0.5 transition-all"
              style={{
                background: active ? '#c0c0c0' : '#9a9a9a',
                color: active ? '#000080' : '#404040',
                borderTop: active ? '2px solid #fff' : '2px solid #707070',
                borderLeft: active ? '2px solid #fff' : '2px solid #707070',
                borderBottom: active ? '2px solid #808080' : '2px solid #404040',
                borderRight: active ? '2px solid #808080' : '2px solid #404040',
                padding: '6px 12px',
                minWidth: 70,
                cursor: 'pointer',
                fontWeight: active ? 'bold' : 'normal',
                fontSize: 12,
                position: 'relative',
                top: active ? 0 : 1,
                zIndex: active ? 2 : 1,
              }}
            >
              <Icon size={16} />
              <span>{g.name}</span>
              <span className="text-[9px] opacity-70">{g.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Game content */}
      <div className="bevel-in-thin bg-[#c0c0c0] p-2 sm:p-3 flex-1 flex flex-col items-center min-h-0">
        {game === 'minesweeper' && <MinesweeperGame />}
        {game === 'snake' && <SnakeGame />}
        {game === 'tictactoe' && <TicTacToeGame />}
        {game === 'memory' && <MemoryGame />}
      </div>

      {/* Status bar */}
      <div className="flex gap-2">
        <div className="status-seg flex-1">
          Jugando: {GAMES.find((g) => g.id === game)?.name}
        </div>
        <div className="status-seg text-[#808080]">ripvoske &copy; 2026</div>
      </div>
    </div>
  );
}
