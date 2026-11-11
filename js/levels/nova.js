// Level: NOVA FCT — Entrega à Meia-Noite.
//
// Puzzle chain:
//   whiteboard binary (101 1000 11)          -> Rita's cacifo (583)    -> charger
//   charger on your laptop                   -> laptop on (shows aluno 61423)
//   evacuation plan route colours            -> night exit panel       -> campus
//   Tó at the AE bar                         -> €1 coin from Rita
//   coin in the vending machine              -> Bolachas Maria + the stuck pen drive
//   pen drive in the laptop                  -> projeto.zip on the pen
//   Bolachas Maria for Sr. Armando           -> lost and found asks for your number (61423) -> student card
//   student card at the Biblioteca           -> 24h study room
//   Rita's books in call-number order (NOVA) -> CLIP login
//   pen drive on the library PC              -> submitted before midnight
//
// Text given as { easy, hard } says less in hard mode.

import { rect, rrect, circle, ellipse, poly, line, star, text, dropShadow, OUT } from '../draw.js';
import { head } from './people.js';

const W = 480;
const f = name => s => !!s.flags[name];
const not = name => s => !s.flags[name];

const NAVY = '#14365c';
const STUDENT_NO = '61423';

// ---------------------------------------------------------------- shared art

function nightSky(g, t, bottom) {
  const sky = g.createLinearGradient(0, 0, 0, bottom);
  sky.addColorStop(0, '#0b1730');
  sky.addColorStop(1, '#27406e');
  g.fillStyle = sky;
  g.fillRect(0, 0, W, bottom);
  for (let i = 0; i < 22; i++) {
    const x = (i * 89) % W, y = (i * 37) % (bottom - 40) + 4;
    if ((t * 1.5 + i) % 6 > 0.5) rect(g, x, y, 2, 2, '#fffaf0', { line: 0 });
  }
}

function body(g, x, y, shirt, w = 26) {
  rrect(g, x - w / 2, y, w, 36, [8, 8, 0, 0], shirt, { line: 1.5 });
}

function doorArt(g, x, y, w, h, color, sign) {
  dropShadow(g, g => rect(g, x, y, w, h, color));
  rect(g, x + 6, y + 10, w - 12, h * 0.4, '#bfe3f2', { line: 1.5 });
  circle(g, x + w - 8, y + h * 0.6, 2.5, '#f2b632', { line: 1 });
  if (sign) {
    rrect(g, x + 2, y - 14, w - 4, 11, 2, '#fffaf0', { line: 1.5 });
    text(g, sign, x + w / 2, y - 8, { size: 5, color: OUT, outline: null });
  }
}

function penArt(g, x, y, full) {
  rrect(g, x, y, 18, 9, 2, '#2a7fc9', { line: 1.5 });
  rect(g, x + 18, y + 2, 6, 5, '#c9d3dc', { line: 1 });
  if (full) circle(g, x + 4, y + 4.5, 1.6, '#4bc292', { line: 0 });
}

// ---------------------------------------------------------------- lab 1.07

const LOCKERS = [
  { id: 'locker0', inspect: 'Locked. Covered in stickers from the Semana do Caloiro.' },
  { id: 'locker1', inspect: "Locked. Someone wrote BORA ESTUDAR on it in marker. Nobody did." },
  { id: 'rita', rita: true },
  { id: 'locker3', inspect: "Not even locked. Empty, apart from a forgotten calculator with the batteries missing." },
].map((l, i) => ({ ...l, x: 372 + i * 25 }));

function drawLab(g, s, t) {
  rect(g, 0, 0, W, 196, '#e6e2d6', { line: 0 });
  rect(g, 0, 0, W, 10, '#c9c4b5', { line: 0 });
  for (const x of [90, 300]) { rect(g, x, 10, 80, 5, '#fffaf0', { line: 1 }); rect(g, x + 4, 15, 72, 3, '#fff8c2', { line: 0, alpha: 0.6 }); }
  rect(g, 0, 196, W, 74, '#9aa0a6', { line: 0 });
  for (let x = 0; x < W; x += 40) line(g, [x, 196, x - 30, 270], '#8a9096', 1);
  line(g, [0, 196, W, 196]);
  // back row of lab PCs
  for (let i = 0; i < 4; i++) {
    const x = 150 + i * 54;
    rect(g, x, 118, 40, 26, '#2a2d36', { line: 1.5 });
    rect(g, x + 3, 121, 34, 20, '#1f4a7a', { line: 0 });
    rect(g, x + 17, 130, 6, 5, '#f2b632', { line: 0.8 });
    circle(g, x + 20, 129, 2, null, { line: 1, stroke: '#f2b632' });
    rect(g, x + 16, 144, 8, 6, '#2a2d36', { line: 1 });
  }
  dropShadow(g, g => rect(g, 140, 150, 220, 6, '#c9b08a'));
  // clock
  circle(g, 330, 40, 13, '#fffaf0');
  line(g, [330, 40, 330, 30], OUT, 1.5);
  line(g, [330, 40, 334, 46], OUT, 1.5);
  // your desk, front and centre
  dropShadow(g, g => {
    rect(g, 130, 196, 10, 50, '#7a5a3a');
    rect(g, 330, 196, 10, 50, '#7a5a3a');
    rect(g, 120, 184, 230, 12, '#c9b08a');
  });
  rect(g, 250, 172, 30, 12, '#fffaf0', { line: 1.2 });
  line(g, [254, 176, 276, 176], '#9aa3ad', 1);
  line(g, [254, 180, 270, 180], '#9aa3ad', 1);
  ellipse(g, 300, 180, 7, 3, '#c8553d', { line: 1.2 });
}

const LAB_HOTSPOTS = [
  {
    id: 'labdoor', name: 'Corredor', rect: [8, 50, 56, 148],
    draw: g => doorArt(g, 12, 64, 48, 132, '#7a8fa6', 'LAB 1.07'),
    go: { to: 'corredor' },
  },
  {
    id: 'whiteboard', name: 'Whiteboard', rect: [70, 26, 74, 66],
    draw(g) {
      dropShadow(g, g => rect(g, 72, 28, 70, 60, '#fdfdfb'));
      rect(g, 72, 86, 70, 3, '#9aa3ad', { line: 1 });
      text(g, 'AC · aula 7', 107, 36, { size: 6, color: '#c8553d', outline: null });
      text(g, '101  1000  11', 107, 50, { size: 7, color: NAVY, outline: null });
      text(g, '→ base 10 ?', 107, 62, { size: 6, color: NAVY, outline: null });
      circle(g, 128, 76, 5, null, { line: 1, stroke: '#2e9b5b' });
      text(g, 'R', 117, 77, { size: 6, color: '#2e9b5b', outline: null });
      circle(g, 126.5, 75, 0.6, '#2e9b5b', { line: 0 });
      circle(g, 129.5, 75, 0.6, '#2e9b5b', { line: 0 });
    },
    inspect: {
      easy: 'Left over from an Arquitetura de Computadores class: "Convert to base 10: 101 · 1000 · 11". Underneath, in Rita\'s green marker: "= my cacifo code, so I never forget :)"',
      hard: 'Left over from an Arquitetura de Computadores class: "101 · 1000 · 11 → base 10?". Someone has added a green smiley and an R.',
    },
  },
  {
    id: 'window', name: 'Window', rect: [160, 26, 120, 64],
    draw(g, s, t) {
      rect(g, 162, 28, 116, 60, '#0b1730', { line: 2 });
      for (let i = 0; i < 6; i++) if ((t + i) % 4 > 0.6) rect(g, 166 + (i * 41) % 108, 32 + (i * 13) % 20, 2, 2, '#fffaf0', { line: 0 });
      rect(g, 196, 58, 58, 30, '#2a3550', { line: 1 });
      for (let i = 0; i < 6; i++) rect(g, 199 + i * 9, 62, 7, 20, '#ffd45e', { line: 0, alpha: 0.85 });
      line(g, [220, 28, 220, 88], OUT, 2);
    },
    inspect: { easy: "Across the campus, the Biblioteca glows. Its 24-hour study room never sleeps, and its PCs are on the university network.", hard: 'Across the campus, the Biblioteca glows.' },
  },
  {
    id: 'poster', name: 'Poster', rect: [286, 64, 36, 44],
    draw(g) {
      rect(g, 288, 66, 32, 40, '#fffaf0', { line: 1.5 });
      circle(g, 304, 80, 8, null, { line: 2, stroke: '#c8553d' });
      ellipse(g, 304, 79, 5, 3, '#d58b3a', { line: 1 });
      rect(g, 299, 80, 10, 2, '#4bc292', { line: 0 });
      line(g, [298, 86, 310, 74], '#c8553d', 2);
      text(g, 'NÃO COMER', 304, 98, { size: 4, color: '#c8553d', outline: null });
    },
    inspect: 'PROIBIDO COMER NO LABORATÓRIO. There are three empty crisp packets under the poster.',
  },
  {
    id: 'pcs', name: 'Lab PCs', rect: [148, 114, 216, 36],
    inspect: { easy: 'The lab PCs. Every one says: Sessão bloqueada. And the building network switches off at night anyway.', hard: 'The lab PCs. Every one says: Sessão bloqueada.' },
  },
  {
    id: 'laptop', name: 'Your Laptop', rect: [176, 150, 64, 36],
    draw(g, s, t) {
      poly(g, [180, 184, 236, 184, 240, 188, 176, 188], '#9aa3ad', { line: 1.5 });
      rect(g, 184, 154, 48, 30, '#3b3e48', { line: 1.5 });
      if (!s.flags.laptopOn) rect(g, 187, 157, 42, 24, '#14161c', { line: 0 });
      else {
        rect(g, 187, 157, 42, 24, '#1f6fb2', { line: 0 });
        rect(g, 191, 161, 34, 6, '#fffaf0', { line: 0 });
        text(g, 'CLIP', 208, 164, { size: 4, color: NAVY, outline: null });
        rect(g, 191, 170, 20 * Math.min(1, (t % 4) / 2), 3, '#4bc292', { line: 0 });
      }
      if (s.flags.laptopOn) line(g, [236, 186, 262, 196, 300, 196], '#2a2d36', 1.5);
    },
    inspect: s => (!s.flags.laptopOn ? {
      easy: "Your laptop. Dead: 0% battery. Your group's whole project lives on it, and it's due on CLIP at midnight. Your charger is at home, of course.",
      hard: 'Your laptop. Dead. The project is due at midnight.',
    } : !s.flags.penFull ? {
      easy: `Alive again! projeto.zip is ready, but there's no network in Ed. II at night. The CLIP login screen remembers your student number: ${STUDENT_NO}. You'll need something to carry the file somewhere with a connection.`,
      hard: `Alive. projeto.zip is ready. No network. The CLIP login screen remembers you: aluno ${STUDENT_NO}.`,
    } : `projeto.zip is safe on the pen drive. CLIP still remembers you: aluno ${STUDENT_NO}.`),
    uses: {
      charger: { when: not('laptopOn'), take: 'charger', set: 'laptopOn', say: 'The laptop wakes up with a chime. 3%... 4%... It lives!' },
      pen: { when: f('laptopOn'), take: 'pen', give: 'penFull', set: 'penFull', say: 'Copying projeto.zip... 100%. Done, with a backup this time.' },
    },
  },
  ...LOCKERS.map(l => ({
    id: l.id, name: 'Cacifo', rect: [l.x, 48, 24, 146],
    draw(g, s) {
      const open = l.rita && s.flags.lockerOpen;
      rect(g, l.x, 50, 24, 144, '#5d86a8', { line: 1.5 });
      for (let y = 58; y < 70; y += 4) line(g, [l.x + 5, y, l.x + 19, y], '#3f6688', 1);
      if (open) poly(g, [l.x, 50, l.x - 8, 56, l.x - 8, 188, l.x, 194], '#7aa0c0');
      else rect(g, l.x + 16, 110, 5, 10, '#c9d3dc', { line: 1 });
      if (l.rita) { circle(g, l.x + 12, 84, 6, '#4bc292', { line: 1.2 }); text(g, 'R', l.x + 12, 84, { size: 6, color: '#fff', outline: null }); }
      if (l.id === 'locker0') for (let i = 0; i < 3; i++) star(g, l.x + 6 + i * 6, 140 + i * 9, 3.5, 1.5, 5, ['#f2b632', '#c8553d', '#fffaf0'][i], { line: 1 });
    },
    inspect: l.rita ? s => (s.flags.lockerOpen ? "Rita's cacifo: notes for Cálculo II, a traje cape, and an empty space where her spare charger was." : '') : l.inspect,
    ...(l.rita && {
      lock: {
        type: 'digits', length: 3, answer: '583',
        prompt: { easy: "Rita's cacifo, with her green R sticker. A three-digit combination padlock.", hard: 'A cacifo with a green R sticker and a three-digit padlock.' },
        onSolve: { set: 'lockerOpen', give: 'charger', say: "The padlock pops open. Rita's spare USB-C charger! She'd want you to have it. Probably.", fx: 'sparkle' },
      },
    }),
  })),
];

// ---------------------------------------------------------------- corredor do DI

// The evacuation route on the plan, in order. Also the night exit's code.
const ROUTE = ['green', 'orange', 'blue', 'purple'];
const ROUTE_HEX = { green: '#4bc292', orange: '#ff9a00', blue: '#2f8cff', purple: '#a46cf0' };

function drawCorredor(g) {
  rect(g, 0, 0, W, 200, '#d9dee3', { line: 0 });
  rect(g, 0, 0, W, 8, '#b8c0c8', { line: 0 });
  rect(g, -2, 112, W + 4, 6, NAVY);
  for (const x of [60, 260]) rect(g, x, 8, 120, 4, '#fffaf0', { line: 1 });
  rect(g, 0, 200, W, 70, '#b9bec4', { line: 0 });
  for (let x = -40; x < W; x += 60) ellipse(g, x + 30, 232, 22, 3, '#d5d9dd', { line: 0 });
  line(g, [0, 200, W, 200]);
  text(g, 'DEPARTAMENTO DE INFORMÁTICA', 200, 24, { size: 9, color: NAVY, outline: '#fff' });
}

const COR_HOTSPOTS = [
  {
    id: 'tolab', name: 'Lab 1.07', rect: [10, 52, 56, 148],
    draw: g => doorArt(g, 14, 66, 48, 132, '#7a8fa6', 'LAB 1.07'),
    go: { to: 'lab' },
  },
  {
    id: 'board', name: 'Notice Board', rect: [76, 38, 84, 66],
    draw(g) {
      dropShadow(g, g => rect(g, 78, 40, 80, 62, '#c99a63'));
      const flyers = [[82, 44, '#fffaf0', -0.05], [106, 48, '#ffd45e', 0.06], [132, 44, '#9ec7d9', -0.03], [86, 72, '#f7b2a8', 0.04], [118, 74, '#fffaf0', -0.06]];
      for (const [x, y, c, a] of flyers) {
        g.save(); g.translate(x + 10, y + 12); g.rotate(a);
        rect(g, -10, -12, 20, 24, c, { line: 1 });
        for (let k = 0; k < 3; k++) line(g, [-6, -6 + k * 5, 6, -6 + k * 5], '#9aa3ad', 1);
        g.restore();
        circle(g, x + 10, y + 1, 1.5, '#c8553d', { line: 0 });
      }
    },
    inspect: 'Flyers: SEMANA DO CALOIRO. JANTAR DE CURSO, SEXTA! Explicações de Cálculo, 10€/hora. Vendo traje académico, usado só 1 vez. Tuna ensaia às quartas.',
  },
  {
    id: 'evacplan', name: 'Planta de Emergência', rect: [170, 38, 72, 60],
    draw(g) {
      dropShadow(g, g => rect(g, 172, 40, 68, 56, '#fffaf0'));
      rect(g, 176, 52, 60, 40, '#eef5ea', { line: 1 });
      text(g, 'PLANTA DE EMERGÊNCIA', 206, 46, { size: 4, color: '#2e9b5b', outline: null });
      const pts = [182, 86, 196, 86, 196, 62, 214, 62, 214, 80, 230, 80, 230, 58];
      g.setLineDash([2, 2]); line(g, pts, '#2e9b5b', 1.5); g.setLineDash([]);
      [[196, 76], [204, 62], [214, 72], [222, 80]].forEach(([x, y], i) => rect(g, x - 3, y - 3, 6, 6, ROUTE_HEX[ROUTE[i]], { line: 1 }));
      circle(g, 182, 86, 2.5, '#e2231a', { line: 1 });
      rect(g, 225, 54, 10, 6, '#2e9b5b', { line: 1 });
    },
    inspect: {
      easy: 'Planta de Emergência. A dashed escape route runs from VOCÊ ESTÁ AQUI to SAÍDA, through a green door, then an orange one, then blue, then purple.',
      hard: 'Planta de Emergência. A dashed route winds from VOCÊ ESTÁ AQUI to SAÍDA, past little coloured doors: green, orange, blue, purple.',
    },
  },
  {
    id: 'gabinete', name: 'Gabinete 2.14', rect: [252, 52, 56, 148],
    draw(g) {
      doorArt(g, 256, 66, 48, 132, '#a0785a', 'GAB. 2.14');
      rect(g, 266, 120, 28, 18, '#ffd45e', { line: 1 });
      line(g, [270, 126, 290, 126], OUT, 1);
      line(g, [270, 131, 284, 131], OUT, 1);
    },
    inspect: 'Prof.ª Ramos\' office. A note on the door: "PROJETOS: entrega no CLIP até às 23:59. SEM EXCEÇÕES. (Sim, isto é contigo.)"',
  },
  {
    id: 'vending', name: 'Vending Machine', rect: [318, 56, 64, 144],
    draw(g, s) {
      dropShadow(g, g => rrect(g, 320, 58, 60, 140, 4, '#c8553d'));
      rect(g, 326, 66, 40, 92, '#1b1e26', { line: 1.5 });
      const snacks = ['#f2b632', '#4bc292', '#2f8cff', '#fe5f55', '#a46cf0'];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
        const x = 330 + c * 12, y = 72 + r * 22;
        line(g, [x, y + 14, x + 10, y + 14], '#9aa3ad', 1.5);
        const gone = r === 2 && c === 1 && s.flags.penGot;
        if (!gone) rect(g, x + 1, y + 2, 8, 12, r === 2 && c === 1 ? '#e8d4a8' : snacks[(r * 3 + c) % 5], { line: 1 });
      }
      if (!s.flags.penGot) penArt(g, 340, 98, false);
      rect(g, 370, 70, 6, 30, '#3b3e48', { line: 1 });
      rect(g, 370, 108, 6, 6, '#c9d3dc', { line: 1 });
      rect(g, 326, 166, 40, 16, '#0f1116', { line: 1.5 });
    },
    inspect: s => (s.flags.penGot ? 'Crisps, chocolate, and an empty spiral where the biscuits were.' : {
      easy: "Someone's pen drive is wedged in a spiral, right behind a pack of Bolachas Maria (€1). Buy the biscuits and the pen drive should fall with them.",
      hard: 'Crisps, chocolate, Bolachas Maria (€1). Something small and blue is wedged in the same spiral as the biscuits.',
    }),
    uses: { coin: { when: not('penGot'), take: 'coin', give: ['bolachas', 'pen'], set: 'penGot', say: 'Clunk! The Bolachas Maria drop, and the pen drive tumbles down with them.' } },
  },
  {
    id: 'exitdoor', name: s => (s.flags.exitOpen ? 'To the Campus' : 'Saída'), rect: [392, 30, 84, 170],
    draw(g, s) {
      rrect(g, 404, 34, 52, 14, 3, '#2e9b5b');
      text(g, 'SAÍDA', 430, 41, { size: 7, color: '#fff' });
      dropShadow(g, g => rect(g, 398, 54, 64, 144, '#9aa3ad'));
      if (s.flags.exitOpen) {
        rect(g, 402, 58, 56, 140, '#0b1730', { line: 1.5 });
        circle(g, 440, 80, 1.5, '#fffaf0', { line: 0 });
        poly(g, [402, 58, 414, 62, 414, 194, 402, 198], '#bfe3f2');
      } else {
        rect(g, 402, 58, 27, 140, '#bfe3f2', { line: 1.5 });
        rect(g, 431, 58, 27, 140, '#bfe3f2', { line: 1.5 });
        rect(g, 404, 120, 52, 5, '#c9d3dc', { line: 1 });
      }
      rect(g, 464, 100, 12, 32, '#3b3e48', { line: 1.5 });
      ['red', 'green', 'orange', 'blue', 'purple', 'yellow'].forEach((c, i) => circle(g, 467 + (i % 2) * 6, 106 + Math.floor(i / 2) * 7, 2, { red: '#fe5f55', yellow: '#ffd23f', ...ROUTE_HEX }[c], { line: 0.8 }));
      circle(g, 470, 128, 1.8, s.flags.exitOpen ? '#4bc292' : '#e2231a', { line: 0.8 });
    },
    lock: {
      type: 'colors', length: 4, answer: ROUTE,
      prompt: {
        easy: 'The night exit. After 23:00 it only opens with the evacuation-route code: press the colours of the escape route, in order.',
        hard: 'The night exit. A panel of coloured buttons and four empty lights.',
      },
      onSolve: { set: 'exitOpen', say: 'Bip bip bip bip! The door clicks open, and cold air from the Caparica coast rushes in.', fx: 'sparkle' },
    },
    go: { to: 'campus', when: f('exitOpen') },
  },
];

// ---------------------------------------------------------------- campus

function drawCampus(g, s, t) {
  nightSky(g, t, 190);
  circle(g, 70, 30, 11, '#fff4c2');
  // Lisbon across the river: the bridge's red towers on the horizon
  rect(g, 0, 150, W, 40, '#1b2b4d', { line: 0 });
  for (let i = 0; i < 40; i++) rect(g, (i * 53) % W, 156 + (i * 7) % 20, 2, 2, '#ffd45e', { line: 0, alpha: 0.7 });
  for (const x of [412, 456]) rect(g, x, 110, 3, 40, '#c8553d', { line: 0 });
  line(g, [384, 134, 413, 112, 434, 130, 457, 112, 480, 132], '#c8553d', 1);
  line(g, [384, 134, 480, 134], '#c8553d', 1.5);
  // lawn and path
  rect(g, 0, 190, W, 80, '#3f7f3a', { line: 0 });
  line(g, [0, 190, W, 190]);
  poly(g, [60, 270, 120, 202, 380, 202, 470, 270], '#c9c4b5', { line: 1.5 });
  for (let i = 0; i < 30; i++) line(g, [(i * 61) % W, 210 + (i * 23) % 56, (i * 61) % W + 2, 206 + (i * 23) % 56], '#5fa055', 1);
  // lamp posts
  for (const x of [110, 384]) {
    line(g, [x, 202, x, 150], '#2a2d36', 3);
    circle(g, x, 148, 5, '#fff4c2');
    circle(g, x, 148, 12, '#fff4c2', { line: 0, alpha: 0.15 });
  }
}

const CAMPUS_HOTSPOTS = [
  {
    id: 'ed2', name: 'Edifício II', rect: [4, 60, 92, 142],
    draw(g) {
      dropShadow(g, g => rect(g, 0, 62, 94, 140, '#a9a39a'));
      for (let y = 72; y < 150; y += 22) for (let x = 6; x < 90; x += 20) rect(g, x, y, 14, 14, (x + y) % 3 ? '#33406b' : '#ffd45e', { line: 1 });
      text(g, 'EDIFÍCIO II', 47, 158, { size: 7, color: '#fffaf0' });
      rect(g, 30, 166, 36, 36, '#bfe3f2', { line: 1.5 });
    },
    go: { to: 'corredor' },
  },
  {
    id: 'biblioteca', name: 'Biblioteca', rect: [130, 52, 150, 150],
    draw(g, s) {
      dropShadow(g, g => rect(g, 130, 54, 150, 148, '#e8e6e1'));
      for (let i = 0; i < 9; i++) rect(g, 136 + i * 16, 62, 12, 70, '#ffd45e', { line: 1, alpha: 0.9 });
      rect(g, 128, 136, 154, 6, '#9aa3ad');
      text(g, 'BIBLIOTECA', 205, 150, { size: 9, color: NAVY, outline: '#fff' });
      rect(g, 186, 160, 38, 42, '#bfe3f2', { line: 1.5 });
      line(g, [205, 160, 205, 202], OUT, 1.5);
      rect(g, 228, 172, 8, 12, '#3b3e48', { line: 1 });
      circle(g, 232, 176, 1.8, s.flags.libOpen ? '#4bc292' : '#e2231a', { line: 0 });
    },
    inspect: s => (s.flags.libOpen ? '' : {
      easy: "The Biblioteca. Its 24-hour study room is lit, but at night the door only opens with a student card. Yours isn't in your wallet... did you lose it today?",
      hard: "The Biblioteca's night entrance. A card reader blinks red.",
    }),
    uses: { card: { when: not('libOpen'), set: 'libOpen', say: 'Bip. The reader turns green: Sala de Estudo 24h. Welcome back.' } },
    go: { to: 'biblioteca', when: f('libOpen') },
  },
  {
    id: 'bar', name: 'Bar da AE', rect: [292, 100, 86, 102],
    draw(g, s, t) {
      dropShadow(g, g => rect(g, 294, 112, 82, 90, '#c8553d'));
      rrect(g, 300, 102, 70, 16, 3, NAVY);
      text(g, 'BAR DA AE', 335, 110, { size: 7, color: '#ffd45e' });
      rect(g, 302, 128, 30, 26, '#ffd45e', { line: 1.5 });
      rect(g, 340, 136, 26, 66, '#7a4024', { line: 1.5 });
      for (let i = 0; i < 6; i++) circle(g, 298 + i * 14, 122 + Math.sin(i) * 2, 2.2, (t * 2 + i) % 3 < 2 ? '#ffd45e' : '#ff9a00', { line: 0.8 });
      text(g, '♪', 318 + Math.sin(t * 3) * 3, 96 - (t % 1) * 6, { size: 6, color: '#fffaf0' });
    },
    go: { to: 'bar' },
  },
  {
    id: 'toportaria', name: 'Portaria · MST', rect: [400, 136, 76, 66],
    draw(g) {
      line(g, [436, 202, 436, 146], '#2a2d36', 2.5);
      poly(g, [412, 146, 466, 146, 474, 154, 466, 162, 412, 162], '#2e9b5b', { line: 1.5 });
      text(g, 'PORTARIA · MST', 440, 154, { size: 5, color: '#fff', outline: null });
    },
    go: { to: 'portaria' },
  },
];

// ---------------------------------------------------------------- bar da AE

function drawBar(g) {
  rect(g, 0, 0, W, 196, '#7a3b2e', { line: 0 });
  for (let x = 0; x < W; x += 24) rect(g, x, 0, 12, 196, '#82443a', { line: 0 });
  rect(g, 0, 196, W, 74, '#5a3a28', { line: 0 });
  for (let y = 206; y < 270; y += 14) line(g, [0, y, W, y], '#4a2e20', 1);
  line(g, [0, 196, W, 196]);
  // shelves of bottles behind the counter
  rect(g, 160, 50, 160, 5, '#3b2418');
  for (let i = 0; i < 10; i++) rrect(g, 166 + i * 15, 32, 9, 18, [3, 3, 0, 0], ['#4bc292', '#c8553d', '#f2b632', '#9ec7d9'][i % 4], { line: 1 });
  // tables
  for (const x of [60, 400]) {
    dropShadow(g, g => { ellipse(g, x, 214, 30, 7, '#c99a63'); rect(g, x - 3, 214, 6, 30, '#3b2418'); });
    rrect(g, x - 12, 200, 7, 12, 2, '#ffd45e', { line: 1 });
  }
}

const BAR_HOTSPOTS = [
  {
    id: 'barout', name: 'Campus', rect: [4, 70, 40, 126],
    draw: g => doorArt(g, 6, 84, 36, 112, '#5a3218', 'SAÍDA'),
    go: { to: 'campus' },
  },
  {
    id: 'tv', name: 'TV', rect: [56, 28, 74, 50],
    draw(g, s, t) {
      rect(g, 58, 30, 70, 44, '#1b1e26', { line: 2 });
      rect(g, 62, 34, 62, 36, '#2d4a8a', { line: 0 });
      for (let i = 0; i < 4; i++) {
        const x = 72 + i * 14, y = 58 + Math.sin(t * 4 + i) * 2;
        poly(g, [x - 5, y + 10, x + 5, y + 10, x + 3, y - 2, x - 3, y - 2], '#14161c', { line: 0.8 });
        circle(g, x, y - 5, 3.5, '#f1c9a5', { line: 0.8 });
      }
    },
    inspect: 'The TV shows a Tuna festival: students in black capes playing guitars and tambourines, very loudly, on mute.',
  },
  {
    id: 'to', name: 'Tó', rect: [196, 60, 72, 92],
    draw(g, s, t) {
      body(g, 232, 104, '#2a2d36', 30);
      head(g, 232, 92, { skin: '#d9a07a', hair: '#1b1b1b' });
      ellipse(g, 232, 104, 8, 3, '#1b1b1b', { line: 1 });
      const k = Math.sin(t * 3) * 3;
      rect(g, 248 + k, 128, 10, 12, '#fffaf0', { line: 1 });
      dropShadow(g, g => rect(g, 150, 140, 180, 56, '#4a2e20'));
      rect(g, 146, 134, 188, 8, '#c99a63');
      for (let i = 0; i < 3; i++) { rect(g, 168 + i * 10, 116, 4, 18, '#c9d3dc', { line: 1 }); circle(g, 170 + i * 10, 114, 3, '#2a2d36', { line: 1 }); }
    },
    inspect: s => (s.flags.coinGot ? '"Fechamos à meia-noite! Go, go, go. Boa sorte com o projeto!"' : ''),
    click: {
      when: not('coinGot'), set: 'coinGot', give: 'coin',
      say: {
        easy: '"Ah, you\'re Rita\'s groupmate! She left you this: \'for the vending machine, the coffee here is off\'." Tó slides a €1 coin across the counter.',
        hard: '"You\'re Rita\'s groupmate? She left you this." Tó slides a €1 coin across the counter.',
      },
    },
  },
  {
    id: 'cartaz', name: 'Poster', rect: [372, 30, 80, 70],
    draw(g) {
      rect(g, 374, 32, 76, 66, '#ffd45e', { line: 1.5 });
      text(g, 'JANTAR', 412, 46, { size: 9, color: '#c8553d' });
      text(g, 'DE CURSO', 412, 60, { size: 9, color: '#c8553d' });
      text(g, 'sexta · 20h', 412, 76, { size: 6, color: OUT, outline: null });
      star(g, 438, 88, 5, 2, 5, '#c8553d', { line: 1 });
    },
    inspect: 'JANTAR DE CURSO: sexta, 20h. Bitoque, imperial e Tuna. Inscrições no bar.',
  },
];

// ---------------------------------------------------------------- portaria & MST

function drawPortaria(g, s, t) {
  nightSky(g, t, 196);
  rect(g, 0, 196, W, 74, '#5d6066', { line: 0 });
  line(g, [0, 196, W, 196]);
  for (const y of [214, 226]) line(g, [0, y, W, y], '#9aa3ad', 2);
  for (let x = 0; x < W; x += 12) line(g, [x, 210, x + 4, 230], '#3b3e48', 2);
  // the last tram glides past now and then
  const x = ((t * 60) % 1600) - 300;
  if (x > -200 && x < W + 10) {
    dropShadow(g, g => rrect(g, x, 150, 180, 62, [10, 10, 2, 2], '#f4f4f0'));
    rect(g, x, 196, 180, 6, '#2e9b5b', { line: 1 });
    for (let i = 0; i < 6; i++) rect(g, x + 10 + i * 28, 160, 20, 22, '#33406b', { line: 1 });
    line(g, [x + 90, 150, x + 100, 120, x + 120, 120], OUT, 1.5);
  }
  line(g, [0, 120, W, 120], '#2a2d36', 1);
}

const PORT_HOTSPOTS = [
  {
    id: 'portback', name: 'Campus', rect: [4, 140, 60, 60],
    draw(g) {
      line(g, [30, 200, 30, 150], '#2a2d36', 2.5);
      poly(g, [8, 146, 52, 146, 52, 162, 8, 162, 2, 154], '#2e9b5b', { line: 1.5 });
      text(g, 'CAMPUS', 28, 154, { size: 5, color: '#fff', outline: null });
    },
    go: { to: 'campus' },
  },
  {
    id: 'armando', name: 'Sr. Armando', rect: [80, 60, 110, 138],
    draw(g, s, t) {
      dropShadow(g, g => rect(g, 84, 70, 102, 128, '#e8e6e1'));
      rect(g, 80, 62, 110, 10, NAVY, { line: 1.5 });
      text(g, 'SEGURANÇA', 135, 67, { size: 6, color: '#fff', outline: null });
      rect(g, 94, 84, 82, 54, '#ffe9a8', { line: 1.5 });
      body(g, 132, 112, NAVY, 28);
      head(g, 132, 102, { skin: '#e3b28d', hair: '#8a8f99', moustache: true, cap: NAVY });
      if (!s.flags.armandoFed) text(g, 'grrr', 160 + Math.sin(t * 6), 96, { size: 5, color: '#c8553d', outline: null });
      rect(g, 94, 138, 82, 6, '#9aa3ad', { line: 1 });
      rect(g, 104, 128, 22, 10, '#fffaf0', { line: 1 });
      // barrier
      rect(g, 186, 168, 8, 30, '#3b3e48', { line: 1 });
      for (let i = 0; i < 6; i++) rect(g, 194 + i * 14, 170, 14, 5, i % 2 ? '#fffaf0' : '#e2231a', { line: 1 });
    },
    inspect: s => (s.flags.cardGot ? '"Boa sorte com o projeto, menino. And don\'t lose that card again!"' : {
      easy: '"Perdidos e achados? At this hour? I haven\'t eaten since lunch, I can\'t think on an empty stomach." His stomach growls.',
      hard: 'Sr. Armando, the night guard, glares at his crossword. His stomach growls.',
    }),
    uses: {
      bolachas: {
        when: not('armandoFed'), take: 'bolachas', set: 'armandoFed',
        say: {
          easy: '"Bolachas Maria! You\'re a saint." Crunch. "Right. Somebody handed in a student card this afternoon. If it\'s yours, tell me the number on it."',
          hard: '"Bolachas Maria! You\'re a saint." Crunch. "Lost something? Prove it\'s yours."',
        },
      },
    },
    lock: {
      type: 'digits', length: 5, answer: STUDENT_NO, when: f('armandoFed'),
      prompt: {
        easy: 'Sr. Armando holds up a student card with his thumb over the number. "What\'s your student number?" (Your laptop knows it.)',
        hard: 'Sr. Armando holds up a student card, his thumb over the number. "Well?"',
      },
      onSolve: { set: 'cardGot', give: 'card', say: `"${STUDENT_NO}, it is." Sr. Armando hands over your student card.`, sfx: 'pick' },
    },
  },
  {
    id: 'paragem', name: 'Paragem Universidade', rect: [300, 70, 120, 128],
    draw(g) {
      rect(g, 304, 82, 4, 116, '#2a2d36', { line: 1 });
      rect(g, 412, 82, 4, 116, '#2a2d36', { line: 1 });
      rect(g, 298, 76, 124, 8, '#2e9b5b');
      rect(g, 310, 90, 100, 20, '#1b1e26', { line: 1.5 });
      text(g, 'CACILHAS  00:30', 360, 100, { size: 6, color: '#ffb02e', outline: null });
      rrect(g, 330, 168, 60, 10, 3, '#9aa3ad');
      for (const x of [336, 372]) line(g, [x, 178, x, 196], '#3b3e48', 2);
    },
    inspect: 'Paragem Universidade. The board says the last MST to Cacilhas leaves at 00:30. From there, the cacilheiro across the river. Plenty of time... if the project gets in.',
  },
];

// ---------------------------------------------------------------- biblioteca

// Rita's books on the trolley, shuffled. Shelved by call number they spell NOVA.
const BOOKS = [
  { title: 'Átomos e Partículas', cota: '530.1', color: '#c8553d' },
  { title: 'Nuvens e Sistemas Distribuídos', cota: '004.2', color: '#2f8cff' },
  { title: 'Variáveis Aleatórias', cota: '519.2', color: '#f2b632' },
  { title: 'Ordenação e Algoritmos', cota: '005.1', color: '#4bc292' },
].map((b, i) => ({ ...b, id: 'book' + i, x: 50 + i * 18 }));

function drawBiblioteca(g) {
  rect(g, 0, 0, W, 196, '#efe6d2', { line: 0 });
  // tall shelves
  for (const x of [0, 380]) {
    rect(g, x, 10, 100, 186, '#8a5a3a', { line: 1.5 });
    for (let y = 16; y < 190; y += 30) {
      rect(g, x + 4, y + 24, 92, 4, '#6a4028', { line: 0 });
      for (let k = 0; k < 11; k++) rect(g, x + 6 + k * 8, y + 4 + (k * 7) % 6, 7, 20 - (k * 7) % 6, ['#c8553d', '#2456a6', '#4bc292', '#f2b632', '#a46cf0'][(k + y) % 5], { line: 0.8 });
    }
  }
  text(g, 'SALA DE ESTUDO 24H', 240, 22, { size: 10, color: NAVY, outline: '#fff' });
  rect(g, 0, 196, W, 74, '#8a6a4a', { line: 0 });
  line(g, [0, 196, W, 196]);
  // long table with lamps
  dropShadow(g, g => rect(g, 150, 178, 260, 10, '#c99a63'));
  for (const x of [170, 380]) rect(g, x, 188, 8, 40, '#6a4028');
}

const LIB_HOTSPOTS = [
  {
    id: 'libout', name: 'Campus', rect: [104, 66, 40, 112],
    draw: g => doorArt(g, 106, 80, 36, 98, '#7a8fa6', 'SAÍDA'),
    go: { to: 'campus' },
  },
  {
    id: 'trolley', name: 'Book Trolley', rect: [36, 156, 92, 60],
    draw(g) {
      rect(g, 40, 166, 84, 6, '#9aa3ad', { line: 1.5 });
      rect(g, 40, 196, 84, 6, '#9aa3ad', { line: 1.5 });
      line(g, [42, 172, 42, 214], OUT, 2);
      line(g, [122, 172, 122, 214], OUT, 2);
      for (const x of [46, 118]) circle(g, x, 216, 4, '#3b3e48', { line: 1 });
      rect(g, 98, 140, 22, 26, '#fffaf0', { line: 1 });
      text(g, 'DEVOLVER', 109, 150, { size: 4, color: OUT, outline: null });
    },
    inspect: 'A returns trolley. A slip on it says: "Reservado: Rita S., Grupo 7. Por favor não arrumar!"',
  },
  ...BOOKS.map(b => ({
    id: b.id, name: 'Book', rect: [b.x, 130, 16, 36],
    draw(g) {
      rect(g, b.x, 132, 15, 34, b.color, { line: 1.5 });
      text(g, b.title[0].normalize('NFD')[0], b.x + 7.5, 142, { size: 8, color: '#fffaf0' });
      rect(g, b.x + 2, 154, 11, 8, '#fffaf0', { line: 0.8 });
      text(g, b.cota.slice(0, 3), b.x + 7.5, 158, { size: 4, color: OUT, outline: null });
    },
    inspect: `"${b.title}". The label on the spine: ${b.cota}.`,
  })),
  {
    id: 'pc', name: s => (s.flags['solved:pc'] ? 'CLIP' : 'Library PC'), rect: [196, 128, 64, 52],
    draw(g, s, t) {
      rect(g, 200, 132, 56, 40, '#2a2d36', { line: 1.5 });
      rect(g, 204, 136, 48, 32, s.flags.submitted ? '#2e9b5b' : '#1f6fb2', { line: 0 });
      text(g, s.flags.submitted ? 'ENTREGUE' : 'CLIP', 228, 150, { size: 6, color: '#fffaf0', outline: null });
      rect(g, 222, 172, 12, 6, '#2a2d36', { line: 1 });
      if (!s.flags['solved:pc']) { rect(g, 244, 126, 14, 12, '#ffd45e', { line: 1 }); line(g, [247, 131, 255, 131], OUT, 0.8); }
      if (s.flags['solved:pc'] && !s.flags.submitted && t % 1 < 0.5) rect(g, 214, 158, 28, 4, '#fffaf0', { line: 0 });
    },
    inspect: s => (s.flags.submitted ? 'ENTREGA RECEBIDA. Projeto Final, Grupo 7, 23:58.'
      : 'CLIP, logged in as Grupo 7. "Projeto Final: submeter ficheiro". A USB port blinks under the screen.'),
    lock: {
      type: 'letters', length: 4, answer: 'NOVA',
      prompt: {
        easy: 'CLIP login, Grupo 7. Rita\'s post-it on the screen: "Group password = the first letters of the books I left on the trolley, put back in shelf order (by call number)!"',
        hard: 'CLIP login, Grupo 7. A post-it in Rita\'s handwriting: "pass: put my books back where they belong ;)"',
      },
      onSolve: { say: '"Bem-vindo, Grupo 7." The project page loads. 23:56.', sfx: 'good' },
    },
    uses: {
      penFull: {
        when: f('solved:pc'), take: 'penFull', set: 'submitted', win: true, fx: 'confetti', sfx: 'win',
        say: 'You upload projeto.zip and click SUBMETER at 23:58. "Entrega recebida." The 24h room gives you a sleepy round of applause. Now run for the last MST: you escaped NOVA FCT!',
      },
    },
  },
  {
    id: 'sleeper', name: 'Student', rect: [300, 140, 70, 40],
    draw(g, s, t) {
      rect(g, 320, 166, 36, 12, '#fffaf0', { line: 1 });
      rect(g, 322, 160, 32, 6, '#9ec7d9', { line: 1 });
      ellipse(g, 330, 168, 14, 7, '#4b3a6b');
      head(g, 342, 158, { skin: '#f1c9a5', hair: '#6a3b20' });
      const z = t % 2;
      text(g, 'z', 352 + z * 3, 146 - z * 6, { size: 6 + z * 2, color: NAVY, outline: '#fff' });
      circle(g, 300, 150, 9, '#ffd45e', { line: 0, alpha: 0.25 });
      line(g, [300, 178, 300, 154, 308, 146], '#2a2d36', 2);
    },
    inspect: 'Someone asleep on a pile of Cálculo II notes. Época de exames does this to people.',
  },
];

// ---------------------------------------------------------------- level

export default {
  id: 'nova',
  title: 'NOVA FCT',
  subtitle: 'Entrega à Meia-Noite',
  blurb: "23:20 on the Caparica campus. Your laptop is dead, the building is locked, and your group's project is due on CLIP at midnight.",
  palette: [NAVY, '#e94f37', '#7bc96f'],
  start: 'lab',
  intro: {
    easy: "23:20. Lab 1.07, Edifício II, NOVA FCT. Your laptop just died, your group's project is due on CLIP at midnight, and the building locked itself at 23:00. Get the project in, then get out of Caparica!",
    hard: '23:20. Lab 1.07. Your laptop is dead. The project is due at midnight.',
  },

  items: {
    charger: {
      name: 'USB-C Charger', desc: { easy: "Rita's spare charger. She'll never know.", hard: "Rita's spare charger." },
      draw(g) {
        rrect(g, 6, 8, 14, 16, 3, '#fffaf0', { line: 1.5 });
        line(g, [20, 16, 26, 16, 26, 26, 14, 28], '#fffaf0', 2.5);
        rect(g, 10, 4, 2, 5, '#c9d3dc', { line: 0.8 });
        rect(g, 14, 4, 2, 5, '#c9d3dc', { line: 0.8 });
      },
    },
    coin: {
      name: '€1 Coin', desc: { easy: 'From Rita, via Tó. "For the vending machine."', hard: 'From Rita, via Tó.' },
      draw(g) {
        circle(g, 16, 16, 11, '#f2b632', { line: 1.5 });
        circle(g, 16, 16, 7, '#c9d3dc', { line: 1 });
        text(g, '1', 16, 16, { size: 8, color: OUT, outline: null });
      },
    },
    pen: { name: 'Pen Drive', desc: 'A blue 16 GB pen drive, slightly sticky from the vending machine. Empty.', draw: g => penArt(g, 4, 12, false) },
    penFull: { name: 'Pen (projeto.zip)', desc: { easy: 'Your whole project. Now find a computer with a connection.', hard: 'Your whole project.' }, draw: g => penArt(g, 4, 12, true) },
    bolachas: {
      name: 'Bolachas Maria', desc: 'The most Portuguese biscuit there is. Goes with everything, especially coffee.',
      draw(g) {
        rrect(g, 4, 10, 24, 14, 3, '#e8d4a8', { line: 1.5 });
        rect(g, 4, 14, 24, 6, '#c8553d', { line: 1 });
        circle(g, 16, 17, 4, '#f2c98a', { line: 1 });
      },
    },
    card: {
      name: 'Cartão de Estudante', desc: `Your NOVA student card. Aluno ${STUDENT_NO}. Opens doors, pays for lunch at the cantina.`,
      draw(g) {
        rrect(g, 3, 8, 26, 17, 3, '#fffaf0', { line: 1.5 });
        rect(g, 3, 8, 26, 5, NAVY, { line: 1 });
        rect(g, 6, 15, 7, 8, '#9ec7d9', { line: 1 });
        line(g, [16, 17, 26, 17], '#9aa3ad', 1);
        line(g, [16, 21, 24, 21], '#9aa3ad', 1);
      },
    },
  },

  scenes: {
    lab: { name: 'Lab 1.07', draw: drawLab, hotspots: LAB_HOTSPOTS },
    corredor: { name: 'Corredor', draw: drawCorredor, hotspots: COR_HOTSPOTS },
    campus: { name: 'Campus', draw: drawCampus, hotspots: CAMPUS_HOTSPOTS, open: f('exitOpen') },
    bar: { name: 'Bar da AE', draw: drawBar, hotspots: BAR_HOTSPOTS, open: f('exitOpen') },
    portaria: { name: 'Portaria', draw: drawPortaria, hotspots: PORT_HOTSPOTS, open: f('exitOpen') },
    biblioteca: { name: 'Biblioteca', draw: drawBiblioteca, hotspots: LIB_HOTSPOTS, open: f('libOpen') },
  },

  hints: [
    { done: f('lockerOpen'), text: ['The whiteboard has a leftover exercise, and Rita signed it.', 'Binary to decimal: 101 = 5, 1000 = 8, 11 = 3. Rita\'s cacifo (the R sticker) opens with 583.'] },
    { done: f('laptopOn'), text: ['A dead laptop wants one thing.', 'Hold the USB-C charger and tap your laptop.'] },
    { done: f('exitOpen'), text: ['The night exit wants colours. The corridor has a map of how to get out.', 'Follow the escape route on the Planta de Emergência: green, orange, blue, purple.'] },
    { done: f('coinGot'), text: ['Someone on campus is still awake and serving.', 'Talk to Tó at the Bar da AE. Rita left you something.'] },
    { done: f('penGot'), text: ['The vending machine has more than biscuits in it.', 'Use the €1 coin on the vending machine in the corridor.'] },
    { done: f('penFull'), text: ['The project needs to leave your laptop somehow.', 'Hold the pen drive and tap your laptop.'] },
    { done: f('armandoFed'), text: ['Sr. Armando at the Portaria is too hungry to help anyone.', 'Give him the Bolachas Maria.'] },
    { done: f('cardGot'), text: ["He wants proof the card is yours. Your laptop's CLIP screen remembers you.", `Your student number is ${STUDENT_NO}.`] },
    { done: f('libOpen'), text: ['The Biblioteca opens at night for students only.', 'Hold your student card and tap the Biblioteca door.'] },
    { done: f('solved:pc'), text: ["Rita's books on the trolley are out of order. Libraries sort by call number.", '004.2 Nuvens, 005.1 Ordenação, 519.2 Variáveis, 530.1 Átomos: NOVA.'] },
    { done: s => !!s.wonAt, text: ['CLIP is waiting for a file.', 'Hold the pen with projeto.zip and tap the library PC.'] },
  ],
};
