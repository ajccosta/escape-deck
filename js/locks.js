// Lock types. A new kind of lock is one entry in LOCK_TYPES (and, if it needs a
// new kind of input, one entry in INPUTS).

import { el } from './dom.js';
import { sfx } from './sfx.js';

export const COLORS = {
  red: '#fe5f55', yellow: '#ffd23f', blue: '#2f8cff',
  green: '#4bc292', purple: '#a46cf0', orange: '#ff9a00',
};

// `keyboard` (an inputmode) lets phone players type the answer: tapping an
// element marked .type-here brings up the on-screen keyboard.
export const LOCK_TYPES = {
  digits: { input: 'wheels', symbols: [...'0123456789'], sep: '', keyboard: 'numeric' },
  letters: { input: 'wheels', symbols: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'], sep: '', keyboard: 'text' },
  colors: { input: 'palette', symbols: Object.keys(COLORS), sep: ' ' },
};

const norm = a => (Array.isArray(a) ? a : [...String(a)]).map(x => String(x).toUpperCase()).join(',');
export const sameAnswer = (a, b) => norm(a) === norm(b);
export const formatAnswer = (lock, a) => a.map(x => String(x).toUpperCase()).join(LOCK_TYPES[lock.type].sep);

// Each input builder returns { el, value(): string[] | null, key(e): bool }.
const INPUTS = {
  wheels(type, lock) {
    const n = type.symbols.length;
    const vals = Array(lock.length).fill(0);
    let cur = 0;
    const boxes = [];
    const render = () => boxes.forEach((b, i) => {
      b.textContent = type.symbols[vals[i]];
      b.classList.toggle('cur', i === cur);
    });
    const step = (i, d) => { vals[i] = (vals[i] + d + n) % n; cur = i; render(); sfx('click'); };
    const wrap = el('div', { class: 'wheels' }, vals.map((_, i) => {
      const box = el('div', { class: 'wheel-val type-here', onclick: () => { cur = i; render(); } });
      boxes.push(box);
      return el('div', { class: 'wheel' },
        el('button', { class: 'btn tiny', onclick: () => step(i, 1) }, '▲'),
        box,
        el('button', { class: 'btn tiny', onclick: () => step(i, -1) }, '▼'));
    }));
    render();
    return {
      el: wrap,
      value: () => vals.map(v => type.symbols[v]),
      key(e) {
        const idx = type.symbols.indexOf(e.key.toUpperCase());
        if (idx >= 0) { vals[cur] = idx; cur = Math.min(cur + 1, lock.length - 1); render(); sfx('click'); return true; }
        const moves = { ArrowUp: () => step(cur, 1), ArrowDown: () => step(cur, -1),
          ArrowLeft: () => { cur = Math.max(0, cur - 1); render(); },
          ArrowRight: () => { cur = Math.min(lock.length - 1, cur + 1); render(); },
          Backspace: () => { cur = Math.max(0, cur - 1); render(); } };
        if (moves[e.key]) { moves[e.key](); return true; }
        return false;
      },
    };
  },

  palette(type, lock) {
    const vals = [];
    const slots = el('div', { class: 'slots' });
    const render = () => slots.replaceChildren(...Array.from({ length: lock.length }, (_, i) =>
      el('div', {
        class: 'slot' + (vals[i] ? ' filled' : ''),
        style: vals[i] ? `--c:${COLORS[vals[i]]}` : '',
        onclick: () => { vals.splice(i, 1); render(); sfx('click'); },
      })));
    const add = c => { if (vals.length < lock.length) { vals.push(c); render(); sfx('click'); } };
    const palette = el('div', { class: 'palette' }, type.symbols.map((c, i) =>
      el('button', { class: 'swatch', title: `${c} (${i + 1})`, style: `--c:${COLORS[c]}`, onclick: () => add(c) })));
    render();
    return {
      el: el('div', { class: 'palette-lock' }, slots, palette,
        el('div', { class: 'hint-line' }, 'Tap a slot to remove it')),
      value: () => (vals.length === lock.length ? vals.slice() : null),
      key(e) {
        const i = Number(e.key) - 1;
        if (i >= 0 && i < type.symbols.length) { add(type.symbols[i]); return true; }
        if (e.key === 'Backspace') { vals.pop(); render(); return true; }
        return false;
      },
    };
  },
};

// Phone keyboards often send no usable keydown, so read what lands in a hidden
// field instead. It always holds one space, so a backspace is still noticed.
function withKeyboard(input, mode) {
  const keys = el('input', {
    class: 'lock-keys', inputmode: mode, enterkeyhint: 'go', autocomplete: 'off',
    autocorrect: 'off', autocapitalize: 'characters', spellcheck: 'false', 'aria-label': 'Type the code',
  });
  const reset = () => { keys.value = ' '; };
  keys.addEventListener('input', () => {
    if (!keys.value) input.key({ key: 'Backspace' });
    else for (const ch of keys.value.slice(1)) input.key({ key: ch });
    reset();
  });
  reset();
  const wrap = el('div', {
    class: 'lock-wrap',
    onclick: e => { if (e.target.closest('.type-here')) keys.focus({ preventScroll: true }); },
  }, input.el, keys);
  return { ...input, el: wrap };
}

export function buildLock(lock) {
  const type = LOCK_TYPES[lock.type];
  const input = INPUTS[type.input](type, lock);
  return type.keyboard ? withKeyboard(input, type.keyboard) : input;
}
