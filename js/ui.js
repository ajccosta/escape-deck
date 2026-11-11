// DOM rendering: screens, modals, toasts, chat, inventory hand, HUD, lobby.

import { $, el, jiggle, fmtTime } from './dom.js';
import { buildLock } from './locks.js';
import { MAX_PLAYERS, sceneOpen, val, mode } from './engine.js';
import { sfx } from './sfx.js';

// ---- screens
export let current = 'title';
export function show(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('hidden', s.id !== 'screen-' + name));
  current = name;
  const slot = { lobby: '#lobby-chat', game: '#game-chat' }[name];
  if (slot) $(slot).append($('#chat'));
  $('#chat').classList.toggle('hidden', !slot);
}

// ---- toasts
export function toast(text) {
  const t = el('div', { class: 'toast' }, text);
  $('#toasts').append(t);
  setTimeout(() => t.remove(), 3500);
}

// ---- modal
let modalState = null;
export function modal(kids, { onClose, onKey } = {}) {
  const card = $('#modal .modal-card');
  card.className = 'modal-card panel pop';
  card.replaceChildren(...kids);
  $('#modal').classList.remove('hidden');
  modalState = { onClose, onKey };
}
export function closeModal() {
  if (!modalState) return;
  const { onClose } = modalState;
  modalState = null;
  $('#modal').classList.add('hidden');
  onClose?.();
}
export const modalOpen = () => !!modalState;
export function shakeModal() {
  const card = $('#modal .modal-card');
  card.classList.remove('pop', 'shake');
  void card.offsetWidth;
  card.classList.add('shake');
}
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
addEventListener('keydown', e => {
  if (!modalState) return;
  if (e.key === 'Escape') return closeModal();
  if (document.activeElement?.tagName === 'INPUT' && !document.activeElement.classList.contains('lock-keys')) return;
  if (modalState.onKey?.(e)) e.preventDefault();
});

const btn = (label, cls, onclick) => el('button', { class: `btn ${cls}`, onclick }, label);

export function inspectModal(title, body, onShare) {
  modal([
    el('div', { class: 'm-title' }, title),
    el('div', { class: 'm-body' }, body),
    el('div', { class: 'm-btns' },
      onShare && btn('Share in chat', 'blue', () => { onShare(); closeModal(); }),
      btn('Close', '', closeModal)),
  ]);
}

// Returns a function to call with the host's verdict.
export function lockModal(title, prompt, lock, onTry, onClose) {
  const input = buildLock(lock);
  const tryIt = () => {
    const v = input.value();
    if (!v) return shakeModal();
    onTry(v);
  };
  modal([
    el('div', { class: 'm-title' }, title),
    prompt && el('div', { class: 'm-body' }, prompt),
    input.el,
    el('div', { class: 'm-btns' }, btn('Try it', 'green', tryIt), btn('Close', '', closeModal)),
  ], { onClose, onKey: e => (e.key === 'Enter' ? (tryIt(), true) : input.key(e)) });
}

export function winModal({ time, hints, wrong, players, isHost, onAgain, onTitle }) {
  modal([
    el('div', { class: 'win-title' }, jiggle('ESCAPED!')),
    el('div', { class: 'stats' },
      el('span', {}, 'Time'), el('span', { class: 'v' }, time),
      el('span', {}, 'Hints used'), el('span', { class: 'v red' }, String(hints)),
      el('span', {}, 'Wrong guesses'), el('span', { class: 'v red' }, String(wrong)),
      el('span', {}, 'Crew'), el('span', { class: 'v' }, players)),
    el('div', { class: 'm-btns' },
      isHost && btn('Play again', 'orange', onAgain),
      btn('Main menu', 'red', onTitle)),
  ]);
}

// ---- chat
let chatKey = '';
export function renderChat(s) {
  const key = s.chat.length + ':' + (s.chat.at(-1)?.at || 0);
  if (key === chatKey) return;
  chatKey = key;
  const log = $('#chat-log');
  const atBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 40;
  log.replaceChildren(...s.chat.map(m => MSG[m.kind](m)));
  if (atBottom) log.scrollTop = log.scrollHeight;
}
const MSG = {
  msg: m => el('div', { class: 'msg' }, el('span', { class: 'who', style: `--c:${m.color}` }, m.name), m.text),
  sys: m => el('div', { class: 'msg-sys' }, m.text),
  hint: m => el('div', { class: 'msg-hint' }, el('b', {}, `HINT (${m.name}): `), m.text),
  clue: m => el('div', { class: 'msg-clue', style: `--c:${m.color}` }, el('b', {}, m.title), m.text, el('br'), el('small', {}, `shared by ${m.name}`)),
};
export function initChat(onSend) {
  $('#chat-form').addEventListener('submit', e => {
    e.preventDefault();
    const i = $('#chat-input');
    if (i.value.trim()) onSend(i.value);
    i.value = '';
  });
}
export const resetChat = () => { chatKey = ''; };

// ---- inventory hand
let handKey = '';
export function renderHand(s, L, selected, onSelect) {
  const key = s.inventory.join() + '|' + selected;
  if (key === handKey) return;
  handKey = key;
  const n = s.inventory.length;
  const tips = mode(s).nudges;
  $('#hand-tip').textContent = selected ? `Holding ${L.items[selected].name}` + (tips ? ': tap something in the scene to use it' : '') : n && tips ? 'Tap a card to hold it' : '';
  $('#hand-desc').textContent = selected ? val(L.items[selected].desc, s) : '';
  if (!n) return $('#hand').replaceChildren(el('div', { class: 'hand-empty' }, 'Nothing yet. Go find something!'));
  $('#hand').replaceChildren(...s.inventory.map((id, i) => {
    const it = L.items[id];
    const art = el('canvas', { class: 'card-art', width: 32, height: 32 });
    it.draw(art.getContext('2d'));
    const inner = el('div', { class: 'card-inner', style: `--d:${i * -0.7}s` }, art, el('div', { class: 'card-name' }, it.name));
    const card = el('div', {
      class: 'card' + (id === selected ? ' selected' : ''),
      style: `--rot:${(i - (n - 1) / 2) * 4}deg`,
      onclick: () => { sfx('click'); onSelect(id === selected ? null : id); },
      onmouseenter: () => sfx('hover'),
      onmousemove: e => {
        const r = card.getBoundingClientRect();
        inner.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 30}deg`);
        inner.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 30}deg`);
      },
      onmouseleave: () => { inner.style.removeProperty('--rx'); inner.style.removeProperty('--ry'); },
    }, inner, el('div', { class: 'card-desc panel' }, el('div', { class: 'desc-title' }, it.name), el('div', { class: 'desc-body' }, val(it.desc, s))));
    return card;
  }));
}
export const resetHand = () => { handKey = ''; };

// ---- HUD
export function renderHUD(s, L, me, sceneId, onGo) {
  $('#hud-title').textContent = L.title;
  $('#hud-sub').textContent = `${L.subtitle} · ${mode(s).label}`;
  $('#btn-hint').classList.toggle('hidden', !mode(s).hints);
  $('#scene-tabs').replaceChildren(...Object.entries(L.scenes)
    .filter(([id]) => sceneOpen(L, id, s))
    .map(([id, sc]) => btn(sc.name, 'small' + (id === sceneId ? ' on' : ''), () => onGo(id))));
  const tabs = $('#scene-tabs');
  tabs.classList.toggle('more', tabs.scrollWidth > tabs.clientWidth);
  tabs.querySelector('.on')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  $('#hud-players').replaceChildren(...Object.entries(s.players).map(([id, p]) =>
    el('span', { class: 'chip', style: `--c:${p.color}` }, p.name + (id === me ? ' (you)' : ''), ' ',
      el('small', {}, '@ ' + L.scenes[p.scene].name))));
}
// A mouse wheel scrolls the room tabs sideways when they overflow.
$('#scene-tabs').addEventListener('wheel', e => {
  const tabs = e.currentTarget;
  if (tabs.scrollWidth <= tabs.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
  tabs.scrollLeft += e.deltaY;
  e.preventDefault();
}, { passive: false });
export const setTime = ms => { $('#hud-time').textContent = fmtTime(ms); };

// ---- lobby
export function renderLobby(s, L, { me, code, isHost }) {
  $('#room-code').textContent = code;
  $('#lobby-level').replaceChildren(el('b', {}, `${L.title}: ${L.subtitle}`), ` (${mode(s).label})`, el('br'), L.blurb);
  const ps = Object.entries(s.players);
  $('#lobby-players').replaceChildren(...Array.from({ length: MAX_PLAYERS }, (_, i) => {
    const [id, p] = ps[i] || [];
    if (!p) return el('div', { class: 'pcard empty' }, 'Waiting...');
    return el('div', { class: 'pcard', style: `--c:${p.color};--d:${i * -0.6}s` },
      el('div', { class: 'suit' }), el('b', {}, p.name),
      el('small', {}, (id === s.host ? 'Host' : 'Player') + (id === me ? ' · you' : '')));
  }));
  $('#btn-start').classList.toggle('hidden', !isHost);
  $('#lobby-status').textContent = isHost
    ? `${ps.length}/${MAX_PLAYERS} players. Send the invite link, or start whenever you're ready.`
    : 'Waiting for the host to start...';
}

// ---- title
export function renderLevelPick(levels, selected, onPick) {
  $('#level-pick').replaceChildren(...levels.map(L => el('button', {
    class: 'level-card' + (L.id === selected ? ' sel' : ''), onclick: () => onPick(L.id),
  }, el('b', {}, L.title), el('span', {}, L.subtitle),
  el('div', { class: 'swatches' }, L.palette.map(c => el('i', { style: `background:${c}` }))))));
}

export function renderModePick(modes, selected, onPick) {
  $('#mode-pick').replaceChildren(...Object.entries(modes).map(([id, m]) => el('button', {
    class: 'level-card mode-card' + (id === selected ? ' sel' : ''), onclick: () => onPick(id),
  }, el('b', {}, m.label), el('span', {}, m.blurb))));
}

export function setLogo(text) {
  $('#logo').replaceChildren(...text.split(' ').flatMap((w, i) => (i ? [el('br'), jiggle(w)] : [jiggle(w)])));
}
