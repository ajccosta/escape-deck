// Peer-to-peer transport over PeerJS. The host is authoritative: guests send
// actions, the host applies them and broadcasts the resulting state.

const PREFIX = 'escape-deck-v1-';
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const roomCode = () => Array.from({ length: 5 }, () => ALPHA[(Math.random() * ALPHA.length) | 0]).join('');

export class Net {
  constructor() {
    this.handlers = {};
    this.conns = new Map();
    this.peer = null;
    this.hostConn = null;
  }

  on(type, fn) { (this.handlers[type] ||= []).push(fn); return this; }
  emit(type, ...args) { (this.handlers[type] || []).forEach(fn => fn(...args)); }

  host(maxGuests) {
    return new Promise((resolve, reject) => {
      if (!window.Peer) return reject(new Error('PeerJS failed to load. Check your connection.'));
      const code = roomCode();
      const peer = new Peer(PREFIX + code);
      peer.on('open', id => { this.peer = peer; this.id = id; this.code = code; resolve(code); });
      peer.on('error', e => {
        if (this.peer) return this.emit('error', e);
        peer.destroy();
        if (e.type === 'unavailable-id') this.host(maxGuests).then(resolve, reject);
        else reject(e);
      });
      peer.on('disconnected', () => { if (this.peer && !peer.destroyed) peer.reconnect(); });
      peer.on('connection', conn => {
        conn.on('open', () => {
          if (this.conns.size >= maxGuests) {
            conn.send({ t: 'full' });
            setTimeout(() => conn.close(), 400);
            return;
          }
          this.conns.set(conn.peer, conn);
        });
        conn.on('data', d => { if (this.conns.has(conn.peer)) this.emit('msg', conn.peer, d); });
        conn.on('close', () => { if (this.conns.delete(conn.peer)) this.emit('leave', conn.peer); });
      });
    });
  }

  join(code) {
    return new Promise((resolve, reject) => {
      if (!window.Peer) return reject(new Error('PeerJS failed to load. Check your connection.'));
      const peer = new Peer();
      let timer;
      peer.on('open', id => {
        this.peer = peer;
        this.id = id;
        const conn = peer.connect(PREFIX + code.trim().toUpperCase(), { reliable: true });
        timer = setTimeout(() => reject(new Error('Could not reach that room.')), 12000);
        conn.on('open', () => { clearTimeout(timer); this.hostConn = conn; resolve(id); });
        conn.on('data', d => this.emit('msg', 'host', d));
        conn.on('close', () => this.emit('hostlost'));
      });
      peer.on('error', e => {
        if (this.hostConn) return this.emit('error', e);
        clearTimeout(timer);
        reject(e.type === 'peer-unavailable' ? new Error('No room with that code.') : e);
      });
    });
  }

  broadcast(msg) { for (const c of this.conns.values()) c.send(msg); }
  toHost(msg) { this.hostConn?.send(msg); }

  close() {
    this.peer?.destroy();
    this.peer = null;
    this.hostConn = null;
    this.conns.clear();
    this.handlers = {};
  }
}
