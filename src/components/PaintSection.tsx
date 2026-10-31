import { useEffect, useRef, useState, useCallback } from 'react';
import { Brush, Eraser, Trash2, Save, Send, Loader2, Palette, GalleryHorizontalEnd } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { sounds } from '@/lib/sounds';

type Tool = 'brush' | 'eraser';

type Drawing = {
  id: string;
  author: string;
  title: string;
  data_url: string;
  created_at: string;
};

const CANVAS_SIZE = 320;
const COLORS = [
  '#000000', '#808080', '#800000', '#808000',
  '#008000', '#008080', '#000080', '#800080',
  '#ffffff', '#c0c0c0', '#ff0000', '#ffff00',
  '#00ff00', '#00ffff', '#0000ff', '#ff00ff',
];

function getPos(canvas: HTMLCanvasElement, e: PointerEvent | Touch): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const clientX = 'clientX' in e ? e.clientX : 0;
  const clientY = 'clientY' in e ? e.clientY : 0;
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

export default function PaintSection() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [author, setAuthor] = useState('Anónimo');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'draw' | 'gallery'>('draw');
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  // Init canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;
  }, []);

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const pos = getPos(canvas, e);
    lastPosRef.current = pos;

    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const moveDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = ctxRef.current;
    if (!ctx) return;
    const pos = getPos(canvas, e);

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.fillStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize;

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    // Draw a dot for single taps
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);

    lastPosRef.current = pos;
  };

  const endDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    drawingRef.current = false;
    lastPosRef.current = null;
  };

  const clearCanvas = () => {
    sounds.click();
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check if canvas is empty (all white)
    const ctx = ctxRef.current;
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const isBlank = imageData.data.every((px, i) => (i % 4 === 3 || px === 255));

    if (isBlank) {
      setError('El lienzo está vacío. ¡Dibuja algo primero!');
      return;
    }

    setSaving(true);
    setError('');

    const dataUrl = canvas.toDataURL('image/png');
    const finalAuthor = author.trim() || 'Anónimo';
    const finalTitle = title.trim() || 'Sin título';

    sounds.send();

    const { error: insertError } = await supabase.from('drawings').insert({
      author: finalAuthor,
      title: finalTitle,
      data_url: dataUrl,
    });

    if (insertError) {
      setError('Error al guardar. Intenta de nuevo.');
      setSaving(false);
      return;
    }

    setSaving(false);
    setTitle('');
    clearCanvas();
    // Switch to gallery to show the new drawing
    setMode('gallery');
    loadGallery();
  };

  const loadGallery = useCallback(async () => {
    setLoadingGallery(true);
    const { data, error: queryError } = await supabase
      .from('drawings')
      .select('id, author, title, data_url, created_at')
      .order('created_at', { ascending: false })
      .limit(60);

    if (queryError) {
      setError('Error al cargar la galería.');
    } else {
      setDrawings(data || []);
    }
    setLoadingGallery(false);
  }, []);

  useEffect(() => {
    if (mode === 'gallery' && drawings.length === 0) {
      loadGallery();
    }
  }, [mode, drawings.length, loadGallery]);

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-3 sm:p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-[14px] font-bold">
          <Palette size={16} /> Paint
        </div>
        {/* Mode toggle */}
        <div className="flex gap-1">
          <button
            className={`w95-btn-sm ${mode === 'draw' ? 'active' : ''}`}
            style={mode === 'draw' ? { fontWeight: 'bold' } : undefined}
            onClick={() => { sounds.tab(); setMode('draw'); }}
          >
            <Brush size={13} /> Dibujar
          </button>
          <button
            className={`w95-btn-sm ${mode === 'gallery' ? 'active' : ''}`}
            style={mode === 'gallery' ? { fontWeight: 'bold' } : undefined}
            onClick={() => { sounds.tab(); setMode('gallery'); }}
          >
            <GalleryHorizontalEnd size={13} /> Galería
          </button>
        </div>
      </div>

      {mode === 'draw' && (
        <>
          {/* Toolbar */}
          <div className="bevel-out bg-[#c0c0c0] p-2 flex flex-col gap-2">
            {/* Tools + colors */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Tool buttons */}
              <div className="flex gap-1">
                <button
                  className="w95-btn-sm"
                  style={tool === 'brush' ? { background: '#000080', color: '#fff' } : undefined}
                  onClick={() => { sounds.click(); setTool('brush'); }}
                  title="Pincel"
                >
                  <Brush size={14} />
                </button>
                <button
                  className="w95-btn-sm"
                  style={tool === 'eraser' ? { background: '#000080', color: '#fff' } : undefined}
                  onClick={() => { sounds.click(); setTool('eraser'); }}
                  title="Borrador"
                >
                  <Eraser size={14} />
                </button>
                <button
                  className="w95-btn-sm"
                  onClick={clearCanvas}
                  title="Limpiar"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Divider */}
              <div className="w-[2px] h-7" style={{ background: '#808080', borderRight: '1px solid #fff' }} />

              {/* Brush size */}
              <div className="flex items-center gap-1">
                <span className="text-[11px]">Tamaño:</span>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-16 h-[14px]"
                  style={{ background: '#fff', border: '2px inset #808080', accentColor: '#000080' }}
                />
                <span className="text-[11px] font-mono w-5 text-center">{brushSize}</span>
              </div>
            </div>

            {/* Color palette */}
            <div className="flex flex-wrap gap-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => { sounds.click(); setColor(c); setTool('brush'); }}
                  className="cursor-pointer"
                  style={{
                    width: 20,
                    height: 20,
                    background: c,
                    borderTop: '2px solid #fff',
                    borderLeft: '2px solid #fff',
                    borderBottom: '2px solid #404040',
                    borderRight: '2px solid #404040',
                    outline: color === c ? '2px dotted #000080' : 'none',
                    outlineOffset: '1px',
                  }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Canvas — responsive container */}
          <div className="flex justify-center">
            <div className="bevel-out bg-[#c0c0c0] p-2">
              <div
                className="bevel-in bg-white relative overflow-hidden"
                style={{ touchAction: 'none' }}
              >
                <canvas
                  ref={canvasRef}
                  className="block cursor-crosshair"
                  style={{
                    width: '100%',
                    maxWidth: CANVAS_SIZE,
                    height: 'auto',
                    aspectRatio: '1/1',
                    touchAction: 'none',
                  }}
                  onPointerDown={startDraw}
                  onPointerMove={moveDraw}
                  onPointerUp={endDraw}
                  onPointerLeave={endDraw}
                  onPointerCancel={endDraw}
                />
              </div>
            </div>
          </div>

          {/* Save form */}
          <div className="bevel-in bg-[#dfdfdf] p-2 flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Tu nombre..."
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={30}
                className="bevel-in bg-white px-2 py-1 text-[12px] flex-1 outline-none"
              />
              <input
                type="text"
                placeholder="Título del dibujo..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={40}
                className="bevel-in bg-white px-2 py-1 text-[12px] flex-1 outline-none"
              />
            </div>
            <button
              className="w95-btn"
              onClick={saveDrawing}
              disabled={saving}
              style={{ opacity: saving ? 0.6 : 1 }}
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              {saving ? 'Guardando...' : 'Guardar y publicar'}
            </button>
            {error && <p className="text-[11px] text-[#ff0000] font-bold">{error}</p>}
          </div>

          {/* Instructions */}
          <div className="bevel-in bg-[#dfdfdf] px-3 py-2 text-[12px]">
            Dibuja con el pincel, borra lo que no te guste, y guárdalo en la galería pública.
            En celular usa el dedo. En PC usa el mouse.
          </div>
        </>
      )}

      {mode === 'gallery' && (
        <>
          {loadingGallery && (
            <div className="flex items-center justify-center gap-2 py-8 text-[#808080]">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-[12px]">Cargando galería...</span>
            </div>
          )}

          {!loadingGallery && drawings.length === 0 && (
            <div className="bevel-in bg-[#dfdfdf] px-3 py-6 text-center text-[12px] text-[#404040]">
              Aún no hay dibujos. ¡Sé el primero en crear uno!
            </div>
          )}

          {!loadingGallery && drawings.length > 0 && (
            <div className="sunken-field p-2 sm:p-3 w95-scroll overflow-y-auto" style={{ maxHeight: 440 }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {drawings.map((d) => (
                  <div key={d.id} className="bevel-out bg-[#c0c0c0] p-1">
                    <div className="bevel-in bg-white flex items-center justify-center overflow-hidden" style={{ aspectRatio: '1/1' }}>
                      <img
                        src={d.data_url}
                        alt={d.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="mt-1 px-1 pb-1">
                      <div className="text-[12px] font-bold truncate" style={{ color: '#000080' }}>
                        {d.title}
                      </div>
                      <div className="text-[10px] truncate text-[#404040]">
                        por {d.author}
                      </div>
                      <div className="text-[9px] text-[#808080]">{fmtDate(d.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <div className="status-seg flex-1">
              {drawings.length} dibujo{drawings.length !== 1 ? 's' : ''} en la galería
            </div>
            <button className="w95-btn-sm" onClick={loadGallery}>
              <Save size={12} /> Recargar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
