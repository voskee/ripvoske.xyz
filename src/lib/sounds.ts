// Retro 8-bit sound effects synthesized with the Web Audio API.
// No audio files needed — all sounds are generated procedurally.

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

type ToneOpts = {
  freq: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  sweepTo?: number;
  delay?: number;
};

function tone({ freq, duration, type = 'square', volume = 0.08, sweepTo, delay = 0 }: ToneOpts): void {
  if (muted) return;
  const audio = getCtx();
  if (!audio) return;

  const start = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(Math.max(sweepTo, 1), start + duration);

  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export const sounds = {
  click() {
    tone({ freq: 1200, duration: 0.04, type: 'square', volume: 0.05 });
  },
  hover() {
    tone({ freq: 600, duration: 0.02, type: 'square', volume: 0.03 });
  },
  tab() {
    tone({ freq: 800, duration: 0.05, type: 'square', volume: 0.06 });
    tone({ freq: 1200, duration: 0.05, type: 'square', volume: 0.06, delay: 0.04 });
  },
  open() {
    tone({ freq: 400, duration: 0.06, type: 'square', volume: 0.06 });
    tone({ freq: 800, duration: 0.06, type: 'square', volume: 0.06, delay: 0.05 });
    tone({ freq: 1600, duration: 0.08, type: 'square', volume: 0.05, delay: 0.10 });
  },
  error() {
    tone({ freq: 200, duration: 0.12, type: 'sawtooth', volume: 0.07, sweepTo: 80 });
  },
  type() {
    tone({ freq: 1500, duration: 0.015, type: 'square', volume: 0.03 });
  },
  send() {
    tone({ freq: 600, duration: 0.05, type: 'square', volume: 0.06 });
    tone({ freq: 900, duration: 0.05, type: 'square', volume: 0.06, delay: 0.04 });
    tone({ freq: 1400, duration: 0.08, type: 'square', volume: 0.05, delay: 0.08 });
  },
  boot() {
    tone({ freq: 300, duration: 0.08, type: 'square', volume: 0.05 });
    tone({ freq: 600, duration: 0.08, type: 'square', volume: 0.05, delay: 0.07 });
    tone({ freq: 1200, duration: 0.12, type: 'square', volume: 0.04, delay: 0.14 });
  },
  reveal() {
    tone({ freq: 1000, duration: 0.03, type: 'square', volume: 0.04 });
  },
  flag() {
    tone({ freq: 700, duration: 0.04, type: 'square', volume: 0.05 });
  },
  win() {
    tone({ freq: 660, duration: 0.08, type: 'square', volume: 0.06 });
    tone({ freq: 880, duration: 0.08, type: 'square', volume: 0.06, delay: 0.07 });
    tone({ freq: 1320, duration: 0.12, type: 'square', volume: 0.05, delay: 0.14 });
  },
  toggle(m: boolean) {
    muted = m;
    if (!muted) sounds.click();
  },
  isMuted() {
    return muted;
  },
};
