import { ArrowLeft, Images, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { sounds } from '@/lib/sounds';

const ACCENT = '#000080';

type Friend = {
  name: string;
  img: string;
  rotate?: number;
  objectPosition?: string;
};

const FRIENDS: Friend[] = [
  { name: 'Eituyoi', img: 'https://lh3.googleusercontent.com/d/1motnUBEfIoedpEhu6zThyx8aiuDQZyCK=w200-h200-c', rotate: -90 },
  { name: 'Vixo', img: 'https://lh3.googleusercontent.com/d/1mInWKS3duxFqdGJDnAAGwKlWNxM593GC=w400-h400', rotate: 90, objectPosition: 'center 20%' },
  { name: 'Victorino', img: 'https://lh3.googleusercontent.com/d/1DTeo6eyjaeSGyVe7kE3NumXV0qwgFaIS=w400-h400' },
  { name: 'Gabote11.', img: 'https://lh3.googleusercontent.com/d/1dvHuf95HgNdEJ9Rx9A-DRXiNpqoEhXk-=w400-h400', rotate: 90 },
  { name: 'Voske', img: 'https://lh3.googleusercontent.com/d/1vziEmazqObYq6qL-32OTgborLJuXtUDt=w400-h400' },
  { name: 'Kamacho', img: 'https://lh3.googleusercontent.com/d/1IncWnUrFEQoh8RXERsc7J6aBbNlsm9kT=w400-h400' },
  { name: 'Mitsubishi', img: 'https://lh3.googleusercontent.com/d/1rf0g8vEZRCcJvLBjZI-bv4CRCqDH6wZs=w400-h400', rotate: 90 },
];

type GallerySectionProps = {
  onBack: () => void;
};

export default function GallerySection({ onBack }: GallerySectionProps) {
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const loadedCount = Object.values(loaded).filter(Boolean).length;

  return (
    <div className="p-3 sm:p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-[14px] font-bold">
          <Images size={16} /> Xoromine
        </div>
        <button className="w95-btn" onClick={() => { sounds.tab(); onBack(); }}>
          <ArrowLeft size={13} /> Volver
        </button>
      </div>

      {/* Album info bar */}
      <div className="bevel-in bg-[#dfdfdf] px-3 py-2 text-[12px] flex flex-wrap gap-x-4 gap-y-1">
        <span>Álbum: <b>Xoromine</b></span>
        <span>Objetos: <b>{FRIENDS.length}</b></span>
        <span>Tamaño: <b>6.7 MB</b></span>
        <span>Modificado: <b>31/10/2026</b></span>
      </div>

      {/* Photo grid */}
      <div className="sunken-field p-2 sm:p-3 w95-scroll overflow-y-auto" style={{ maxHeight: 420 }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {FRIENDS.map((f, i) => (
            <div key={i} className="bevel-out bg-[#c0c0c0] p-1">
              {/* Photo frame */}
              <div className="bevel-in bg-white flex items-center justify-center overflow-hidden" style={{ aspectRatio: '1/1' }}>
                {!loaded[i] && (
                  <div className="flex flex-col items-center gap-1 text-[#808080]">
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-[10px]">Cargando...</span>
                  </div>
                )}
                <img
                  src={f.img}
                  alt={f.name}
                  width={200}
                  height={200}
                  loading="lazy"
                  decoding="async"
                  onLoad={() => setLoaded((p) => ({ ...p, [i]: true }))}
                  style={{
                    display: loaded[i] ? 'block' : 'none',
                    transform: f.rotate ? `rotate(${f.rotate}deg)` : undefined,
                    objectPosition: f.objectPosition,
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Name */}
              <div className="mt-1 px-1 pb-1">
                <div className="text-[12px] font-bold truncate" style={{ color: ACCENT }}>{f.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex gap-2">
        <div className="status-seg flex-1">{loadedCount} de {FRIENDS.length} objetos cargados</div>
        <div className="status-seg text-[#808080]">ripvoske &copy; 2026</div>
      </div>
    </div>
  );
}
