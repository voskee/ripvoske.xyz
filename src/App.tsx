import { useEffect, useState } from 'react';
import { Minus, Square, X, User, Images, Volume2, VolumeX, Grid3x3, Palette, Music } from 'lucide-react';
import BioSection from '@/components/BioSection';
import GallerySection from '@/components/GallerySection';
import MinesweeperSection from '@/components/MinesweeperSection';
import MusicSection from '@/components/MusicSection';
import PaintSection from '@/components/PaintSection';
import { sounds } from '@/lib/sounds';
import { DEFAULT_THEME } from '@/lib/themes';

type TabId = 'bio' | 'gallery' | 'paint' | 'minesweeper' | 'music';

type MenuItem = {
  label: string;
  action?: () => void;
  check?: boolean;
};

type Menu = {
  name: string;
  items: MenuItem[];
};

const theme = DEFAULT_THEME;

export default function App() {
  const [tab, setTab] = useState<TabId>(() => {
    const saved = sessionStorage.getItem('ripvoske-tab') as TabId | null;
    return saved ?? 'bio';
  });
  const [maximized, setMaximized] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    sounds.boot();
  }, []);

  useEffect(() => {
    sessionStorage.setItem('ripvoske-tab', tab);
  }, [tab]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    sounds.toggle(next);
  };

  const menus: Menu[] = [
    {
      name: 'Archivo',
      items: [
        { label: 'Abrir instagram', action: () => window.open('https://instagram.com/xpvoske', '_blank') },
        { label: 'Abrir spotify', action: () => window.open('https://open.spotify.com/playlist/3wt1GGbMq6hG4XBBApj5yi?si=9PL_5XM5QvGLsdWEBHWhlg', '_blank') },
        { label: '---' },
        { label: 'Salir', action: () => alert('no se puede salir, sorry') },
      ],
    },
    {
      name: 'Ver',
      items: [
        { label: 'Inicio', action: () => setTab('bio'), check: tab === 'bio' },
        { label: 'Xoromine', action: () => setTab('gallery'), check: tab === 'gallery' },
        { label: 'Paint', action: () => setTab('paint'), check: tab === 'paint' },
        { label: 'Minijuegos', action: () => setTab('minesweeper'), check: tab === 'minesweeper' },
        { label: 'Música', action: () => setTab('music'), check: tab === 'music' },
      ],
    },
    {
      name: 'Ayuda',
      items: [
        { label: 'Acerca de ripvoske...', action: () => alert('ripvoske.xyz v1.0\nmis 900 pesos en internet.\n© 2026 ripvoske.xyz') },
      ],
    },
  ];

  const handleMenuClick = (name: string) => {
    sounds.click();
    setOpenMenu(openMenu === name ? null : name);
  };

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.label === '---') return;
    sounds.click();
    setOpenMenu(null);
    item.action?.();
  };

  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');

  const containerClass = maximized
    ? 'w-full h-full'
    : 'w-full max-w-[760px] h-full max-h-[680px]';

  const statusText: Record<TabId, string> = {
    bio: 'Listo',
    gallery: 'Viendo al Xoromine...',
    paint: 'Dibujando en Paint...',
    minesweeper: 'Jugando Minijuegos',
    music: 'Escuchando música...',
  };

  return (
    <div
      className="desktop w-full h-full flex items-center justify-center"
      style={{ padding: maximized ? '0' : undefined }}
      onMouseDown={() => openMenu && setOpenMenu(null)}
    >
      <div className={`bevel-out flex flex-col win-open ${containerClass}`} style={{ background: theme.face }}>
        {/* --- Title bar --- */}
        <div
          className="flex items-center justify-between h-[26px] px-1 select-none flex-shrink-0"
          style={{ background: theme.titleBg, color: theme.titleText }}
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            <User size={15} className="flex-shrink-0" />
            <span className="text-[13px] font-bold truncate" style={{ textShadow: '1px 1px 0 #000' }}>
              ripvoske.xyz
            </span>
          </div>
          <div className="flex items-center gap-[2px] flex-shrink-0">
            <button className="title-btn" onClick={() => { sounds.click(); toggleMute(); }} title={muted ? 'Activar sonido' : 'Silenciar'}>
              {muted ? <VolumeX size={11} strokeWidth={2} /> : <Volume2 size={11} strokeWidth={2} />}
            </button>
            <button className="title-btn" onClick={() => { sounds.click(); setMaximized(false); }} title="Minimizar">
              <Minus size={10} strokeWidth={3} />
            </button>
            <button
              className="title-btn"
              onClick={() => { sounds.click(); setMaximized((v) => !v); }}
              title={maximized ? 'Restaurar' : 'Maximizar'}
            >
              <Square size={9} strokeWidth={2} />
            </button>
            <button
              className="title-btn"
              onClick={() => { sounds.error(); alert('no puedes salir wnn'); }}
              title="cerrar"
            >
              <X size={12} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* --- Menu bar --- */}
        <div className="flex items-center px-1 flex-shrink-0 relative" style={{ height: 22, background: theme.face }}>
          {menus.map((m) => (
            <div key={m.name} className="relative">
              <div
                className={`menu-item ${openMenu === m.name ? 'active' : ''}`}
                style={openMenu === m.name ? { background: theme.titleBg, color: theme.titleText } : undefined}
                onMouseDown={(e) => { e.stopPropagation(); handleMenuClick(m.name); }}
                onMouseEnter={() => openMenu && setOpenMenu(m.name)}
              >
                <span className="underline">{m.name.charAt(0)}</span>{m.name.slice(1)}
              </div>
              {openMenu === m.name && (
                <div
                  className="bevel-out absolute top-full left-0 z-50 py-1"
                  style={{ minWidth: 180, background: theme.face }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {m.items.map((item, i) =>
                    item.label === '---' ? (
                      <div key={i} className="my-1 mx-1" style={{ borderTop: '1px solid #808080', borderBottom: '1px solid #fff' }} />
                    ) : (
                      <button
                        key={i}
                        className="w-full text-left px-4 py-1 text-[13px] flex items-center justify-between gap-3"
                        style={{ color: '#000' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = theme.titleBg;
                          e.currentTarget.style.color = theme.titleText;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#000';
                        }}
                        onClick={() => handleMenuItemClick(item)}
                      >
                        <span>{item.label}</span>
                        {item.check && <span>✓</span>}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
          <div className="flex-1" />
          <div className="text-[11px] text-[#404040] pr-2 hidden sm:block">
            ripvoske98 SE
          </div>
        </div>

        {/* --- Tab strip --- */}
        <div className="flex items-end px-1 pt-1 flex-shrink-0" style={{ background: theme.face }}>
          <div
            className={`tab ${tab === 'bio' ? 'active' : ''}`}
            onClick={() => { sounds.tab(); setTab('bio'); }}
          >
            <User size={11} className="inline mr-1 -mt-0.5" /> Inicio
          </div>
          <div
            className={`tab ${tab === 'gallery' ? 'active' : ''}`}
            onClick={() => { sounds.tab(); setTab('gallery'); }}
          >
            <Images size={11} className="inline mr-1 -mt-0.5" /> Xoromine
          </div>
          <div
            className={`tab ${tab === 'paint' ? 'active' : ''}`}
            onClick={() => { sounds.tab(); setTab('paint'); }}
          >
            <Palette size={11} className="inline mr-1 -mt-0.5" /> Paint
          </div>
          <div
            className={`tab ${tab === 'minesweeper' ? 'active' : ''}`}
            onClick={() => { sounds.tab(); setTab('minesweeper'); }}
          >
            <Grid3x3 size={11} className="inline mr-1 -mt-0.5" /> Minijuegos
          </div>
          <div
            className={`tab ${tab === 'music' ? 'active' : ''}`}
            onClick={() => { sounds.tab(); setTab('music'); }}
          >
            <Music size={11} className="inline mr-1 -mt-0.5" /> Música
          </div>
        </div>

        {/* --- Content area --- */}
        <div className="bevel-in-thin mx-1 flex-1 overflow-hidden flex flex-col min-h-0" style={{ background: theme.face }}>
          <div className="w95-scroll overflow-y-auto flex-1" style={{ display: tab === 'bio' ? 'block' : 'none' }}>
            <BioSection onOpenGallery={() => setTab('gallery')} />
          </div>
          <div className="w95-scroll overflow-y-auto flex-1" style={{ display: tab === 'gallery' ? 'block' : 'none' }}>
            <GallerySection onBack={() => setTab('bio')} />
          </div>
          <div className="w95-scroll overflow-y-auto flex-1" style={{ display: tab === 'paint' ? 'block' : 'none' }}>
            <PaintSection />
          </div>
          <div className="w95-scroll overflow-y-auto flex-1" style={{ display: tab === 'minesweeper' ? 'block' : 'none' }}>
            <MinesweeperSection />
          </div>
          <div className="w95-scroll overflow-y-auto flex-1" style={{ display: tab === 'music' ? 'block' : 'none' }}>
            <MusicSection onBack={() => setTab('bio')} />
          </div>
        </div>

        {/* --- Status bar --- */}
        <div className="flex gap-2 px-1 py-1 flex-shrink-0" style={{ background: theme.face }}>
          <div className="status-seg flex-1">
            {statusText[tab]}
          </div>
          <div className="status-seg tabular-nums">
            {hh}:{mm}
          </div>
        </div>
      </div>
    </div>
  );
}
