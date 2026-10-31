import { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Trophy } from 'lucide-react';
import { sounds } from '@/lib/sounds';

const GRID = 17;
const SPEED = 140;

type Point = { x: number; y: number };
type Dir = 'up' | 'down' | 'left' | 'right';

const DIRS: Record<Dir, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function randomFood(snake: Point[]): Point {
  let f: Point;
  do {
    f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snake.some((s) => s.x === f.x && s.y === f.y));
  return f;
}

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>([{ x: 8, y: 8 }]);
  const [dir, setDir] = useState<Dir>('right');
  const [food, setFood] = useState<Point>({ x: 4, y: 4 });
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [running, setRunning] = useState(false);
  const [dead, setDead] = useState(false);
  const [pendingDir, setPendingDir] = useState<Dir>('right');

  const reset = useCallback(() => {
    sounds.click();
    setSnake([{ x: 8, y: 8 }]);
    setDir('right');
    setPendingDir('right');
    setFood({ x: 4, y: 4 });
    setScore(0);
    setDead(false);
    setRunning(true);
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSnake((prev) => {
        const nd = pendingDir;
        setDir(nd);
        const delta = DIRS[nd];
        const head = prev[0];
        const nh = { x: head.x + delta.x, y: head.y + delta.y };

        if (nh.x < 0 || nh.x >= GRID || nh.y < 0 || nh.y >= GRID) {
          setDead(true);
          setRunning(false);
          sounds.error();
          return prev;
        }
        if (prev.some((s) => s.x === nh.x && s.y === nh.y)) {
          setDead(true);
          setRunning(false);
          sounds.error();
          return prev;
        }

        const ate = nh.x === food.x && nh.y === food.y;
        const ns = ate ? [nh, ...prev] : [nh, ...prev.slice(0, -1)];

        if (ate) {
          sounds.reveal();
          setScore((s) => {
            const ns2 = s + 10;
            setBest((b) => Math.max(b, ns2));
            return ns2;
          });
          setFood(randomFood(ns));
        }
        return ns;
      });
    }, SPEED);
    return () => clearInterval(id);
  }, [running, pendingDir, food]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right',
      };
      const nd = map[e.key];
      if (!nd) return;
      e.preventDefault();
      const opp: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };
      if (opp[dir] === nd) return;
      setPendingDir(nd);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dir]);

  const handleButton = (nd: Dir) => {
    const opp: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };
    if (opp[dir] === nd) return;
    setPendingDir(nd);
  };

  return (
    <div className="flex flex-col gap-3 items-center w-full">
      {/* HUD */}
      <div className="bevel-in bg-[#c0c0c0] flex items-center justify-between px-3 py-1 w-full max-w-[360px]">
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold">Puntos:</span>
          <span className="text-[14px] font-mono font-bold text-[#008000]">{String(score).padStart(3, '0')}</span>
        </div>
        <button className="w95-btn-sm" onClick={reset} style={{ minWidth: 36, minHeight: 28 }}>
          <RefreshCw size={12} /> Nuevo
        </button>
        <div className="flex items-center gap-1">
          <Trophy size={12} />
          <span className="text-[14px] font-mono font-bold text-[#ff0000]">{String(best).padStart(3, '0')}</span>
        </div>
      </div>

      {/* Board */}
      <div
        className="bevel-in bg-[#0a0a0a] p-1 relative overflow-hidden"
        style={{ width: GRID * 18 + 2, height: GRID * 18 + 2 }}
      >
        {!running && !dead && score === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#0a0a0a]/80">
            <button className="w95-btn" onClick={reset}>Jugar</button>
          </div>
        )}
        {dead && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-2 bg-[#0a0a0a]/85">
            <span className="text-[14px] font-bold text-[#ff0000] font-mono">GAME OVER</span>
            <button className="w95-btn" onClick={reset}>Reintentar</button>
          </div>
        )}
        {/* Food */}
        <div
          className="absolute"
          style={{
            left: food.x * 18 + 1,
            top: food.y * 18 + 1,
            width: 16,
            height: 16,
            background: '#ff0000',
            border: '1px solid #aa0000',
          }}
        />
        {/* Snake */}
        {snake.map((s, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: s.x * 18 + 1,
              top: s.y * 18 + 1,
              width: 16,
              height: 16,
              background: i === 0 ? '#00cc00' : '#008800',
              border: '1px solid #004400',
            }}
          />
        ))}
      </div>

      {/* D-pad controls (mobile) */}
      <div className="flex flex-col items-center gap-1 sm:hidden">
        <div className="flex gap-1">
          <button className="w95-btn-sm" style={{ width: 40, height: 36 }} onClick={() => handleButton('up')}>↑</button>
        </div>
        <div className="flex gap-1">
          <button className="w95-btn-sm" style={{ width: 40, height: 36 }} onClick={() => handleButton('left')}>←</button>
          <button className="w95-btn-sm" style={{ width: 40, height: 36 }} onClick={() => handleButton('down')}>↓</button>
          <button className="w95-btn-sm" style={{ width: 40, height: 36 }} onClick={() => handleButton('right')}>→</button>
        </div>
      </div>

      <div className="bevel-in bg-[#dfdfdf] px-3 py-2 text-[12px] w-full max-w-[340px]">
        Usa las flechas del teclado o WASD para mover la serpiente.<br />
        Come los puntos rojos para crecer. No choques con las paredes ni contigo mismo.
      </div>
    </div>
  );
}
