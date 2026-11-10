// Tiny DOM helpers shared by every UI module.

export const $ = (sel, root = document) => root.querySelector(sel);

export function el(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'style') e.style.cssText = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const k of kids.flat()) {
    if (k == null || k === false) continue;
    e.append(k.nodeType ? k : document.createTextNode(k));
  }
  return e;
}

// Balatro-style bobbing letters.
export function jiggle(str, cls = '') {
  return el('span', { class: `jiggle ${cls}` },
    [...str].map((ch, i) => el('span', { style: `--i:${i}` }, ch === ' ' ? ' ' : ch)));
}

export function fmtTime(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
