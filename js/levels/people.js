// Character art shared by levels.

import { rect, rrect, circle, ellipse, OUT } from '../draw.js';

// A round cartoon head. Options pick the hair, extras and accessories.
export function head(g, x, y, { skin = '#f1c9a5', hair = '#3b2a20', bun = false, glasses = false, moustache = false, cap = null } = {}) {
  if (bun) circle(g, x, y - 11, 5, hair);
  circle(g, x, y, 9, skin);
  g.beginPath(); g.arc(x, y - 1, 9, Math.PI * 1.05, Math.PI * 1.95); g.closePath();
  g.fillStyle = hair; g.fill(); g.strokeStyle = OUT; g.lineWidth = 1.5; g.stroke();
  if (cap) { rrect(g, x - 9, y - 10, 18, 6, 2, cap, { line: 1.5 }); rect(g, x - 2, y - 6, 13, 3, cap, { line: 1 }); }
  for (const dx of [-3.5, 3.5]) circle(g, x + dx, y + 1, 1.2, OUT, { line: 0 });
  if (glasses) for (const dx of [-3.5, 3.5]) circle(g, x + dx, y + 1, 2.8, null, { line: 1 });
  if (moustache) ellipse(g, x, y + 5, 5, 1.8, hair, { line: 1 });
  else { g.beginPath(); g.arc(x, y + 3.5, 2.5, 0.2 * Math.PI, 0.8 * Math.PI); g.strokeStyle = OUT; g.lineWidth = 1.2; g.stroke(); }
}
