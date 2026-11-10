// Wires the title/lobby/game screens to the engine and the network.

import { $ } from './dom.js';
import { LEVELS } from './levels/index.js';
import { getLevel, createState, reduce, activeLock, ok, val, sceneOpen, hotspot, MAX_PLAYERS } from './engine.js';
import { Net } from './net.js';
import { SceneView, W, H } from './scene.js';
import { startBackground } from './bg.js';
import { sfx, toggleMute, isMuted } from './sfx.js';
import { fmtTime } from './dom.js';
import * as ui from './ui.js';

const MENU_PALETTE = ['#c8322b', '#0b5fa5', '#1a2a33'];
const FIRST = ['Lucky', 'Sunny', 'Captain', 'Professor', 'Lil', 'Big', 'Princess', 'Sir', 'Doctor', 'Silly', 'Super', 'Grumpy'];
const LAST = ['Bumblebee', 'Wigglepants', 'Fizzlefoot', 'McNoodle', 'Jellyroll', 'Pickleberry', 'Zippenhoff', 'Puddlesplash', 'Bonkers', 'Giggleswick'];
const pick = a => a[(Math.random() * a.length) | 0];
const toonName = () => `${pick(FIRST)} ${pick(LAST)}`.slice(0, 16);

const app = {
  net: null, me: null, isHost: false, code: '',
  state: null, L: null, levelId: Object.keys(LEVELS)[0],
  scene: null, selected: null, lockOpen: null, clockOffset: 0, shownWin: false, chatLen: 0,
};

const bg = startBackground($('#bg'), MENU_PALETTE);

// ---------------------------------------------------------------- state flow

// Host only: apply an action and broadcast the result.
function apply(action) {
  const ev = reduce(app.state, action, app.L);
  app.net?.broadcast({ t: 'state', s: app.state, now: Date.now(), ev });
  onState(app.state, ev);
}

function dispatch(action) {
  action.by = app.me;
  if (app.isHost) apply(action);
  else app.net.toHost({ t: 'act', a: action });
}

// Client-side reactions to host events: one entry per event kind.
const EVENTS = {
  toast: e => ui.toast(e.text),
  sfx: e => sfx(e.name),
  fx: e => view.fx(e.fx, e.at),
  nope: () => { ui.toast('Nothing happens.'); sfx('bad'); },
  solveResult: e => {
    if (e.ok) ui.closeModal();
    else { ui.shakeModal(); sfx('bad'); }
  },
};

function onState(s, ev = []) {
  app.state = s;
  if (app.L?.id !== s.levelId) app.L = getLevel(s.levelId);
  const L = app.L;

  if (s.phase === 'lobby') {
    if (ui.current !== 'lobby') ui.show('lobby');
    ui.renderLobby(s, L, app);
  } else {
    if (ui.current !== 'game') enterGame();
    if (!sceneOpen(L, app.scene, s)) setScene(L.start);
    if (app.selected && !s.inventory.includes(app.selected)) app.selected = null;
    ui.renderHUD(s, L, app.me, app.scene, goTo);
    ui.renderHand(s, L, app.selected, select);
    // A teammate may have cracked the lock we're looking at.
    if (app.lockOpen && !activeLock(hotspot(L, app.lockOpen), s)) ui.closeModal();
  }

  const last = s.chat.at(-1);
  if (s.chat.length !== app.chatLen && last?.kind === 'msg' && last.name !== s.players[app.me]?.name) sfx('chat');
  app.chatLen = s.chat.length;
  ui.renderChat(s);

  for (const e of ev) if (!e.to || e.to === app.me) EVENTS[e.kind]?.(e);

  if (s.wonAt && !app.shownWin) {
    app.shownWin = true;
    setTimeout(showWin, 1400);
  }
  if (!s.wonAt) app.shownWin = false;
}

function showWin() {
  const s = app.state;
  ui.winModal({
    time: fmtTime(s.wonAt - s.startedAt),
    hints: s.hintsUsed, wrong: s.wrong,
    players: Object.values(s.players).map(p => p.name).join(', '),
    isHost: app.isHost,
    onAgain: () => { ui.closeModal(); dispatch({ type: 'restart' }); },
    onTitle: () => { ui.closeModal(); toTitle(); },
  });
}

// ---------------------------------------------------------------- game screen

const view = new SceneView($('#scene'), $('#tooltip'), { onClick: clickHotspot, onMove: sendCursor });

function enterGame() {
  ui.show('game');
  bg.palette(app.L.palette);
  ui.resetHand();
  setScene(app.state.players[app.me]?.scene || app.L.start);
  fitStage();
}

function setScene(id) {
  app.scene = id;
  view.set(app.L, id);
}

function goTo(id) {
  if (id === app.scene || !sceneOpen(app.L, id, app.state)) return;
  sfx('click');
  setScene(id);
  dispatch({ type: 'move', scene: id });
  ui.renderHUD(app.state, app.L, app.me, app.scene, goTo);
}

function select(id) {
  app.selected = id;
  ui.renderHand(app.state, app.L, app.selected, select);
}

function clickHotspot(h) {
  const s = app.state, L = app.L, name = val(h.name, s);
  if (app.selected) {
    const item = app.selected;
    select(null);
    if (ok(h.uses?.[item], s)) dispatch({ type: 'use', item, hotspot: h.id });
    else { ui.toast(`The ${L.items[item].name} doesn't do anything there.`); sfx('bad'); }
    return;
  }
  const lock = activeLock(h, s);
  if (lock) {
    sfx('click');
    app.lockOpen = h.id;
    return ui.lockModal(name, val(lock.prompt, s), lock,
      answer => dispatch({ type: 'solve', hotspot: h.id, answer }),
      () => { app.lockOpen = null; });
  }
  if (h.go && ok(h.go, s)) return goTo(h.go.to);
  if (ok(h.click, s)) return dispatch({ type: 'click', hotspot: h.id });
  const text = val(h.inspect, s);
  if (!text) return;
  sfx('click');
  ui.inspectModal(name, text, () => dispatch({ type: 'share', title: name, text }));
}

function labelFor(h) {
  const name = val(h.name, app.state);
  return app.selected ? `Use ${app.L.items[app.selected].name} on ${name}` : name;
}

let lastCursor = 0;
function sendCursor(p) {
  if (!app.net || performance.now() - lastCursor < 66) return;
  lastCursor = performance.now();
  const c = { t: 'cur', x: Math.round(p.x), y: Math.round(p.y), scene: app.scene };
  if (app.isHost) app.net.broadcast({ ...c, id: app.me });
  else app.net.toHost(c);
}

function fitStage() {
  const wrap = $('#stage-wrap'), stage = $('#stage');
  // Stacked (phone portrait) layouts give the stage the full width and let the
  // page scroll; the others fit it inside its grid cell.
  const stacked = getComputedStyle($('.game')).getPropertyValue('--stacked').trim() === '1';
  const k = Math.min(wrap.clientWidth / W, wrap.clientHeight / H);
  const w = stacked ? wrap.clientWidth : Math.floor(W * k);
  stage.style.width = w + 'px';
  stage.style.height = Math.floor((w * H) / W) + 'px';
}
new ResizeObserver(() => ui.current === 'game' && fitStage()).observe($('#stage-wrap'));

let prev = performance.now();
(function loop(now) {
  const dt = Math.min(0.05, (now - prev) / 1000);
  prev = now;
  const s = app.state;
  if (ui.current === 'game' && s && view.def) {
    view.frame(s, now / 1000, dt, {
      labelFor, me: app.me,
      ghost: app.selected && (g => app.L.items[app.selected].draw(g)),
    });
    ui.setTime((s.wonAt || Date.now() + app.clockOffset) - s.startedAt);
  }
  requestAnimationFrame(loop);
})(prev);

// ---------------------------------------------------------------- networking

function wireHost(net) {
  net.on('msg', (id, m) => {
    if (m.t === 'hello') apply({ type: 'join', by: id, name: cleanName(m.name) });
    else if (m.t === 'act') apply({ ...m.a, by: id });
    else if (m.t === 'cur') {
      const c = { ...m, id };
      net.broadcast(c);
      view.cursor(c);
    }
  });
  net.on('leave', id => apply({ type: 'leave', by: id }));
}

function wireGuest(net) {
  net.on('msg', (_, m) => {
    if (m.t === 'state') { app.clockOffset = m.now - Date.now(); onState(m.s, m.ev); }
    else if (m.t === 'cur') view.cursor(m);
    else if (m.t === 'full') { toTitle(); err('That room is full (4/4).'); }
  });
  net.on('hostlost', () => { toTitle(); err('The host closed the room.'); });
}

// ---------------------------------------------------------------- title

const cleanName = n => String(n || '').trim().slice(0, 16) || toonName();
const err = m => { $('#title-err').textContent = m; };
const myName = () => {
  const n = cleanName($('#name').value);
  try { localStorage.setItem('ed-name', n); } catch {}
  return n;
};

function newRun(me) {
  app.me = me;
  app.isHost = true;
  app.shownWin = false;
  app.chatLen = 0;
  app.state = createState(app.levelId, me);
  app.L = getLevel(app.levelId);
  ui.resetChat();
}

function playSolo() {
  newRun('solo');
  apply({ type: 'join', by: 'solo', name: myName() });
  apply({ type: 'start', by: 'solo' });
}

async function hostRoom() {
  err('Opening a room...');
  const net = new Net();
  try {
    app.code = await net.host(MAX_PLAYERS - 1);
  } catch (e) { return err(`Couldn't open a room: ${e.message || e.type}`); }
  err('');
  app.net = net;
  wireHost(net);
  newRun(net.id);
  apply({ type: 'join', by: net.id, name: myName() });
}

async function joinRoom() {
  const code = $('#code').value.trim().toUpperCase();
  if (code.length !== 5) return err('Room codes have 5 characters.');
  err('Connecting...');
  const net = new Net();
  try {
    app.me = await net.join(code);
  } catch (e) { net.close(); return err(e.message || 'Could not connect.'); }
  err('');
  app.net = net;
  app.isHost = false;
  app.code = code;
  app.shownWin = false;
  ui.resetChat();
  wireGuest(net);
  net.toHost({ t: 'hello', name: myName() });
}

function toTitle() {
  app.net?.close();
  Object.assign(app, { net: null, state: null, scene: null, selected: null, isHost: false });
  ui.closeModal();
  ui.show('title');
  bg.palette(MENU_PALETTE);
}

function renderPick() { ui.renderLevelPick(Object.values(LEVELS), app.levelId, id => { app.levelId = id; sfx('click'); renderPick(); }); }

let saved = '';
try { saved = localStorage.getItem('ed-name') || ''; } catch {}
$('#name').value = saved || toonName();
ui.setLogo('ESCAPE DECK');
renderPick();
ui.show('title');

$('#reroll').onclick = () => { $('#name').value = toonName(); sfx('click'); };
$('#btn-solo').onclick = () => { sfx('click'); playSolo(); };
$('#btn-host').onclick = () => { sfx('click'); hostRoom(); };
$('#btn-join').onclick = () => { sfx('click'); joinRoom(); };
$('#code').addEventListener('keydown', e => { if (e.key === 'Enter') joinRoom(); });
$('#btn-start').onclick = () => { sfx('good'); dispatch({ type: 'start' }); };
$('#btn-leave').onclick = toTitle;
$('#copy-code').onclick = () => { navigator.clipboard?.writeText(app.code); ui.toast('Room code copied!'); };
$('#btn-hint').onclick = () => { sfx('click'); dispatch({ type: 'hint' }); };
$('#btn-quit').onclick = () => { if (confirm('Leave this game?')) toTitle(); };
const muteBtn = $('#btn-mute');
const paintMute = () => { muteBtn.textContent = isMuted() ? 'Muted' : 'Sound'; };
muteBtn.onclick = () => { toggleMute(); paintMute(); };
paintMute();
ui.initChat(text => dispatch({ type: 'chat', text }));
addEventListener('keydown', e => { if (e.key === 'Escape' && app.selected && !ui.modalOpen()) select(null); });

// Debug handle for the console.
window.escapeDeck = app;
