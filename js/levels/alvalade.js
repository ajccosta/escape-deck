// Level: Alvalade — O Último Metro.
//
// Puzzle chain:
//   Dona Graça's note + azulejo with no twin -> cookie tin (13)   -> Door Key
//   Door Key on the pastelaria door          -> the arraial opens
//   bread basket -> Papo-seco -> Sr. Manel's grill               -> Sardinha no Pão
//   sardine to the cat on the bench          -> Navegante card (empty)
//   display case -> Pastel de Nata -> Dona Lurdes at her window  -> she shows her purse
//   four manjerico verses, shouted words     -> purse lock (FADO) -> €2 coin
//   card, then coin, in the ticket machine   -> Charged Navegante
//   charged card on the ticket gates         -> escape on the last metro

import { rect, rrect, circle, ellipse, poly, line, star, text, puffs, dropShadow, OUT } from '../draw.js';
import { COLORS } from '../locks.js';

const W = 480;
const f = name => s => !!s.flags[name];
const not = name => s => !s.flags[name];

const AZUL = '#2456a6';
const TILE_BG = '#f7f4ec';

// ---------------------------------------------------------------- shared art

function head(g, x, y, { skin = '#f1c9a5', hair = '#3b2a20', bun = false, glasses = false, moustache = false, cap = null } = {}) {
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

function nataArt(g, x, y, s = 1) {
  poly(g, [x - 9 * s, y - 2 * s, x + 9 * s, y - 2 * s, x + 7 * s, y + 5 * s, x - 7 * s, y + 5 * s], '#d58b3a', { line: 1.5 });
  ellipse(g, x, y - 2 * s, 9 * s, 3.5 * s, '#ffd45e', { line: 1.5 });
  circle(g, x - 3 * s, y - 2.5 * s, 1.6 * s, '#8a4b1c', { line: 0 });
  circle(g, x + 2.5 * s, y - 1.5 * s, 1.2 * s, '#8a4b1c', { line: 0 });
}

function breadArt(g, x, y, s = 1) {
  ellipse(g, x, y, 11 * s, 6 * s, '#e0a352', { line: 1.5 });
  line(g, [x - 1 * s, y - 5 * s, x + 1 * s, y + 5 * s], '#a8692a', 1.5 * s);
  ellipse(g, x - 5 * s, y - 2 * s, 3 * s, 1.5 * s, '#f2c98a', { line: 0 });
}

function sardine(g, x, y, s = 1, flip = false) {
  const d = flip ? -1 : 1;
  ellipse(g, x, y, 9 * s, 2.6 * s, '#aab6c4', { line: 1.2 });
  poly(g, [x - d * 8 * s, y, x - d * 13 * s, y - 3 * s, x - d * 13 * s, y + 3 * s], '#aab6c4', { line: 1 });
  line(g, [x - d * 3 * s, y - 1.5 * s, x + d * 4 * s, y - 1.5 * s], '#5f6f80', 1);
  circle(g, x + d * 6 * s, y - 0.5 * s, 0.9 * s, OUT, { line: 0 });
}

function cardArt(g, x, y, charged) {
  rrect(g, x, y, 24, 16, 3, '#2a7fc9', { line: 1.5 });
  rect(g, x + 2, y + 3, 20, 3, '#5ec3f2', { line: 0 });
  circle(g, x + 18, y + 11, 3, charged ? '#4bc292' : '#c9d3dc', { line: 1 });
}

// ---------------------------------------------------------------- pastelaria

const TILE_ART = {
  star: (g, x, y) => star(g, x, y, 10, 4.5, 8, AZUL, { line: 1 }),
  flower(g, x, y) {
    for (let i = 0; i < 4; i++) ellipse(g, x + Math.cos(i * Math.PI / 2) * 5, y + Math.sin(i * Math.PI / 2) * 5, 5, 3, AZUL, { line: 1 }, i * Math.PI / 2);
    circle(g, x, y, 2.5, '#f2b632', { line: 1 });
  },
  diamond(g, x, y) {
    poly(g, [x, y - 10, x + 10, y, x, y + 10, x - 10, y], AZUL, { line: 1 });
    poly(g, [x, y - 5, x + 5, y, x, y + 5, x - 5, y], TILE_BG, { line: 1 });
  },
  wave(g, x, y) {
    for (let k = -1; k <= 1; k++) {
      const pts = [];
      for (let i = 0; i <= 8; i++) pts.push(x - 10 + i * 2.5, y + k * 6 + Math.sin(i * 1.2) * 2);
      line(g, pts, AZUL, 2);
    }
  },
  curl(g, x, y) {
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2, ex = x + Math.cos(a) * 7, ey = y + Math.sin(a) * 7;
      line(g, [x, y, ex, ey], AZUL, 2.5);
      g.beginPath(); g.arc(ex + Math.cos(a + Math.PI / 2) * 2.5, ey + Math.sin(a + Math.PI / 2) * 2.5, 2.5, a - Math.PI / 2, a + Math.PI);
      g.strokeStyle = AZUL; g.lineWidth = 1.8; g.stroke();
    }
    circle(g, x, y, 2, AZUL, { line: 0 });
  },
};
const TILE_DESC = {
  star: 'an eight-pointed star', flower: 'a four-petal flower with a yellow heart', diamond: 'a diamond inside a diamond',
  wave: 'three wavy lines, like the river', curl: 'a cross whose arms curl at the tips',
};
// Every pattern has a twin except one. Its number opens the cookie tin.
const TILES = [
  ['star', 21], ['flower', 7], ['diamond', 34],
  ['wave', 18], ['star', 45], ['flower', 9],
  ['curl', 13], ['diamond', 26], ['wave', 30],
].map(([k, n], i) => ({ id: 'tile' + i, k, n, x: 94 + (i % 3) * 28, y: 24 + Math.floor(i / 3) * 28 }));

function drawPastelaria(g, s, t) {
  rect(g, 0, 0, W, 120, '#f3e6c8', { line: 0 });
  rect(g, 0, 0, W, 6, '#d9c39a', { line: 0 });
  // azulejo wainscot
  rect(g, 0, 120, W, 72, TILE_BG, { line: 0 });
  for (let x = 0; x < W; x += 16)
    for (let y = 124; y < 192; y += 16) {
      poly(g, [x + 8, y + 2, x + 14, y + 8, x + 8, y + 14, x + 2, y + 8], '#9db7e0', { line: 0 });
      circle(g, x + 8, y + 8, 2, AZUL, { line: 0 });
    }
  rect(g, -2, 118, W + 4, 6, AZUL);
  // checkerboard floor
  for (let y = 192, r = 0; y < 270; y += 20, r++)
    for (let x = 0, c = r; x < W; x += 20, c++) rect(g, x, y, 20, 20, c % 2 ? '#2b2b33' : '#e9e4d8', { line: 0 });
  line(g, [0, 192, W, 192]);
  // shop sign and clock
  text(g, 'PASTELARIA GRAÇA', 316, 22, { size: 11, color: AZUL, outline: '#fff' });
  circle(g, 216, 40, 14, '#fffaf0');
  line(g, [216, 40, 216, 30], OUT, 1.5);
  line(g, [216, 40, 222, 42], OUT, 1.5);
  // shelf
  dropShadow(g, g => rect(g, 240, 72, 232, 6, '#8a4b2a'));
  for (const [x, c] of [[300, '#c8553d'], [318, '#4bc292'], [420, '#f2b632'], [438, '#c8553d']]) {
    rrect(g, x, 54, 12, 18, 2, c, { line: 1.5 });
    rect(g, x + 1, 50, 10, 4, '#e9e4d8', { line: 1 });
  }
  // counter
  dropShadow(g, g => {
    rect(g, 240, 152, 234, 44, '#8a4b2a');
    rect(g, 236, 146, 242, 8, '#e8e6e1');
  });
  for (let x = 250; x < 470; x += 44) rect(g, x, 160, 34, 28, '#7a4024', { line: 1 });
  // espresso machine
  dropShadow(g, g => {
    rrect(g, 404, 112, 54, 34, 4, '#c9d3dc');
    rect(g, 400, 106, 62, 8, '#9aa3ad');
  });
  rect(g, 414, 126, 8, 8, '#555a66', { line: 1 });
  rect(g, 440, 126, 8, 8, '#555a66', { line: 1 });
  const steam = t % 3;
  circle(g, 431, 100 - steam * 6, 3 + steam, '#ffffff', { line: 0, alpha: Math.max(0, 0.6 - steam * 0.2) });
  // chair by your table
  line(g, [196, 140, 198, 196], '#5a3218', 3);
  line(g, [214, 140, 212, 196], '#5a3218', 3);
  rrect(g, 192, 136, 26, 8, 3, '#7a4024');
  rect(g, 192, 170, 26, 5, '#7a4024');
  // your table
  rect(g, 147, 164, 6, 30, '#3b3b44');
  ellipse(g, 150, 196, 16, 4, '#3b3b44');
  ellipse(g, 150, 162, 38, 8, '#eeeae4');
}

const PAST_HOTSPOTS = [
  {
    id: 'shopdoor', name: s => (s.flags.doorOpen ? 'To the Arraial' : 'Pastelaria Door'), rect: [10, 48, 70, 146],
    draw(g, s, t) {
      dropShadow(g, g => rect(g, 14, 52, 62, 140, '#5a3218'));
      rect(g, 20, 58, 50, 90, '#1a2a52', { line: 1.5 });
      for (let i = 0; i < 5; i++) poly(g, [20 + i * 10, 68, 30 + i * 10, 68, 25 + i * 10, 76], Object.values(COLORS)[i], { line: 1 });
      for (let i = 0; i < 4; i++) circle(g, 26 + i * 12, 90 + (i % 2) * 6, 2, (t + i) % 2 < 1 ? '#ffd45e' : '#ff9a00', { line: 0 });
      if (s.flags.doorOpen) {
        poly(g, [20, 58, 34, 64, 34, 186, 20, 190], '#7a4024');
        text(g, 'ABERTO', 52, 124, { size: 7, color: '#4bc292' });
      } else {
        line(g, [36, 100, 45, 92, 54, 100], '#c9a26b', 1);
        rrect(g, 24, 100, 42, 14, 2, '#fffaf0', { line: 1.5 });
        text(g, 'FECHADO', 45, 107, { size: 5, color: '#c8553d', outline: null });
        circle(g, 66, 160, 3, '#f2b632', { line: 1.5 });
      }
      rect(g, 20, 150, 50, 36, '#7a4024', { line: 1.5 });
    },
    inspect: 'Locked, with a FECHADO (closed) sign on the glass. Through it you can see the arraial in full swing: bunting, lights, and the smell of grilled sardines.',
    uses: { key: { when: not('doorOpen'), take: 'key', set: 'doorOpen', say: 'The key turns with a satisfying clunk. The door swings open onto the arraial!', fx: 'sparkle' } },
    go: { to: 'arraial', when: f('doorOpen') },
  },
  ...TILES.map(tl => ({
    id: tl.id, name: 'Azulejo', rect: [tl.x, tl.y, 28, 28],
    draw(g) {
      rect(g, tl.x, tl.y, 28, 28, TILE_BG, { line: 1 });
      TILE_ART[tl.k](g, tl.x + 14, tl.y + 13);
      text(g, String(tl.n), tl.x + 24, tl.y + 24, { size: 5, color: OUT, outline: null, align: 'right' });
    },
    inspect: `A hand-painted azulejo: ${TILE_DESC[tl.k]}. A tiny number is painted in the corner: ${tl.n}.`,
  })),
  {
    id: 'cup', name: 'Your Bica', rect: [124, 146, 22, 14],
    draw(g) {
      ellipse(g, 135, 157, 9, 2.5, '#fffaf0', { line: 1.2 });
      rrect(g, 130, 148, 10, 8, [0, 0, 3, 3], '#fffaf0', { line: 1.2 });
      g.beginPath(); g.arc(141, 152, 2.5, -Math.PI / 2, Math.PI / 2); g.strokeStyle = OUT; g.lineWidth = 1.2; g.stroke();
    },
    inspect: 'Your bica, stone cold. You must have been asleep for hours.',
  },
  {
    id: 'note', name: "Dona Graça's Note", rect: [150, 150, 28, 12],
    draw(g) {
      poly(g, [152, 160, 156, 152, 176, 152, 173, 160], '#fff6d8', { line: 1.2 });
      line(g, [158, 155, 171, 155], AZUL, 1);
    },
    inspect: '"Querido cliente! You were sleeping like an angel, I didn\'t have the heart to wake you. I\'m at the arraial! The spare key is in the cookie tin. Its code is the number on the azulejo that has no twin. Take a pastel de nata and a papo-seco for the road. The last metro leaves at 1! Beijinhos, Graça"',
  },
  {
    id: 'bread', name: 'Bread Basket', rect: [244, 126, 44, 22],
    draw(g, s) {
      ellipse(g, 266, 142, 20, 6, '#c9a26b');
      if (!s.flags.breadTaken) [[256, 138], [270, 136], [264, 140]].forEach(([x, y]) => breadArt(g, x, y, 0.75));
      else breadArt(g, 258, 139, 0.75);
      rrect(g, 246, 140, 40, 8, [0, 0, 6, 6], '#b07a3e');
      for (let x = 250; x < 284; x += 6) line(g, [x, 141, x + 3, 147], '#8a5a2a', 1);
    },
    inspect: s => (s.flags.breadTaken ? 'One lonely papo-seco left. Leave it for the morning crowd.' : ''),
    click: { when: not('breadTaken'), set: 'breadTaken', give: 'bread', say: 'You take a papo-seco. Still a little warm.' },
  },
  {
    id: 'natacase', name: 'Display Case', rect: [294, 110, 88, 40],
    draw(g, s) {
      rect(g, 296, 140, 84, 8, '#e8e6e1', { line: 1.5 });
      for (let i = 0; i < 5; i++) if (i || !s.flags.nataTaken) nataArt(g, 306 + i * 16, 136, 0.7);
      for (let i = 0; i < 3; i++) breadArt(g, 316 + i * 22, 122, 0.55);
      rect(g, 296, 112, 84, 36, 'rgba(200,240,255,0.25)', { line: 1.5 });
      line(g, [302, 118, 312, 114], '#fff', 1.5);
    },
    inspect: s => (s.flags.nataTaken ? 'Pastéis de nata in neat rows, minus the one you took.' : ''),
    click: { when: not('nataTaken'), set: 'nataTaken', give: 'nata', say: 'You take a pastel de nata, as Dona Graça told you to. It would be rude not to.' },
  },
  {
    id: 'radio', name: 'Radio', rect: [250, 44, 40, 28],
    draw(g, s, t) {
      rrect(g, 254, 52, 32, 20, 4, '#c8553d');
      circle(g, 264, 62, 5, '#e8e6e1', { line: 1 });
      for (let i = 0; i < 3; i++) line(g, [274, 58 + i * 4, 282, 58 + i * 4], OUT, 1);
      line(g, [282, 52, 288, 40], OUT, 1);
      const k = t % 2;
      text(g, '♪', 290 + k * 6, 46 - k * 8, { size: 7, color: AZUL });
    },
    inspect: 'The radio plays fado, soft and sad. A guitarra portuguesa weeps somewhere far away.',
  },
  {
    id: 'tin', name: 'Cookie Tin', rect: [346, 46, 34, 28],
    draw(g, s) {
      dropShadow(g, g => rrect(g, 350, 52, 26, 20, 3, AZUL));
      ellipse(g, 363, 52, 13, 3, '#5d86d1', { line: 1.5 });
      if (s.flags.tinOpen) ellipse(g, 368, 46, 13, 3, '#5d86d1', { line: 1.5 }, 0.3);
      else { rect(g, 357, 58, 12, 8, '#e8e6e1', { line: 1 }); text(g, '00', 363, 62, { size: 5, color: OUT, outline: null }); }
    },
    inspect: s => (s.flags.tinOpen ? 'The cookie tin, open. Only crumbs left.' : ''),
    lock: {
      type: 'digits', length: 2, answer: '13',
      prompt: 'A blue cookie tin with a little two-digit dial on the front.',
      onSolve: { set: 'tinOpen', give: 'key', say: 'The lid pops off. Under a layer of biscoitos: the spare key!', fx: 'sparkle' },
    },
  },
];

// ---------------------------------------------------------------- arraial

const BUNTING = ['#c8553d', '#f2b632', '#2456a6', '#4bc292', '#fffaf0'];
const lightAt = x => 26 + 18 * Math.sin((x / W) * Math.PI);

// Four manjericos on Dona Lurdes' sill. One SHOUTED word in each verse.
const MANJERICOS = [
  { id: 'manj1', x: 34, col: 'red', verse: '"Little basil, little pot, / I bought you on the square; / FESTA lights are in the street / and music in the air."' },
  { id: 'manj2', x: 56, col: 'yellow', verse: '"Santo António, kind old saint, / please find me someone true; / ALL the hearts of Alvalade / have asked the same of you."' },
  { id: 'manj3', x: 78, col: 'blue', verse: '"The sardines on the grill / are crackling in the night; / DANCE with me until the morning / comes up warm and bright."' },
  { id: 'manj4', x: 100, col: 'green', verse: '"My neighbour at her window / sees everything I do; / ONE day I\'ll find a quiet street, / but not in June, it\'s true!"' },
];

function drawArraial(g, s, t) {
  const sky = g.createLinearGradient(0, 0, 0, 200);
  sky.addColorStop(0, '#0d1b3d');
  sky.addColorStop(1, '#2d4a8a');
  g.fillStyle = sky;
  g.fillRect(0, 0, W, 200);
  for (let i = 0; i < 18; i++) {
    const x = (i * 97) % W, y = (i * 53) % 60 + 4;
    if ((t * 2 + i) % 5 > 0.4) rect(g, x, y, 2, 2, '#fffaf0', { line: 0 });
  }
  circle(g, 420, 26, 12, '#fff4c2');
  circle(g, 426, 22, 10, '#16264d', { line: 0 });
  // far buildings
  const far = [[150, 80, '#e7a6a0'], [196, 64, '#9ec7d9'], [250, 88, '#f2d08a'], [306, 70, '#c9b6e4'], [356, 84, '#a8d8a0']];
  for (const [x, y, c] of far) {
    rect(g, x, y, 50, 200 - y, c);
    for (let wy = y + 10; wy < 180; wy += 20)
      for (let wx = x + 8; wx < x + 44; wx += 16) rect(g, wx, wy, 8, 10, (wx * wy) % 3 ? '#ffd45e' : '#33406b', { line: 1 });
  }
  // the pastelaria building
  dropShadow(g, g => rect(g, 0, 30, 150, 172, '#f2c14e'));
  rect(g, 0, 30, 150, 6, '#e8e6e1');
  for (let y = 110; y < 202; y += 12) for (let x = 0; x < 150; x += 12) rect(g, x, y, 12, 12, (x + y) % 24 ? '#dce6f5' : '#b8cbea', { line: 0 });
  line(g, [0, 110, 150, 110]);
  rrect(g, 6, 114, 138, 16, 3, AZUL);
  text(g, 'PASTELARIA GRAÇA', 75, 122, { size: 7, color: '#fff' });
  rect(g, 96, 138, 46, 40, '#ffd45e', { line: 1.5 });
  for (let i = 0; i < 3; i++) nataArt(g, 106 + i * 13, 172, 0.5);
  // ground: calçada portuguesa
  rect(g, 0, 200, W, 70, '#ece8df', { line: 0 });
  line(g, [0, 200, W, 200]);
  for (let k = 0; k < 4; k++) {
    const pts = [];
    for (let x = 0; x <= W; x += 8) pts.push(x, 214 + k * 16 + Math.sin(x / 22 + k) * 5);
    line(g, pts, '#33363d', 3);
  }
  // bunting and string lights
  for (let x = 0; x < W; x += 16) {
    const y = lightAt(x) + 14;
    poly(g, [x, y, x + 14, y, x + 7, y + 10], BUNTING[(x / 16) % BUNTING.length], { line: 1 });
  }
  const pts = [];
  for (let x = 0; x <= W; x += 8) pts.push(x, lightAt(x));
  line(g, pts, '#2a2140', 1.5);
  for (let x = 12, i = 0; x < W; x += 30, i++) circle(g, x, lightAt(x) + 3, 3, (t * 2 + i) % 3 < 2 ? '#ffd45e' : '#ff9a00', { line: 1 });
}

const ARR_HOTSPOTS = [
  {
    id: 'backdoor', name: 'Pastelaria Graça', rect: [40, 134, 46, 68],
    draw(g) {
      rect(g, 44, 138, 38, 62, '#7a4024');
      rect(g, 50, 144, 26, 30, '#ffd45e', { line: 1.5 });
    },
    go: { to: 'pastelaria' },
  },
  {
    id: 'lurdes', name: 'Dona Lurdes', rect: [36, 44, 82, 42],
    draw(g, s, t) {
      rect(g, 30, 42, 92, 46, '#ffcf7a');
      poly(g, [30, 42, 52, 42, 46, 88, 30, 88], '#c8553d', { line: 1.5 });
      poly(g, [122, 42, 100, 42, 106, 88, 122, 88], '#c8553d', { line: 1.5 });
      rect(g, 54, 70, 44, 18, '#7a6aa8');
      head(g, 76, 62, { skin: '#f1c9a5', hair: '#c9cdd3', bun: true, glasses: true });
      if (s.flags.coinGot) {
        const a = Math.sin(t * 8) * 0.4;
        line(g, [92, 74, 98 + Math.sin(a) * 6, 58]);
        circle(g, 98 + Math.sin(a) * 6, 56, 3, '#f1c9a5', { line: 1.5 });
      } else if (s.flags.lurdesAsked) {
        rrect(g, 88, 66, 16, 12, 3, '#c8553d', { line: 1.5 });
        rect(g, 93, 68, 6, 4, '#f2b632', { line: 1 });
      }
    },
    inspect: s => (s.flags.coinGot
      ? 'Dona Lurdes waves at you. "Apanha o metro, filho! And come back for the sardines next year!"'
      : "Dona Lurdes leans on her windowsill, watching everything and everyone. \"Boa noite! You're the one who fell asleep at Graça's! Ai, I could murder a pastel de nata right now...\""),
    uses: { nata: { when: not('lurdesAsked'), take: 'nata', set: 'lurdesAsked', say: '"Ai, que bom! Thank you, filho. Here, let me give you something for the metro... if I can open my purse. My late husband set the lock to the word my manjericos whisper."', sfx: 'good' } },
    lock: {
      type: 'letters', length: 4, answer: 'FADO', when: f('lurdesAsked'),
      prompt: 'Dona Lurdes holds out a little purse with a four-letter lock. "It\'s the word my four manjericos whisper. Each verse has one word shouted in capitals. Take their first letters, left to right!"',
      onSolve: { set: 'coinGot', give: 'coin', say: 'Click! Dona Lurdes tosses down a €2 coin wrapped in a napkin. "Para o metro! Don\'t tell your mother I\'m spoiling you."', fx: 'sparkle' },
    },
  },
  ...MANJERICOS.map((m, i) => ({
    id: m.id, name: 'Manjerico', rect: [m.x - 1, 76, 20, 26],
    draw(g, s, t) {
      if (i === 0) rect(g, 26, 96, 100, 6, '#e8e6e1');
      const x = m.x + 9, sway = Math.sin(t * 2 + i) * 0.8;
      poly(g, [x - 7, 88, x + 7, 88, x + 5, 97, x - 5, 97], '#c8553d', { line: 1.5 });
      puffs(g, [[x - 3 + sway, 84, 4], [x + 3 + sway, 84, 4], [x + sway, 80, 4.5]], '#3f9b3a', { line: 1.5 });
      line(g, [x + 5, 86, x + 8, 76], '#3f9b3a', 1);
      circle(g, x + 8, 75, 2.6, COLORS[m.col], { line: 1 });
      rect(g, x - 9, 74, 7, 6, '#fffaf0', { line: 1 });
    },
    inspect: `A pot of manjerico, the little basil everyone gives for Santo António, with a paper carnation (${m.col}) and a folded verse: ${m.verse}`,
  })),
  {
    id: 'grill', name: 'Sr. Manel', rect: [172, 112, 96, 90],
    draw(g, s, t) {
      const x = 220;
      // Sr. Manel
      rect(g, x - 14, 136, 28, 40, '#fffaf0');
      rect(g, x - 9, 140, 18, 30, '#c8553d', { line: 1.5 });
      head(g, x, 126, { skin: '#e3b28d', hair: '#2a2a2a', moustache: true, cap: '#2a2a2a' });
      // grill
      dropShadow(g, g => {
        rect(g, x - 34, 172, 68, 14, '#3b3b44');
        line(g, [x - 28, 186, x - 32, 200], OUT, 3);
        line(g, [x + 28, 186, x + 32, 200], OUT, 3);
      });
      rect(g, x - 32, 168, 64, 5, '#5d6a85', { line: 1 });
      for (let i = 0; i < 4; i++) sardine(g, x - 22 + i * 15, 166, 0.6, i % 2);
      for (let i = 0; i < 3; i++) circle(g, x - 20 + i * 18, 176, 2, (t * 3 + i) % 2 < 1 ? '#ff9a00' : '#fe5f55', { line: 0 });
      for (let i = 0; i < 3; i++) {
        const p = (t * 0.5 + i / 3) % 1;
        circle(g, x - 10 + i * 10 + Math.sin(p * 6) * 4, 160 - p * 50, 4 + p * 8, '#d9dde3', { line: 0, alpha: 0.7 * (1 - p) });
      }
    },
    inspect: s => (s.flags.sardineMade
      ? 'Sr. Manel flips sardines and hums along to the music. "Bom apetite!"'
      : '"Boa noite! Sardinhas? Ai, I\'ve run out of bread, and a sardine without bread is just a fish! Bring me a papo-seco and I\'ll sort you out."'),
    uses: { bread: { take: 'bread', give: 'sardine', set: 'sardineMade', say: 'Sr. Manel lays a fat sardine on your papo-seco. "There! Now that is dinner."' } },
  },
  {
    id: 'cat', name: s => (s.flags.catFed ? 'Happy Cat' : 'Sleeping Cat'), rect: [284, 150, 84, 50],
    draw(g, s, t) {
      dropShadow(g, g => {
        rect(g, 290, 178, 72, 6, '#7a4024');
        line(g, [296, 184, 296, 198], OUT, 3);
        line(g, [356, 184, 356, 198], OUT, 3);
      });
      if (!s.flags.catFed) {
        rect(g, 330, 174, 14, 5, '#2a7fc9', { line: 1 });
        ellipse(g, 320, 170, 18, 9, '#f0a04b');
        circle(g, 304, 166, 7, '#f0a04b');
        poly(g, [299, 161, 300, 154, 304, 159], '#f0a04b', { line: 1 });
        poly(g, [306, 159, 309, 154, 310, 161], '#f0a04b', { line: 1 });
        line(g, [301, 167, 304, 167], OUT, 1);
        const z = t % 2;
        text(g, 'z', 296 - z * 3, 152 - z * 8, { size: 6 + z * 2, color: '#fffaf0' });
      } else {
        const x = 330, wag = Math.sin(t * 5) * 4;
        line(g, [x + 10, 194, x + 18 + wag, 180], '#f0a04b', 3);
        ellipse(g, x, 190, 12, 8, '#f0a04b');
        circle(g, x - 12, 192, 6, '#f0a04b');
        poly(g, [x - 16, 188, x - 15, 182, x - 12, 187], '#f0a04b', { line: 1 });
        sardine(g, x - 24, 197, 0.6);
      }
    },
    inspect: s => (s.flags.catFed
      ? 'The cat is very busy with her sardine. Purr.'
      : 'A fat ginger cat is asleep on the bench, sprawled on top of something blue and plastic. She opens one eye, sniffs towards the grill, and closes it again.'),
    uses: { sardine: { take: 'sardine', give: 'navegante', set: 'catFed', say: 'The cat leaps down and gets to work on the sardine. She was sleeping on a Navegante card!', sfx: 'pick' } },
  },
  {
    id: 'metroentrance', name: 'Metro Alvalade', rect: [380, 70, 96, 132],
    draw(g) {
      rect(g, 392, 74, 4, 88, '#3b3b44');
      dropShadow(g, g => rrect(g, 378, 70, 32, 30, 4, '#e2231a'));
      text(g, 'M', 394, 85, { size: 18, color: '#fff' });
      poly(g, [404, 162, 476, 162, 476, 200, 412, 200], '#22242c');
      for (let y = 168; y < 200; y += 6) line(g, [410, y, 476, y], '#3b3e48', 1.5);
      line(g, [404, 162, 412, 200], '#9aa3ad', 3);
      line(g, [404, 150, 404, 162], '#9aa3ad', 3);
      line(g, [404, 150, 476, 150], '#9aa3ad', 3);
      rrect(g, 414, 128, 56, 16, 3, '#1f6f43');
      text(g, 'ALVALADE', 442, 136, { size: 7, color: '#fff' });
    },
    go: { to: 'metro' },
  },
];

// ---------------------------------------------------------------- metro

const GREEN_LINE = ['Telheiras', 'Campo Grande', 'Alvalade', 'Roma', 'Areeiro', 'Alameda', 'Arroios', 'Anjos', 'Intendente', 'Martim Moniz', 'Rossio', 'Baixa-Chiado', 'Cais do Sodré'];

function drawMetro(g) {
  rect(g, 0, 0, W, 196, '#eef0ec', { line: 0 });
  for (let x = 0; x < W; x += 16) line(g, [x, 0, x, 196], '#d6dad4', 1);
  for (let y = 0; y < 196; y += 12) line(g, [0, y, W, y], '#d6dad4', 1);
  rect(g, -2, 80, W + 4, 10, '#2e9b5b');
  rect(g, 0, 196, W, 74, '#9aa0a6', { line: 0 });
  line(g, [0, 196, W, 196]);
  rect(g, 0, 236, W, 6, '#f2b632', { line: 1 });
  for (let x = 4; x < W; x += 8) circle(g, x, 239, 1, '#c99520', { line: 0 });
  rrect(g, 172, 20, 136, 24, 4, '#1f3a5f');
  text(g, 'ALVALADE', 240, 32, { size: 13, color: '#fff' });
  rect(g, 236, 52, 8, 26, '#3b3b44', { line: 1 });
  circle(g, 240, 52, 12, '#fffaf0');
  text(g, '00:52', 240, 52, { size: 6, color: OUT, outline: null });
}

const METRO_HOTSPOTS = [
  {
    id: 'linemap', name: 'Line Map', rect: [16, 18, 136, 50],
    draw(g) {
      rect(g, 18, 20, 132, 46, '#fffaf0');
      line(g, [26, 44, 142, 44], '#2e9b5b', 4);
      for (let i = 0; i < 13; i++) circle(g, 26 + i * 9.6, 44, i === 2 ? 3.5 : 2, i === 2 ? '#e2231a' : '#fffaf0', { line: 1 });
      text(g, 'LINHA VERDE', 84, 28, { size: 6, color: '#2e9b5b', outline: null });
      text(g, 'VOCÊ ESTÁ AQUI', 50, 56, { size: 5, color: '#e2231a', outline: null, align: 'left' });
    },
    inspect: `The green line map, with a red dot that says VOCÊ ESTÁ AQUI (you are here): ${GREEN_LINE.map(n => (n === 'Alvalade' ? 'ALVALADE' : n)).join(' · ')}.`,
  },
  {
    id: 'machine', name: 'Ticket Machine', rect: [36, 96, 64, 100],
    draw(g, s) {
      dropShadow(g, g => rrect(g, 40, 100, 56, 96, 4, '#2e9b5b'));
      rect(g, 48, 108, 40, 24, '#16264d', { line: 1.5 });
      const msg = s.flags.charged ? ['OBRIGADO', '1 VIAGEM'] : s.flags.cardIn ? ['€1,80', 'MOEDAS'] : ['INSIRA', 'CARTÃO'];
      msg.forEach((m, i) => text(g, m, 68, 115 + i * 9, { size: 5, color: s.flags.charged ? '#4bc292' : '#7fd3ff', outline: null }));
      rect(g, 50, 140, 16, 4, OUT, { line: 1 });
      rect(g, 74, 138, 12, 8, '#c9d3dc', { line: 1 });
      text(g, '€', 80, 142, { size: 5, color: OUT, outline: null });
      rect(g, 50, 170, 36, 12, '#1f6f43', { line: 1.5 });
    },
    inspect: s => (s.flags.charged ? 'The screen says OBRIGADO: your card is charged with one trip.'
      : s.flags.cardIn ? 'The screen says: CARREGAR 1 VIAGEM, €1,80. INSIRA MOEDAS (insert coins).'
        : 'A ticket machine. The screen says: INSIRA CARTÃO (insert card).'),
    uses: {
      navegante: { when: not('cardIn'), take: 'navegante', set: 'cardIn', say: 'The machine swallows the card. CARREGAR 1 VIAGEM: €1,80.' },
      coin: { when: s => !!s.flags.cardIn && !s.flags.charged, take: 'coin', give: 'trip', set: 'charged', say: 'Clink! The machine whirrs and spits out your Navegante, charged with one trip. Twenty cents change, too.' },
    },
  },
  {
    id: 'gates', name: 'Ticket Gates', rect: [150, 112, 172, 86],
    draw(g, s, t) {
      for (let i = 0; i < 3; i++) {
        const x = 160 + i * 56;
        dropShadow(g, g => rrect(g, x, 130, 16, 64, 3, '#9aa3ad'));
        rect(g, x + 3, 134, 10, 6, s.flags.gateOpen && i === 1 ? '#4bc292' : '#e2231a', { line: 1 });
        if (i < 2) {
          if (s.flags.gateOpen && i === 1) {
            rect(g, x + 16, 144, 4, 34, 'rgba(200,240,255,0.5)', { line: 1.5 });
            rect(g, x + 52, 144, 4, 34, 'rgba(200,240,255,0.5)', { line: 1.5 });
          } else {
            rect(g, x + 16, 144, 18, 34, 'rgba(200,240,255,0.5)', { line: 1.5 });
            rect(g, x + 38, 144, 18, 34, 'rgba(200,240,255,0.5)', { line: 1.5 });
          }
        }
      }
      rrect(g, 210, 100, 52, 12, 3, '#1f3a5f');
      text(g, 'CAIS ▶', 236, 106, { size: 6, color: '#fff' });
    },
    inspect: s => (s.flags.gateOpen ? 'The gate is open. GO!' : 'The ticket gates. Beyond them, the escalator down to the platform. You need a charged Navegante card to get through.'),
    uses: { trip: { take: 'trip', set: 'gateOpen', win: true, say: 'Bip! The gate swings open. You race down the escalator and leap onto the last metro as the doors close. Adeus, Alvalade! You escaped!', fx: 'confetti', sfx: 'win' } },
  },
  {
    id: 'booth', name: 'Sr. Zé', rect: [340, 96, 72, 100],
    draw(g, s, t) {
      dropShadow(g, g => rect(g, 344, 100, 64, 96, '#1f6f43'));
      rect(g, 350, 108, 52, 40, '#bfe3f2', { line: 1.5 });
      rect(g, 362, 132, 28, 16, '#1f3a5f', { line: 1 });
      head(g, 376, 124, { skin: '#d9a07a', hair: '#555', cap: '#1f3a5f', moustache: true });
      if (Math.sin(t * 0.7) > 0.8) text(g, 'z', 392, 114, { size: 6, color: OUT, outline: '#fff' });
      rect(g, 350, 156, 52, 8, '#fffaf0', { line: 1 });
      text(g, 'INFORMAÇÕES', 376, 160, { size: 5, color: OUT, outline: null });
    },
    inspect: '"Última viagem à uma! Card charged? Then off you go. No card? The machine does that, not me. I only do information." He goes back to his crossword.',
  },
  {
    id: 'exitstairs', name: 'Way Out', rect: [420, 92, 56, 106],
    draw(g) {
      rrect(g, 426, 96, 46, 14, 3, '#f2b632');
      text(g, 'SAÍDA', 449, 103, { size: 7, color: OUT, outline: null });
      poly(g, [424, 196, 476, 196, 476, 116, 450, 116], '#c9cdd3');
      for (let y = 124; y < 196; y += 8) line(g, [452 - (y - 116) * 0.35, y, 476, y], '#9aa3ad', 1.5);
    },
    go: { to: 'arraial' },
  },
];

// ---------------------------------------------------------------- level

export default {
  id: 'alvalade',
  title: 'Alvalade',
  subtitle: 'O Último Metro',
  blurb: "It's Santo António night in Lisbon. You dozed off in a pastelaria in Alvalade, and the last metro leaves at 1. Get out, make some friends, and catch it.",
  palette: [AZUL, '#f2b632', '#c8553d'],
  start: 'pastelaria',
  intro: "You wake up with your cheek on a marble table. It's Santo António night, Pastelaria Graça is dark and locked, and the last metro leaves Alvalade at 1. Better get moving!",

  items: {
    key: {
      name: 'Door Key', desc: "Dona Graça's spare key, on a ring with a little plastic sardine.",
      draw(g) {
        circle(g, 10, 12, 6, null, { line: 2.5, stroke: '#f2b632' });
        rect(g, 15, 14, 14, 4, '#f2b632', { line: 1.5 });
        rect(g, 24, 17, 3, 5, '#f2b632', { line: 1.5 });
        sardine(g, 12, 26, 0.6);
      },
    },
    bread: { name: 'Papo-seco', desc: 'A crusty Portuguese bread roll. Still a little warm.', draw: g => breadArt(g, 16, 17, 1.2) },
    nata: { name: 'Pastel de Nata', desc: 'Crisp pastry, wobbly custard, scorched on top. Dangerously good.', draw: g => nataArt(g, 16, 17, 1.4) },
    sardine: {
      name: 'Sardinha no Pão', desc: 'A grilled sardine on a papo-seco, the bread soaking up the juices. The taste of June in Lisbon.',
      draw(g) { breadArt(g, 16, 20, 1.2); sardine(g, 17, 15, 0.9); },
    },
    navegante: { name: 'Navegante Card', desc: "A Lisbon transit card. It's a bit warm and covered in cat hair. Balance: 0 trips.", draw: g => cardArt(g, 4, 8, false) },
    coin: {
      name: '€2 Coin', desc: "Wrapped in a napkin that smells of Dona Lurdes' perfume.",
      draw(g) {
        circle(g, 16, 16, 11, '#c9d3dc', { line: 1.5 });
        circle(g, 16, 16, 7, '#f2b632', { line: 1 });
        text(g, '2', 16, 16, { size: 8, color: OUT, outline: null });
      },
    },
    trip: { name: 'Charged Navegante', desc: 'Balance: 1 trip. The last metro is waiting.', draw: g => cardArt(g, 4, 8, true) },
  },

  scenes: {
    pastelaria: { name: 'Pastelaria', draw: drawPastelaria, hotspots: PAST_HOTSPOTS },
    arraial: { name: 'Arraial', draw: drawArraial, hotspots: ARR_HOTSPOTS, open: f('doorOpen') },
    metro: { name: 'Metro', draw: drawMetro, hotspots: METRO_HOTSPOTS, open: f('doorOpen') },
  },

  hints: [
    { done: f('tinOpen'), text: ["Dona Graça left you a note on your table. Then take a good look at the azulejos on the wall.", 'Every tile has a twin except the curly cross, bottom left: 13. Fitting, since the 13th of June is Santo António\'s day.'] },
    { done: f('doorOpen'), text: ['Keys go in doors.', 'Tap the Door Key card to hold it, then tap the pastelaria door.'] },
    { done: f('sardineMade'), text: ["Sr. Manel can't make sardinhas without bread.", 'Take a papo-seco from the bread basket in the pastelaria and give it to Sr. Manel.'] },
    { done: f('catFed'), text: ['The cat is sleeping on top of something. What would get a cat off a warm bench?', 'Give the cat your sardinha no pão.'] },
    { done: f('lurdesAsked'), text: ['Dona Lurdes, at her window, is craving something sweet.', "Take a pastel de nata from the pastelaria's display case and give it to her."] },
    { done: f('coinGot'), text: ['Read the four manjericos on her windowsill. Each verse has one word in capitals.', 'FESTA, ALL, DANCE, ONE: the code is FADO.'] },
    { done: f('charged'), text: ['The ticket machine in the station charges cards. It tells you what it wants.', 'Put in the Navegante card first, then the €2 coin.'] },
    { done: s => !!s.wonAt, text: ['You have a charged card and a train to catch.', 'Hold the Charged Navegante and tap the ticket gates.'] },
  ],
};
