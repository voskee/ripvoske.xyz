import { useEffect, useState } from 'react';

const LINES = [
  'Windows',
  '',
  'Ha ocurrido un error fatal en ripvoske98 SE. El sistema',
  'se detendrá para no perder su progreso.',
  '',
  'Si esta es la primera vez que ve esta pantalla, reinicie',
  'su sitio. Si vuelve a verla, contacte a su proveedor de',
  'internet o visite ripvoske.xyz.',
  '',
  'Error: 0xR1P : R1PV0SK3_F4T4L_W34RD0',
  '',
  'Cargando mensajes de la pizarra libre... [OK]',
  'Cargando Xoromine................... [OK]',
  'Cargando Paint..................... [OK]',
  'Cargando minijuegos................. [OK]',
  'Cargando 0xERR_NUL7.................... [FAIL]',
  '',
  'Presione cualquier tecla para continuar _',
];

export default function BlueScreen({ onClose }: { onClose: () => void }) {
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = () => onClose();
    const t = setTimeout(() => {
      window.addEventListener('keydown', handler);
      window.addEventListener('click', handler);
    }, 100);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', handler);
      window.removeEventListener('click', handler);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-start p-[6%] cursor-pointer"
      style={{ background: '#000080', color: '#fff', fontFamily: 'monospace' }}
    >
      <div className="text-[13px] sm:text-[15px] leading-[1.6] max-w-full">
        {LINES.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-words">
            {line === '' ? '\u00A0' : line}
            {i === LINES.length - 1 && showCursor && '\u00A0'}
          </div>
        ))}
      </div>
    </div>
  );
}
