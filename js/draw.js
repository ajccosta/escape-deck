// Chunky outlined drawing primitives for the low-res scene canvas.

export const OUT = '#231d33';
export const TAU = Math.PI * 2;

export function shape(g, build, fill, { line = 2, stroke = OUT, alpha } = {}) {
  g.beginPath();
  build(g);
  if (alpha != null) g.globalAlpha = alpha;
  if (fill) { g.fillStyle = fill; g.fill(); }
  g.globalAlpha = 1;
  if (line) { g.lineWidth = line; g.strokeStyle = stroke; g.lineJoin = 'round'; g.stroke(); }
}

export const rect = (g, x, y, w, h, fill, o) => shape(g, g => g.rect(x, y, w, h), fill, o);
export const rrect = (g, x, y, w, h, r, fill, o) => shape(g, g => g.roundRect(x, y, w, h, r), fill, o);
export const circle = (g, x, y, r, fill, o) => shape(g, g => g.arc(x, y, r, 0, TAU), fill, o);
export const ellipse = (g, x, y, rx, ry, fill, o, rot = 0) =>
  shape(g, g => g.ellipse(x, y, rx, ry, rot, 0, TAU), fill, o);

export function poly(g, pts, fill, o) {
  shape(g, g => {
    g.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
    g.closePath();
  }, fill, o);
}

export function line(g, pts, color = OUT, w = 2) {
  g.beginPath();
  g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.strokeStyle = color;
  g.lineWidth = w;
  g.lineCap = 'round';
  g.stroke();
}

export function star(g, x, y, r1, r2, n, fill, o, rot = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r2 : r1, a = rot + (i * Math.PI) / n;
    pts.push(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  poly(g, pts, fill, o);
}

// A union of circles with one shared outline (bushes, clouds, cream).
export function puffs(g, circles, fill, { line = 2, stroke = OUT } = {}) {
  if (line) circles.forEach(([x, y, r]) => circle(g, x, y, r + line, stroke, { line: 0 }));
  circles.forEach(([x, y, r]) => circle(g, x, y, r, fill, { line: 0 }));
}

export function text(g, str, x, y, { size = 8, color = '#fff', align = 'center', outline = OUT, base = 'middle' } = {}) {
  g.font = `400 ${Math.round(size * 1.35)}px "Jersey 10", monospace`;
  g.textAlign = align;
  g.textBaseline = base;
  if (outline) {
    g.lineWidth = Math.max(2, size / 3.5);
    g.strokeStyle = outline;
    g.lineJoin = 'round';
    g.strokeText(str, x, y);
  }
  g.fillStyle = color;
  g.fillText(str, x, y);
}

// Balatro-style offset silhouette under whatever fn draws.
let off = null;
export function dropShadow(g, fn, dx = 3, dy = 3, alpha = 0.3) {
  const { width: W, height: H } = g.canvas;
  if (!off || off.width !== W || off.height !== H) {
    off = document.createElement('canvas');
    off.width = W;
    off.height = H;
  }
  const o = off.getContext('2d');
  o.clearRect(0, 0, W, H);
  fn(o);
  o.globalCompositeOperation = 'source-in';
  o.fillStyle = `rgba(20,10,30,${alpha})`;
  o.fillRect(0, 0, W, H);
  o.globalCompositeOperation = 'source-over';
  g.drawImage(off, dx, dy);
  fn(g);
}
