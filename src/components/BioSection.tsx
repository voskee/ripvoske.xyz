import { useEffect, useState } from 'react';
import { Instagram, Music, Images, Send, Loader2, User } from 'lucide-react';
import { supabase, type GuestbookNote } from '@/lib/supabase';
import { sounds } from '@/lib/sounds';

type BioSectionProps = {
  onOpenGallery: () => void;
};

const ACCENT = '#000080';

export default function BioSection({ onOpenGallery }: BioSectionProps) {
  const [notes, setNotes] = useState<GuestbookNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadNotes();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('guestbook_notes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      setError('No se pudieron cargar los mensajes.');
    } else {
      setNotes(data as GuestbookNote[]);
    }
    setLoading(false);
  };

  const handlePost = async () => {
    if (!message.trim()) return;
    setPosting(true);
    setError(null);
    const { data, error } = await supabase
      .from('guestbook_notes')
      .insert({
        author: author.trim() || 'Anónimo',
        message: message.trim(),
      })
      .select()
      .single();
    if (error || !data) {
      setError('No se pudo publicar. Intenta de nuevo.');
      setPosting(false);
      return;
    }
    setNotes((prev) => [data as GuestbookNote, ...prev]);
    setMessage('');
    setPosting(false);
    sounds.send();
  };

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-3 sm:p-4 flex flex-col gap-3">
      {/* ===== Profile card ===== */}
      <div className="bevel-in bg-[#dfdfdf] p-3 sm:p-4">
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-[20px] sm:text-[24px] font-bold" style={{ color: ACCENT }}>ripvoske.xyz</h2>
          <div className="y2k-divider my-1" />
          <p className="text-[13px] leading-relaxed">
            aloalo, esta es mi página, no se que se puede hacer, estoy puro weando ajajaja.
          </p>
          <p className="text-[11px] mt-2 italic text-[#404040]">
            &gt; Sistema operativo: ripvoske98 SE &nbsp;|&nbsp; Memoria: 32 MB &nbsp;|&nbsp; CPU: Pentium I 166MHz
          </p>
        </div>
      </div>

      {/* ===== Link buttons ===== */}
      <div className="bevel-out bg-[#c0c0c0] p-3">
        <div className="text-[12px] font-bold mb-2 text-[#404040]">-- Enlaces externos --</div>
        <div className="flex flex-wrap gap-2">
          <button
            className="w95-btn"
            onClick={() => { sounds.click(); window.open('https://instagram.com/xpvoske', '_blank'); }}
          >
            <Instagram size={15} /> Instagram
          </button>
          <button
            className="w95-btn"
            onClick={() => { sounds.click(); window.open('https://open.spotify.com/playlist/3wt1GGbMq6hG4XBBApj5yi?si=9PL_5XM5QvGLsdWEBHWhlg', '_blank'); }}
          >
            <Music size={15} /> Spotify
          </button>
          <button className="w95-btn" onClick={() => { sounds.tab(); onOpenGallery(); }}>
            <Images size={15} /> Xoromine
          </button>
        </div>
      </div>

      {/* ===== Pizarra libre / Guestbook ===== */}
      <div className="bevel-out bg-[#c0c0c0] p-3">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-[13px] font-bold">Pizarra libre — Deja tu huella</span>
          <span className="blink text-[#000080] font-bold">_</span>
        </div>

        {/* Compose form */}
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex gap-2 items-center">
            <label className="text-[12px] whitespace-nowrap w-10">Nick:</label>
            <input
              type="text"
              value={author}
              onChange={(e) => { setAuthor(e.target.value); sounds.type(); }}
              maxLength={30}
              placeholder="Anónimo"
              className="sunken-field px-2 text-[13px] flex-1 h-[22px] outline-none"
            />
          </div>
          <div className="flex gap-2 items-start">
            <label className="text-[12px] whitespace-nowrap w-10 pt-[3px]">Msg:</label>
            <textarea
              value={message}
              onChange={(e) => { setMessage(e.target.value); sounds.type(); }}
              maxLength={500}
              placeholder="Escribe tu mensaje..."
              rows={2}
              className="sunken-field px-2 py-1 text-[13px] flex-1 outline-none resize-none"
            />
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] text-[#404040]">{message.length}/500</span>
            <div className="flex gap-2 items-center">
              {error && <span className="text-[11px] text-[#800000]">{error}</span>}
              <button
                className="w95-btn"
                onClick={handlePost}
                disabled={posting || !message.trim()}
                style={{ opacity: posting || !message.trim() ? 0.6 : 1 }}
              >
                {posting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Publicar
              </button>
            </div>
          </div>
        </div>

        {/* Notes list */}
        <div className="sunken-field p-2 w95-scroll overflow-y-auto" style={{ maxHeight: 240 }}>
          {loading ? (
            <div className="text-center text-[13px] py-4 flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Cargando mensajes...
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center text-[13px] text-[#808080] py-4">
              No hay mensajes aún. Sé el primero por siempre<span className="blink">_</span>
            </div>
          ) : (
            <div className="flex flex-col gap-[6px]">
              {notes.map((n) => (
                <div key={n.id} className="bevel-in-thin bg-[#f5f5f5] px-2 py-1 text-[13px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#000080] flex items-center gap-1 truncate">
                      <User size={10} className="flex-shrink-0" /> {n.author}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-[#808080]">{fmtDate(n.created_at)}</span>
                    </div>
                  </div>
                  <p className="mt-1 break-words leading-snug selectable">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
