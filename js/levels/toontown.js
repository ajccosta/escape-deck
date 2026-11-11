// Level: Toontown Central — Cog Lockdown.
//
// Puzzle chain:
//   HQ portraits + Flippy's note  -> drawer (73)          -> HQ Key
//   HQ Key on HQ door             -> playground opens
//   bushes                        -> Jellybean
//   Jellybean in fountain         -> coloured spray pattern
//   spray pattern                 -> Gag Shop padlock (R Y B G)
//   Clarabelle's note + counting  -> pie case (425)        -> Cream Pie
//   Cream Pie on the Cog          -> Cog Memo
//   memo + torn HQ poster         -> trolley password (JOKE) -> escape

import { rect, rrect, circle, ellipse, poly, line, star, text, puffs, dropShadow, OUT } from '../draw.js';
import { COLORS } from '../locks.js';
import { val } from '../engine.js';

const W = 480;
const f = name => s => !!s.flags[name];
const not = name => s => !s.flags[name];

// ---------------------------------------------------------------- shared art

function toonHead(g, x, y, kind, happy, col) {
  if (kind === 'dog') {
    ellipse(g, x - 12, y + 1, 5, 10, '#8a5a3c', {}, 0.3);
    ellipse(g, x + 12, y + 1, 5, 10, '#8a5a3c', {}, -0.3);
  }
  if (kind === 'cat') {
    poly(g, [x - 12, y - 3, x - 9, y - 18, x - 2, y - 10], col);
    poly(g, [x + 12, y - 3, x + 9, y - 18, x + 2, y - 10], col);
  }
  circle(g, x, y, 12, col);
  for (const dx of [-4, 4]) {
    ellipse(g, x + dx, y - 3, 2.6, 3.6, '#fff', { line: 1 });
    circle(g, x + dx + 0.5, y - 2, 1.3, OUT, { line: 0 });
  }
  if (kind === 'duck') ellipse(g, x, y + 4, 7, 3.5, '#ffb52e', { line: 1.5 });
  else { ellipse(g, x, y + 5, 5.5, 4, '#fff3e0', { line: 1 }); circle(g, x, y + 3, 1.8, OUT, { line: 0 }); }
  g.beginPath();
  if (happy) g.arc(x, y + 6, 3.5, 0.15 * Math.PI, 0.85 * Math.PI);
  else g.arc(x, y + 11, 3.5, 1.2 * Math.PI, 1.8 * Math.PI);
  g.strokeStyle = OUT; g.lineWidth = 1.5; g.stroke();
}

function door(g, x, y, w, h, col, open, inside = '#2a2140') {
  rrect(g, x - 5, y - 5, w + 10, h + 5, [w / 2 + 5, w / 2 + 5, 0, 0], '#ffd23f');
  if (open) {
    rrect(g, x, y, w, h, [w / 2, w / 2, 0, 0], inside);
    poly(g, [x, y + w / 3, x + 10, y + w / 3 + 6, x + 10, y + h - 3, x, y + h], col);
  } else {
    rrect(g, x, y, w, h, [w / 2, w / 2, 0, 0], col);
    circle(g, x + w - 8, y + h * 0.6, 2.5, '#ffd23f', { line: 1.5 });
  }
}

function bush(g, x, y, w) {
  const r = w / 4;
  puffs(g, [[x + r, y + r * 0.6, r], [x + w / 2, y, r * 1.25], [x + w - r, y + r * 0.6, r], [x + w / 2, y + r * 0.8, r]], '#3fa34d');
  puffs(g, [[x + w / 2 - 3, y - r * 0.3, r * 0.5], [x + r - 2, y + r * 0.3, r * 0.4]], '#5cc35a', { line: 0 });
}

const GAGS = {
  seltzer(g, x, y) {
    rrect(g, x - 5, y - 20, 10, 20, 2, '#6fd0ff');
    rect(g, x - 4, y - 26, 8, 6, '#cfd6e0');
    rect(g, x + 4, y - 25, 5, 2.5, '#cfd6e0', { line: 1 });
  },
  banana(g, x, y) {
    poly(g, [x - 9, y, x - 6, y - 6, x - 2, y - 3, x, y - 10, x + 3, y - 3, x + 7, y - 7, x + 9, y], '#ffe14a');
    ellipse(g, x, y - 1, 3, 2, '#8a6a20', { line: 0 });
  },
  anvil(g, x, y) {
    poly(g, [x - 13, y - 18, x + 9, y - 18, x + 14, y - 14, x + 7, y - 12, x + 4, y - 7, x + 8, y, x - 8, y, x - 4, y - 7, x - 7, y - 12, x - 13, y - 13], '#4b5160');
    line(g, [x - 10, y - 16, x + 6, y - 16], '#7d8597', 1);
  },
  pot(g, x, y) {
    line(g, [x, y - 12, x, y - 20], '#2f8f3e', 2);
    circle(g, x, y - 22, 4, '#fe5f55', { line: 1.5 });
    circle(g, x, y - 22, 1.5, '#ffd23f', { line: 0 });
    poly(g, [x - 7, y - 12, x + 7, y - 12, x + 5, y, x - 5, y], '#d2693c');
  },
  whoopee(g, x, y) {
    ellipse(g, x, y - 5, 10, 5, '#ff7fbf');
    rect(g, x + 8, y - 6, 5, 3, '#ff7fbf', { line: 1 });
  },
};
const GAG_NAMES = { seltzer: 'a seltzer bottle', banana: 'a banana peel', anvil: 'an anvil', pot: 'a flower pot', whoopee: 'a whoopee cushion' };

function pieArt(g, x, y, s = 1) {
  ellipse(g, x, y + 4 * s, 13 * s, 5 * s, '#c9c9d6');
  ellipse(g, x, y + 1 * s, 12 * s, 5 * s, '#e7b36a');
  puffs(g, [[x - 6 * s, y - 2 * s, 4 * s], [x, y - 4 * s, 5 * s], [x + 6 * s, y - 2 * s, 4 * s]], '#fffaf0', { line: 1.5 });
  circle(g, x, y - 9 * s, 2.5 * s, '#fe5f55', { line: 1 });
}

// ---------------------------------------------------------------- fountain

const SPRAY = ['red', 'yellow', 'blue', 'green'];
const STEP = 0.9, REST = 1.8;
function sprayColor(t) {
  const i = Math.floor((t % (SPRAY.length * STEP + REST)) / STEP);
  return i < SPRAY.length ? COLORS[SPRAY[i]] : null;
}

// ---------------------------------------------------------------- HQ

const PORTRAITS = [
  { id: 'portrait1', x: 30, kind: 'dog', name: 'Dash', col: '#f2a65a', bg: '#ffe6a8', happy: true, laff: 42, mood: 'grinning from ear to floppy ear' },
  { id: 'portrait2', x: 98, kind: 'cat', name: 'Penny', col: '#b88cf0', bg: '#c8f0ff', happy: false, laff: 19, mood: 'frowning glumly' },
  { id: 'portrait3', x: 166, kind: 'duck', name: 'Quackers', col: '#fff1a8', bg: '#ffd0e0', happy: true, laff: 31, mood: 'beaming' },
];

function drawPortrait(g, p) {
  const y = 30;
  dropShadow(g, g => rrect(g, p.x, y, 58, 72, 4, '#ffd23f'));
  rect(g, p.x + 5, y + 5, 48, 46, p.bg, { line: 1.5 });
  toonHead(g, p.x + 29, y + 30, p.kind, p.happy, p.col);
  rect(g, p.x + 8, y + 55, 42, 12, '#fff6d8', { line: 1.5 });
  text(g, `LAFF ${p.laff}`, p.x + 29, y + 61.5, { size: 8, color: OUT, outline: null });
}

function drawHQ(g, s, t) {
  rect(g, 0, 0, W, 152, '#4c9fe0', { line: 0 });
  for (let y = 14, row = 0; y < 150; y += 26, row++)
    for (let x = (row % 2) * 24 + 10; x < W; x += 48) star(g, x, y, 5, 2.2, 5, '#69b3ec', { line: 0 });
  rect(g, 0, 152, W, 40, '#2b67b3', { line: 0 });
  for (let x = 0; x < W; x += 30) rect(g, x + 4, 160, 22, 26, '#3274c4', { line: 1, stroke: '#21508c' });
  rect(g, -2, 148, W + 4, 6, '#ffd23f');
  rect(g, 0, 192, W, 80, '#c98a4b', { line: 0 });
  line(g, [0, 192, W, 192]);
  for (let y = 206, r = 0; y < 270; y += 14, r++) {
    line(g, [0, y, W, y], '#a46d37', 1);
    for (let x = (r % 3) * 37; x < W; x += 110) line(g, [x, y - 14, x, y], '#a46d37', 1);
  }
  ellipse(g, 300, 238, 80, 18, '#e2504a');
  ellipse(g, 300, 238, 64, 12, '#ffd23f', { line: 0 });
  ellipse(g, 300, 238, 50, 8, '#e2504a', { line: 0 });
  text(g, 'TOON HQ', 300, 238, { size: 8, color: '#fff' });
  // desk
  dropShadow(g, g => {
    rect(g, 30, 146, 170, 50, '#a8693a');
    rrect(g, 22, 138, 186, 10, 3, '#8f5a2e');
  });
  rect(g, 38, 156, 50, 32, '#93592e', { line: 1.5 });
  rect(g, 58, 170, 10, 4, '#ffd23f', { line: 1 });
  // lamp
  line(g, [184, 136, 184, 112, 172, 104]);
  ellipse(g, 184, 136, 9, 3, '#2f3b6b');
  poly(g, [162, 96, 180, 100, 176, 112, 160, 106], '#ffd23f');
  // fishbowl table
  rect(g, 288, 156, 4, 38, '#7a4a24');
  rect(g, 324, 156, 4, 38, '#7a4a24');
  rrect(g, 280, 150, 56, 7, 2, '#8f5a2e');
}

const HQ_HOTSPOTS = [
  ...PORTRAITS.map(p => ({
    id: p.id, name: `Portrait of ${p.name}`, rect: [p.x, 30, 58, 72],
    draw: g => drawPortrait(g, p),
    inspect: `${p.name} the ${p.kind}, ${p.mood}. The little plaque reads: LAFF ${p.laff}.`,
  })),
  {
    id: 'bulletin', name: 'Bulletin Board', rect: [250, 28, 100, 80],
    draw(g) {
      dropShadow(g, g => rrect(g, 250, 28, 100, 80, 4, '#9a5f31'));
      rect(g, 256, 34, 88, 68, '#d9a066', { line: 1.5 });
      rect(g, 262, 40, 32, 26, '#fff6d8', { line: 1.5 });
      text(g, 'TOON', 278, 48, { size: 7, color: '#e2504a', outline: null });
      text(g, 'TASKS', 278, 58, { size: 7, color: '#e2504a', outline: null });
      poly(g, [300, 40, 338, 40, 334, 50, 340, 60, 333, 70, 338, 82, 300, 82], '#fff', { line: 1.5 });
      ['COGS', "CAN'T", 'TAKE A', 'JO'].forEach((w, i) => text(g, w, 304, 47 + i * 9, { size: 7, color: OUT, outline: null, align: 'left' }));
      rect(g, 264, 72, 28, 24, '#9fe0ff', { line: 1.5 });
      for (let i = 0; i < 3; i++) line(g, [268, 79 + i * 6, 288, 79 + i * 6], '#5a7a9a', 1);
      [[278, 41], [319, 41], [278, 73]].forEach(([x, y]) => circle(g, x, y, 2, '#fe5f55', { line: 1 }));
    },
    inspect: 'Notices pinned to the cork. "TOON TASK: Help Flippy find his spare key!" Next to it, a torn old poster: "REMEMBER, TOONS: COGS CAN\'T TAKE A JO—" The rest has been ripped off.',
  },
  {
    id: 'fishbowl', name: 'Fishbowl', rect: [290, 112, 36, 38],
    draw(g, s, t) {
      circle(g, 308, 132, 17, 'rgba(160,230,255,0.85)');
      ellipse(g, 308, 116, 9, 3, '#e8f8ff', { line: 1.5 });
      rect(g, 296, 141, 24, 4, '#f5dc9e', { line: 0 });
      const fx = 308 + Math.sin(t * 1.3) * 8, dir = Math.cos(t * 1.3) > 0 ? 1 : -1;
      poly(g, [fx - dir * 5, 133, fx - dir * 10, 129, fx - dir * 10, 137], '#ff9a00', { line: 1 });
      ellipse(g, fx, 133, 6, 4, '#ff9a00', { line: 1 });
      circle(g, fx + dir * 3, 132, 1, OUT, { line: 0 });
    },
    inspect: 'Bubbles the goldfish. He blows a bubble shaped a bit like a question mark. Not helpful, Bubbles.',
  },
  {
    id: 'note', name: "Flippy's Note", rect: [52, 126, 34, 14],
    draw(g) {
      poly(g, [56, 140, 61, 129, 84, 129, 80, 140], '#fff27a', { line: 1.5 });
      line(g, [63, 133, 79, 133], '#8a7a40', 1);
      line(g, [62, 136, 76, 136], '#8a7a40', 1);
    },
    inspect: { easy: 'A note in Flippy\'s handwriting: "Spare HQ key is in the desk drawer. The combo is the total LAFF of every SMILING toon on the wall. Don\'t tell the Cogs! — F"',
      hard: 'A note in Flippy\'s handwriting: "Drawer: add up the smiles. — F"' },
  },
  {
    id: 'drawer', name: 'Desk Drawer', rect: [100, 154, 66, 32],
    draw(g, s) {
      if (s.flags.drawerOpen) {
        rect(g, 100, 156, 64, 8, '#3b2414', { line: 1.5 });
        rect(g, 96, 164, 72, 22, '#b8773f');
        rect(g, 124, 172, 16, 5, '#ffd23f', { line: 1 });
      } else {
        rect(g, 100, 158, 64, 26, '#b8773f');
        rect(g, 124, 166, 16, 5, '#ffd23f', { line: 1 });
        circle(g, 154, 171, 5, '#d5dbe8', { line: 1.5 });
        line(g, [154, 171, 154, 167], OUT, 1);
      }
    },
    inspect: s => (s.flags.drawerOpen ? 'The drawer is open. Empty, apart from a stale gumdrop.' : ''),
    lock: {
      type: 'digits', length: 2, answer: '73',
      prompt: 'A locked desk drawer with a two-digit combination dial.',
      onSolve: { set: 'drawerOpen', give: 'hqkey', say: 'Click! Inside the drawer: a star-shaped key!', fx: 'sparkle' },
    },
  },
  {
    id: 'hqdoor', name: s => (s.flags.hqDoorOpen ? 'To the Playground' : 'HQ Door'), rect: [384, 58, 76, 134],
    draw(g, s) {
      dropShadow(g, g => door(g, 392, 64, 60, 128, '#e2504a', s.flags.hqDoorOpen, '#bff0ff'));
      if (s.flags.hqDoorOpen) rect(g, 392, 170, 60, 22, '#62c94f', { line: 0 });
      else {
        star(g, 422, 100, 13, 6, 5, '#bff0ff', { line: 1.5 });
        star(g, 434, 145, 3, 1.5, 5, OUT, { line: 0 });
      }
      text(g, 'EXIT', 422, 48, { size: 9, color: '#ffd23f' });
    },
    inspect: 'Locked tight. The keyhole is shaped like a little star.',
    uses: { hqkey: { when: not('hqDoorOpen'), take: 'hqkey', set: 'hqDoorOpen', say: 'The star key turns with a squeaky *honk*. The door to the playground swings open!', fx: 'sparkle' } },
    go: { to: 'playground', when: f('hqDoorOpen') },
  },
];

// ---------------------------------------------------------------- playground

function drawPlayground(g, s, t) {
  const sky = g.createLinearGradient(0, 0, 0, 170);
  sky.addColorStop(0, '#6fcaff');
  sky.addColorStop(1, '#d4f3ff');
  g.fillStyle = sky;
  g.fillRect(0, 0, W, 170);
  circle(g, 430, 34, 18, '#ffd23f');
  for (let i = 0; i < 4; i++) {
    const x = ((i * 150 + t * 5) % 620) - 70, y = 22 + (i % 2) * 22;
    puffs(g, [[x, y, 9], [x + 12, y - 5, 12], [x + 25, y, 9]], '#fff');
  }
  puffs(g, [[60, 190, 90], [250, 200, 100], [440, 190, 90]], '#86dc6e');
  rect(g, 0, 168, W, 102, '#62c94f', { line: 0 });
  line(g, [0, 168, W, 168]);
  ellipse(g, 250, 238, 210, 32, '#f5dc9e', { line: 2 });
  // Toon HQ building
  dropShadow(g, g => {
    rrect(g, 6, 74, 112, 118, 8, '#3e86e6');
    star(g, 62, 58, 28, 12, 5, '#ffd23f');
  });
  rect(g, 6, 82, 112, 16, '#ffd23f');
  text(g, 'TOON HQ', 62, 90, { size: 10, color: '#e2504a', outline: '#fff' });
  [[16, 108], [88, 108]].forEach(([x, y]) => rrect(g, x, y, 20, 22, 3, '#bff0ff', { line: 1.5 }));
  // Gag shop building
  dropShadow(g, g => {
    poly(g, [354, 94, 417, 52, 480, 94], '#fe5f55');
    rrect(g, 362, 92, 112, 100, 6, '#a46cf0');
  });
  rrect(g, 370, 100, 96, 20, 4, '#ffd23f');
  text(g, 'GAG SHOP', 418, 110, { size: 10, color: '#a46cf0', outline: '#fff' });
  rrect(g, 444, 130, 22, 22, 3, '#bff0ff', { line: 1.5 });
  pieArt(g, 455, 143, 0.6);
  // trolley tracks
  rect(g, 104, 208, 120, 5, '#8b5a2b', { line: 1.5 });
  for (let x = 108; x < 222; x += 12) rect(g, x, 205, 4, 11, '#6b4220', { line: 1 });
}

const PG_HOTSPOTS = [
  {
    id: 'hqentrance', name: 'Toon HQ', rect: [40, 134, 44, 58],
    draw: g => door(g, 44, 140, 36, 52, '#e2504a', false),
    go: { to: 'hq' },
  },
  {
    id: 'trolley', name: 'Trolley', rect: [108, 136, 108, 72],
    draw(g) {
      const x = 112, y = 148;
      dropShadow(g, g => {
        rrect(g, x + 6, y - 10, 92, 12, 4, '#ffd23f');
        rrect(g, x, y, 104, 50, 6, '#fe5f55');
      });
      for (let i = 0; i < 4; i++) rrect(g, x + 8 + i * 24, y + 8, 18, 16, 3, '#bff0ff', { line: 1.5 });
      rect(g, x, y + 30, 104, 6, '#ffd23f', { line: 1.5 });
      circle(g, x + 22, y + 54, 7, '#555a66');
      circle(g, x + 82, y + 54, 7, '#555a66');
      text(g, 'TROLLEY', x + 52, y - 4, { size: 8, color: '#fe5f55', outline: '#fff' });
    },
    inspect: s => (s.flags.cogGone ? '' : 'The Toontown Trolley! A Cog stands in front of it with its arms crossed.'),
    lock: {
      type: 'letters', length: 4, answer: 'JOKE', when: f('cogGone'),
      prompt: "The trolley's control panel blinks: ENTER OVERRIDE PASSWORD. There are four letter slots.",
      onSolve: { win: true, say: 'DING DING! The trolley lurches forward and whisks you out of Toontown Central. You escaped!', fx: 'confetti', sfx: 'win' },
    },
  },
  {
    id: 'cog', name: 'Cog', rect: [148, 134, 40, 80], visible: not('cogGone'),
    draw(g, s, t) {
      const x = 168, y = 150 + Math.round(Math.sin(t * 3));
      dropShadow(g, g => {
        rect(g, x - 9, y + 42, 7, 18, '#3a3f4d');
        rect(g, x + 2, y + 42, 7, 18, '#3a3f4d');
        rect(g, x - 20, y + 14, 7, 24, '#5d6a85');
        rect(g, x + 13, y + 14, 7, 24, '#5d6a85');
        poly(g, [x - 15, y + 12, x + 15, y + 12, x + 12, y + 45, x - 12, y + 45], '#5d6a85');
        circle(g, x, y, 12, '#9aa3ad');
      });
      circle(g, x - 16, y + 40, 4, '#9aa3ad', { line: 1.5 });
      circle(g, x + 16, y + 40, 4, '#9aa3ad', { line: 1.5 });
      poly(g, [x - 5, y + 12, x + 5, y + 12, x, y + 24], '#fff', { line: 1 });
      poly(g, [x - 2, y + 14, x + 2, y + 14, x + 1.5, y + 26, x, y + 28, x - 1.5, y + 26], '#fe5f55', { line: 1 });
      rect(g, x - 9, y - 4, 7, 5, '#cfefff', { line: 1.5 });
      rect(g, x + 2, y - 4, 7, 5, '#cfefff', { line: 1.5 });
      line(g, [x - 9, y - 7, x - 3, y - 5]);
      line(g, [x + 9, y - 7, x + 3, y - 5]);
      line(g, [x - 4, y + 6, x + 4, y + 6]);
    },
    inspect: s => 'A Cog. A Flunky, judging by the tiny suit. "Nobody rides the trolley. Company policy." It won\'t budge.' + val({ easy: ' Cogs really can\'t stand a bit of slapstick...', hard: '' }, s),
    uses: { pie: { take: 'pie', give: 'memo', set: 'cogGone', say: 'SPLAT! The Cog sputters, sparks... and explodes into a shower of gears! It dropped a memo.', fx: 'explode', sfx: 'boom' } },
  },
  {
    id: 'fountain', name: 'Fountain', rect: [196, 120, 92, 98],
    draw(g, s, t) {
      const cx = 242, on = s.flags.fountainOn, col = on && sprayColor(t);
      dropShadow(g, g => ellipse(g, cx, 206, 44, 12, '#b9c3d6'));
      ellipse(g, cx, 203, 36, 8, on ? col || '#7fd3ff' : '#8a93a8', { line: 1.5 });
      rect(g, cx - 5, 172, 10, 32, '#d5dbe8');
      ellipse(g, cx, 172, 17, 5, '#d5dbe8');
      if (!on) { rect(g, cx - 8, 208, 16, 7, '#ffd23f', { line: 1 }); return; }
      const c = col || '#9fe3ff', height = col ? 1 : 0.35;
      rect(g, cx - 3, 170 - 34 * height, 6, 34 * height, c, { line: 1.5 });
      for (const side of [-1, 1])
        for (let j = 0; j < 6; j++) {
          const p = (t * 1.1 + j / 6) % 1;
          circle(g, cx + side * p * 30 * height, 170 - 34 * height + (-30 * p + 64 * p * p) * height + (1 - height) * 20, 2.5, c, { line: 1 });
        }
    },
    inspect: s => (s.flags.fountainOn
      ? val({ easy: 'The fountain sprays water that keeps changing colour, over and over, with a little rest in between. Watch it closely.', hard: 'The fountain sprays coloured water.' }, s)
      : 'The fountain is bone dry. A brass plaque reads: "TOSS IN A JELLYBEAN, MAKE A WISH."'),
    uses: { jellybean: { when: not('fountainOn'), take: 'jellybean', set: 'fountainOn', say: 'Plink! The jellybean sinks... and the fountain gurgles to life, spraying coloured water!', fx: 'splash', sfx: 'splash' } },
  },
  {
    id: 'signpost', name: 'Signpost', rect: [300, 122, 34, 52],
    draw(g) {
      rect(g, 314, 128, 5, 46, '#8b5a2b');
      poly(g, [298, 130, 330, 130, 336, 136, 330, 142, 298, 142], '#ffd23f', { line: 1.5 });
      poly(g, [336, 146, 304, 146, 298, 152, 304, 158, 336, 158], '#4bc292', { line: 1.5 });
    },
    inspect: 'One arrow says PUNCHLINE PLACE, the other says SILLY STREET. They both point at the ground.',
  },
  {
    id: 'bushA', name: 'Bush', rect: [4, 196, 56, 34],
    draw: g => bush(g, 6, 206, 52),
    inspect: 'Just a bush. Very green. Very bushy.',
  },
  {
    id: 'bushB', name: 'Bush', rect: [290, 168, 58, 30],
    draw: g => bush(g, 292, 178, 52),
    inspect: 'Leaves, twigs, and a very startled ladybug.',
  },
  {
    id: 'bushC', name: 'Bush', rect: [306, 210, 64, 40],
    draw(g, s, t) {
      bush(g, 308, 222, 60);
      if (!s.flags.beanFound && t % 2.2 < 0.35) star(g, 346, 226, 3, 1.2, 4, '#ff6fae', { line: 1 });
    },
    inspect: s => (s.flags.beanFound ? 'The bush where you found the jellybean.' : 'Just a bush.'),
    click: { when: not('beanFound'), set: 'beanFound', give: 'jellybean', say: 'You rummage in the bush... something squishy! A JELLYBEAN!', fx: 'sparkle' },
  },
  {
    id: 'gagdoor', name: s => (s.flags.gagOpen ? 'Gag Shop' : 'Gag Shop Door'), rect: [394, 134, 44, 58],
    draw(g, s) {
      door(g, 398, 140, 36, 52, '#fe5f55', s.flags.gagOpen);
      if (s.flags.gagOpen) return;
      g.beginPath(); g.arc(416, 160, 6, Math.PI, 0); g.strokeStyle = '#9aa3ad'; g.lineWidth = 3; g.stroke();
      rrect(g, 406, 160, 20, 14, 2, '#5d6a85', { line: 1.5 });
      for (let i = 0; i < 4; i++) circle(g, 410 + i * 4, 167, 1.4, '#cfd6e0', { line: 0 });
    },
    lock: {
      type: 'colors', length: 4, answer: SPRAY,
      prompt: 'A Cog padlock clamps the Gag Shop shut. It has four coloured-button slots.',
      onSolve: { set: 'gagOpen', say: 'The Cog padlock pops off with a sad little *bzzt*. The Gag Shop is open!', fx: 'sparkle' },
    },
    go: { to: 'gagshop', when: f('gagOpen') },
  },
];

// ---------------------------------------------------------------- gag shop

const SHELVES = [
  { id: 'shelfTop', label: 'Top shelf', y: 88, items: ['seltzer', 'pot', 'seltzer', 'whoopee', 'anvil'] },
  { id: 'shelfMid', label: 'Middle shelf', y: 134, items: ['anvil', 'seltzer', 'banana', 'pot', 'anvil'] },
  { id: 'shelfBot', label: 'Bottom shelf', y: 180, items: ['whoopee', 'anvil', 'seltzer', 'pot'] },
];

function drawGagShop(g) {
  rect(g, 0, 0, W, 200, '#9b62e2', { line: 0 });
  for (let x = 0; x < W; x += 24) rect(g, x, 0, 12, 200, '#8a4fd1', { line: 0 });
  rect(g, -2, -2, W + 4, 10, '#ffd23f');
  for (let y = 200, r = 0; y < 270; y += 14, r++)
    for (let x = 0, c = r; x < W; x += 24, c++) rect(g, x, y, 24, 14, c % 2 ? '#ffd23f' : '#ff9a00', { line: 0 });
  line(g, [0, 200, W, 200]);
  dropShadow(g, g => rrect(g, 16, 36, 208, 168, 4, '#a8673a'));
  rect(g, 24, 44, 192, 152, '#6e3f1f', { line: 1.5 });
  for (const sh of SHELVES) rect(g, 20, sh.y, 200, 7, '#c27a45', { line: 1.5 });
  dropShadow(g, g => {
    rrect(g, 302, 148, 170, 54, 4, '#c27a45');
    rrect(g, 296, 140, 182, 9, 3, '#e2a46a');
  });
  for (let x = 314; x < 466; x += 30) rect(g, x, 158, 18, 36, '#b06a38', { line: 1 });
  rrect(g, 370, 18, 100, 24, 6, '#fe5f55');
  text(g, 'GAGS & GIGGLES', 420, 30, { size: 8, color: '#fff' });
}

const GS_HOTSPOTS = [
  ...SHELVES.map(sh => ({
    id: sh.id, name: sh.label, rect: [24, sh.y - 44, 192, 46],
    draw(g) {
      const gap = 192 / (sh.items.length + 1);
      sh.items.forEach((k, i) => GAGS[k](g, 24 + gap * (i + 1), sh.y));
    },
    inspect: `${sh.label}: ${sh.items.map(k => GAG_NAMES[k]).join(', ')}.`,
  })),
  {
    id: 'exit', name: 'To the Playground', rect: [234, 92, 56, 108],
    draw(g) {
      door(g, 238, 100, 48, 100, '#4bc292', false);
      text(g, 'EXIT', 262, 84, { size: 9, color: '#ffd23f' });
    },
    go: { to: 'playground' },
  },
  {
    id: 'ceilinganvil', name: 'Something hanging', rect: [314, 4, 34, 48],
    draw(g, s, t) {
      const sway = Math.sin(t * 1.4) * 2;
      line(g, [331, 6, 331 + sway, 32], '#c9a26b', 2);
      GAGS.anvil(g, 331 + sway, 48);
    },
    inspect: 'An anvil dangling from the ceiling on a fraying rope. Best not to stand under it.',
  },
  {
    id: 'floorbanana', name: 'Something on the floor', rect: [166, 222, 32, 22],
    draw: g => GAGS.banana(g, 182, 238),
    inspect: 'A banana peel, right in the walkway. Classic.',
  },
  {
    id: 'clarnote', name: "Clarabelle's Note", rect: [304, 128, 34, 16],
    draw(g) {
      poly(g, [306, 142, 310, 131, 334, 131, 331, 142], '#fff6d8', { line: 1.5 });
      line(g, [312, 135, 329, 135], '#a46cf0', 1);
      line(g, [311, 138, 325, 138], '#a46cf0', 1);
    },
    inspect: { easy: 'A note on the counter: "Gone to lunch! The pie case combination is how many SELTZER BOTTLES, then BANANA PEELS, then ANVILS are in this shop. Count EVERYTHING! — Clarabelle"',
      hard: 'A note on the counter: "Gone to lunch! Seltzer, banana, anvil. — Clarabelle"' },
  },
  {
    id: 'piecase', name: 'Pie Case', rect: [346, 96, 64, 46],
    draw(g, s) {
      rect(g, 348, 134, 60, 7, '#e2a46a', { line: 1.5 });
      if (!s.flags.pieTaken) pieArt(g, 378, 124);
      shape(g);
      if (!s.flags.pieTaken) rrect(g, 372, 135, 12, 5, 1, '#5d6a85', { line: 1 });
      function shape(g) {
        g.beginPath(); g.arc(378, 134, 28, Math.PI, 0); g.closePath();
        g.fillStyle = 'rgba(200,240,255,0.3)'; g.fill();
        g.strokeStyle = OUT; g.lineWidth = 1.5; g.stroke();
        line(g, [362, 118, 368, 112], '#fff', 1.5);
      }
    },
    inspect: s => (s.flags.pieTaken ? 'An empty pie case. A few crumbs of crust remain.' : ''),
    lock: {
      type: 'digits', length: 3, answer: '425',
      prompt: 'A glass pie case with a three-digit lock. One perfect cream pie sits inside, taunting you.',
      onSolve: { set: 'pieTaken', give: 'pie', say: 'The case pops open. You grab the cream pie. It smells like victory.' },
    },
  },
  {
    id: 'register', name: 'Cash Register', rect: [418, 104, 48, 38],
    draw(g) {
      dropShadow(g, g => {
        poly(g, [420, 140, 424, 116, 462, 116, 464, 140], '#4bc292');
        rect(g, 428, 104, 26, 12, '#2f7f5f');
      });
      text(g, '0', 441, 110, { size: 7, color: '#ffd23f', outline: null });
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) rect(g, 428 + i * 10, 122 + j * 7, 7, 4, '#fff', { line: 1 });
    },
    inspect: 'The cash register. Its display reads 0 jellybeans. Clarabelle runs a tight ship.',
  },
];

// ---------------------------------------------------------------- level

export default {
  id: 'toontown',
  title: 'Toontown Central',
  subtitle: 'Cog Lockdown',
  blurb: 'The Cogs have locked down Toontown Central! Find a way onto the trolley before the whole town turns gray.',
  palette: ['#1f7fd0', '#ffbf2f', '#e2504a'],
  start: 'hq',
  intro: "The Cogs have put Toontown Central on lockdown, and you're stuck inside Toon HQ! Find a way onto the trolley before the whole town turns gray.",

  items: {
    hqkey: {
      name: 'HQ Key', desc: "A star-shaped key. Flippy's spare.",
      draw(g) {
        rect(g, 15, 14, 14, 5, '#ffd23f', { line: 1.5 });
        rect(g, 24, 18, 3, 5, '#ffd23f', { line: 1.5 });
        star(g, 11, 16, 9, 4, 5, '#ffd23f', { line: 1.5 });
      },
    },
    jellybean: {
      name: 'Jellybean', desc: "A shiny pink jellybean. Toontown's finest currency.",
      draw(g) {
        ellipse(g, 16, 17, 11, 7, '#ff6fae', { line: 1.5 }, -0.4);
        ellipse(g, 12, 14, 3, 1.5, '#ffd0e6', { line: 0 }, -0.4);
      },
    },
    pie: {
      name: 'Cream Pie', desc: 'Whipped to perfection. Cogs absolutely hate these.',
      draw: g => pieArt(g, 16, 18),
    },
    memo: {
      name: 'Cog Memo',
      desc: 'INTERNAL MEMO, Re: trolley lockdown. "The override password is the four-letter thing we Cogs famously can\'t take. The Toons keep telling us them. We still don\'t get it. — Management"',
      draw(g) {
        rect(g, 7, 4, 18, 24, '#fff', { line: 1.5 });
        for (let i = 0; i < 4; i++) line(g, [10, 9 + i * 4, 22, 9 + i * 4], '#9aa3ad', 1);
        circle(g, 21, 24, 5, '#fe5f55', { line: 1.5 });
        circle(g, 21, 24, 1.5, '#fff', { line: 0 });
      },
    },
  },

  scenes: {
    hq: { name: 'Toon HQ', draw: drawHQ, hotspots: HQ_HOTSPOTS },
    playground: { name: 'Playground', draw: drawPlayground, hotspots: PG_HOTSPOTS, open: f('hqDoorOpen') },
    gagshop: { name: 'Gag Shop', draw: drawGagShop, hotspots: GS_HOTSPOTS, open: f('gagOpen') },
  },

  hints: [
    { done: f('drawerOpen'), text: ['Flippy left a note on the desk. Read it, then look at the wall.', 'Add up the LAFF of the smiling toons only: 42 + 31.'] },
    { done: f('hqDoorOpen'), text: ['Keys go in doors.', 'Click the HQ Key card to hold it, then click the door.'] },
    { done: f('beanFound'), text: ['The fountain outside wants a jellybean. Toontown bushes hide all sorts of things.', 'Rummage through the bush at the front right.'] },
    { done: f('fountainOn'), text: ['Make a wish!', 'Hold the Jellybean and click the fountain.'] },
    { done: f('gagOpen'), text: ['The fountain spray changes colour in a repeating pattern.', 'Red, Yellow, Blue, Green.'] },
    { done: f('pieTaken'), text: ["Clarabelle's note says to count EVERYTHING. Not every gag is on the shelves.", '4 seltzers, 2 banana peels (one on the floor), 5 anvils (one hanging from the ceiling): 425.'] },
    { done: f('cogGone'), text: ["Cogs can't take a joke... or a pie.", 'Hold the Cream Pie and click the Cog.'] },
    { done: s => !!s.wonAt, text: ["Read the Cog's memo. Then remember the torn poster in Toon HQ.", 'The password is JOKE.'] },
  ],
};
