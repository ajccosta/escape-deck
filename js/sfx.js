// Synthesised sound effects: one table entry per sound.

let ctx = null;
let muted = false;
try { muted = localStorage.getItem('ed-muted') === '1'; } catch {}

const ac = () => (ctx ||= new (window.AudioContext || window.webkitAudioContext)());

function tone(freq, dur, { type = 'square', vol = 0.05, slide = 0, delay = 0 } = {}) {
  const a = ac(), o = a.createOscillator(), g = a.createGain();
  const t = a.currentTime + delay;
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur, vol = 0.2) {
  const a = ac();
  const buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2;
  const src = a.createBufferSource(), g = a.createGain();
  src.buffer = buf;
  g.gain.value = vol;
  src.connect(g).connect(a.destination);
  src.start();
}

const arp = (notes, step, opts) => notes.forEach((f, i) => tone(f, 0.14, { delay: i * step, ...opts }));

const SFX = {
  click: () => tone(620, 0.05, { vol: 0.035 }),
  hover: () => tone(1300, 0.025, { vol: 0.012, type: 'triangle' }),
  pick: () => arp([523, 659, 784, 1046], 0.06, { type: 'triangle', vol: 0.06 }),
  good: () => arp([392, 523, 659, 784, 1046], 0.05, { type: 'square', vol: 0.035 }),
  bad: () => tone(170, 0.28, { type: 'sawtooth', slide: 0.6, vol: 0.045 }),
  boom: () => { noise(0.6, 0.25); tone(90, 0.5, { type: 'sine', slide: 0.4, vol: 0.2 }); },
  splash: () => noise(0.35, 0.08),
  chat: () => tone(880, 0.07, { type: 'triangle', vol: 0.03 }),
  win: () => arp([523, 659, 784, 1046, 784, 1046, 1318], 0.09, { type: 'square', vol: 0.04 }),
};

export function sfx(name) {
  if (muted) return;
  try { SFX[name]?.(); } catch {}
}

export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem('ed-muted', muted ? '1' : '0'); } catch {}
  return muted;
}
export const isMuted = () => muted;
