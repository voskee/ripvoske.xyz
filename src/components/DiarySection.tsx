import { BookOpen } from 'lucide-react';
import { DIARY_ENTRIES } from '@/lib/diary';
import { DEFAULT_THEME } from '@/lib/themes';

export default function DiarySection() {
  const entries = [...DIARY_ENTRIES].sort((a, b) => b.date.localeCompare(a.date));

  const fmtDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="p-3 sm:p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-[14px] font-bold">
        <BookOpen size={16} /> Diario
      </div>

      <div className="bevel-in bg-[#dfdfdf] px-3 py-2 text-[12px]">
        Actualizaciones de vez en cuando.
      </div>

      {/* Entries */}
      <div className="flex flex-col gap-3">
        {entries.map((entry) => (
          <div key={entry.id} className="bevel-out bg-[#c0c0c0] p-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-[14px] font-bold" style={{ color: DEFAULT_THEME.accent }}>
                {entry.title}
              </h3>
              <span className="text-[11px] text-[#404040] whitespace-nowrap">
                {fmtDate(entry.date)}
              </span>
            </div>
            <div className="y2k-divider mb-2" />
            <p className="text-[13px] leading-relaxed selectable">{entry.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
