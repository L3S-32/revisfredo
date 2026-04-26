/* Persistance localStorage : préférences UI + base de données utilisateur */

/* ---------- Préférences UI (palette, dark mode) ---------- */
const STORAGE_KEY = 'revisfredo-prefs';

const loadPrefs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { darkMode:false, palIdx:0, textScale:1, fontIdx:0 };
    const p = JSON.parse(raw);
    return {
      darkMode: !!p.darkMode,
      palIdx:  Number.isInteger(p.palIdx)  && p.palIdx  >= 0 && p.palIdx  < PALETTES.length ? p.palIdx  : 0,
      fontIdx: Number.isInteger(p.fontIdx) && p.fontIdx >= 0 && p.fontIdx < FONTS.length    ? p.fontIdx : 0,
      textScale: typeof p.textScale === 'number' && p.textScale >= 0.7 && p.textScale <= 1.5 ? p.textScale : 1,
    };
  } catch { return { darkMode:false, palIdx:0, textScale:1, fontIdx:0 }; }
};

const savePrefs = (prefs) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch {}
};

/* ---------- Données utilisateur (historique, tests, identité) ---------- */
const DB_KEY = 'revisfredo-data';

const defaultDB = () => ({ history:[], tests:[], userName:'Alfredo', userSub:'BTS SIO' });

const loadDB = () => {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return defaultDB();
    const p = JSON.parse(raw);
    return {
      history:  Array.isArray(p.history) ? p.history : [],
      tests:    Array.isArray(p.tests)   ? p.tests   : [],
      userName: typeof p.userName === 'string' ? p.userName : 'Alfredo',
      userSub:  typeof p.userSub  === 'string' ? p.userSub  : 'BTS SIO',
    };
  } catch { return defaultDB(); }
};

const saveDB = (db) => {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch {}
};
