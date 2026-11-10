// Game rules. Pure state + reducer, run only on the host (or locally in solo).
// Levels are data: scenes with hotspots; hotspots declare click / uses / lock /
// go behaviour and effects. The engine knows nothing about any one level.

import { LEVELS } from './levels/index.js';
import { sameAnswer, formatAnswer } from './locks.js';

export const MAX_PLAYERS = 4;
export const PLAYER_COLORS = ['#fe5f55', '#009dff', '#ff9a00', '#4bc292'];
const CHAT_MAX = 150;

export const val = (v, s) => (typeof v === 'function' ? v(s) : v);
export const ok = (o, s) => !!o && (!o.when || o.when(s));
const list = v => [].concat(v);

export function getLevel(id) {
  const L = LEVELS[id];
  if (!L.index) {
    L.index = {};
    for (const [sid, sc] of Object.entries(L.scenes))
      for (const h of sc.hotspots) { h.scene = sid; L.index[h.id] = h; }
  }
  return L;
}

export const hotspot = (L, id) => L.index[id];
export const isVisible = (h, s) => !h.visible || h.visible(s);
export const sceneOpen = (L, id, s) => !!L.scenes[id] && (!L.scenes[id].open || L.scenes[id].open(s));
export const isSolved = (h, s) => !!s.flags['solved:' + h.id];
export const activeLock = (h, s) => (h.lock && !isSolved(h, s) && ok(h.lock, s) ? h.lock : null);

export function createState(levelId, hostId) {
  return {
    levelId, host: hostId, phase: 'lobby', players: {}, chat: [],
    ...freshRun(getLevel(levelId)),
  };
}

function freshRun(L) {
  return { flags: {}, inventory: [...(L.startItems || [])], hintsUsed: 0, hintTier: {}, wrong: 0, startedAt: 0, wonAt: 0 };
}

// ---- effects: one entry per key an effect object may carry (applied in this order)
const EFFECTS = {
  take: (s, v) => { s.inventory = s.inventory.filter(i => !list(v).includes(i)); },
  give: (s, v) => list(v).forEach(i => s.inventory.includes(i) || s.inventory.push(i)),
  set: (s, v) => list(v).forEach(f => { s.flags[f] = true; }),
  win: s => { s.wonAt ||= Date.now(); },
};

function post(s, msg) {
  s.chat.push({ at: Date.now(), ...msg });
  if (s.chat.length > CHAT_MAX) s.chat.splice(0, s.chat.length - CHAT_MAX);
}

function applyEffect(s, eff, ev, at) {
  for (const k in EFFECTS) if (k in eff) EFFECTS[k](s, eff[k]);
  if (eff.say) { post(s, { kind: 'sys', text: eff.say }); ev.push({ kind: 'toast', text: eff.say }); }
  if (eff.fx) ev.push({ kind: 'fx', fx: eff.fx, at: eff.at || at });
  ev.push({ kind: 'sfx', name: eff.sfx || (eff.give ? 'pick' : 'good') });
}

const who = (s, a) => s.players[a.by];

// ---- actions: one entry per action type a player can send
const ACTIONS = {
  join(s, a, L) {
    if (s.players[a.by] || Object.keys(s.players).length >= MAX_PLAYERS) return;
    const used = Object.values(s.players).map(p => p.color);
    const color = PLAYER_COLORS.find(c => !used.includes(c));
    s.players[a.by] = { name: a.name, color, scene: L.start };
    post(s, { kind: 'sys', text: `${a.name} joined.` });
  },
  leave(s, a) {
    const p = who(s, a);
    if (!p) return;
    delete s.players[a.by];
    post(s, { kind: 'sys', text: `${p.name} left.` });
  },
  start(s, a, L) {
    if (a.by !== s.host || s.phase !== 'lobby') return;
    s.phase = 'play';
    s.startedAt = Date.now();
    post(s, { kind: 'sys', text: L.intro });
  },
  restart(s, a, L) {
    if (a.by !== s.host) return;
    Object.assign(s, freshRun(L), { startedAt: Date.now() });
    for (const p of Object.values(s.players)) p.scene = L.start;
    post(s, { kind: 'sys', text: 'New run! ' + L.intro });
  },
  move(s, a, L) {
    if (who(s, a) && sceneOpen(L, a.scene, s)) s.players[a.by].scene = a.scene;
  },
  chat(s, a) {
    const p = who(s, a), text = String(a.text || '').trim().slice(0, 240);
    if (p && text) post(s, { kind: 'msg', name: p.name, color: p.color, text });
  },
  share(s, a) {
    const p = who(s, a);
    if (p) post(s, { kind: 'clue', name: p.name, color: p.color, title: String(a.title).slice(0, 60), text: String(a.text).slice(0, 400) });
  },
  click(s, a, L, ev) {
    const h = hotspot(L, a.hotspot);
    if (h && ok(h.click, s)) applyEffect(s, h.click, ev, h.id);
  },
  use(s, a, L, ev) {
    const h = hotspot(L, a.hotspot), u = h?.uses?.[a.item];
    if (!s.inventory.includes(a.item) || !ok(u, s)) return ev.push({ kind: 'nope', to: a.by });
    applyEffect(s, u, ev, h.id);
  },
  solve(s, a, L, ev) {
    const p = who(s, a), h = hotspot(L, a.hotspot), lock = h && activeLock(h, s);
    if (!p || !lock || !Array.isArray(a.answer)) return;
    const right = sameAnswer(a.answer, lock.answer);
    ev.push({ kind: 'solveResult', to: a.by, ok: right });
    if (right) {
      s.flags['solved:' + h.id] = true;
      post(s, { kind: 'sys', text: `${p.name} cracked the ${val(h.name, s)}!` });
      applyEffect(s, lock.onSolve, ev, h.id);
    } else {
      s.wrong++;
      post(s, { kind: 'sys', text: `${p.name} tried ${formatAnswer(lock, a.answer)} on the ${val(h.name, s)}. No luck.` });
    }
  },
  hint(s, a, L) {
    const p = who(s, a), i = L.hints.findIndex(h => !h.done(s));
    if (!p || i < 0) return;
    const tier = s.hintTier[i] || 0, tiers = L.hints[i].text;
    s.hintTier[i] = tier + 1;
    s.hintsUsed++;
    post(s, { kind: 'hint', name: p.name, text: tiers[Math.min(tier, tiers.length - 1)] });
  },
};

// Applies an action in place and returns the events for clients to play.
export function reduce(s, a, L) {
  const ev = [];
  ACTIONS[a.type]?.(s, a, L, ev);
  return ev;
}
