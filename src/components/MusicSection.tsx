import { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
} from 'lucide-react';
import { PLAYLIST } from '@/lib/music';
import { sounds } from '@/lib/sounds';

type MusicSectionProps = {
  onBack: () => void;
};

function formatTime(s: number): string {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function MusicSection({ onBack }: MusicSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const track = PLAYLIST[currentIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setProgress(audio.currentTime);
    const onDur = () => setDuration(audio.duration);
    const onEnd = () => handleNext();

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onDur);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onDur);
      audio.removeEventListener('ended', onEnd);
    };
  }, [currentIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    sounds.click();
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    sounds.click();
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setProgress(0);
  };

  const selectTrack = (i: number) => {
    sounds.click();
    setCurrentIndex(i);
    setIsPlaying(false);
    setProgress(0);
    setTimeout(() => {
      const audio = audioRef.current;
      if (audio) {
        audio.play().catch(() => {});
        setIsPlaying(true);
      }
    }, 50);
  };

  const handleNext = () => {
    const next = (currentIndex + 1) % PLAYLIST.length;
    selectTrack(next);
  };

  const handlePrev = () => {
    if (progress > 3) {
      const audio = audioRef.current;
      if (audio) audio.currentTime = 0;
      return;
    }
    const prev = (currentIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    selectTrack(prev);
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    setProgress(t);
  };

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="p-3 sm:p-4 flex flex-col gap-3">
      <audio ref={audioRef} src={track.src} preload="metadata" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-[14px] font-bold">
          <Music size={16} /> Música
        </div>
        <button className="w95-btn" onClick={() => { sounds.tab(); onBack(); }}>
          <Play size={13} /> Volver
        </button>
      </div>

      {/* Win95-style player window */}
      <div className="bevel-out flex flex-col" style={{ background: '#c0c0c0' }}>
        {/* Win95 title bar */}
        <div
          className="flex items-center justify-between px-1.5 py-0.5 flex-shrink-0"
          style={{ background: '#000080', color: '#fff' }}
        >
          <div className="flex items-center gap-1">
            <Music size={12} />
            <span className="text-[11px] font-bold" style={{ textShadow: '1px 1px 0 #000' }}>
              Reproductor de Medios — ripvoske
            </span>
          </div>
          <div className="flex items-center gap-[2px]">
            <button className="title-btn" style={{ width: 16, height: 14 }}>
              <span className="text-[10px] font-bold">_</span>
            </button>
            <button className="title-btn" style={{ width: 16, height: 14 }}>
              <span className="text-[9px] font-bold">□</span>
            </button>
            <button className="title-btn" style={{ width: 16, height: 14 }}>
              <span className="text-[11px] font-bold leading-none">×</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-2 p-2">
          {/* LCD screen (embedded in gray panel) */}
          <div
            className="flex items-center justify-between px-2 py-1.5"
            style={{
              background: '#0a0a0a',
              border: '2px inset #808080',
              boxShadow: 'inset 1px 1px 0 #000',
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 8,
                  height: 8,
                  background: isPlaying ? '#00ff00' : '#003300',
                  border: '1px solid #00ff00',
                  boxShadow: isPlaying ? '0 0 3px #00ff00' : 'none',
                }}
              />
              <div className="flex flex-col gap-0.5 overflow-hidden">
                <span
                  className="text-[12px] font-bold truncate max-w-[200px]"
                  style={{ color: '#00ff00', fontFamily: 'monospace', textShadow: '0 0 3px #00ff00' }}
                >
                  {track.title}
                </span>
                <span
                  className="text-[10px] truncate max-w-[200px]"
                  style={{ color: '#00cc00', fontFamily: 'monospace' }}
                >
                  {track.artist}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
              <span
                className="text-[13px] font-bold tabular-nums"
                style={{ color: '#00ff00', fontFamily: 'monospace', textShadow: '0 0 3px #00ff00' }}
              >
                {formatTime(progress)} / {formatTime(duration)}
              </span>
              <span className="text-[8px]" style={{ color: '#00aa00', fontFamily: 'monospace' }}>
                {isPlaying ? 'SONANDO' : 'DETENIDO'}
              </span>
            </div>
          </div>

          {/* Seek bar (Win95 sunken track) */}
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={progress}
              onChange={seek}
              className="flex-1 h-[14px]"
              style={{
                background: '#fff',
                border: '2px inset #808080',
                accentColor: '#000080',
              }}
            />
            <span
              className="text-[10px] tabular-nums flex-shrink-0 px-1"
              style={{
                background: '#0a0a0a',
                color: '#00ff00',
                fontFamily: 'monospace',
                border: '1px inset #808080',
                minWidth: 36,
                textAlign: 'center',
              }}
            >
              {Math.round(pct)}%
            </span>
          </div>

          {/* Cover + track info (Win95 panel) */}
          <div className="bevel-in bg-[#dfdfdf] flex items-center gap-2 p-2">
            <div className="bevel-out bg-[#c0c0c0] p-1 flex-shrink-0">
              <img
                src={track.cover}
                alt={track.album}
                width={56}
                height={56}
                loading="lazy"
                className="w-14 h-14 object-cover"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="56" height="56" fill="%23808080"/><text x="28" y="32" text-anchor="middle" font-size="8" fill="%23c0c0c0" font-family="monospace">NO IMG</text></svg>';
                }}
              />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <span className="text-[12px] font-bold truncate" style={{ color: '#000080' }}>
                {track.title}
              </span>
              <span className="text-[11px] truncate" style={{ color: '#404040' }}>
                {track.artist}
              </span>
              <span className="text-[10px] truncate" style={{ color: '#808080' }}>
                Álbum: {track.album}
              </span>
            </div>
          </div>

          {/* Controls (Win95 buttons) */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <button
              className="w95-btn-sm"
              style={{ width: 36, height: 32 }}
              onClick={() => { sounds.click(); handlePrev(); }}
              title="Anterior"
            >
              <SkipBack size={15} />
            </button>
            <button
              className="w95-btn-sm"
              style={{ width: 40, height: 32 }}
              onClick={handlePlay}
              title={isPlaying ? 'Pausa' : 'Play'}
            >
              {isPlaying ? <Pause size={17} /> : <Play size={17} />}
            </button>
            <button
              className="w95-btn-sm"
              style={{ width: 36, height: 32 }}
              onClick={handleStop}
              title="Stop"
            >
              <Square size={13} />
            </button>
            <button
              className="w95-btn-sm"
              style={{ width: 36, height: 32 }}
              onClick={() => { sounds.click(); handleNext(); }}
              title="Siguiente"
            >
              <SkipForward size={15} />
            </button>
            <div className="w-[2px] h-7 mx-0.5" style={{ background: '#808080', borderRight: '1px solid #fff' }} />
            <button
              className="w95-btn-sm"
              style={{ width: 36, height: 32 }}
              onClick={() => { sounds.click(); setMuted(!muted); }}
              title={muted ? 'Activar volumen' : 'Silenciar'}
            >
              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }}
              className="w-20 h-[14px]"
              style={{
                background: '#fff',
                border: '2px inset #808080',
                accentColor: '#000080',
              }}
            />
          </div>
        </div>
      </div>

      {/* Playlist (Win95 list view) */}
      <div className="bevel-in bg-[#dfdfdf] p-2 flex flex-col gap-1">
        <div className="flex items-center justify-between px-1 pb-1">
          <span className="text-[12px] font-bold" style={{ color: '#000080' }}>
            Lista de reproducción
          </span>
          <span className="text-[11px]" style={{ color: '#808080' }}>
            {PLAYLIST.length} pistas
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          {PLAYLIST.map((t, i) => {
            const isActive = i === currentIndex;
            return (
              <button
                key={i}
                onClick={() => selectTrack(i)}
                className="flex items-center gap-2 p-1 text-left"
                style={{
                  background: isActive ? '#000080' : '#c0c0c0',
                  color: isActive ? '#fff' : '#000',
                  border: isActive
                    ? '2px outset #fff'
                    : '2px outset #dfdfdf',
                  cursor: 'pointer',
                }}
              >
                {/* Cover thumbnail (Win95 beveled) */}
                <div className="bevel-out bg-[#c0c0c0] p-0.5 flex-shrink-0">
                  <img
                    src={t.cover}
                    alt={t.album}
                    width={40}
                    height={40}
                    loading="lazy"
                    className="w-10 h-10 object-cover"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23808080"/><text x="20" y="24" text-anchor="middle" font-size="7" fill="%23c0c0c0" font-family="monospace">NO</text></svg>';
                    }}
                  />
                </div>
                {/* Track info */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[12px] font-bold truncate">
                    {i + 1}. {t.title}
                  </span>
                  <span className="text-[10px] truncate" style={{ opacity: 0.85 }}>
                    {t.artist} — {t.album}
                  </span>
                </div>
                {/* Playing indicator */}
                {isActive && isPlaying && (
                  <span className="text-[10px] mr-1 flex-shrink-0" style={{ color: '#00ff00' }}>
                    ▶
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex gap-2">
        <div className="status-seg flex-1">
          {isPlaying ? 'Reproduciendo' : 'Detenido'}: {track.title} — {track.artist}
        </div>
        <div className="status-seg text-[#808080]">ripvoske &copy; 2026</div>
      </div>
    </div>
  );
}
