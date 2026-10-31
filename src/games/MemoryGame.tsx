import { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Timer } from 'lucide-react';
import { sounds } from '@/lib/sounds';

type Card = {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
};

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(): Card[] {
  const pairs = [...EMOJIS, ...EMOJIS];
  return shuffle(pairs).map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }));
}

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>(buildDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [won, setWon] = useState(false);
  const [started, setStarted] = useState(false);

  const reset = useCallback(() => {
    sounds.click();
    setCards(buildDeck());
    setFlipped([]);
    setMoves(0);
    setSeconds(0);
    setWon(false);
    setStarted(false);
  }, []);

  useEffect(() => {
    if (!started || won) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [started, won]);

  const handleClick = (idx: number) => {
    if (cards[idx].flipped || cards[idx].matched || flipped.length >= 2) return;
    sounds.click();

    const nc = cards.map((c, i) => (i === idx ? { ...c, flipped: true } : c));
    setCards(nc);
    const nf = [...flipped, idx];
    setFlipped(nf);

    if (nf.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = nf;
      if (nc[a].emoji === nc[b].emoji) {
        sounds.reveal();
        setTimeout(() => {
          setCards((prev) => {
            const upd = prev.map((c, i) =>
              i === a || i === b ? { ...c, matched: true } : c
            );
            if (upd.every((c) => c.matched)) {
              setWon(true);
              sounds.win();
            }
            return upd;
          });
          setFlipped([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === a || i === b ? { ...c, flipped: false } : c
            )
          );
          setFlipped([]);
        }, 900);
      }
    }

    if (!started) setStarted(true);
  };

  const matched = cards.filter((c) => c.matched).length / 2;

  return (
    <div className="flex flex-col gap-3 items-center w-full">
      {/* HUD */}
      <div className="bevel-in bg-[#c0c0c0] flex items-center justify-between px-3 py-1 w-full max-w-[360px]">
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold">Pares:</span>
          <span className="text-[14px] font-mono font-bold text-[#008000]">{matched}/{EMOJIS.length}</span>
        </div>
        <button className="w95-btn-sm" onClick={reset} style={{ minWidth: 36, minHeight: 28 }}>
          <RefreshCw size={12} /> Nuevo
        </button>
        <div className="flex items-center gap-1">
          <Timer size={12} />
          <span className="text-[14px] font-mono font-bold text-[#ff0000]">{String(seconds).padStart(3, '0')}</span>
          <span className="text-[11px] ml-1">Mov: {moves}</span>
        </div>
      </div>

      {/* Board */}
      <div className="bevel-out bg-[#c0c0c0] p-2">
        <div className="grid gap-[3px] bg-[#808080] p-1 bevel-in" style={{ gridTemplateColumns: 'repeat(4, 60px)' }}>
          {cards.map((card, i) => (
            <button
              key={card.id}
              className="flex items-center justify-center text-[28px] cursor-pointer select-none"
              style={{
                width: 60,
                height: 60,
                background: card.flipped || card.matched ? '#fff' : '#000080',
                borderTop: card.flipped || card.matched
                  ? '2px solid #808080'
                  : '2px solid #0000ff',
                borderLeft: card.flipped || card.matched
                  ? '2px solid #808080'
                  : '2px solid #0000ff',
                borderBottom: card.flipped || card.matched
                  ? '2px solid #fff'
                  : '2px solid #000040',
                borderRight: card.flipped || card.matched
                  ? '2px solid #fff'
                  : '2px solid #000040',
                color: card.matched ? '#008000' : '#000',
                opacity: card.matched ? 0.5 : 1,
              }}
              onClick={() => handleClick(i)}
            >
              {card.flipped || card.matched ? card.emoji : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="bevel-in bg-[#dfdfdf] px-3 py-2 text-[12px] w-full max-w-[340px]">
        {won ? (
          <p className="font-bold text-[#008000]">
            ¡Ganaste! {moves} movimientos en {seconds} segundos.
          </p>
        ) : (
          <p>Encuentra todas las parejas de animales. Click para voltear las cartas.</p>
        )}
      </div>
    </div>
  );
}
