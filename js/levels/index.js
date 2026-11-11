// Level registry: a new level is one import and one entry here.
import toontown from './toontown.js';
import alvalade from './alvalade.js';
import nova from './nova.js';

export const LEVELS = Object.fromEntries([toontown, alvalade, nova].map(L => [L.id, L]));
