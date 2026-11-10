// Renders the current scene to a low-res canvas, handles hover / click on
// hotspots, particle effects and other players' cursors.

import { isVisible, hotspot } from './engine.js';
import { circle, rect, star, text, poly, OUT, TAU } from './draw.js';
import { COLORS } from './locks.js';

export const W = 480, H = 270;
const rand = (a, b) => a + Math.random() * (b - a);
const CONFETTI = Object.values(COLORS);

// Particle effects: one entry per effect name a level may use.
const FX = {
  explode: (x, y) => ({
    shake: 9,
    parts: [
      ...Array.from({ length: 26 }, () => ({ kind: 'gear', x, y, vx: rand(-120, 120), vy: rand(-220, -60), r: rand(2, 5), life: rand(1, 1.8), spin: rand(-8, 8) })),
      { kind: 'word', text: 'SPLAT!', x, y: y - 24, life: 1.3, color: '#fffaf0' },
    ],
  }),
  splash: (x, y) => ({
    shake: 2,
    parts: Array.from({ length: 18 }, () => ({ kind: 'drop', x, y, vx: rand(-70, 70), vy: rand(-160, -60), r: rand(1.5, 3), life: rand(0.6, 1.1), color: '#7fd3ff' })),
  }),
  sparkle: (x, y) => ({
    shake: 0,
    parts: Array.from({ length: 12 }, () => ({ kind: 'star', x: x + rand(-20, 20), y: y + rand(-20, 20), vx: rand(-20, 20), vy: rand(-50, -10), r: rand(3, 6), life: rand(0.6, 1.2), g: 0 })),
  }),
  confetti: () => ({
    shake: 4,
    parts: Array.from({ length: 90 }, () => ({ kind: 'confetti', x: rand(0, W), y: rand(-60, 0), vx: rand(-30, 30), vy: rand(20, 90), r: rand(2, 4), life: rand(2.5, 4), spin: rand(-6, 6), color: CONFETTI[(Math.random() * CONFETTI.length) | 0], g: 40 })),
  }),
};

const PART_DRAW = {
  gear(g, p) {
    g.save(); g.translate(p.x, p.y); g.rotate(p.a);
    for (let i = 0; i < 6; i++) { g.rotate(TAU / 6); g.fillStyle = OUT; g.fillRect(-1.5, -p.r - 2, 3, 3); }
    circle(g, 0, 0, p.r, '#9aa3ad', { line: 1.5 });
    circle(g, 0, 0, p.r / 3, OUT, { line: 0 });
    g.restore();
  },
  drop: (g, p) => circle(g, p.x, p.y, p.r, p.color, { line: 1 }),
  star: (g, p) => star(g, p.x, p.y, p.r, p.r / 2.4, 4, '#ffd23f', { line: 1 }),
  confetti(g, p) {
    g.save(); g.translate(p.x, p.y); g.rotate(p.a);
    rect(g, -p.r, -p.r / 2, p.r * 2, p.r, p.color, { line: 1 });
    g.restore();
  },
  word(g, p) {
    const k = Math.min(1, p.age * 6);
    text(g, p.text, p.x, p.y - p.age * 10, { size: 10 + 12 * k, color: p.color });
  },
};

export class SceneView {
  constructor(canvas, tip, { onClick, onMove }) {
    this.c = canvas;
    this.g = canvas.getContext('2d');
    this.tip = tip;
    this.parts = [];
    this.shake = 0;
    this.cursors = new Map();
    this.mouse = null;
    this.hover = null;
    canvas.addEventListener('pointermove', e => { this.mouse = this.toLocal(e); onMove?.(this.mouse); });
    canvas.addEventListener('pointerleave', () => { this.mouse = null; });
    canvas.addEventListener('click', e => {
      const h = this.hit(this.toLocal(e));
      if (h) onClick(h);
    });
  }

  set(level, sceneId) {
    if (this.sceneId !== sceneId) this.parts = [];
    this.level = level;
    this.sceneId = sceneId;
    this.def = level.scenes[sceneId];
  }

  toLocal(e) {
    const r = this.c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  }

  hotspots() { return this.def.hotspots.filter(h => isVisible(h, this.state)); }

  hit(p) {
    if (!p || !this.def) return null;
    const hs = this.hotspots();
    for (let i = hs.length - 1; i >= 0; i--) {
      const [x, y, w, h] = hs[i].rect;
      if (p.x >= x && p.x < x + w && p.y >= y && p.y < y + h) return hs[i];
    }
    return null;
  }

  fx(name, at) {
    const h = hotspot(this.level, at);
    if (h && h.scene !== this.sceneId) return;
    const [x, y, w, hh] = h ? h.rect : [0, 0, W, H];
    const { parts, shake } = FX[name](x + w / 2, y + hh / 2);
    parts.forEach(p => { p.age = 0; p.a = 0; });
    this.parts.push(...parts);
    this.shake = Math.max(this.shake, shake);
  }

  cursor(c) { this.cursors.set(c.id, { ...c, seen: performance.now() }); }

  // labelFor(h) -> tooltip text; ghost(g) draws the held item at the cursor.
  frame(state, t, dt, { labelFor, ghost, me }) {
    this.state = state;
    const g = this.g;
    this.shake = Math.max(0, this.shake - dt * 25);
    g.setTransform(1, 0, 0, 1, Math.round(rand(-1, 1) * this.shake), Math.round(rand(-1, 1) * this.shake));
    g.clearRect(-20, -20, W + 40, H + 40);
    g.imageSmoothingEnabled = false;

    this.def.draw(g, state, t);
    this.hover = this.hit(this.mouse);
    for (const h of this.hotspots()) h.draw?.(g, state, t, h === this.hover);

    this.parts = this.parts.filter(p => (p.age += dt) < p.life);
    for (const p of this.parts) {
      p.vy += (p.g ?? 380) * dt;
      p.x += (p.vx || 0) * dt;
      p.y += (p.vy || 0) * dt;
      p.a += (p.spin || 0) * dt;
      g.globalAlpha = Math.min(1, (p.life - p.age) * 3);
      PART_DRAW[p.kind](g, p);
    }
    g.globalAlpha = 1;

    const now = performance.now();
    for (const c of this.cursors.values()) {
      const p = state.players[c.id];
      if (!p || c.id === me || c.scene !== this.sceneId || now - c.seen > 8000) continue;
      poly(g, [c.x, c.y, c.x + 9, c.y + 6, c.x + 4, c.y + 7, c.x + 2, c.y + 11], p.color, { line: 1.5 });
      text(g, p.name, c.x + 6, c.y + 16, { size: 7, color: p.color, align: 'left' });
    }

    if (this.mouse && ghost) {
      g.save();
      g.translate(this.mouse.x + 4, this.mouse.y + 2);
      g.scale(0.6, 0.6);
      ghost(g);
      g.restore();
    }

    const label = this.hover && labelFor(this.hover);
    this.c.style.cursor = this.hover ? 'pointer' : 'default';
    if (label) {
      if (this.tip.textContent !== label) this.tip.textContent = label;
      this.tip.style.left = `${(this.mouse.x / W) * 100}%`;
      this.tip.style.top = `${(this.mouse.y / H) * 100}%`;
      this.tip.classList.add('on');
    } else this.tip.classList.remove('on');
  }
}
