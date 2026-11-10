// Level registry: a new level is one import and one entry here.
import toontown from './toontown.js';

export const LEVELS = Object.fromEntries([toontown].map(L => [L.id, L]));
