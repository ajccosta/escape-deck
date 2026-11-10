// Level registry: a new level is one import and one entry here.
import toontown from './toontown.js';
import alvalade from './alvalade.js';

export const LEVELS = Object.fromEntries([toontown, alvalade].map(L => [L.id, L]));
